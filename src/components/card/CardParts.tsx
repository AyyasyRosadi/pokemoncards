"use client";

import { User } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ELEMENTS, getFilterCss } from "@/lib/themes";
import { FOIL_STYLES } from "@/lib/foil";
import type { CardData, ElementType, FoilStyle } from "@/lib/types";

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
 * Lapisan foil holo. Posisi kilau mengikuti CSS variable --mx / --my
 * yang diisi oleh <HoloTilt>. Tanpa HoloTilt, efek diam di tengah.
 */
export function HoloLayer({ strength, style = "rainbow" }: { strength: number; style?: FoilStyle }) {
  if (strength <= 0) return null;
  return (
    <>
      {FOIL_STYLES[style].layers(strength).map((layer, i) => (
        <div key={i} className="pointer-events-none absolute inset-0" style={layer as CSSProperties} />
      ))}
    </>
  );
}
