import {
  AVAILABLE_MODELS,
  MODEL_ALIASES,
  ModelPricing,
  formatContextWindow,
  formatModelDisplayPrices,
  getAutoMarkupMultiplier,
} from "./pricing";

interface OpenRouterRawModel {
  id: string;
  name?: string;
  description?: string;
  created?: number;
  context_length?: number;
  endpoints?: string[];
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
}

const CATALOG_TTL_MS = 15 * 60 * 1000; // 15 menit cache in-memory selain Next.js ISR

let memoryCache: {
  expiresAt: number;
  models: ModelPricing[];
  byId: Map<string, ModelPricing>;
  byShortSlug: Map<string, ModelPricing>;
} | null = null;

function inferProvider(id: string, name?: string): string {
  const prefix = id.split("/")[0]?.toLowerCase() || "";
  const map: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    deepseek: "DeepSeek",
    "x-ai": "xAI",
    qwen: "Qwen",
    meta: "Meta",
    "meta-llama": "Meta",
    mistralai: "Mistral AI",
    cohere: "Cohere",
    perplexity: "Perplexity",
    nvidia: "NVIDIA",
    upstage: "Upstage",
    xiaomi: "Xiaomi",
    baidu: "Baidu",
    tencent: "Tencent",
    minimax: "MiniMax",
    moonshotai: "Moonshot",
    zhipuai: "Zhipu AI",
    "z-ai": "Z.ai",
  };
  if (map[prefix]) return map[prefix];
  if (name && name.includes(":")) return name.split(":")[0].trim();
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : "AI";
}

function inferCategory(
  id: string,
  inputPer1M: number,
  outputPer1M: number
): ModelPricing["category"] {
  const lower = id.toLowerCase();
  if (lower.includes("coder") || lower.includes("codestral") || lower.includes("sonnet") || lower.includes("opus")) {
    return "coding";
  }
  if (lower.includes("reason") || lower.includes("r1") || lower.includes("/o1") || lower.includes("/o3") || lower.includes("astra") || lower.includes("fable") || lower.includes("thinking")) {
    return "reasoning";
  }
  if (Math.max(inputPer1M, outputPer1M) <= 0.8 || lower.includes("flash") || lower.includes("mini") || lower.includes("haiku") || lower.includes("luna")) {
    return "fast";
  }
  return "flagship";
}

function cleanDisplayName(rawName: string | undefined, id: string): string {
  if (!rawName) return id;
  const idx = rawName.indexOf(":");
  if (idx > 0 && idx < 28) {
    return rawName.slice(idx + 1).trim();
  }
  return rawName.trim();
}

function buildFallbackCatalog(): ModelPricing[] {
  return Object.values(AVAILABLE_MODELS);
}

/**
 * Mengambil seluruh model chat berbayar yang aktif secara live dari OpenRouter (330+ model),
 * menerapkan margin keuntungan otomatis per tier harga, serta menandai model unggulan terbaru.
 */
