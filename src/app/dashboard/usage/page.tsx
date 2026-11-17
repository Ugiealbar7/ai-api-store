"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, Cpu, Coins } from "lucide-react";

export default function UsagePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((d) => {
        if (d.logs) setLogs(d.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Riwayat Penggunaan API</h1>
        <p className="text-sm text-slate-400 mt-1">
          Daftar 50 transaksi request terakhir beserta konsumsi token dan potongan biaya Rupiah.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Log Aktivitas ({logs.length})</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Memuat riwayat penggunaan...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            Belum ada aktivitas request. Lakukan request pertama via API key Anda!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Model AI</th>
                  <th className="p-4">API Key</th>
                  <th className="p-4">Prompt Tokens</th>
                  <th className="p-4">Output Tokens</th>
                  <th className="p-4">Total Tokens</th>
                  <th className="p-4 text-right">Biaya Terpotong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 text-slate-400 font-sans">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                        {log.model}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-sans">
                      {log.apiKey?.name || "Key"}
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
