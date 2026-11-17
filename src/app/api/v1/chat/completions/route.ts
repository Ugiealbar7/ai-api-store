import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { calculateTokenCostIdr } from "@/lib/pricing";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { error: { message: "API key diperlukan. Sertakan header Authorization: Bearer sk-live-...", type: "invalid_request_error" } },
        { status: 401 }
      );
    }

    const apiKey = await validateApiKey(token);
    if (!apiKey) {
      return NextResponse.json(
        { error: { message: "API key tidak valid atau telah dinonaktifkan.", type: "invalid_api_key" } },
        { status: 401 }
      );
    }

    if (apiKey.user.balance <= 0) {
      return NextResponse.json(
        {
          error: {
            message: "Saldo Anda tidak mencukupi (Rp " + apiKey.user.balance.toLocaleString("id-ID") + "). Silakan top-up saldo di dashboard.",
            type: "insufficient_balance",
          },
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const model = body.model || "gpt-4o-mini";
    const isStream = Boolean(body.stream);

    const upstreamBase = (process.env.UPSTREAM_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
    const upstreamKey = process.env.UPSTREAM_API_KEY || "";

    // Teruskan request ke Upstream AI
    const upstreamResponse = await fetch(`${upstreamBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${upstreamKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      return new NextResponse(errText, {
        status: upstreamResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // NON-STREAMING RESPONSE
    if (!isStream) {
      const data = await upstreamResponse.json();
      const promptTokens = data.usage?.prompt_tokens || 10;
      const completionTokens = data.usage?.completion_tokens || 20;
      const totalTokens = promptTokens + completionTokens;

      const { costIdr } = calculateTokenCostIdr(model, promptTokens, completionTokens);

      // Potong saldo & catat log pemakaian di latar belakang
      await prisma.$transaction([
        prisma.user.update({
          where: { id: apiKey.userId },
          data: { balance: { decrement: costIdr } },
        }),
        prisma.apiKey.update({
          where: { id: apiKey.id },
          data: {
            totalSpent: { increment: costIdr },
            lastUsedAt: new Date(),
          },
        }),
        prisma.usageLog.create({
          data: {
            userId: apiKey.userId,
            apiKeyId: apiKey.id,
            model,
            promptTokens,
            completionTokens,
            totalTokens,
            costIdr,
          },
        }),
      ]);

      return NextResponse.json(data);
    }

    // STREAMING RESPONSE (SSE)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let accumulatedContent = "";
    let capturedPromptTokens = 0;
    let capturedCompletionTokens = 0;

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(value);

            // Parsing usage jika upstream mengirim chunk usage
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed.usage) {
                    capturedPromptTokens = parsed.usage.prompt_tokens;
                    capturedCompletionTokens = parsed.usage.completion_tokens;
                  }
                  if (parsed.choices?.[0]?.delta?.content) {
                    accumulatedContent += parsed.choices[0].delta.content;
                  }
                } catch {}
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();

          // Estimasi token jika upstream tidak mengirim objek usage
          const promptTokens = capturedPromptTokens || Math.max(15, Math.ceil(JSON.stringify(body.messages || "").length / 4));
          const completionTokens = capturedCompletionTokens || Math.max(1, Math.ceil(accumulatedContent.length / 4));
          const totalTokens = promptTokens + completionTokens;

          const { costIdr } = calculateTokenCostIdr(model, promptTokens, completionTokens);

          // Potong saldo pengguna
          try {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: apiKey.userId },
                data: { balance: { decrement: costIdr } },
              }),
              prisma.apiKey.update({
                where: { id: apiKey.id },
                data: {
                  totalSpent: { increment: costIdr },
                  lastUsedAt: new Date(),
                },
              }),
              prisma.usageLog.create({
                data: {
                  userId: apiKey.userId,
                  apiKeyId: apiKey.id,
                  model,
                  promptTokens,
                  completionTokens,
                  totalTokens,
                  costIdr,
                },
              }),
            ]);
          } catch (dbErr) {
            console.error("Gagal potong saldo stream:", dbErr);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("Chat Completion Proxy Error:", error);
    return NextResponse.json({ error: { message: "Internal Server Error", code: 500 } }, { status: 500 });
  }
}
