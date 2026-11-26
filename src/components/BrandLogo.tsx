import Link from "next/link";
import { BRAND } from "@/lib/brand";

interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showTag?: boolean;
  subtitle?: string;
}

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="36" height="36" rx="8" fill="#FAFAFA" />
      {/* Precision architectural "A" apex + gateway chevron */}
      <path
        d="M18 7.5L8.5 28H13.3L18 16.8L22.7 28H27.5L18 7.5Z"
        fill="#09090B"
      />
      {/* Signal node / terminal bar representing live token routing */}
      <rect x="14.75" y="22.25" width="6.5" height="3.25" rx="1.2" fill="#10B981" />
    </svg>
  );
}

export default function BrandLogo({
  href = "/",
  size = "md",
  showTag = true,
  subtitle,
}: BrandLogoProps) {
  const iconPx = size === "lg" ? 38 : size === "sm" ? 28 : 32;
  const textClass =
    size === "lg"
      ? "text-lg font-bold tracking-tight text-zinc-50"
      : size === "sm"
      ? "text-sm font-bold tracking-tight text-zinc-50"
      : "text-base font-bold tracking-tight text-zinc-50";

  const content = (
    <div className="inline-flex items-center gap-2.5 group select-none">
      <div className="transition-transform duration-200 group-hover:-translate-y-0.5">
        <BrandMark size={iconPx} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className={textClass}>{BRAND.name}</span>
          {showTag && (
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
              {BRAND.shortTag}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[11px] text-zinc-500 leading-none mt-0.5">{subtitle}</span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
