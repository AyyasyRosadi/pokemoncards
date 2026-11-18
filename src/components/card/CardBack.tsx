"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { CARD_HEIGHT, CARD_WIDTH } from "@/lib/types";

/** Letakkan gambar belakang kartu di sini (folder public/). */
export const DEFAULT_BACK_SRC = "/card-back.png";

const fileChecks = new Map<string, Promise<boolean>>();

/**
 * fileExists — cek sekali apakah file gambar bawaan ada.
 * Task:
 * 1. Cari hasil cek sebelumnya untuk src ini (cache modul)
 * 2. Jika belum ada, muat gambar sekali dan simpan hasilnya
 * 3. Kembalikan true jika berhasil dimuat — jadi 404 hanya terjadi satu kali, bukan per kartu
 */
function fileExists(src: string): Promise<boolean> {
  let check = fileChecks.get(src);
  if (!check) {
    check = new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
    fileChecks.set(src, check);
  }
  return check;
}

export interface CardBackProps {
  /** Gambar belakang dari upload user (data URL). Prioritas tertinggi. */
  image?: string | null;
  /** File bawaan di folder public/. Dipakai jika `image` kosong. */
  src?: string;
  /** Ref ke elemen kartu (ukuran asli) — dipakai untuk export. */
  cardRef?: Ref<HTMLDivElement>;
  className?: string;
  /** Overlay tambahan di atas belakang kartu. */
  children?: ReactNode;
}

/**
 * Belakang kartu 390×545.
 * Urutan sumber: upload user → /card-back.jpg → desain bawaan orisinal.
 */
export function CardBack({ image, src = DEFAULT_BACK_SRC, cardRef, className, children }: CardBackProps) {
  const source = image || src;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [fileOk, setFileOk] = useState(false);

  useEffect(() => {
    if (image) return;
    let alive = true;
    void fileExists(src).then((ok) => alive && setFileOk(ok));
    return () => {
      alive = false;
    };
  }, [image, src]);

  const showImage = failedSource !== source && (image ? true : fileOk);

  return (
    <div
      ref={cardRef}
      className={cn("relative select-none overflow-hidden", className)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 22,
        background: "radial-gradient(circle at 50% 38%, #4f46e5 0%, #2b2a8f 35%, #14124a 70%, #0b0a2e 100%)",
      }}
    >
      {/* desain bawaan: kisi berlian + bingkai emas + emblem bintang */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, rgba(255,255,255,.07) 0 1px, transparent 1px 22px)",
        }}
      />
      <div
        className="absolute"
        style={{ inset: 14, borderRadius: 12, border: "2px solid rgba(251,191,36,.7)", boxShadow: "inset 0 0 0 5px rgba(0,0,0,.18)" }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 150,
            height: 150,
            background: "conic-gradient(from 20deg, #fde68a, #f59e0b, #b45309, #fde68a, #f59e0b, #fde68a)",
            boxShadow: "0 8px 24px rgba(0,0,0,.5)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 122, height: 122, background: "radial-gradient(circle at 35% 30%, #3730a3, #1e1b4b 70%)", border: "3px solid rgba(0,0,0,.35)" }}
          >
            <Sparkles size={58} strokeWidth={1.6} color="#fcd34d" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[26px] font-extrabold leading-none tracking-[0.3em] text-amber-200" style={{ fontFamily: "var(--font-card)" }}>
            FOTOCARD
          </p>
          <p className="mt-2 text-[10px] font-bold tracking-[0.5em] text-white/50">TRADING CARD</p>
        </div>
      </div>

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailedSource(source)}
        />
      )}

      {children && <div className="absolute inset-0">{children}</div>}
    </div>
  );
}
