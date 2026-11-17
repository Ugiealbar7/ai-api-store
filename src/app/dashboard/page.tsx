"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Key,
  Activity,
  Copy,
  Check,
  ArrowRight,
  Play,
  Loader2,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/pricing";

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick API Test playground state
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [testPrompt, setTestPrompt] = useState("Sebutkan 3 tips produktif coding.");
  const [testResult, setTestResult] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const fetchUserData = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => d.authenticated && setUser(d.user));

    fetch("/api/keys")
      .then((res) => res.json())
      .then((d) => d.keys && setKeys(d.keys));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleCopy = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runQuickTest = async () => {
    const activeKey = keys.find((k) => k.isActive)?.key || keys[0]?.key;
    if (!activeKey) return;

    setIsTesting(true);
    setTestResult("");
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: testPrompt }],
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      const data = await res.json();
      if (res.ok) {
        setTestResult(data.choices?.[0]?.message?.content || "Sukses (tidak ada teks respons).");
        fetchUserData();
      } else {
        setTestResult(`Error (${res.status}): ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      setTestResult(`Request Failed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const activeKeysCount = keys.filter((k) => k.isActive).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Ringkasan Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Pantau saldo, kelola API key aktif, dan lakukan pengujian langsung ke gateway.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Saldo Tersedia</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            Rp {user?.balance?.toLocaleString("id-ID") ?? "0"}
          </div>
          <Link
            href="/dashboard/topup"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 mt-3"
          >
            <span>Top Up via QRIS</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">API Key Aktif</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {activeKeysCount} / {keys.length} Key
          </div>
          <Link
            href="/dashboard/keys"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 mt-3"
          >
            <span>Kelola Kunci</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Endpoint API</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xs font-mono text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 truncate">
            /api/v1/chat/completions
          </div>
          <Link
            href="/dashboard/docs"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 mt-3"
          >
            <span>Lihat Panduan Integrasi</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* QUICK API KEY LIST */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">API Key Anda</h2>
          <Link href="/dashboard/keys" className="text-xs text-indigo-400 hover:text-indigo-300">
            Lihat Semua ({keys.length}) →
          </Link>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <p className="text-xs text-slate-400 mb-3">Anda belum memiliki API key.</p>
            <Link
              href="/dashboard/keys"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
            >
              + Buat API Key Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.slice(0, 3).map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{k.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        k.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {k.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {k.key.slice(0, 10)}••••••••••••••••{k.key.slice(-4)}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(k.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                >
                  {copiedKey === k.key ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Key</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIVE QUICK TEST PLAYGROUND */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Tes Cepat API Langsung di Browser</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kirim request langsung ke API key Anda untuk memastikan gateway bekerja dengan sempurna.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Pilih Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {Object.keys(AVAILABLE_MODELS).map((mId) => (
                <option key={mId} value={mId}>
                  {mId} ({AVAILABLE_MODELS[mId].provider})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Tulis prompt uji coba..."
          />

          <div className="flex items-center justify-between">
            <button
              onClick={runQuickTest}
              disabled={isTesting || keys.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              <span>Kirim Test Request</span>
            </button>

            {latencyMs !== null && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Waktu Respons: {latencyMs} ms</span>
              </span>
            )}
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-xl bg-[#080c14] border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
