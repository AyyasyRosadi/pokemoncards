import { isMobileDevice } from "./device";

export type SaveResult = "shared" | "downloaded" | "cancelled" | "needs-tap";

/**
 * canShareFiles — cek apakah browser bisa membagikan file lewat share sheet.
 * Task:
 * 1. Pastikan navigator.share dan navigator.canShare tersedia
 * 2. Tanyakan canShare({ files }) untuk file yang akan dikirim
 * 3. Kembalikan true jika didukung (di iPhone, share sheet berisi "Simpan Gambar" ke Galeri)
 */
export function canShareFiles(files: File[]): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

/**
 * downloadFile — unduh satu file lewat elemen <a download>.
 * Task:
 * 1. Buat object URL dari file
 * 2. Klik link sementara agar browser mengunduh
 * 3. Bersihkan link dan cabut object URL setelah jeda singkat
 */
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * shareFiles — buka share sheet bawaan perangkat dengan file terlampir.
 * Task:
 * 1. Panggil navigator.share({ files, title })
 * 2. AbortError = user menutup sheet → "cancelled"
 * 3. NotAllowedError = izin gestur kedaluwarsa → "needs-tap" (tampilkan tombol manual)
 * 4. Error lain → "failed" agar pemanggil memakai cadangan unduhan
 */
export async function shareFiles(files: File[], title: string): Promise<"shared" | "cancelled" | "needs-tap" | "failed"> {
  try {
    await navigator.share({ files, title });
    return "shared";
  } catch (e) {
    const name = e instanceof DOMException ? e.name : "";
    if (name === "AbortError") return "cancelled";
    if (name === "NotAllowedError") return "needs-tap";
    return "failed";
  }
}

export interface SaveOptions {
  title?: string;
}

/**
 * saveFiles — simpan file ke perangkat dengan cara terbaik.
 * Task:
 * 1. Di HP yang mendukung: buka share sheet (iPhone: "Simpan Gambar" langsung ke Galeri)
 * 2. Jika share butuh tap ulang, kembalikan "needs-tap" untuk menampilkan sheet manual
 * 3. Di desktop atau jika share gagal: unduh tiap file
 * 4. Kembalikan hasil: shared / downloaded / cancelled / needs-tap
 */
export async function saveFiles(files: File[], { title = "Kartu" }: SaveOptions = {}): Promise<SaveResult> {
  if (isMobileDevice() && canShareFiles(files)) {
    const result = await shareFiles(files, title);
    if (result !== "failed") return result;
  }
  for (const [i, file] of files.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 300));
    downloadFile(file);
  }
  return "downloaded";
}
