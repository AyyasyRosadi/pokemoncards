"use client";

import { Button } from "@heroui/react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fileToDataUrl } from "@/lib/utils";
import { CardBack } from "../card/CardBack";

export interface BackImagePickerProps {
  /** Gambar belakang buatan user (data URL). null = pakai /card-back.jpg atau desain bawaan. */
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
  /** Konten tambahan di bawah tombol. */
  children?: ReactNode;
}

/** Pilih gambar untuk belakang kartu. Hasilnya dipakai di preview, PNG, 3D, dan video. */
export function BackImagePicker({ value, onChange, className, children }: BackImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      onChange(await fileToDataUrl(file, 1000));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membaca gambar.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-4">
        <div className="shrink-0 overflow-hidden rounded-lg shadow-lg" style={{ width: 70, height: 98 }}>
          <div style={{ transform: "scale(0.1795)", transformOrigin: "top left" }}>
            <CardBack image={value} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{value ? "Gambar belakang kustom" : "Belakang kartu bawaan"}</p>
          <p className="text-xs text-white/55">
            Upload gambar rasio kartu (portrait). Atau taruh file <code className="rounded bg-white/10 px-1">card-back.jpg</code> di folder{" "}
            <code className="rounded bg-white/10 px-1">public/</code> sebagai bawaan.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onPress={() => inputRef.current?.click()}>
          <ImagePlus size={14} /> Upload gambar belakang
        </Button>
        {value && (
          <Button size="sm" variant="ghost" onPress={() => onChange(null)}>
            <RotateCcw size={14} /> Kembali ke bawaan
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
      {children}
    </div>
  );
}
