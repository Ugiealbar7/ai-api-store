"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { USD_TO_IDR, type ModelPricing } from "@/lib/pricing";

type DisplayModel = ModelPricing & {
  displayInputPrice: string;
  displayOutputPrice: string;
};

export default function HargaCatalogClient({ models }: { models: DisplayModel[] }) {
  const [query, setQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [limit, setLimit] = useState(40);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const providers = ["ALL", "Google", "OpenAI", "Anthropic", "DeepSeek", "Qwen", "xAI", "Meta"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((m) => {
      const matchProvider =
        providerFilter === "ALL" || m.provider.toLowerCase() === providerFilter.toLowerCase();
      if (!matchProvider) return false;
      if (!q) return true;
      return (
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      );
    });
  }, [models, query, providerFilter]);

  const visible = filtered.slice(0, limit);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(40);
            }}
            placeholder={`Cari dari ${models.length}+ model (hydrogen, astra, opus)...`}
            className="w-full md:w-80 pl-8 pr-3 py-2 rounded-lg bg-[#111114] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex flex-wrap gap-1 p-1 bg-[#111114] border border-zinc-800 rounded-lg">
          {providers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setProviderFilter(p);
                setLimit(40);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                providerFilter === p
                  ? "bg-zinc-50 text-zinc-950 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {p === "ALL" ? `Semua (${models.length})` : p}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#141418] border-b border-zinc-800 text-zinc-400 font-medium text-xs">
                <th className="p-4">Model & Provider</th>
                <th className="p-4">Model ID (Klik Salin)</th>
                <th className="p-4">Context</th>
                <th className="p-4 text-right">Input / 1K Token</th>
                <th className="p-4 text-right">Output / 1K Token</th>
                <th className="p-4 text-right">Est. per 1M Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {visible.map((m) => {
                const outPer1mIdr = Math.round(
                  m.outputCostPer1MUsd * USD_TO_IDR * m.markupMultiplier
                );
                return (
                  <tr key={m.id} className="hover:bg-[#15151a] transition">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-100">{m.name}</div>
                      <div className="text-[11px] text-zinc-500">{m.provider}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id)}
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
                      >
                        <span>{m.id}</span>
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-60" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-400">{m.contextWindow}</td>
                    <td className="p-4 text-right font-mono text-xs text-zinc-200 tabular-nums">
                      {m.displayInputPrice.replace(" / 1K token", "")}
                    </td>
                    <td className="p-4 text-right font-mono text-xs text-zinc-200 tabular-nums">
                      {m.displayOutputPrice.replace(" / 1K token", "")}
                    </td>
                    <td className="p-4 text-right font-mono text-xs text-zinc-400 tabular-nums">
                      Rp {outPer1mIdr.toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > limit && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + 60)}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition"
          >
            Muat Lebih Banyak ({filtered.length - limit} model lagi)
          </button>
        </div>
      )}
    </div>
  );
}
