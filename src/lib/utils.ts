import { BASE_CARD, DEFAULT_TRANSFORM, getTemplate } from "./templates";
import type { CardData } from "./types";

const DRAFT_KEY = "fotocard:draft:v1";

/**
 * clamp — batasi angka dalam rentang tertentu.
 * Task:
 * 1. Terima nilai, batas minimum, dan batas maksimum
 * 2. Kembalikan min jika terlalu kecil, max jika terlalu besar
 * 3. Kembalikan min jika nilai bukan angka valid (NaN)
 */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * slugify — ubah teks bebas menjadi nama file yang aman.
 * Task:
 * 1. Ubah ke huruf kecil dan hapus aksen
 * 2. Ganti semua karakter selain huruf/angka dengan tanda "-"
 * 3. Hapus "-" di awal/akhir, fallback ke "card" jika kosong
 */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "card";
}

/**
 * buildCardFromTemplate — buat data kartu baru dari sebuah template.
 * Task:
 * 1. Cari template berdasarkan id (jika tidak ada, kembalikan data saat ini)
 * 2. Mulai dari BASE_CARD lalu timpa dengan data template
 * 3. Pertahankan foto, posisi foto, filter, nama, illustrator, dan lokasi milik user
 * 4. Kembalikan objek CardData lengkap
 */
export function buildCardFromTemplate(templateId: string, current: CardData): CardData {
  const template = getTemplate(templateId);
  if (!template) return current;

  const keepName = current.name.trim() && current.name !== BASE_CARD.name;

  return {
    ...BASE_CARD,
    ...template.data,
    name: keepName ? current.name : (template.data.name ?? BASE_CARD.name),
    illustrator: current.illustrator,
    location: current.location,
    photo: current.photo,
    photoTransform: current.photoTransform,
    photoFilter: current.photoFilter,
  };
}

/**
 * fileToDataUrl — baca file gambar dan perkecil agar ringan.
 * Task:
 * 1. Validasi bahwa file adalah gambar
 * 2. Baca file menjadi object URL lalu load sebagai HTMLImageElement
 * 3. Perkecil sisi terpanjang ke maxSize piksel (rasio tetap)
 * 4. Gambar ke canvas dan export: PNG untuk gambar transparan (png/webp), JPEG untuk sisanya
 * 5. Kembalikan data URL (data URL dipakai supaya export PNG tidak kena masalah CORS)
 */
export async function fileToDataUrl(file: File, maxSize = 1600): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, WebP).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
      el.src = objectUrl;
    });

    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak tersedia di browser ini.");
    ctx.drawImage(img, 0, 0, w, h);

    const keepAlpha = file.type === "image/png" || file.type === "image/webp";
    return keepAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * loadDraft — ambil kartu terakhir yang disimpan di browser.
 * Task:
 * 1. Baca localStorage (aman untuk SSR dan private mode)
 * 2. Parse JSON dan gabungkan dengan BASE_CARD supaya field baru tidak hilang
 * 3. Kembalikan null jika tidak ada draft atau datanya rusak
 */
export function loadDraft(): CardData | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CardData>;
    return {
      ...BASE_CARD,
      ...parsed,
      photoTransform: { ...DEFAULT_TRANSFORM, ...(parsed.photoTransform ?? {}) },
    };
  } catch {
    return null;
  }
}

/**
 * saveDraft — simpan kartu ke browser.
 * Task:
 * 1. Serialisasi data kartu ke JSON
 * 2. Simpan ke localStorage
 * 3. Abaikan error (kuota penuh / private mode) tanpa mengganggu user
 */
export function saveDraft(data: CardData): void {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* kuota penuh atau storage diblokir */
  }
}

/**
 * clearDraft — hapus draft tersimpan.
 * Task:
 * 1. Hapus key draft dari localStorage
 * 2. Abaikan error storage
 */
export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* abaikan */
  }
}

/**
 * hexToRgba — ubah warna hex menjadi string rgba().
 * Task:
 * 1. Terima hex 3 atau 6 digit (dengan/tanpa "#")
 * 2. Pecah menjadi komponen R, G, B
 * 3. Kembalikan "rgba(r, g, b, alpha)"
 */
export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
