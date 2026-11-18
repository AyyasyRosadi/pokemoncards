export interface SpinVideoOptions {
  /** Gambar depan tanpa foil (data URL PNG). */
  frontSrc: string;
  /** Gambar belakang (data URL PNG). */
  backSrc: string;
  /** Tambahkan kilau yang bergerak di sisi depan (untuk kartu Rare / Ultra). */
  holo: boolean;
  /** Nama file tanpa ekstensi. */
  fileName: string;
  width?: number;
  height?: number;
  durationMs?: number;
  /** Dipanggil 0 – 1 selama merekam. */
  onProgress?: (progress: number) => void;
}

const MIME_CANDIDATES: { mime: string; ext: string }[] = [
  { mime: "video/mp4;codecs=avc1.42E01E", ext: "mp4" },
  { mime: "video/mp4", ext: "mp4" },
  { mime: "video/webm;codecs=vp9", ext: "webm" },
  { mime: "video/webm;codecs=vp8", ext: "webm" },
  { mime: "video/webm", ext: "webm" },
];

/**
 * pickMime — pilih format video yang didukung browser.
 * Task:
 * 1. Pastikan MediaRecorder tersedia
 * 2. Coba kandidat dari yang paling kompatibel (mp4 untuk iPhone, lalu webm)
 * 3. Kembalikan { mime, ext } pertama yang didukung, atau null
 */
function pickMime(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((c) => MediaRecorder.isTypeSupported(c.mime)) ?? null;
}

/**
 * isVideoRecordingSupported — cek apakah browser bisa merekam video dari canvas.
 * Task:
 * 1. Cek canvas.captureStream tersedia
 * 2. Cek ada format video yang didukung MediaRecorder
 */
export function isVideoRecordingSupported(): boolean {
  if (typeof document === "undefined") return false;
  return "captureStream" in HTMLCanvasElement.prototype && pickMime() !== null;
}

/**
 * loadImage — muat gambar dari URL / data URL.
 * Task:
 * 1. Buat HTMLImageElement
 * 2. Tunggu onload (decode selesai)
 * 3. Lempar error jika gagal
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gambar kartu gagal dimuat."));
    img.src = src;
  });
}

/**
 * angleAt — sudut putar (radian) pada waktu t.
 * Task:
 * 1. Tahan di depan kartu sebentar di awal dan akhir
 * 2. Di tengah, putar penuh 360° dengan easing halus
 */
function angleAt(t: number): number {
  const hold = 0.12;
  const end = 0.88;
  if (t <= hold) return 0;
  if (t >= end) return Math.PI * 2;
  const k = (t - hold) / (end - hold);
  const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  return eased * Math.PI * 2;
}

/**
 * recordSpinVideo — rekam kartu berputar 360° menjadi video.
 * Task:
 * 1. Muat gambar depan dan belakang
 * 2. Tiap frame: proyeksikan kartu dengan perspektif (iris vertikal) sesuai sudut putar
 * 3. Sisi depan memakai kilau bergerak jika `holo`; sisi belakang tampil saat kartu terbalik
 * 4. Rekam canvas dengan MediaRecorder (mp4 di iPhone, webm di browser lain)
 * 5. Kembalikan File video, siap disimpan ke Galeri lewat share sheet
 */
export async function recordSpinVideo(opts: SpinVideoOptions): Promise<File> {
  const picked = pickMime();
  if (!picked) throw new Error("Browser ini belum mendukung perekaman video.");

  const W = opts.width ?? 720;
  const H = opts.height ?? 960;
  const duration = opts.durationMs ?? 5200;
  const [front, back] = await Promise.all([loadImage(opts.frontSrc), loadImage(opts.backSrc)]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia di browser ini.");

  // tekstur depan (dengan kilau) digambar ulang tiap frame di kanvas terpisah
  const tex = document.createElement("canvas");
  tex.width = front.naturalWidth;
  tex.height = front.naturalHeight;
  const tctx = tex.getContext("2d");
  if (!tctx) throw new Error("Canvas tidak tersedia di browser ini.");

  const cardW = W * 0.74;
  const cardH = cardW * (545 / 390);
  const cx = W / 2;
  const cy = H / 2 - 12;
  const SLICES = Math.min(front.naturalWidth, 480);
  const DIST = 1900;

  const draw = (theta: number) => {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const showFront = cosT >= 0;

    const bg = ctx.createRadialGradient(W * 0.8, -H * 0.05, 40, W / 2, H / 2, H * 0.9);
    bg.addColorStop(0, "#26286b");
    bg.addColorStop(0.45, "#12132e");
    bg.addColorStop(1, "#0a0b14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // bayangan di bawah kartu
    const shadowW = cardW * (0.25 + 0.75 * Math.abs(cosT));
    ctx.save();
    ctx.translate(cx, cy + cardH / 2 + 38);
    ctx.scale(1, 0.14);
    const sg = ctx.createRadialGradient(0, 0, 2, 0, 0, shadowW / 2);
    sg.addColorStop(0, "rgba(0,0,0,.65)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(-W, -W, W * 2, W * 2);
    ctx.restore();

    let source: CanvasImageSource = back;
    let sw = back.naturalWidth;
    let sh = back.naturalHeight;
    if (showFront) {
      tctx.clearRect(0, 0, tex.width, tex.height);
      tctx.drawImage(front, 0, 0);
      if (opts.holo) {
        const gx = tex.width * (0.5 + sinT * 0.9);
        const g = tctx.createLinearGradient(gx - tex.width * 0.35, 0, gx + tex.width * 0.35, tex.height);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, "rgba(255,255,255,.32)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        tctx.globalCompositeOperation = "source-atop";
        tctx.fillStyle = g;
        tctx.fillRect(0, 0, tex.width, tex.height);
        tctx.globalCompositeOperation = "source-over";
      }
      source = tex;
      sw = tex.width;
      sh = tex.height;
    }

    // proyeksi perspektif: kartu dipotong vertikal, tiap irisan diskalakan menurut kedalamannya
    for (let i = 0; i < SLICES; i++) {
      const u0 = i / SLICES;
      const u1 = (i + 1) / SLICES;
      const p0 = (u0 - 0.5) * cardW;
      const p1 = (u1 - 0.5) * cardW;
      const s0 = DIST / (DIST - p0 * sinT);
      const s1 = DIST / (DIST - p1 * sinT);
      const x0 = cx + p0 * cosT * s0;
      const x1 = cx + p1 * cosT * s1;
      const sMid = (s0 + s1) / 2;
      // dilihat dari belakang, tekstur belakang tampil terbalik kiri-kanan
      const srcX = (showFront ? u0 : 1 - u1) * sw;
      const dh = cardH * sMid;
      ctx.drawImage(source, srcX, 0, sw / SLICES, sh, Math.min(x0, x1), cy - dh / 2, Math.abs(x1 - x0) + 1, dh);
    }
  };

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: picked.mime, videoBitsPerSecond: 8_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: picked.mime.split(";")[0] }));
    recorder.onerror = () => reject(new Error("Gagal merekam video."));
  });

  draw(0);
  recorder.start(250);

  await new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      draw(angleAt(t));
      opts.onProgress?.(t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });

  await new Promise((r) => setTimeout(r, 250));
  recorder.stop();
  const blob = await finished;
  if (blob.size === 0) throw new Error("Video kosong. Coba lagi dan jangan pindah tab saat merekam.");
  return new File([blob], `${opts.fileName}.${picked.ext}`, { type: blob.type });
}
