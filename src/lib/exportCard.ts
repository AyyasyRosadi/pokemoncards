import { toBlob, toPng } from "html-to-image";
import { isSafari } from "./device";
import { CARD_HEIGHT, CARD_WIDTH } from "./types";
import { slugify } from "./utils";

export type CardSide = "front" | "back" | "both";

const baseOptions = (pixelRatio: number) => ({
  pixelRatio,
  cacheBust: true,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  // node asli bisa sedang di-scale untuk preview, export selalu ukuran penuh
  style: { transform: "none", margin: "0" },
});

/**
 * warmUp — render dummy supaya font & gambar sudah termuat sebelum render asli.
 * Task:
 * 1. Tunggu document.fonts.ready
 * 2. Render node kecil (1×) — Safari butuh 2 kali, browser lain 1 kali
 * 3. Abaikan error pada pemanasan
 */
async function warmUp(node: HTMLElement): Promise<void> {
  try {
    await document.fonts?.ready;
    const rounds = isSafari() ? 2 : 1;
    for (let i = 0; i < rounds; i++) await toBlob(node, baseOptions(1));
  } catch {
    /* abaikan, render asli yang menentukan */
  }
}

/**
 * nodeToBlob — render elemen kartu menjadi Blob PNG.
 * Task:
 * 1. Panaskan render (font + gambar)
 * 2. Render node ke PNG pada resolusi pixelRatio (sudut tetap transparan)
 * 3. Lempar error jika hasilnya kosong
 */
export async function nodeToBlob(node: HTMLElement, pixelRatio = 3): Promise<Blob> {
  await warmUp(node);
  const blob = await toBlob(node, baseOptions(pixelRatio));
  if (!blob) throw new Error("Gagal membuat gambar kartu.");
  return blob;
}

/**
 * nodeToDataUrl — render elemen kartu menjadi data URL PNG.
 * Task:
 * 1. Panaskan render
 * 2. Render ke data URL pada resolusi pixelRatio
 * 3. Dipakai untuk 3D interaktif dan video (butuh gambar yang bisa dibaca canvas)
 */
export async function nodeToDataUrl(node: HTMLElement, pixelRatio = 2): Promise<string> {
  await warmUp(node);
  return toPng(node, baseOptions(pixelRatio));
}

export interface BuildCardFilesOptions {
  front: HTMLElement | null;
  back: HTMLElement | null;
  side: CardSide;
  name: string;
  pixelRatio?: number;
}

/**
 * buildCardFiles — hasilkan file PNG kartu sesuai sisi yang dipilih.
 * Task:
 * 1. Tentukan sisi yang dirender dari `side` (depan / belakang / keduanya)
 * 2. Render tiap node menjadi Blob
 * 3. Bungkus sebagai File bernama "<nama>-depan.png" / "<nama>-belakang.png"
 * 4. Kembalikan daftar File (siap dibagikan atau diunduh)
 */
export async function buildCardFiles({ front, back, side, name, pixelRatio = 3 }: BuildCardFilesOptions): Promise<File[]> {
  const slug = slugify(name);
  const jobs: { node: HTMLElement | null; label: string }[] = [];
  if (side !== "back") jobs.push({ node: front, label: "depan" });
  if (side !== "front") jobs.push({ node: back, label: "belakang" });

  const files: File[] = [];
  for (const job of jobs) {
    if (!job.node) continue;
    const blob = await nodeToBlob(job.node, pixelRatio);
    files.push(new File([blob], `${slug}-${job.label}.png`, { type: "image/png" }));
  }
  if (files.length === 0) throw new Error("Kartu belum siap diekspor.");
  return files;
}

/**
 * copyCardToClipboard — salin kartu sebagai gambar ke clipboard.
 * Task:
 * 1. Cek dukungan Clipboard API untuk gambar
 * 2. Render node kartu menjadi Blob PNG
 * 3. Tulis blob ke clipboard
 * 4. Kembalikan false jika browser tidak mendukung
 */
export async function copyCardToClipboard(node: HTMLElement, pixelRatio = 2): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return false;
  const blob = await nodeToBlob(node, pixelRatio);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  return true;
}
