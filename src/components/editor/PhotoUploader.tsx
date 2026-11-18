"use client";

import { Button } from "@heroui/react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fileToDataUrl } from "@/lib/utils";

export interface PhotoUploaderProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
  /** Konten tambahan di bawah dropzone (mis. kontrol posisi foto). */
  children?: ReactNode;
}

/** Dropzone foto: klik, drag & drop, atau paste (Ctrl/Cmd+V). */
export function PhotoUploader({ value, onChange, className, children }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        onChange(await fileToDataUrl(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal membaca gambar.");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (item) void handleFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition",
          dragging ? "border-indigo-400 bg-indigo-500/15" : "border-white/15 bg-white/[0.03] hover:border-white/30",
        )}
      >
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Foto kamu" className="size-full object-cover" />
          ) : (
            <ImagePlus className="text-white/50" size={30} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{busy ? "Memproses foto…" : value ? "Ganti foto" : "Upload fotomu"}</p>
          <p className="text-xs text-white/55">Klik, seret &amp; lepas, atau paste (Ctrl/Cmd + V). JPG, PNG, WebP.</p>
          <p className="mt-1 text-[11px] text-white/40">Foto portrait dengan wajah di tengah atas hasilnya paling bagus.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs font-semibold text-red-400">{error}</p>}

      {value && (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onPress={() => inputRef.current?.click()}>
            <Upload size={14} /> Ganti
          </Button>
          <Button size="sm" variant="danger-soft" onPress={() => onChange(null)}>
            <Trash2 size={14} /> Hapus
          </Button>
        </div>
      )}

      {children}
    </div>
  );
}
