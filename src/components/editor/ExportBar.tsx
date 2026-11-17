"use client";

import { Button } from "@heroui/react";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { copyCardToClipboard, exportCardToPng } from "@/lib/exportCard";

export interface ExportBarProps {
  /** Ref ke elemen kartu (dari TradingCard.cardRef). */
  cardRef: RefObject<HTMLDivElement | null>;
  fileName: string;
  className?: string;
  children?: ReactNode;
}

type Status = { kind: "idle" } | { kind: "busy"; label: string } | { kind: "ok"; label: string } | { kind: "error"; label: string };

/** Tombol unduh PNG (3×) dan salin gambar ke clipboard. */
export function ExportBar({ cardRef, fileName, className, children }: ExportBarProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const run = async (label: string, done: string, task: (node: HTMLElement) => Promise<boolean | void>) => {
    const node = cardRef.current;
    if (!node) return;
    setStatus({ kind: "busy", label });
    try {
      const result = await task(node);
      if (result === false) {
        setStatus({ kind: "error", label: "Browser ini belum mendukung salin gambar. Pakai Unduh PNG." });
      } else {
        setStatus({ kind: "ok", label: done });
      }
    } catch {
      setStatus({ kind: "error", label: "Gagal membuat gambar. Coba lagi." });
    }
    setTimeout(() => setStatus({ kind: "idle" }), 3500);
  };

  const busy = status.kind === "busy";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button
          variant="primary"
          isDisabled={busy}
          onPress={() => run("Membuat PNG…", "PNG terunduh (1170×1635).", (n) => exportCardToPng(n, fileName, { pixelRatio: 3 }))}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Unduh PNG
        </Button>
        <Button variant="secondary" isDisabled={busy} onPress={() => run("Menyalin…", "Gambar disalin ke clipboard.", (n) => copyCardToClipboard(n))}>
          <Copy size={16} /> Salin
        </Button>
      </div>
      <p
        aria-live="polite"
        className={cn(
          "flex min-h-4 items-center gap-1 text-xs",
          status.kind === "error" ? "text-red-400" : status.kind === "ok" ? "text-emerald-400" : "text-white/50",
        )}
      >
        {status.kind === "ok" && <Check size={13} />}
        {status.kind === "idle" ? "Hasil PNG transparan di sudut, siap dibagikan atau dicetak." : status.label}
      </p>
      {children}
    </div>
  );
}
