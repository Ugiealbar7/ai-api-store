export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  description: string;
  // Harga per 1M (1 juta) token dalam USD dari upstream provider
  inputCostPer1MUsd: number;
  outputCostPer1MUsd: number;
  // Margin keuntungan Anda (misal 1.25 = 25% profit)
  markupMultiplier: number;
}

// Kurs acuan USD ke IDR yang sudah diberi safety buffer
export const USD_TO_IDR = 16500;

export const AVAILABLE_MODELS: Record<string, ModelPricing> = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o (Omni)",
    provider: "OpenAI",
    description: "Model unggulan OpenAI paling cerdas untuk coding, penalaran, dan analisis kompleks.",
    inputCostPer1MUsd: 2.50,
    outputCostPer1MUsd: 10.00,
    markupMultiplier: 1.25, // 25% profit
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Cepat, murah, dan cerdas untuk tugas sehari-hari, bot chat, dan ekstraksi data.",
    inputCostPer1MUsd: 0.15,
    outputCostPer1MUsd: 0.60,
    markupMultiplier: 1.30, // 30% profit
  },
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    description: "Model coding dan reasoning terdepan di dunia dengan kemampuan hybrid thinking.",
    inputCostPer1MUsd: 3.00,
    outputCostPer1MUsd: 15.00,
    markupMultiplier: 1.20, // 20% profit
  },
  "claude-3-5-haiku": {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Kecepatan luar biasa dengan harga sangat terjangkau untuk pipeline berkecepatan tinggi.",
    inputCostPer1MUsd: 0.80,
    outputCostPer1MUsd: 4.00,
    markupMultiplier: 1.25,
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Model open-source terpopuler setara GPT-4o dengan biaya super hemat.",
    inputCostPer1MUsd: 0.14,
    outputCostPer1MUsd: 0.28,
    markupMultiplier: 1.35, // 35% profit
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Model reasoning o1-class dengan pemikiran mendalam (chain-of-thought) terbuka.",
    inputCostPer1MUsd: 0.55,
    outputCostPer1MUsd: 2.19,
    markupMultiplier: 1.30,
  },
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Model multimodal ultra-cepat dengan konteks jendela 1 juta token.",
    inputCostPer1MUsd: 0.075,
    outputCostPer1MUsd: 0.30,
    markupMultiplier: 1.40, // 40% profit
  },
};

/**
 * Menghitung biaya dalam Rupiah yang dikenakan ke pengguna
 */
export function calculateTokenCostIdr(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): { costIdr: number; rawCostUsd: number; profitIdr: number } {
  const model = AVAILABLE_MODELS[modelId] || AVAILABLE_MODELS["gpt-4o-mini"];

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
