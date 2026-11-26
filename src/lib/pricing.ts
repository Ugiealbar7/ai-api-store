export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  category: "reasoning" | "coding" | "fast" | "flagship";
  contextWindow: string;
  badge?: string;
  description: string;
  upstreamModelId?: string;
  featured?: boolean;
  created?: number;
  // Harga per 1M (1 juta) token dalam USD dari upstream provider
  inputCostPer1MUsd: number;
  outputCostPer1MUsd: number;
  // Margin keuntungan (misal 1.25 = 25% profit)
  markupMultiplier: number;
}

// Kurs acuan USD ke IDR dengan safety buffer fluktuasi kurs
export const USD_TO_IDR = 16500;

export function getAutoMarkupMultiplier(inputPer1MUsd: number, outputPer1MUsd: number): number {
  const maxPrice = Math.max(inputPer1MUsd, outputPer1MUsd);
  if (maxPrice <= 0.6) return 1.35; // Model hemat / flash: 35% margin
  if (maxPrice <= 6.0) return 1.25; // Model mid-tier: 25% margin
  return 1.2; // Model ultra-frontier mahal: 20% margin tetap kompetitif
}

// Daftar model unggulan & fallback offline jika katalog OpenRouter sedang tidak terjangkau
export const AVAILABLE_MODELS: Record<string, ModelPricing> = {
  "google/gemini-4-hydrogen": {
    id: "google/gemini-4-hydrogen",
    name: "Gemini 4 Hydrogen",
    provider: "Google",
    category: "flagship",
    contextWindow: "1M",
    badge: "BARU & POPULER",
    upstreamModelId: "google/gemini-4-hydrogen",
    featured: true,
    description: "Model generasi terbaru Google Gemini 4 seri Hydrogen dengan penalaran multimodal dan konteks 1 juta token.",
    inputCostPer1MUsd: 1.5,
    outputCostPer1MUsd: 7.5,
    markupMultiplier: 1.25,
  },
  "google/gemini-4-neon": {
    id: "google/gemini-4-neon",
    name: "Gemini 4 Neon",
    provider: "Google",
    category: "flagship",
    contextWindow: "1M",
    badge: "TERBARU GOOGLE",
    upstreamModelId: "google/gemini-4-neon",
    featured: true,
    description: "Varian flagship performa tinggi seri Gemini 4 untuk analisis kompleks, multimodal, dan coding.",
    inputCostPer1MUsd: 3.0,
    outputCostPer1MUsd: 15.0,
    markupMultiplier: 1.2,
  },
  "openai/gpt-6.2-astra": {
    id: "openai/gpt-6.2-astra",
    name: "GPT-6.2 Astra",
    provider: "OpenAI",
    category: "reasoning",
    contextWindow: "1M",
    badge: "FLAGSHIP OPENAI",
    upstreamModelId: "openai/gpt-6.2-astra",
    featured: true,
    description: "Model frontier terbaru OpenAI seri Astra dengan akurasi penalaran tingkat tinggi dan konteks 1 juta token.",
    inputCostPer1MUsd: 8.0,
    outputCostPer1MUsd: 40.0,
    markupMultiplier: 1.2,
  },
  "openai/gpt-6-astra": {
    id: "openai/gpt-6-astra",
    name: "GPT-6 Astra",
    provider: "OpenAI",
    category: "reasoning",
    contextWindow: "1M",
    badge: "ASTRA SERIES",
    upstreamModelId: "openai/gpt-6-astra",
    featured: true,
    description: "Model generasi GPT-6 Astra untuk arsitektur software, riset berat, dan agentic workflow.",
    inputCostPer1MUsd: 10.0,
    outputCostPer1MUsd: 50.0,
    markupMultiplier: 1.2,
  },
  "openai/gpt-6.2-sol": {
    id: "openai/gpt-6.2-sol",
    name: "GPT-6.2 Sol",
    provider: "OpenAI",
    category: "coding",
    contextWindow: "1M",
    badge: "SEIMBANG & CEPAT",
    upstreamModelId: "openai/gpt-6.2-sol",
    featured: true,
    description: "Varian GPT-6.2 Sol yang seimbang antara kecepatan, kualitas coding, dan efisiensi biaya.",
    inputCostPer1MUsd: 2.0,
    outputCostPer1MUsd: 10.0,
    markupMultiplier: 1.25,
  },
  "openai/gpt-6-luna": {
    id: "openai/gpt-6-luna",
    name: "GPT-6 Luna",
    provider: "OpenAI",
    category: "fast",
    contextWindow: "1M",
    badge: "SUPER HEMAT",
    upstreamModelId: "openai/gpt-6-luna",
    featured: true,
    description: "Model ringan dan super hemat dari keluarga GPT-6 untuk chatbot, automasi, dan ekstraksi data cepat.",
    inputCostPer1MUsd: 0.1,
    outputCostPer1MUsd: 0.5,
    markupMultiplier: 1.35,
  },
  "anthropic/claude-opus-5.5": {
    id: "anthropic/claude-opus-5.5",
    name: "Claude Opus 5.5",
    provider: "Anthropic",
    category: "coding",
    contextWindow: "1M",
    badge: "RAJA KODING BARU",
    upstreamModelId: "anthropic/claude-opus-5.5",
    featured: true,
    description: "Model flagship Anthropic Claude Opus 5.5 untuk software engineering, refactoring besar, dan penulisan presisi.",
    inputCostPer1MUsd: 4.0,
    outputCostPer1MUsd: 20.0,
    markupMultiplier: 1.2,
  },
  "anthropic/claude-fable-5.2": {
    id: "anthropic/claude-fable-5.2",
    name: "Claude Fable 5.2",
    provider: "Anthropic",
    category: "reasoning",
    contextWindow: "1M",
    badge: "TERBARU ANTHROPIC",
    upstreamModelId: "anthropic/claude-fable-5.2",
    featured: true,
    description: "Model terbaru seri Claude Fable 5.2 dengan kemampuan penalaran kreatif dan pemahaman konteks 1 juta token.",
    inputCostPer1MUsd: 8.0,
    outputCostPer1MUsd: 40.0,
    markupMultiplier: 1.2,
  },
  "anthropic/claude-sonnet-5.5": {
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    provider: "Anthropic",
    category: "coding",
    contextWindow: "1M",
    badge: "FAVORIT CURSOR",
    upstreamModelId: "anthropic/claude-sonnet-5.5",
    featured: true,
    description: "Pilihan utama developer untuk Cursor IDE, VS Code Cline, dan agen koding berkecepatan tinggi.",
    inputCostPer1MUsd: 2.0,
    outputCostPer1MUsd: 10.0,
    markupMultiplier: 1.25,
  },
  "anthropic/claude-haiku-5.5": {
    id: "anthropic/claude-haiku-5.5",
    name: "Claude Haiku 5.5",
    provider: "Anthropic",
    category: "fast",
    contextWindow: "1M",
    badge: "KILAT & MURAH",
    upstreamModelId: "anthropic/claude-haiku-5.5",
    featured: true,
    description: "Respons sub-detik kualitas Anthropic dengan tarif sangat terjangkau.",
    inputCostPer1MUsd: 0.1,
    outputCostPer1MUsd: 0.5,
    markupMultiplier: 1.35,
  },
  "deepseek/deepseek-v4.1-flash": {
    id: "deepseek/deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash",
    provider: "DeepSeek",
    category: "fast",
    contextWindow: "1M",
    badge: "TERLARIS HEMAT",
    upstreamModelId: "deepseek/deepseek-v4.1-flash",
    featured: true,
    description: "Generasi terbaru DeepSeek V4.1 dengan konteks 1 juta token dan biaya token paling ekonomis.",
    inputCostPer1MUsd: 0.0507,
    outputCostPer1MUsd: 0.2028,
    markupMultiplier: 1.35,
  },
  "qwen/qwen4-max": {
    id: "qwen/qwen4-max",
    name: "Qwen4 Max",
    provider: "Qwen",
    category: "flagship",
    contextWindow: "1M",
    badge: "BARU QWEN4",
    upstreamModelId: "qwen/qwen4-max",
    featured: true,
    description: "Model flagship Qwen4 Max dengan kemampuan multibahasa, matematika, dan coding yang tajam.",
    inputCostPer1MUsd: 1.425,
    outputCostPer1MUsd: 4.275,
    markupMultiplier: 1.25,
  },
  "x-ai/grok-4.7": {
    id: "x-ai/grok-4.7",
    name: "Grok 4.7",
    provider: "xAI",
    category: "flagship",
    contextWindow: "500K",
    badge: "TERBARU XAI",
    upstreamModelId: "x-ai/grok-4.7",
    featured: true,
    description: "Model terbaru xAI Grok 4.7 untuk analisis cepat, penalaran, dan percakapan teknis.",
    inputCostPer1MUsd: 2.0,
    outputCostPer1MUsd: 6.0,
    markupMultiplier: 1.25,
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "reasoning",
    contextWindow: "64K",
    badge: "REASONING R1",
    upstreamModelId: "deepseek/deepseek-r1",
    featured: true,
    description: "Model reasoning klasik DeepSeek R1 yang masih banyak dipakai untuk riset dan logika.",
    inputCostPer1MUsd: 0.55,
    outputCostPer1MUsd: 2.19,
    markupMultiplier: 1.25,
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "fast",
    contextWindow: "128K",
    badge: "LEGACY CEPAT",
    upstreamModelId: "openai/gpt-4o-mini",
    featured: false,
    description: "Model ringan OpenAI untuk kompatibilitas skrip dan aplikasi lama.",
    inputCostPer1MUsd: 0.15,
    outputCostPer1MUsd: 0.6,
    markupMultiplier: 1.35,
  },
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "coding",
    contextWindow: "200K",
    upstreamModelId: "anthropic/claude-3.7-sonnet",
    featured: false,
    description: "Model coding Claude 3.7 Sonnet dengan mode standard dan thinking.",
    inputCostPer1MUsd: 3.0,
    outputCostPer1MUsd: 15.0,
    markupMultiplier: 1.2,
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "OpenAI",
    category: "flagship",
    contextWindow: "128K",
    upstreamModelId: "openai/gpt-4o",
    featured: false,
    description: "Model multimodal klasik OpenAI untuk kompatibilitas SDK lama.",
    inputCostPer1MUsd: 2.5,
    outputCostPer1MUsd: 10.0,
    markupMultiplier: 1.2,
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "flagship",
    contextWindow: "1M",
    upstreamModelId: "google/gemini-2.5-pro",
    featured: false,
    description: "Model Gemini 2.5 Pro dengan dukungan konteks panjang.",
    inputCostPer1MUsd: 1.25,
    outputCostPer1MUsd: 5.0,
    markupMultiplier: 1.25,
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "fast",
    contextWindow: "1M",
    upstreamModelId: "google/gemini-2.5-flash",
    featured: false,
    description: "Model cepat Gemini 2.5 Flash untuk tugas bervolume tinggi.",
    inputCostPer1MUsd: 0.075,
    outputCostPer1MUsd: 0.3,
    markupMultiplier: 1.35,
  },
};

