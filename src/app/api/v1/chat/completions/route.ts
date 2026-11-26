import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { USD_TO_IDR, calculateCostFromModel } from "@/lib/pricing";
import { resolveLiveModel } from "@/lib/openrouter-catalog";
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

    const body = await req.json();
    const rawModel = body.model || "gpt-4o-mini";
    const isStream = Boolean(body.stream);

    const { internalModelId, upstreamModelId, modelConfig } = await resolveLiveModel(rawModel);

    if (!modelConfig) {
      return NextResponse.json(
        {
          error: {
            message: `Model '${rawModel}' tidak tersedia di katalog aktif. Periksa daftar model di ${BRAND.siteUrl}/api/v1/models atau ${BRAND.siteUrl}/harga.`,
            type: "model_not_found",
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Proteksi saldo minimum dinamis sesuai harga live model agar saldo tidak mudah minus
    const estimated2kOutputIdr = Math.ceil(
      ((modelConfig.outputCostPer1MUsd * 2000) / 1_000_000) *
        USD_TO_IDR *
        modelConfig.markupMultiplier
    );
    const minRequiredBalanceIdr = Math.max(20, estimated2kOutputIdr);

    const estimatedPromptTokens = Math.max(
      10,
      Math.ceil(JSON.stringify(body.messages || "").length / 4)
    );
    const estimatedPrecheckCost = calculateCostFromModel(
      modelConfig,
      estimatedPromptTokens,
      100
    ).costIdr;
    const requiredBalance = Math.max(minRequiredBalanceIdr, estimatedPrecheckCost);

    if (apiKey.user.balance <= 0 || apiKey.user.balance < requiredBalance) {
      return NextResponse.json(
        {
          error: {
            message: `Saldo Anda (Rp ${Math.max(0, apiKey.user.balance).toLocaleString(
              "id-ID"
            )}) belum cukup untuk model ${internalModelId} (butuh min. Rp ${requiredBalance.toLocaleString(
              "id-ID"
            )}). Silakan isi ulang via QRIS di ${BRAND.siteUrl}/dashboard/topup.`,
            type: "insufficient_balance",
          },
        },
        { status: 402, headers: corsHeaders }
      );
    }

    const upstreamBase = (process.env.UPSTREAM_BASE_URL || "https://openrouter.ai/api/v1").replace(
      /\/+$/,
      ""
    );
    const upstreamKey = process.env.UPSTREAM_API_KEY || "";

    const finalUpstreamModel = upstreamBase.includes("openrouter.ai")
      ? upstreamModelId
      : rawModel;

    const upstreamPayload = {
      ...body,
      model: finalUpstreamModel,
      ...(isStream
        ? {
            stream_options: {
              ...(body.stream_options || {}),
              include_usage: true,
            },
          }
        : {}),
    };

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(`${upstreamBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${upstreamKey}`,
          "HTTP-Referer": BRAND.siteUrl,
          "X-Title": BRAND.fullName,
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
      const promptTokens =
        data.usage?.prompt_tokens ||
        Math.max(10, Math.ceil(JSON.stringify(body.messages || "").length / 4));
      const completionTokens =
        data.usage?.completion_tokens ||
        Math.max(10, Math.ceil(JSON.stringify(data.choices?.[0]?.message || "").length / 4));
      const totalTokens = promptTokens + completionTokens;
      const upstreamCostUsd =
        typeof data.usage?.cost === "number" ? data.usage.cost : undefined;

      const { costIdr } = calculateCostFromModel(
        modelConfig,
        promptTokens,
        completionTokens,
        upstreamCostUsd
      );

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
              model: internalModelId,
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

      if (data.model && data.model !== rawModel) {
        data.model = rawModel;
      }

      return NextResponse.json(data, { headers: corsHeaders });
    }

    // STREAMING RESPONSE (SSE)
    const decoder = new TextDecoder();
    let accumulatedContent = "";
    let capturedPromptTokens = 0;
    let capturedCompletionTokens = 0;
    let capturedUpstreamCostUsd: number | undefined;

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

            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed.usage) {
                    capturedPromptTokens = parsed.usage.prompt_tokens || capturedPromptTokens;
                    capturedCompletionTokens =
                      parsed.usage.completion_tokens || capturedCompletionTokens;
                    if (typeof parsed.usage.cost === "number") {
                      capturedUpstreamCostUsd = parsed.usage.cost;
                    }
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

          const promptTokens =
            capturedPromptTokens ||
            Math.max(15, Math.ceil(JSON.stringify(body.messages || "").length / 4));
          const completionTokens =
            capturedCompletionTokens || Math.max(1, Math.ceil(accumulatedContent.length / 4));
          const totalTokens = promptTokens + completionTokens;

          const { costIdr } = calculateCostFromModel(
            modelConfig,
            promptTokens,
            completionTokens,
            capturedUpstreamCostUsd
          );

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
                  model: internalModelId,
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
