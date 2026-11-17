"use client";

import { User } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ELEMENTS, getFilterCss } from "@/lib/themes";
import type { CardData, ElementType } from "@/lib/types";

const DARK_ICON: ElementType[] = ["colorless", "lightning", "metal"];

interface EnergyIconProps {
  element: ElementType;
  size?: number;
  className?: string;
  /** konten tambahan di dalam lingkaran (opsional, menggantikan ikon) */
  children?: ReactNode;
}

/** Lingkaran energy bergaya Pokémon TCG dengan ikon elemen. */
export function EnergyIcon({ element, size = 20, className, children }: EnergyIconProps) {
  const t = ELEMENTS[element];
  const Icon = t.icon;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${t.light}, ${t.main} 55%, ${t.dark})`,
        boxShadow: "inset 0 -1px 2px rgba(0,0,0,.35), 0 1px 2px rgba(0,0,0,.45)",
        border: "1px solid rgba(0,0,0,.25)",
      }}
    >
      {children ?? (
        <Icon
          size={Math.round(size * 0.58)}
          strokeWidth={2.8}
          color={DARK_ICON.includes(element) ? "#1f2937" : "#ffffff"}
        />
      )}
    </span>
  );
}

interface EnergyCostProps {
  element: ElementType;
  count: number;
  size?: number;
  className?: string;
}

/** Deretan energy untuk biaya attack. */
export function EnergyCost({ element, count, size = 16, className }: EnergyCostProps) {
  if (count <= 0) return null;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-[3px]", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <EnergyIcon key={i} element={element} size={size} />
      ))}
    </span>
  );
}

/** Titik retreat cost ala kartu asli: ●● atau — */
export function RetreatDots({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return <span className={className}>—</span>;
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="inline-block rounded-full border border-current"
          style={{ width: 9, height: 9, background: "currentColor", opacity: 0.9 }}
        />
      ))}
    </span>
  );
}

interface CardPhotoProps {
  data: CardData;
  className?: string;
  style?: CSSProperties;
}

/** Foto (atau placeholder) yang mengisi parent-nya, lengkap dengan zoom/posisi/filter. */
export function CardPhoto({ data, className, style }: CardPhotoProps) {
  const t = ELEMENTS[data.element];
  const { zoom, x, y, flip } = data.photoTransform;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        background: `linear-gradient(160deg, ${t.light} 0%, ${t.main} 48%, ${t.dark} 100%)`,
        ...style,
      }}
    >
      {data.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.photo}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: "50% 22%",
            transformOrigin: "50% 30%",
            transform: `translate(${x}%, ${y}%) scale(${zoom}) scaleX(${flip ? -1 : 1})`,
            filter: getFilterCss(data.photoFilter),
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
          <User size={120} strokeWidth={1.2} />
          <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Upload fotomu</span>
        </div>
      )}
    </div>
  );
}

/**
 * Lapisan foil holo. Posisi mengikuti CSS variable --mx / --my
 * yang diisi oleh <HoloTilt>. Tanpa HoloTilt, efek diam di tengah.
 */
export function HoloLayer({ strength }: { strength: number }) {
  if (strength <= 0) return null;
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: strength * 0.4,
          mixBlendMode: "color-dodge",
          backgroundImage:
            "linear-gradient(115deg, transparent 12%, rgba(255,0,153,.6) 28%, rgba(255,214,0,.6) 38%, rgba(0,255,170,.6) 48%, rgba(0,153,255,.6) 58%, rgba(153,0,255,.6) 68%, transparent 84%)",
          backgroundSize: "260% 260%",
          backgroundPosition: "var(--mx, 50%) var(--my, 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: strength * 0.38,
          mixBlendMode: "overlay",
          backgroundImage:
            "radial-gradient(circle at 12% 18%, #fff 0 1.2px, transparent 1.8px), radial-gradient(circle at 63% 41%, #fff 0 1px, transparent 1.6px), radial-gradient(circle at 38% 77%, #fff 0 1.4px, transparent 2px), radial-gradient(circle at 88% 64%, #fff 0 1px, transparent 1.6px)",
          backgroundSize: "64px 64px, 83px 83px, 71px 71px, 97px 97px",
          backgroundPosition: "var(--mx, 50%) var(--my, 50%), 0 0, 0 0, 0 0",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: strength * 0.75,
          mixBlendMode: "overlay",
          backgroundImage:
            "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.65), rgba(255,255,255,0) 52%)",
        }}
      />
    </>
  );
}