// Alias populer agar user boleh memanggil dengan nama pendek maupun ID OpenRouter lengkap
export const MODEL_ALIASES: Record<string, string> = {
  // Generasi terbaru 2026
  "gemini-4-hydrogen": "google/gemini-4-hydrogen",
  "gemini-4-neon": "google/gemini-4-neon",
  "gemini-4-carbon": "google/gemini-4-carbon",
  "gemini-3.8-flash": "google/gemini-3.8-flash",
  "gpt-6.2-astra": "openai/gpt-6.2-astra",
  "gpt-6.2-astra-pro": "openai/gpt-6.2-astra-pro",
  "gpt-6.2-sol": "openai/gpt-6.2-sol",
  "gpt-6.2-sol-pro": "openai/gpt-6.2-sol-pro",
  "gpt-6-astra": "openai/gpt-6-astra",
  "gpt-6-astra-pro": "openai/gpt-6-astra-pro",
  "gpt-6-luna": "openai/gpt-6-luna",
  "gpt-6.1-terra": "openai/gpt-6.1-terra",
  "claude-opus-5.5": "anthropic/claude-opus-5.5",
  "claude-sonnet-5.5": "anthropic/claude-sonnet-5.5",
  "claude-haiku-5.5": "anthropic/claude-haiku-5.5",
  "claude-fable-5.2": "anthropic/claude-fable-5.2",
  "claude-opus-5": "anthropic/claude-opus-5",
  "deepseek-v4.1-flash": "deepseek/deepseek-v4.1-flash",
  "qwen4-max": "qwen/qwen4-max",
  "grok-4.7": "x-ai/grok-4.7",

  // Alias klasik & kompatibilitas mundur
  "deepseek/deepseek-r1": "deepseek-reasoner",
  "deepseek-r1": "deepseek-reasoner",
  "deepseek-v3": "deepseek/deepseek-chat",
  "openai/o3-mini": "openai/o3-mini",
  "o3-mini": "openai/o3-mini",
  "openai/o1": "openai/o1",
  "o1": "openai/o1",
  "openai/gpt-4o": "gpt-4o",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  "anthropic/claude-3.7-sonnet": "claude-3-7-sonnet",
  "claude-3.7-sonnet": "claude-3-7-sonnet",
  "claude-3-7-sonnet-20250219": "claude-3-7-sonnet",
  "anthropic/claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
  "claude-3-5-sonnet": "anthropic/claude-3.5-sonnet",
  "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
  "claude-3-5-haiku": "anthropic/claude-3.5-haiku",
  "claude-3.5-haiku": "anthropic/claude-3.5-haiku",
  "google/gemini-2.5-pro": "gemini-2.5-pro",
  "google/gemini-2.5-flash": "gemini-2.5-flash",
  "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct",
  "qwen-2.5-coder-32b": "qwen/qwen-2.5-coder-32b-instruct",
  "codestral-2501": "mistralai/codestral-2501",
};

