"use client";

import type { ReactNode, Ref } from "react";
import { CARD_HEIGHT, CARD_WIDTH, type CardData } from "@/lib/types";
import { CardBack } from "./CardBack";
import { CardFront } from "./TradingCard";

export interface ExportStageProps {
  data: CardData;
  backImage?: string | null;
  /** Depan lengkap dengan foil (untuk PNG). */
  frontRef: Ref<HTMLDivElement>;
  /** Depan tanpa foil (untuk 3D interaktif dan video, foilnya digerakkan sendiri). */
  frontCleanRef: Ref<HTMLDivElement>;
  /** Belakang kartu. */
  backRef: Ref<HTMLDivElement>;
  children?: ReactNode;
}

/**
 * Salinan datar kartu di luar layar. Semua export membaca node di sini,
 * sehingga hasilnya tidak terpengaruh miring / balik / skala preview.
 */
export function ExportStage({ data, backImage, frontRef, frontCleanRef, backRef, children }: ExportStageProps) {
  return (
    <div aria-hidden className="pointer-events-none fixed" style={{ left: -10000, top: 0, width: CARD_WIDTH, height: CARD_HEIGHT * 3 }}>
      <CardFront data={data} cardRef={frontRef} />
      <CardFront data={data} disableHolo cardRef={frontCleanRef} />
      <CardBack image={backImage} cardRef={backRef} />
      {children}
    </div>
  );
}