export async function getLiveModelsCatalog(): Promise<ModelPricing[]> {
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return memoryCache.models;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 1800 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter models fetch HTTP ${res.status}`);
    }

    const payload = await res.json();
    const rawList: OpenRouterRawModel[] = Array.isArray(payload?.data) ? payload.data : [];

    const byId = new Map<string, ModelPricing>();
    const byShortSlug = new Map<string, ModelPricing>();
    const liveModels: ModelPricing[] = [];

    for (const item of rawList) {
      if (!item?.id) continue;
      if (item.id.startsWith("~") || item.id.endsWith(":batch") || item.id.endsWith(":free")) {
        continue;
      }
      if (
        Array.isArray(item.endpoints) &&
        item.endpoints.length > 0 &&
        !item.endpoints.includes("/api/v1/chat/completions")
      ) {
        continue;
      }

      const promptRate = Number(item.pricing?.prompt ?? -1);
      const completionRate = Number(item.pricing?.completion ?? -1);
      // Abaikan router dinamis (-1) dan endpoint gratis tanpa harga jelas
      if (!Number.isFinite(promptRate) || !Number.isFinite(completionRate) || promptRate <= 0 || completionRate <= 0) {
        continue;
      }

      const inputCostPer1MUsd = Number((promptRate * 1_000_000).toFixed(4));
      const outputCostPer1MUsd = Number((completionRate * 1_000_000).toFixed(4));
      const curated = AVAILABLE_MODELS[item.id];

      const cleanDesc = (curated?.description || item.description || "Model AI terbaru siap pakai via gateway Aksara API.")
        .replace(/\s+/g, " ")
        .trim();

      const model: ModelPricing = {
        id: item.id,
        name: curated?.name || cleanDisplayName(item.name, item.id),
        provider: curated?.provider || inferProvider(item.id, item.name),
        category: curated?.category || inferCategory(item.id, inputCostPer1MUsd, outputCostPer1MUsd),
        contextWindow: formatContextWindow(item.context_length),
        badge: curated?.badge,
        featured: Boolean(curated?.featured),
        created: item.created || 0,
        description: cleanDesc.length > 165 ? `${cleanDesc.slice(0, 162)}...` : cleanDesc,
        upstreamModelId: item.id,
        inputCostPer1MUsd,
        outputCostPer1MUsd,
        markupMultiplier: curated?.markupMultiplier || getAutoMarkupMultiplier(inputCostPer1MUsd, outputCostPer1MUsd),
      };

      liveModels.push(model);
      byId.set(model.id.toLowerCase(), model);

      const slashIdx = model.id.indexOf("/");
      if (slashIdx > 0) {
        const shortSlug = model.id.slice(slashIdx + 1).toLowerCase();
        if (!byShortSlug.has(shortSlug)) {
          byShortSlug.set(shortSlug, model);
        }
      }
    }

    // Pastikan seluruh model kurasi & alias pendek (seperti claude-3-7-sonnet, gpt-4o-mini) selalu bisa di-resolve
    for (const curated of buildFallbackCatalog()) {
      const curatedKey = curated.id.toLowerCase();
      const targetUpstream = (curated.upstreamModelId || curated.id).toLowerCase();
      const liveMatch = byId.get(targetUpstream);

      if (liveMatch) {
        if (!byId.has(curatedKey)) {
          byId.set(curatedKey, liveMatch);
        }
      } else if (!byId.has(curatedKey)) {
        liveModels.push(curated);
        byId.set(curatedKey, curated);
      }
    }

    if (liveModels.length > 0) {
      // Urutkan: model featured di atas, lalu terbaru berdasarkan timestamp created
      liveModels.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.created || 0) - (a.created || 0);
      });

      memoryCache = {
        expiresAt: Date.now() + CATALOG_TTL_MS,
        models: liveModels,
        byId,
        byShortSlug,
      };
      return liveModels;
    }
  } catch (err) {
    console.warn("[OpenRouter Catalog] Fallback to curated list:", err);
  }

  return buildFallbackCatalog();
}

export async function getLiveDisplayModels() {
  const models = await getLiveModelsCatalog();
  return formatModelDisplayPrices(models);
}

/**
 * Mencari konfigurasi harga & upstream model ID yang tepat dari katalog live OpenRouter.
 */
export async function resolveLiveModel(rawModel: string): Promise<{
  internalModelId: string;
  upstreamModelId: string;
  modelConfig: ModelPricing | null;
}> {
  await getLiveModelsCatalog();
  const clean = (rawModel || "gpt-4o-mini").trim().toLowerCase();
  const aliasTarget = MODEL_ALIASES[clean]?.toLowerCase() || clean;

  if (memoryCache) {
    const direct =
      memoryCache.byId.get(aliasTarget) ||
      memoryCache.byId.get(clean) ||
      memoryCache.byShortSlug.get(clean) ||
      memoryCache.byShortSlug.get(aliasTarget);

    if (direct) {
      return {
        internalModelId: direct.id,
        upstreamModelId: direct.upstreamModelId || direct.id,
        modelConfig: direct,
      };
    }
  }

  const curated = AVAILABLE_MODELS[aliasTarget] || AVAILABLE_MODELS[clean];
  if (curated) {
    return {
      internalModelId: curated.id,
      upstreamModelId: curated.upstreamModelId || curated.id,
      modelConfig: curated,
    };
  }

  return {
    internalModelId: clean,
    upstreamModelId: rawModel.trim(),
    modelConfig: null,
  };
}
