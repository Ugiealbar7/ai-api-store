export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  category: "reasoning" | "coding" | "fast" | "flagship";
  contextWindow: string;
  badge?: string;
  description: string;
  upstreamModelId?: string;
  // Harga per 1M (1 juta) token dalam USD dari upstream provider
  inputCostPer1MUsd: number;
  outputCostPer1MUsd: number;
  // Margin keuntungan Anda (misal 1.25 = 25% profit)
  markupMultiplier: number;
}

// Kurs acuan USD ke IDR dengan safety buffer fluktuasi kurs
export const USD_TO_IDR = 16500;

export const AVAILABLE_MODELS: Record<string, ModelPricing> = {
  // ==========================================
  // REASONING & CHAIN-OF-THOUGHT (DEEP THINKING)
  // ==========================================
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "reasoning",
    contextWindow: "64K",
    badge: "🔥 PALING POPULER",
    upstreamModelId: "deepseek/deepseek-r1",
    description: "Model reasoning o1-class open-weights paling populer di dunia dengan penalaran mendalam terbuka.",
    inputCostPer1MUsd: 0.55,
    outputCostPer1MUsd: 2.19,
    markupMultiplier: 1.30,
  },
  "o3-mini": {
    id: "o3-mini",
    name: "OpenAI o3-mini",
    provider: "OpenAI",
    category: "reasoning",
    contextWindow: "200K",
    badge: "⚡ REASONING CEPAT",
    upstreamModelId: "openai/o3-mini",
    description: "Model reasoning generasi terbaru OpenAI khusus coding, matematika, dan sains dengan latency ultra cepat.",
    inputCostPer1MUsd: 1.10,
    outputCostPer1MUsd: 4.40,
    markupMultiplier: 1.25,
  },
  "o1": {
    id: "o1",
    name: "OpenAI o1",
    provider: "OpenAI",
    category: "reasoning",
    contextWindow: "200K",
    badge: "OTAK TERTINGGI",
    upstreamModelId: "openai/o1",
    description: "Model penalaran tercanggih dari OpenAI untuk riset rumit, audit keamanan, dan logika arsitektur tingkat lanjut.",
    inputCostPer1MUsd: 15.00,
    outputCostPer1MUsd: 60.00,
    markupMultiplier: 1.15,
  },

  // ==========================================
  // HYBRID & CODING POWERHOUSES
  // ==========================================
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "coding",
    contextWindow: "200K",
    badge: "👑 RAJA CODING 2025/2026",
    upstreamModelId: "anthropic/claude-3.7-sonnet",
    description: "Model coding dan reasoning terdepan di dunia dengan fitur hybrid standard/thinking mode.",
    inputCostPer1MUsd: 3.00,
    outputCostPer1MUsd: 15.00,
    markupMultiplier: 1.20,
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "coding",
    contextWindow: "200K",
    badge: "FAVORIT CURSOR",
    upstreamModelId: "anthropic/claude-3.5-sonnet",
    description: "Standar industri untuk pengembangan software modern, pemahaman codebase luas, dan debugging presisi.",
    inputCostPer1MUsd: 3.00,
    outputCostPer1MUsd: 15.00,
    markupMultiplier: 1.20,
  },
  "qwen-2.5-coder-32b": {
    id: "qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    provider: "Alibaba Qwen",
    category: "coding",
    contextWindow: "128K",
    badge: "HEMAT & TANGGUH",
    upstreamModelId: "qwen/qwen-2.5-coder-32b-instruct",
    description: "Model open-source khusus coding dengan akurasi setara GPT-4o namun dengan biaya token super hemat.",
    inputCostPer1MUsd: 0.20,
    outputCostPer1MUsd: 0.20,
    markupMultiplier: 1.40,
  },
  "codestral-2501": {
    id: "codestral-2501",
    name: "Mistral Codestral 2501",
    provider: "Mistral AI",
    category: "coding",
    contextWindow: "256K",
    badge: "256K JENDELA KODE",
    upstreamModelId: "mistralai/codestral-2501",
    description: "Didesain spesifik untuk code completion dan refactoring dalam 80+ bahasa pemrograman.",
    inputCostPer1MUsd: 0.30,
    outputCostPer1MUsd: 0.90,
    markupMultiplier: 1.30,
  },

  // ==========================================
  // FLAGSHIP GENERAL INTELLIGENCE
  // ==========================================
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "OpenAI",
    category: "flagship",
    contextWindow: "128K",
    badge: "MULTIMODAL UNGGULAN",
    upstreamModelId: "openai/gpt-4o",
    description: "Model flagship OpenAI serbaguna dengan pemahaman teks, gambar, coding, dan logika yang sangat matang.",
    inputCostPer1MUsd: 2.50,
    outputCostPer1MUsd: 10.00,
    markupMultiplier: 1.25,
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "flagship",
    contextWindow: "2M Token",
    badge: "2 JUTA KONTEKS",
    upstreamModelId: "google/gemini-2.5-pro",
    description: "Jendela konteks terluas di dunia (2 juta token). Mampu membaca seluruh repositori kode atau ratusan PDF sekaligus.",
    inputCostPer1MUsd: 1.25,
    outputCostPer1MUsd: 5.00,
    markupMultiplier: 1.25,
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    category: "flagship",
    contextWindow: "64K",
    badge: "SUPER VALUE",
    upstreamModelId: "deepseek/deepseek-chat",
    description: "Model 671B MoE setara GPT-4o dengan efisiensi biaya luar biasa. Terbaik untuk chatbot bisnis skala masif.",
    inputCostPer1MUsd: 0.14,
    outputCostPer1MUsd: 0.28,
    markupMultiplier: 1.35,
  },
  "llama-3.3-70b": {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta",
    category: "flagship",
    contextWindow: "128K",
    badge: "OPEN SOURCE FLAGSHIP",
    upstreamModelId: "meta-llama/llama-3.3-70b-instruct",
    description: "Model open-weights terpopuler dari Meta yang menyaingi GPT-4o dengan reliabilitas instruksi tinggi.",
    inputCostPer1MUsd: 0.35,
    outputCostPer1MUsd: 0.40,
    markupMultiplier: 1.35,
  },

  // ==========================================
  // ULTRA FAST & BUDGET FRIENDLY
  // ==========================================
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "fast",
    contextWindow: "128K",
    badge: "DEAFULT CEPAT",
    upstreamModelId: "openai/gpt-4o-mini",
    description: "Ringan, responsif, dan murah. Ideal untuk integrasi bot percakapan harian, ekstraksi data, dan parsing.",
    inputCostPer1MUsd: 0.15,
    outputCostPer1MUsd: 0.60,
    markupMultiplier: 1.30,
  },
  "claude-3-5-haiku": {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    category: "fast",
    contextWindow: "200K",
    badge: "KILAT & CERDAS",
    upstreamModelId: "anthropic/claude-3.5-haiku",
    description: "Eksekusi sub-detik dengan pemahaman konteks ala Claude. Cocok untuk asisten coding inline dan agent pipeline.",
    inputCostPer1MUsd: 0.80,
    outputCostPer1MUsd: 4.00,
    markupMultiplier: 1.25,
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "fast",
    contextWindow: "1M Token",
    badge: "1M KONTEKS TERMURAH",
    upstreamModelId: "google/gemini-2.5-flash",
    description: "Model multimodal kilat dengan konteks 1 juta token dengan harga termurah di kelasnya.",
    inputCostPer1MUsd: 0.075,
    outputCostPer1MUsd: 0.30,
    markupMultiplier: 1.40,
  },
};

