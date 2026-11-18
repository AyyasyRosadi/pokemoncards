"use client";

import { Button } from "@heroui/react";
import { Box, Check, Copy, Download, Film, ImageDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { isMobileDevice } from "@/lib/device";
import { buildCardFiles, copyCardToClipboard, nodeToDataUrl, type CardSide } from "@/lib/exportCard";
import { FOIL_STYLES } from "@/lib/foil";
import { RARITIES } from "@/lib/rarity";
import { saveFiles, type SaveResult } from "@/lib/saveToDevice";
import { isVideoRecordingSupported, recordSpinVideo } from "@/lib/spinVideo";
import type { CardData } from "@/lib/types";
import { getDisplayName, slugify } from "@/lib/utils";
import { buildViewerHtml, viewerToFile } from "@/lib/viewer3d";
import { SaveSheet } from "./SaveSheet";

export interface ExportBarProps {
  data: CardData;
  /** Gambar belakang kustom (data URL), dipakai sebagai kunci cache. */
  backImage?: string | null;
  /** Node dari <ExportStage>: depan lengkap dengan foil. */
  frontRef: RefObject<HTMLDivElement | null>;
  /** Node dari <ExportStage>: depan tanpa foil (untuk 3D & video). */
  frontCleanRef: RefObject<HTMLDivElement | null>;
  /** Node dari <ExportStage>: belakang. */
  backRef: RefObject<HTMLDivElement | null>;
  className?: string;
  children?: ReactNode;
}

type Status = { kind: "idle" } | { kind: "busy"; label: string } | { kind: "ok"; label: string } | { kind: "error"; label: string };

const SIDES: { id: CardSide; label: string }[] = [
  { id: "front", label: "Depan" },
  { id: "back", label: "Belakang" },
  { id: "both", label: "Keduanya" },
];

interface PrefetchEntry {
  data: CardData;
  backImage: string | null | undefined;
  side: CardSide;
  files: File[];
}

/**
 * Panel simpan: PNG (langsung ke Galeri di HP), 3D interaktif (.html), dan video putar 360°.
 * Di HP, file disiapkan di latar belakang supaya tombol Simpan bisa membuka share sheet seketika.
 */
export function ExportBar({ data, backImage, frontRef, frontCleanRef, backRef, className, children }: ExportBarProps) {
  const [side, setSide] = useState<CardSide>("front");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [sheet, setSheet] = useState<File[] | null>(null);
  const [mobile, setMobile] = useState(false);
  const [videoOk, setVideoOk] = useState(false);
  const prefetch = useRef<PrefetchEntry | null>(null);

  const rarity = RARITIES[data.rarity];
  const name = getDisplayName(data) || data.name || "kartu";
  const busy = status.kind === "busy";

  useEffect(() => {
    setMobile(isMobileDevice());
    setVideoOk(isVideoRecordingSupported());
  }, []);

  // status sukses / error hilang sendiri
  useEffect(() => {
    if (status.kind !== "ok" && status.kind !== "error") return;
    const id = setTimeout(() => setStatus({ kind: "idle" }), 4500);
    return () => clearTimeout(id);
  }, [status]);

  // HP: siapkan PNG di latar belakang agar share dipanggil langsung dari tap (syarat iOS)
  useEffect(() => {
    if (!mobile || busy) return;
    const id = setTimeout(async () => {
      try {
        const files = await buildCardFiles({ front: frontRef.current, back: backRef.current, side, name });
        prefetch.current = { data, backImage, side, files };
      } catch {
        prefetch.current = null;
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [mobile, busy, data, backImage, side, name, frontRef, backRef]);

  const finish = useCallback((result: SaveResult, files: File[], doneLabel: string) => {
    if (result === "needs-tap") {
      setSheet(files);
      setStatus({ kind: "idle" });
    } else if (result === "cancelled") {
      setStatus({ kind: "idle" });
    } else {
      setStatus({ kind: "ok", label: result === "shared" ? "Selesai lewat menu perangkat." : doneLabel });
    }
  }, []);

  const run = async (label: string, task: () => Promise<void>) => {
    setStatus({ kind: "busy", label });
    try {
      await task();
    } catch (e) {
      setStatus({ kind: "error", label: e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi." });
    }
  };

  const savePng = async () => {
    const cached = prefetch.current;
    if (cached && cached.data === data && cached.backImage === backImage && cached.side === side) {
      // file sudah siap: share dipanggil langsung dari tap, tanpa menunggu render
      finish(await saveFiles(cached.files, { title: name }), cached.files, cached.files.length > 1 ? "2 gambar terunduh." : "PNG terunduh.");
      return;
    }
    await run("Membuat gambar…", async () => {
      const files = await buildCardFiles({ front: frontRef.current, back: backRef.current, side, name });
      finish(await saveFiles(files, { title: name }), files, files.length > 1 ? "2 gambar terunduh." : "PNG terunduh.");
    });
  };

  const copy = () =>
    run("Menyalin…", async () => {
      if (!frontRef.current) throw new Error("Kartu belum siap.");
      const ok = await copyCardToClipboard(frontRef.current);
      if (!ok) throw new Error("Browser ini belum mendukung salin gambar. Pakai Unduh PNG.");
      setStatus({ kind: "ok", label: "Gambar disalin ke clipboard." });
    });

  const renderBoth = async () => {
    if (!frontCleanRef.current || !backRef.current) throw new Error("Kartu belum siap.");
    const [frontSrc, backSrc] = await Promise.all([nodeToDataUrl(frontCleanRef.current, 2), nodeToDataUrl(backRef.current, 2)]);
    return { frontSrc, backSrc };
  };

  const save3d = () =>
    run("Membuat file 3D…", async () => {
      const { frontSrc, backSrc } = await renderBoth();
      const foil = rarity.holo > 0 ? FOIL_STYLES[data.foilStyle].layers(rarity.holo) : [];
      const file = viewerToFile(buildViewerHtml({ title: name, frontSrc, backSrc, foil }), `${slugify(name)}-3d.html`);
      finish(await saveFiles([file], { title: name }), [file], "File 3D terunduh. Buka di browser.");
    });

  const saveVideo = () =>
    run("Menyiapkan video…", async () => {
      const { frontSrc, backSrc } = await renderBoth();
      const file = await recordSpinVideo({
        frontSrc,
        backSrc,
        holo: rarity.holo > 0,
        fileName: `${slugify(name)}-360`,
        onProgress: (p) => setStatus({ kind: "busy", label: `Merekam video… ${Math.round(p * 100)}% (tetap di halaman ini)` }),
      });
      finish(await saveFiles([file], { title: name }), [file], "Video terunduh.");
    });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div role="group" aria-label="Sisi kartu yang disimpan" className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.06] p-1">
        {SIDES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={side === s.id}
            onClick={() => setSide(s.id)}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs font-bold transition",
              side === s.id ? "bg-indigo-500/40 text-white" : "text-white/55 hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={cn("grid gap-2", mobile ? "grid-cols-1" : "grid-cols-[1fr_auto]")}>
        <Button variant="primary" isDisabled={busy} onPress={savePng}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : mobile ? <ImageDown size={16} /> : <Download size={16} />}
          {mobile ? "Simpan ke Galeri" : "Unduh PNG"}
        </Button>
        {!mobile && (
          <Button variant="secondary" isDisabled={busy} onPress={copy}>
            <Copy size={16} /> Salin
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" isDisabled={busy} onPress={save3d}>
          <Box size={16} /> 3D interaktif
        </Button>
        {videoOk && (
          <Button variant="secondary" isDisabled={busy} onPress={saveVideo}>
            <Film size={16} /> Video 360°
          </Button>
        )}
      </div>

      <p
        aria-live="polite"
        className={cn(
          "flex min-h-4 items-center gap-1 text-xs",
          status.kind === "error" ? "text-red-400" : status.kind === "ok" ? "text-emerald-400" : "text-white/50",
        )}
      >
        {status.kind === "ok" && <Check size={13} />}
        {status.kind === "idle"
          ? mobile
            ? "Tombol Simpan membuka menu iPhone: pilih Simpan Gambar untuk masuk ke Galeri."
            : "PNG 1170×1635 dengan sudut transparan. 3D interaktif = file .html yang bisa digerakkan."
          : status.label}
      </p>

      <SaveSheet files={sheet} onClose={() => setSheet(null)} title={name} />
      {children}
    </div>
  );
}
