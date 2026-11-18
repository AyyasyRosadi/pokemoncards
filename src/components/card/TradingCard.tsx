"use client";

import type { KeyboardEvent, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";
import { RARITIES } from "@/lib/rarity";
import { CARD_HEIGHT, CARD_WIDTH, type CardData } from "@/lib/types";
import { CardBack } from "./CardBack";
import { HoloLayer } from "./CardParts";
import { ClassicLayout } from "./ClassicLayout";
import { FullArtLayout } from "./FullArtLayout";

export interface CardFrontProps {
  data: CardData;
  /** Matikan foil holo walaupun rarity-nya rare / ultra. */
  disableHolo?: boolean;
  /** Ref ke elemen kartu (ukuran asli, tanpa transform) — dipakai untuk export. */
  cardRef?: Ref<HTMLDivElement>;
  className?: string;
  /** Overlay tambahan di atas kartu (stiker, watermark, dsb). */
  children?: ReactNode;
}

/** Sisi depan kartu, datar, ukuran asli 390×545. */
export function CardFront({ data, disableHolo = false, cardRef, className, children }: CardFrontProps) {
  const rarity = RARITIES[data.rarity];

  return (
    <div
      ref={cardRef}
      className={cn("relative select-none", className)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fontFamily: "var(--font-card)",
        borderRadius: 22,
        padding: 7,
        background: rarity.frame,
      }}
    >
      <div className="relative h-full w-full overflow-hidden bg-[#0b1020]" style={{ borderRadius: 16, isolation: "isolate" }}>
        {data.layout === "fullart" ? <FullArtLayout data={data} /> : <ClassicLayout data={data} />}

        {!disableHolo && <HoloLayer strength={rarity.holo} style={data.foilStyle} />}

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
  );
}

export interface TradingCardProps {
  data: CardData;
  /** Skala tampilan. 1 = 390×545 px. Export PNG memakai ExportStage (selalu ukuran penuh). */
  scale?: number;
  className?: string;
  /** Matikan foil holo walaupun rarity-nya rare / ultra. */
  disableHolo?: boolean;
  /** true = tampilkan sisi belakang. */
  flipped?: boolean;
  /** Jika diisi, kartu bisa diklik / ditekan Enter untuk dibalik. */
  onFlip?: () => void;
  /** Render sisi belakang. Matikan untuk thumbnail agar ringan. */
  withBack?: boolean;
  /** Gambar belakang kartu dari upload user (data URL). */
  backImage?: string | null;
  /** Overlay tambahan di atas sisi depan. Diposisikan absolute di dalam kartu. */
  children?: ReactNode;
}

/**
 * Kartu trading lengkap dengan animasi balik 3D.
 * Posisi kilau holo mengikuti CSS variable --mx / --my dari <HoloTilt>.
 */
export function TradingCard({
  data,
  scale = 1,
  className,
  disableHolo = false,
  flipped = false,
  onFlip,
  withBack = true,
  backImage,
  children,
}: TradingCardProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onFlip && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onFlip();
    }
  };

  const face = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

  return (
    <div
      className={cn("relative shrink-0", onFlip && "cursor-pointer", className)}
      role={onFlip ? "button" : undefined}
      tabIndex={onFlip ? 0 : undefined}
      aria-label={onFlip ? (flipped ? "Balik ke depan kartu" : "Balik ke belakang kartu") : undefined}
      onClick={onFlip}
      onKeyDown={onKeyDown}
      style={{
        width: CARD_WIDTH * scale,
        height: CARD_HEIGHT * scale,
        borderRadius: 22 * scale,
        boxShadow: scale >= 0.8 ? "0 24px 50px -12px rgba(0,0,0,.65)" : "0 8px 18px -8px rgba(0,0,0,.6)",
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left", perspective: 1400 }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 700ms cubic-bezier(.2,.8,.2,1)",
            transform: `rotateY(${flipped ? 180 : 0}deg)`,
          }}
        >
          <div style={face}>
            <CardFront data={data} disableHolo={disableHolo}>
              {children}
            </CardFront>
          </div>
          {withBack && (
            <div style={{ ...face, transform: "rotateY(180deg)" }}>
              <CardBack image={backImage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
