"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Coins, RefreshCw, Layers, Download } from "lucide-react";

export default function UsagePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsage = () => {
    setLoading(true);
    fetch("/api/usage")
      .then((res) => res.json())
      .then((d) => {
        if (d.logs) setLogs(d.logs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const totalRequests = logs.length;
  const totalTokens = logs.reduce((acc, log) => acc + (log.totalTokens || 0), 0);
  const totalCost = logs.reduce((acc, log) => acc + (log.costIdr || 0), 0);

  // Hitung ringkasan 7 hari terakhir untuk bar chart sederhana tanpa library berat
  const dailyBars = useMemo(() => {
    const days: { key: string; label: string; cost: number; tokens: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400_000);
      const key = dt.toISOString().slice(0, 10);
      const label = dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      days.push({ key, label, cost: 0, tokens: 0 });
    }
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const log of logs) {
      const k = new Date(log.createdAt).toISOString().slice(0, 10);
      const entry = byKey.get(k);
      if (entry) {
        entry.cost += log.costIdr || 0;
        entry.tokens += log.totalTokens || 0;
      }
    }
    const maxCost = Math.max(1, ...days.map((d) => d.cost));
    return days.map((d) => ({
      ...d,
      heightPercent: d.cost > 0 ? Math.max(8, Math.round((d.cost / maxCost) * 100)) : 2,
    }));
  }, [logs]);

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = [
      "Waktu",
      "Model",
      "API Key",
      "Prompt Tokens",
      "Completion Tokens",
      "Total Tokens",
      "Biaya IDR",
    ];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      `"${(l.model || "").replace(/"/g, '""')}"`,
      `"${(l.apiKey?.name || "Default Key").replace(/"/g, '""')}"`,
      l.promptTokens || 0,
      l.completionTokens || 0,
      l.totalTokens || 0,
      l.costIdr || 0,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aksara-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Riwayat Penggunaan API</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Daftar 50 transaksi request terakhir beserta konsumsi token dan potongan biaya Rupiah secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111114] border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchUsage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111114] border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Total Permintaan</span>
            <Activity className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-50 tabular-nums">
            {totalRequests} <span className="text-xs font-normal text-zinc-500 font-sans">Request</span>
          </div>
        </div>

        <div className="surface-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Total Token Terpakai</span>
            <Layers className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-50 tabular-nums">
            {totalTokens.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-zinc-500 font-sans">Tokens</span>
          </div>
        </div>

        <div className="surface-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Total Pengeluaran</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            Rp {totalCost.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* 7-DAY DAILY SPEND BAR CHART */}
      <div className="surface-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider font-mono">
            Grafik Pengeluaran 7 Hari Terakhir (IDR)
          </span>
          <span className="text-[11px] font-mono text-zinc-500">Berdasarkan 50 log terakhir</span>
        </div>
        <div className="grid grid-cols-7 gap-2.5 items-end h-28 pt-2">
          {dailyBars.map((bar) => (
            <div key={bar.key} className="flex flex-col items-center justify-end h-full gap-1.5">
              <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                {bar.cost > 0 ? `Rp${bar.cost.toLocaleString("id-ID")}` : "-"}
              </span>
              <div className="w-full max-w-[38px] bg-zinc-900 rounded-t h-16 flex items-end overflow-hidden border border-zinc-800/70">
                <div
                  style={{ height: `${bar.heightPercent}%` }}
                  className={`w-full transition-all ${
                    bar.cost > 0 ? "bg-emerald-500" : "bg-zinc-800"
                  }`}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* USAGE LOG TABLE */}
      <div className="surface-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider font-mono">
            Log Aktivitas Request ({logs.length})
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-zinc-500 text-xs">Memuat riwayat penggunaan...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-xs">
            Belum ada aktivitas request. Lakukan request pertama via API key Anda untuk melihat metrik konsumsi token.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#141418] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Model AI</th>
                  <th className="p-4">Kunci API</th>
                  <th className="p-4">Prompt Tokens</th>
                  <th className="p-4">Output Tokens</th>
                  <th className="p-4">Total Tokens</th>
                  <th className="p-4 text-right">Biaya Terpotong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#15151a] transition">
                    <td className="p-4 text-zinc-400 font-sans text-[11px]">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                        {log.model}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 font-sans text-xs">
                      {log.apiKey?.name || "Default Key"}
                    </td>
                    <td className="p-4 text-zinc-400 tabular-nums">{log.promptTokens.toLocaleString()}</td>
                    <td className="p-4 text-zinc-400 tabular-nums">{log.completionTokens.toLocaleString()}</td>
                    <td className="p-4 text-zinc-100 font-semibold tabular-nums">{log.totalTokens.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-emerald-400 tabular-nums">
                      Rp {log.costIdr.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