export function normalizeModelId(rawModel: string): string {
  const clean = (rawModel || "").trim().toLowerCase();
  if (AVAILABLE_MODELS[clean]) return clean;
  if (MODEL_ALIASES[clean]) return MODEL_ALIASES[clean];
  return clean || "gpt-4o-mini";
}

export function resolveUpstreamModelId(clientModelId: string, upstreamBaseUrl: string): string {
  const normalized = normalizeModelId(clientModelId);
  const modelConfig = AVAILABLE_MODELS[normalized];

  if (upstreamBaseUrl.includes("openrouter.ai")) {
    if (modelConfig?.upstreamModelId) return modelConfig.upstreamModelId;
    if (MODEL_ALIASES[normalized]) return MODEL_ALIASES[normalized];
  }
  return clientModelId.trim();
}

export function formatContextWindow(contextLength?: number | null): string {
  if (!contextLength || contextLength <= 0) return "128K";
  if (contextLength >= 900_000) {
    const m = contextLength / 1_000_000;
    return `${m >= 1.9 ? Math.round(m) : Number(m.toFixed(1))}M`;
  }
  return `${Math.round(contextLength / 1000)}K`;
}

export function formatModelDisplayPrices(models: ModelPricing[]) {
  return models.map((m) => {
    const inputPer1kIdr = (m.inputCostPer1MUsd / 1000) * USD_TO_IDR * m.markupMultiplier;
    const outputPer1kIdr = (m.outputCostPer1MUsd / 1000) * USD_TO_IDR * m.markupMultiplier;

    return {
      ...m,
      displayInputPrice: `Rp ${inputPer1kIdr.toFixed(2)} / 1K token`,
      displayOutputPrice: `Rp ${outputPer1kIdr.toFixed(2)} / 1K token`,
    };
  });
}

