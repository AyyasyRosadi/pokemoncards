import type { FoilStyle } from "./types";

/** Satu lapis foil. Bentuknya sengaja dibuat sama dengan style CSS agar bisa dipakai di React maupun di HTML 3D. */
export interface FoilLayer {
  backgroundImage: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  mixBlendMode: string;
  opacity: number;
}

export interface FoilConfig {
  id: FoilStyle;
  label: string;
  description: string;
  /** Daftar lapisan untuk kekuatan efek 0 – 1. Posisi kilau memakai CSS variable --mx / --my. */
  layers: (strength: number) => FoilLayer[];
}

const MX = "var(--mx, 50%)";
const MY = "var(--my, 50%)";

const dots = (opacity: number, blend = "overlay"): FoilLayer => ({
  opacity,
  mixBlendMode: blend,
  backgroundImage:
    "radial-gradient(circle at 12% 18%, #fff 0 1.2px, transparent 1.8px), radial-gradient(circle at 63% 41%, #fff 0 1px, transparent 1.6px), radial-gradient(circle at 38% 77%, #fff 0 1.4px, transparent 2px), radial-gradient(circle at 88% 64%, #fff 0 1px, transparent 1.6px)",
  backgroundSize: "64px 64px, 83px 83px, 71px 71px, 97px 97px",
  backgroundPosition: `${MX} ${MY}, 0 0, 0 0, 0 0`,
});

const glare = (strength: number): FoilLayer => ({
  opacity: strength * 0.75,
  mixBlendMode: "overlay",
  backgroundImage: `radial-gradient(circle at ${MX} ${MY}, rgba(255,255,255,.65), rgba(255,255,255,0) 52%)`,
});

export const FOIL_STYLES: Record<FoilStyle, FoilConfig> = {
  rainbow: {
    id: "rainbow",
    label: "Rainbow",
    description: "Pelangi klasik ala kartu holo.",
    layers: (s) => [
      {
        opacity: s * 0.4,
        mixBlendMode: "color-dodge",
        backgroundImage:
          "linear-gradient(115deg, transparent 12%, rgba(255,0,153,.6) 28%, rgba(255,214,0,.6) 38%, rgba(0,255,170,.6) 48%, rgba(0,153,255,.6) 58%, rgba(153,0,255,.6) 68%, transparent 84%)",
        backgroundSize: "260% 260%",
        backgroundPosition: `${MX} ${MY}`,
      },
      dots(s * 0.38),
      glare(s),
    ],
  },
  cosmos: {
    id: "cosmos",
    label: "Cosmos",
    description: "Ungu-biru galaksi dengan bintang.",
    layers: (s) => [
      {
        opacity: s * 0.36,
        mixBlendMode: "color-dodge",
        backgroundImage:
          "linear-gradient(125deg, transparent 10%, rgba(56,189,248,.7) 30%, rgba(129,140,248,.75) 45%, rgba(217,70,239,.7) 60%, rgba(34,211,238,.6) 75%, transparent 90%)",
        backgroundSize: "280% 280%",
        backgroundPosition: `${MX} ${MY}`,
      },
      dots(s * 0.7, "screen"),
      glare(s),
    ],
  },
  gold: {
    id: "gold",
    label: "Gold",
    description: "Kilau emas dengan garis halus.",
    layers: (s) => [
      {
        opacity: s * 0.34,
        mixBlendMode: "color-dodge",
        backgroundImage:
          "linear-gradient(115deg, transparent 15%, rgba(255,214,102,.85) 32%, rgba(255,255,255,.9) 45%, rgba(255,170,40,.8) 58%, transparent 80%)",
        backgroundSize: "260% 260%",
        backgroundPosition: `${MX} ${MY}`,
      },
      {
        opacity: s * 0.35,
        mixBlendMode: "overlay",
        backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,.35) 0 2px, transparent 2px 8px)",
        backgroundSize: "200% 200%",
        backgroundPosition: `${MX} ${MY}`,
      },
      glare(s),
    ],
  },
  sparkle: {
    id: "sparkle",
    label: "Sparkle",
    description: "Pastel lembut dengan glitter.",
    layers: (s) => [
      {
        opacity: s * 0.75,
        mixBlendMode: "soft-light",
        backgroundImage: `conic-gradient(from 0deg at ${MX} ${MY}, #ff9ad5, #ffe29a, #9affd6, #9ad4ff, #c49aff, #ff9ad5)`,
      },
      dots(s * 0.6),
      glare(s),
    ],
  },
};

export const FOIL_LIST: FoilConfig[] = Object.values(FOIL_STYLES);

/**
 * layerToCss — ubah FoilLayer menjadi string CSS inline.
 * Task:
 * 1. Terima satu FoilLayer
 * 2. Ubah nama properti camelCase menjadi kebab-case
 * 3. Lewati properti yang tidak diisi
 * 4. Kembalikan string "prop:value;prop:value"
 */
export function layerToCss(layer: FoilLayer): string {
  const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  return Object.entries(layer)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${kebab(k)}:${v}`)
    .join(";");
}
