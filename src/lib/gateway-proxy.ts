import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { USD_TO_IDR, calculateCostFromModel } from "@/lib/pricing";
import { resolveLiveModel } from "@/lib/openrouter-catalog";
import { prisma } from "@/lib/db";

export type GatewayProtocol = "chat_completions" | "anthropic_messages" | "openai_responses";

export const gatewayCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, x-api-key, anthropic-version, anthropic-beta, x-requested-with",
};

export function extractBearerOrApiKey(req: Request): string {
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer;
  const xApiKey = req.headers.get("x-api-key") || "";
  return xApiKey.trim();
}

function formatProtocolError(
  protocol: GatewayProtocol,
  message: string,
  type: string,
  status: number
) {
  if (protocol === "anthropic_messages") {
    return NextResponse.json(
      { type: "error", error: { type, message } },
      { status, headers: gatewayCorsHeaders }
    );
  }
  return NextResponse.json(
    { error: { message, type } },
    { status, headers: gatewayCorsHeaders }
  );
}

function getUpstreamPath(protocol: GatewayProtocol): string {
  if (protocol === "anthropic_messages") return "/messages";
  if (protocol === "openai_responses") return "/responses";
  return "/chat/completions";
}

function extractUsageFromNonStream(
  protocol: GatewayProtocol,
  data: any,
  body: any
): { promptTokens: number; completionTokens: number; upstreamCostUsd?: number } {
  const fallbackInput = Math.max(
    10,
    Math.ceil(JSON.stringify(body.messages || body.input || "").length / 4)
  );
  const fallbackOutput = Math.max(
    10,
    Math.ceil(JSON.stringify(data.choices?.[0]?.message || data.content || data.output || "").length / 4)
  );

  if (protocol === "anthropic_messages") {
    return {
      promptTokens: Number(data?.usage?.input_tokens || fallbackInput),
      completionTokens: Number(data?.usage?.output_tokens || fallbackOutput),
      upstreamCostUsd: typeof data?.usage?.cost === "number" ? data.usage.cost : undefined,
    };
  }

  if (protocol === "openai_responses") {
    return {
      promptTokens: Number(data?.usage?.input_tokens || data?.usage?.prompt_tokens || fallbackInput),
      completionTokens: Number(
        data?.usage?.output_tokens || data?.usage?.completion_tokens || fallbackOutput
      ),
      upstreamCostUsd: typeof data?.usage?.cost === "number" ? data.usage.cost : undefined,
    };
  }

  return {
    promptTokens: Number(data?.usage?.prompt_tokens || fallbackInput),
    completionTokens: Number(data?.usage?.completion_tokens || fallbackOutput),
    upstreamCostUsd: typeof data?.usage?.cost === "number" ? data.usage.cost : undefined,
  };
}

/**
 * Handler terpadu untuk /api/v1/chat/completions, /api/v1/messages (Anthropic/Claude Code),
 * dan /api/v1/responses (OpenAI Responses / OpenClaw).
 */
