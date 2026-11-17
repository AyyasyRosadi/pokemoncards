"use client";

import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";
import { RARITIES } from "@/lib/rarity";
import { CARD_HEIGHT, CARD_WIDTH, type CardData } from "@/lib/types";
import { HoloLayer } from "./CardParts";
import { ClassicLayout } from "./ClassicLayout";
import { FullArtLayout } from "./FullArtLayout";

export interface TradingCardProps {
  data: CardData;
  /** Skala tampilan. 1 = 390×545 px. Export PNG selalu memakai ukuran penuh. */
  scale?: number;
  className?: string;
  /** Matikan foil holo walaupun rarity-nya rare / ultra. */
  disableHolo?: boolean;
  /** Ref ke elemen kartu (ukuran asli) — dipakai untuk export PNG. */
  cardRef?: Ref<HTMLDivElement>;
  /** Overlay tambahan di atas kartu (stiker, watermark, dsb). Diposisikan absolute di dalam kartu. */
  children?: ReactNode;
}

/**
 * Kartu trading lengkap: frame, layout (classic / fullart), foil holo, dan overlay children.
 * Posisi kilau holo mengikuti CSS variable --mx / --my dari <HoloTilt>.
 */
export function TradingCard({
  data,
  scale = 1,
  className,
  disableHolo = false,
  cardRef,
  children,
}: TradingCardProps) {
  const rarity = RARITIES[data.rarity];

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{
        width: CARD_WIDTH * scale,
        height: CARD_HEIGHT * scale,
        borderRadius: 22 * scale,
        boxShadow: scale >= 0.8 ? "0 24px 50px -12px rgba(0,0,0,.65)" : "0 8px 18px -8px rgba(0,0,0,.6)",
      }}
    >
      <div
        ref={cardRef}
        className="absolute left-0 top-0 select-none"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          fontFamily: "var(--font-card)",
          borderRadius: 22,
          padding: 7,
          background: rarity.frame,
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-[#0b1020]"
          style={{ borderRadius: 16, isolation: "isolate" }}
        >
          {data.layout === "fullart" ? <FullArtLayout data={data} /> : <ClassicLayout data={data} />}

          {!disableHolo && <HoloLayer strength={rarity.holo} />}

          {children && <div className="absolute inset-0">{children}</div>}
        </div>

        {/* kilau di bingkai */}
        {rarity.holo > 0 && !disableHolo && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: 22,
              mixBlendMode: "overlay",
              background:
                "linear-gradient(135deg, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 68%, rgba(255,255,255,.45) 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
