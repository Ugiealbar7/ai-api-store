import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${BRAND.fullName} — 330+ Model AI API Indonesia Bayar QRIS`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "56px 64px",
          color: "#fafafa",
          fontFamily: "sans-serif",
          borderTop: "6px solid #10b981",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "12px",
                backgroundColor: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#09090b",
                fontSize: "28px",
                fontWeight: 900,
              }}
            >
              A
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {BRAND.name}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#34d399",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                }}
              >
                API GATEWAY
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#34d399",
              backgroundColor: "#111114",
              border: "1px solid #27272a",
              padding: "10px 18px",
              borderRadius: "999px",
            }}
          >
            <span>Bayar QRIS Rupiah • Tanpa Kartu Kredit</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "980px" }}>
          <div
            style={{
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#fafafa",
            }}
          >
            Satu API Key untuk 330+ Model AI Terbaru.
          </div>
          <div style={{ fontSize: "26px", color: "#a1a1aa", lineHeight: 1.4 }}>
            Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1, & Grok 4.7.
            Siap di Cursor IDE, Cline, n8n, Python, dan Node.js.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
            fontSize: "20px",
            color: "#d4d4d8",
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            <span>✓ Auto-Sync OpenRouter Live</span>
            <span>✓ Min. Top Up Rp 10.000</span>
            <span>✓ Bonus s.d. +5%</span>
          </div>
          <span style={{ color: "#10b981", fontWeight: 700 }}>
            {BRAND.siteUrl.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