export async function handleGatewayProxy(req: Request, protocol: GatewayProtocol) {
  try {
    const token = extractBearerOrApiKey(req);
    if (!token) {
      return formatProtocolError(
        protocol,
        "API key diperlukan. Sertakan header Authorization: Bearer sk-live-... atau x-api-key.",
        "invalid_request_error",
        401
      );
    }

    const apiKey = await validateApiKey(token);
    if (!apiKey) {
      return formatProtocolError(
        protocol,
        "API key tidak valid atau telah dinonaktifkan.",
        "invalid_api_key",
        401
      );
    }

    // Cek batas pengeluaran opsional per API key
    if (
      typeof apiKey.spendingLimit === "number" &&
      apiKey.spendingLimit > 0 &&
      apiKey.totalSpent >= apiKey.spendingLimit
    ) {
      return formatProtocolError(
        protocol,
        `Batas pengeluaran API key "${apiKey.name}" (Rp ${apiKey.spendingLimit.toLocaleString(
          "id-ID"
        )}) sudah tercapai. Naikkan limit atau buat key baru di dashboard.`,
        "spending_limit_exceeded",
        402
      );
    }

    const body = await req.json();
    const rawModel =
      body.model ||
      (protocol === "anthropic_messages" ? "anthropic/claude-sonnet-5.5" : "gpt-4o-mini");
    const isStream = Boolean(body.stream);

    const { internalModelId, upstreamModelId, modelConfig } = await resolveLiveModel(rawModel);

    if (!modelConfig) {
      return formatProtocolError(
        protocol,
        `Model '${rawModel}' tidak tersedia di katalog aktif. Periksa daftar model di ${BRAND.siteUrl}/api/v1/models atau ${BRAND.siteUrl}/harga.`,
        "model_not_found",
        400
      );
    }

    const estimated2kOutputIdr = Math.ceil(
      ((modelConfig.outputCostPer1MUsd * 2000) / 1_000_000) *
        USD_TO_IDR *
        modelConfig.markupMultiplier
    );
    const minRequiredBalanceIdr = Math.max(20, estimated2kOutputIdr);

    const estimatedPromptTokens = Math.max(
      10,
      Math.ceil(JSON.stringify(body.messages || body.input || "").length / 4)
    );
    const estimatedPrecheckCost = calculateCostFromModel(
      modelConfig,
      estimatedPromptTokens,
      100
    ).costIdr;
    const requiredBalance = Math.max(minRequiredBalanceIdr, estimatedPrecheckCost);

    if (apiKey.user.balance <= 0 || apiKey.user.balance < requiredBalance) {
      return formatProtocolError(
        protocol,
        `Saldo Anda (Rp ${Math.max(0, apiKey.user.balance).toLocaleString(
          "id-ID"
        )}) belum cukup untuk model ${internalModelId} (butuh min. Rp ${requiredBalance.toLocaleString(
          "id-ID"
        )}). Silakan isi ulang via QRIS di ${BRAND.siteUrl}/dashboard/topup.`,
        "insufficient_balance",
        402
      );
    }

    const upstreamBase = (process.env.UPSTREAM_BASE_URL || "https://openrouter.ai/api/v1").replace(
      /\/+$/,
      ""
    );
    const upstreamKey = process.env.UPSTREAM_API_KEY || "";

    const finalUpstreamModel = upstreamBase.includes("openrouter.ai") ? upstreamModelId : rawModel;

    const upstreamPayload = {
      ...body,
      model: finalUpstreamModel,
      ...(protocol === "chat_completions" && isStream
        ? {
            stream_options: {
              ...(body.stream_options || {}),
              include_usage: true,
            },
          }
        : {}),
    };

    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${upstreamKey}`,
      "HTTP-Referer": BRAND.siteUrl,
      "X-Title": BRAND.fullName,
    };

    if (protocol === "anthropic_messages") {
      upstreamHeaders["anthropic-version"] = req.headers.get("anthropic-version") || "2023-06-01";
      const beta = req.headers.get("anthropic-beta");
      if (beta) upstreamHeaders["anthropic-beta"] = beta;
    }

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(`${upstreamBase}${getUpstreamPath(protocol)}`, {
        method: "POST",
        headers: upstreamHeaders,
        body: JSON.stringify(upstreamPayload),
      });
    } catch (networkErr: any) {
      return formatProtocolError(
        protocol,
        `Gagal terhubung ke AI provider (${networkErr.message}).`,
        "upstream_connection_error",
        502
      );
    }

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      return new NextResponse(errText, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...gatewayCorsHeaders,
        },
      });
    }

    // NON-STREAMING RESPONSE
    if (!isStream) {
      const data = await upstreamResponse.json();
      const { promptTokens, completionTokens, upstreamCostUsd } = extractUsageFromNonStream(
        protocol,
        data,
        body
      );
      const totalTokens = promptTokens + completionTokens;
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
        console.error("[Gateway Billing Error]:", dbErr);
      }

      if (data.model && data.model !== rawModel) {
        data.model = rawModel;
      }

      return NextResponse.json(data, { headers: gatewayCorsHeaders });
    }

    // STREAMING RESPONSE (SSE)
    const decoder = new TextDecoder();
    let sseBuffer = "";
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

            controller.enqueue(value);
            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split("\n");
            sseBuffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ") || line.trim() === "data: [DONE]") continue;
              try {
                const parsed = JSON.parse(line.slice(6));

                // OpenAI Chat Completions usage
                if (parsed.usage) {
                  if (parsed.usage.prompt_tokens) capturedPromptTokens = parsed.usage.prompt_tokens;
                  if (parsed.usage.completion_tokens) {
                    capturedCompletionTokens = parsed.usage.completion_tokens;
                  }
                  if (parsed.usage.input_tokens) capturedPromptTokens = parsed.usage.input_tokens;
                  if (parsed.usage.output_tokens) {
                    capturedCompletionTokens = parsed.usage.output_tokens;
                  }
                  if (typeof parsed.usage.cost === "number") {
                    capturedUpstreamCostUsd = parsed.usage.cost;
                  }
                }

                // Anthropic message_start usage
                if (parsed.message?.usage?.input_tokens) {
                  capturedPromptTokens = parsed.message.usage.input_tokens;
                }

                // OpenAI Responses API completed usage
                if (parsed.response?.usage) {
                  if (parsed.response.usage.input_tokens) {
                    capturedPromptTokens = parsed.response.usage.input_tokens;
                  }
                  if (parsed.response.usage.output_tokens) {
                    capturedCompletionTokens = parsed.response.usage.output_tokens;
                  }
                  if (typeof parsed.response.usage.cost === "number") {
                    capturedUpstreamCostUsd = parsed.response.usage.cost;
                  }
                }

                // Text accumulation fallback
                if (parsed.choices?.[0]?.delta?.content) {
                  accumulatedContent += parsed.choices[0].delta.content;
                } else if (typeof parsed.delta?.text === "string") {
                  accumulatedContent += parsed.delta.text;
                } else if (typeof parsed.delta === "string") {
                  accumulatedContent += parsed.delta;
                }
              } catch {}
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();

          const promptTokens =
            capturedPromptTokens ||
            Math.max(
              15,
              Math.ceil(JSON.stringify(body.messages || body.input || "").length / 4)
            );
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
            console.error("[Gateway Stream Billing Error]:", dbErr);
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
        ...gatewayCorsHeaders,
      },
    });
  } catch (error: any) {
    console.error(`[Gateway Error - ${protocol}]:`, error);
    return formatProtocolError(protocol, "Internal Server Error", "server_error", 500);
  }
}