// Pemetaan alias model populer agar fleksibel dan toleran terhadap nama alternatif
export const MODEL_ALIASES: Record<string, string> = {
  // DeepSeek
  "deepseek/deepseek-r1": "deepseek-reasoner",
  "deepseek-r1": "deepseek-reasoner",
  "deepseek/deepseek-chat": "deepseek-chat",
  "deepseek-v3": "deepseek-chat",
  // OpenAI
  "openai/o3-mini": "o3-mini",
  "openai/o1": "o1",
  "openai/gpt-4o": "gpt-4o",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  // Anthropic
  "anthropic/claude-3.7-sonnet": "claude-3-7-sonnet",
  "claude-3.7-sonnet": "claude-3-7-sonnet",
  "claude-3-7-sonnet-20250219": "claude-3-7-sonnet",
  "anthropic/claude-3.5-sonnet": "claude-3-5-sonnet",
  "claude-3.5-sonnet": "claude-3-5-sonnet",
  "claude-3-5-sonnet-20241022": "claude-3-5-sonnet",
  "anthropic/claude-3.5-haiku": "claude-3-5-haiku",
  "claude-3.5-haiku": "claude-3-5-haiku",
  // Google
  "google/gemini-2.5-pro": "gemini-2.5-pro",
  "gemini-2.5-pro": "gemini-2.5-pro",
  "google/gemini-2.5-flash": "gemini-2.5-flash",
  "gemini-2.5-flash": "gemini-2.5-flash",
  "gemini-2.0-flash": "gemini-2.5-flash",
  "google/gemini-2.0-flash-001": "gemini-2.5-flash",
  // Meta
  "meta-llama/llama-3.3-70b-instruct": "llama-3.3-70b",
  "llama-3.3-70b-instruct": "llama-3.3-70b",
  "llama-3.3": "llama-3.3-70b",
  // Qwen
  "qwen/qwen-2.5-coder-32b-instruct": "qwen-2.5-coder-32b",
  "qwen-2.5-coder-32b-instruct": "qwen-2.5-coder-32b",
  "qwen-coder": "qwen-2.5-coder-32b",
  // Mistral
  "mistralai/codestral-2501": "codestral-2501",
  "codestral": "codestral-2501",
};