export function getModelDisplayPrices() {
  return formatModelDisplayPrices(Object.values(AVAILABLE_MODELS));
}

export function calculateCostFromModel(
  model: Pick<ModelPricing, "inputCostPer1MUsd" | "outputCostPer1MUsd" | "markupMultiplier">,
  promptTokens: number,
  completionTokens: number,
  reportedUpstreamCostUsd?: number
): { costIdr: number; rawCostUsd: number; profitIdr: number } {
  const rawInputCostUsd = (promptTokens / 1_000_000) * model.inputCostPer1MUsd;
  const rawOutputCostUsd = (completionTokens / 1_000_000) * model.outputCostPer1MUsd;
  const tokenCalculatedUsd = rawInputCostUsd + rawOutputCostUsd;

  // Gunakan nilai terbesar antara kalkulasi token dan biaya aktual upstream agar tidak tekor
  const totalRawCostUsd = Math.max(
    tokenCalculatedUsd,
    typeof reportedUpstreamCostUsd === "number" && reportedUpstreamCostUsd > 0
      ? reportedUpstreamCostUsd
      : 0
  );

  const totalRawCostIdr = totalRawCostUsd * USD_TO_IDR;
  const billedCostIdr = Math.max(1, Math.ceil(totalRawCostIdr * model.markupMultiplier));
  const profitIdr = Math.max(0, billedCostIdr - totalRawCostIdr);

  return {
    costIdr: billedCostIdr,
    rawCostUsd: totalRawCostUsd,
    profitIdr,
  };
}

export function calculateTokenCostIdr(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
  reportedUpstreamCostUsd?: number
): { costIdr: number; rawCostUsd: number; profitIdr: number } {
  const normalized = normalizeModelId(modelId);
  const model = AVAILABLE_MODELS[normalized] || AVAILABLE_MODELS["gpt-4o-mini"];
  return calculateCostFromModel(model, promptTokens, completionTokens, reportedUpstreamCostUsd);
}
