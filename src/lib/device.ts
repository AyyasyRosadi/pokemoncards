/**
 * isMobileDevice — deteksi HP / tablet (termasuk iPad yang menyamar sebagai Mac).
 * Task:
 * 1. Pastikan kode berjalan di browser
 * 2. Cek user agent iPhone / iPad / iPod / Android
 * 3. Cek iPadOS: platform MacIntel dengan layar sentuh
 * 4. Kembalikan true jika salah satu cocok
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * isSafari — deteksi Safari (iOS maupun macOS) yang butuh "pemanasan" render gambar.
 * Task:
 * 1. Pastikan kode berjalan di browser
 * 2. Cek "Safari" ada di user agent
 * 3. Kecualikan Chrome / Chromium / Android yang juga memuat kata Safari
 */
export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Android/i.test(ua);
}

type MotionEventCtor = { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * requestMotionPermission — minta izin sensor gerak (gyroscope).
 * Task:
 * 1. Pastikan DeviceOrientationEvent tersedia
 * 2. Di iOS 13+ panggil requestPermission() (harus dari tap user)
 * 3. Di browser lain, izin dianggap langsung diberikan
 * 4. Kembalikan true jika sensor boleh dipakai
 */
export async function requestMotionPermission(): Promise<boolean> {
  if (typeof window === "undefined" || typeof window.DeviceOrientationEvent === "undefined") return false;
  const ctor = window.DeviceOrientationEvent as unknown as MotionEventCtor;
  if (typeof ctor.requestPermission === "function") {
    try {
      return (await ctor.requestPermission()) === "granted";
    } catch {
      return false;
    }
  }
  return true;
}
