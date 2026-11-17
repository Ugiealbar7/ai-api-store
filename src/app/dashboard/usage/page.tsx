"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, Cpu, Coins, RefreshCw, Layers } from "lucide-react";

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

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Riwayat Penggunaan API</h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar 50 transaksi request terakhir beserta konsumsi token dan potongan biaya Rupiah secara transparan.
          </p>
        </div>

        <button
          onClick={fetchUsage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Permintaan</span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalRequests} <span className="text-xs font-normal text-slate-500 font-sans">Request</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Token Terpakai</span>
            <Layers className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalTokens.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-slate-500 font-sans">Tokens</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Pengeluaran</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            Rp {totalCost.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* USAGE LOG TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Log Aktivitas Request ({logs.length})
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 text-xs">Memuat riwayat penggunaan...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            Belum ada aktivitas request. Lakukan request pertama via API key Anda untuk melihat metrik konsumsi token!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#030611] text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/[0.08]">
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
              <tbody className="divide-y divide-white/[0.06] font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 text-slate-400 font-sans text-[11px]">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                        {log.model}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-sans text-xs">
                      {log.apiKey?.name || "Default Key"}
                    </td>
                    <td className="p-4 text-slate-400">{log.promptTokens.toLocaleString()}</td>
                    <td className="p-4 text-slate-400">{log.completionTokens.toLocaleString()}</td>
                    <td className="p-4 text-white font-semibold">{log.totalTokens.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-emerald-400">
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
