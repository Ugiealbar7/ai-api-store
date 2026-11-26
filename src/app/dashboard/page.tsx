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
  AlertTriangle,
} from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/pricing";

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
  const isLowBalance = typeof user?.balance === "number" && user.balance < 5000;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Ringkasan Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Pantau saldo, kelola API key aktif, dan lakukan pengujian langsung ke gateway.
        </p>
      </div>

      {/* LOW BALANCE NUDGE */}
      {isLowBalance && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs text-amber-200">
              Saldo Anda tersisa <strong>Rp {user.balance.toLocaleString("id-ID")}</strong>. Isi ulang mulai Rp 10.000 via QRIS agar request API tidak terhenti — top up mulai Rp 100.000 gratis bonus saldo hingga +5%.
            </p>
          </div>
          <Link
            href="/dashboard/topup?amount=100000"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition shrink-0 text-center"
          >
            Isi Saldo QRIS
          </Link>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Saldo Tersedia</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            Rp {user?.balance?.toLocaleString("id-ID") ?? "0"}
          </div>
          <Link
            href="/dashboard/topup"
            className="text-xs text-zinc-300 hover:text-emerald-400 font-medium inline-flex items-center gap-1 mt-3 transition"
          >
            <span>Top Up via QRIS</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="surface-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">API Key Aktif</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
              <Key className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-50 font-mono tabular-nums">
            {activeKeysCount} / {keys.length} Key
          </div>
          <Link
            href="/dashboard/keys"
            className="text-xs text-zinc-300 hover:text-emerald-400 font-medium inline-flex items-center gap-1 mt-3 transition"
          >
            <span>Kelola Kunci</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="surface-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Endpoint API</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-300 bg-[#0c0c0f] p-2 rounded-lg border border-zinc-800 truncate">
            /api/v1/chat/completions
          </div>
          <Link
            href="/dashboard/docs"
            className="text-xs text-zinc-300 hover:text-emerald-400 font-medium inline-flex items-center gap-1 mt-3 transition"
          >
            <span>Lihat Panduan Integrasi</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* QUICK API KEY LIST */}
      <div className="surface-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-50">API Key Anda</h2>
          <Link href="/dashboard/keys" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
            Lihat Semua ({keys.length}) →
          </Link>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-6 bg-[#0c0c0f] rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-3">Anda belum memiliki API key.</p>
            <Link
              href="/dashboard/keys"
              className="px-4 py-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-lg transition"
            >
              + Buat API Key Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.slice(0, 3).map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3.5 bg-[#0c0c0f] border border-zinc-800 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{k.name}</span>
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
                  <span className="text-xs font-mono text-zinc-400">
                    {k.key.slice(0, 10)}••••••••••••••••{k.key.slice(-4)}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(k.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition"
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
      <div className="surface-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-50 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Tes Cepat API Langsung di Browser</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Kirim request langsung menggunakan API key Anda untuk memastikan gateway berjalan normal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#0c0c0f] border border-zinc-800 text-emerald-400 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600"
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
            className="w-full px-4 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600"
            placeholder="Tulis prompt uji coba..."
          />

          <div className="flex items-center justify-between">
            <button
              onClick={runQuickTest}
              disabled={isTesting || keys.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              <span>Kirim Test Request</span>
            </button>

            {latencyMs !== null && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                <span>Waktu Respons: {latencyMs} ms</span>
              </span>
            )}
          </div>

          {testResult && (
            <div className="mt-4 p-4 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
