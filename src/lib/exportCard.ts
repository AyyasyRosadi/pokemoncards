import { toBlob, toPng } from "html-to-image";
import { CARD_HEIGHT, CARD_WIDTH } from "./types";
import { slugify } from "./utils";

export interface ExportOptions {
  /** 1 = 390×545, 3 = 1170×1635 (default, siap cetak kecil) */
  pixelRatio?: number;
}

const baseOptions = (pixelRatio: number) => ({
  pixelRatio,
  cacheBust: true,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  // node asli bisa sedang di-scale untuk preview, export selalu ukuran penuh
  style: { transform: "none", margin: "0" },
});

/**
 * exportCardToPng — render elemen kartu menjadi file PNG dan unduh.
 * Task:
 * 1. Render node kartu ke PNG dengan resolusi pixelRatio (sudut tetap transparan)
 * 2. Buat nama file dari nama kartu
 * 3. Picu unduhan lewat elemen <a> sementara
 */
export async function exportCardToPng(
  node: HTMLElement,
  name: string,
  { pixelRatio = 3 }: ExportOptions = {},
): Promise<void> {
  // render dua kali: pass pertama memanaskan font & gambar agar hasil akhir tidak kosong
  await toPng(node, baseOptions(1));
  const dataUrl = await toPng(node, baseOptions(pixelRatio));

  const link = document.createElement("a");
  link.download = `${slugify(name)}-card.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * copyCardToClipboard — salin kartu sebagai gambar ke clipboard.
 * Task:
 * 1. Cek dukungan Clipboard API untuk gambar
 * 2. Render node kartu menjadi Blob PNG
 * 3. Tulis blob ke clipboard
 * 4. Kembalikan false jika browser tidak mendukung
 */
export async function copyCardToClipboard(
  node: HTMLElement,
  { pixelRatio = 2 }: ExportOptions = {},
): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;

  await toBlob(node, baseOptions(1));
  const blob = await toBlob(node, baseOptions(pixelRatio));
  if (!blob) return false;

  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  return true;
}