/**
 * Normalisasi ID model yang dikirim client ke model internal
 */
export function normalizeModelId(rawModel: string): string {
  const clean = (rawModel || "").trim().toLowerCase();
  if (AVAILABLE_MODELS[clean]) return clean;
  if (MODEL_ALIASES[clean]) return MODEL_ALIASES[clean];
  return clean || "gpt-4o-mini";
}

/**
 * Dapatkan upstream ID yang sesuai (misal OpenRouter memerlukan awalan nama seperti openai/o3-mini)
 */
export function resolveUpstreamModelId(clientModelId: string, upstreamBaseUrl: string): string {
  const normalized = normalizeModelId(clientModelId);
  const modelConfig = AVAILABLE_MODELS[normalized];

  if (upstreamBaseUrl.includes("openrouter.ai") && modelConfig?.upstreamModelId) {
    return modelConfig.upstreamModelId;
  }
  return clientModelId;
}

/**
 * Menghitung biaya dalam Rupiah yang dikenakan ke pengguna
 */
export function calculateTokenCostIdr(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): { costIdr: number; rawCostUsd: number; profitIdr: number } {
  const normalized = normalizeModelId(modelId);
  const model = AVAILABLE_MODELS[normalized] || AVAILABLE_MODELS["gpt-4o-mini"];

  const rawInputCostUsd = (promptTokens / 1_000_000) * model.inputCostPer1MUsd;
  const rawOutputCostUsd = (completionTokens / 1_000_000) * model.outputCostPer1MUsd;
  const totalRawCostUsd = rawInputCostUsd + rawOutputCostUsd;

  const totalRawCostIdr = totalRawCostUsd * USD_TO_IDR;
  const billedCostIdr = Math.max(1, Math.ceil(totalRawCostIdr * model.markupMultiplier));
  const profitIdr = Math.max(0, billedCostIdr - totalRawCostIdr);

  return {
    costIdr: billedCostIdr,
    rawCostUsd: totalRawCostUsd,
    profitIdr: profitIdr,
  };
}

/**
 * Format harga Rupiah per 1.000 token untuk tampilan tabel harga di UI
 */
export function getModelDisplayPrices() {
  return Object.values(AVAILABLE_MODELS).map((m) => {
    const inputPer1kIdr = (m.inputCostPer1MUsd / 1000) * USD_TO_IDR * m.markupMultiplier;
    const outputPer1kIdr = (m.outputCostPer1MUsd / 1000) * USD_TO_IDR * m.markupMultiplier;

    return {
      ...m,
      displayInputPrice: `Rp ${inputPer1kIdr.toFixed(2)} / 1K token`,
      displayOutputPrice: `Rp ${outputPer1kIdr.toFixed(2)} / 1K token`,
    };
  });
}
