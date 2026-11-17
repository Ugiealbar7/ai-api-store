import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { calculateTokenCostIdr, resolveUpstreamModelId, normalizeModelId } from "@/lib/pricing";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-requested-with",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        {
          error: {
            message: "API key diperlukan. Sertakan header Authorization: Bearer sk-live-...",
            type: "invalid_request_error",
          },
        },
        { status: 401, headers: corsHeaders }
      );
    }

    const apiKey = await validateApiKey(token);
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            message: "API key tidak valid atau telah dinonaktifkan.",
            type: "invalid_api_key",
          },
        },
        { status: 401, headers: corsHeaders }
      );
    }

    if (apiKey.user.balance <= 0) {
      return NextResponse.json(
        {
          error: {
            message: `Saldo Anda tidak mencukupi (Rp ${apiKey.user.balance.toLocaleString("id-ID")}). Silakan top-up saldo di dashboard.`,
            type: "insufficient_balance",
          },
        },
        { status: 402, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const rawModel = body.model || "gpt-4o-mini";
    const internalModel = normalizeModelId(rawModel);
    const isStream = Boolean(body.stream);

    const upstreamBase = (process.env.UPSTREAM_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
    const upstreamKey = process.env.UPSTREAM_API_KEY || "";

    // Sesuaikan model jika upstream adalah OpenRouter (misal: deepseek-reasoner -> deepseek/deepseek-r1)
    const upstreamModel = resolveUpstreamModelId(rawModel, upstreamBase);

    const upstreamPayload = {
      ...body,
      model: upstreamModel,
      ...(isStream
        ? {
            stream_options: {
              ...(body.stream_options || {}),
              include_usage: true,
            },
          }
        : {}),
    };

    // Teruskan request ke Upstream AI
    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(`${upstreamBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${upstreamKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://ai-api-store.vercel.app",
          "X-Title": "Nusantara AI Gateway",
        },
        body: JSON.stringify(upstreamPayload),
      });
    } catch (networkErr: any) {
      console.error("Upstream connection error:", networkErr);
      return NextResponse.json(
        {
          error: {
            message: `Gagal terhubung ke AI provider (${networkErr.message}). Periksa UPSTREAM_BASE_URL di environment.`,
            type: "upstream_connection_error",
          },
        },
        { status: 502, headers: corsHeaders }
      );
    }

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      return new NextResponse(errText, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // NON-STREAMING RESPONSE
    if (!isStream) {
      const data = await upstreamResponse.json();
      const promptTokens = data.usage?.prompt_tokens || Math.max(10, Math.ceil(JSON.stringify(body.messages || "").length / 4));
      const completionTokens = data.usage?.completion_tokens || Math.max(10, Math.ceil(JSON.stringify(data.choices?.[0]?.message || "").length / 4));
      const totalTokens = promptTokens + completionTokens;

      const { costIdr } = calculateTokenCostIdr(internalModel, promptTokens, completionTokens);

      // Potong saldo & catat log pemakaian di database
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
              model: internalModel,
              promptTokens,
              completionTokens,
              totalTokens,
              costIdr,
            },
          }),
        ]);
      } catch (dbErr) {
        console.error("Gagal potong saldo non-stream:", dbErr);
      }

      // Pastikan response mengembalikan model nama asli yang diminta client
      if (data.model && data.model !== rawModel) {
        data.model = rawModel;
      }

      return NextResponse.json(data, { headers: corsHeaders });
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

            // Parsing usage jika upstream mengirim chunk usage (standar OpenAI stream_options)
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
          const promptTokens =
            capturedPromptTokens ||
            Math.max(15, Math.ceil(JSON.stringify(body.messages || "").length / 4));
          const completionTokens =
            capturedCompletionTokens || Math.max(1, Math.ceil(accumulatedContent.length / 4));
          const totalTokens = promptTokens + completionTokens;

          const { costIdr } = calculateTokenCostIdr(internalModel, promptTokens, completionTokens);

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
                  model: internalModel,
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
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Chat Completion Proxy Error:", error);
    return NextResponse.json(
      { error: { message: "Internal Server Error", code: 500 } },
      { status: 500, headers: corsHeaders }
    );
  }
}
