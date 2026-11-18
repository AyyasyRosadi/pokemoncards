"use client";

import { Button, Modal, buttonVariants } from "@heroui/react";
import { Download, FileBox, ImageDown, X } from "lucide-react";
import { useEffect, useMemo, type ReactNode } from "react";
import { downloadFile } from "@/lib/saveToDevice";

export interface SaveSheetProps {
  /** File yang siap disimpan. null = sheet tertutup. */
  files: File[] | null;
  onClose: () => void;
  title?: string;
  /** Konten tambahan di bawah petunjuk (mis. info lain). */
  children?: ReactNode;
}

/**
 * Panel "Simpan ke Galeri". Dipakai saat iOS menolak share otomatis karena
 * render memakan waktu. Tombol di sini memanggil share langsung dari tap,
 * jadi selalu diizinkan.
 */
export function SaveSheet({ files, onClose, title = "Kartu", children }: SaveSheetProps) {
  const previews = useMemo(() => (files ?? []).map((f) => ({ name: f.name, url: URL.createObjectURL(f), kind: f.type.startsWith("video/") ? "video" : f.type.startsWith("image/") ? "image" : "file" })), [files]);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  // dipanggil langsung dari event click (tanpa await sebelumnya) supaya izin gestur iOS tetap berlaku
  const shareNow = () => {
    if (!files) return;
    navigator
      .share({ files, title })
      .then(onClose)
      .catch(() => {
        /* user menutup share sheet */
      });
  };

  const canShare = typeof navigator !== "undefined" && typeof navigator.canShare === "function" && !!files && navigator.canShare({ files });

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={!!files}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Modal.Container placement="center" size="md">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Siap disimpan</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center gap-3">
                  {previews.map((p) =>
                    p.kind === "video" ? (
                      <video key={p.name} src={p.url} className="h-56 w-auto rounded-xl shadow-lg" controls playsInline muted loop />
                    ) : p.kind === "file" ? (
                      <div key={p.name} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                        <FileBox size={18} /> {p.name}
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p.name} src={p.url} alt={p.name} className="h-56 w-auto rounded-xl shadow-lg" />
                    ),
                  )}
                </div>

                {canShare && (
                  <button type="button" onClick={shareNow} className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })}>
                    <ImageDown size={18} /> Simpan ke Galeri
                  </button>
                )}

                <p className="text-xs leading-relaxed text-white/60">
                  {canShare ? "Di iPhone, pilih " : "Di iPhone, tekan lama gambar lalu pilih "}
                  <b className="text-white/80">{canShare ? "Simpan Gambar / Simpan Video" : "Tambahkan ke Foto"}</b>
                  {canShare ? " pada menu yang muncul agar tersimpan di Galeri." : " agar tersimpan di Galeri."}
                </p>
                {children}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={() => files?.forEach(downloadFile)}>
                <Download size={16} /> Unduh file
              </Button>
              <Button variant="ghost" onPress={onClose}>
                <X size={16} /> Tutup
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
