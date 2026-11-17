import type { CardData, CardLayout, Rarity } from "./types";

export interface RarityConfig {
  id: Rarity;
  label: string;
  description: string;
  /** simbol rarity di footer kartu */
  symbol: string;
  /** layout bawaan saat rarity dipilih */
  defaultLayout: CardLayout;
  /** kekuatan efek holo 0 – 1 */
  holo: number;
  /** frame luar kartu */
  frame: string;
  /** apakah menampilkan badge EX */
  badge: string | null;
}

export const RARITIES: Record<Rarity, RarityConfig> = {
  basic: {
    id: "basic",
    label: "Basic",
    description: "Kartu klasik, bersih, tanpa foil.",
    symbol: "●",
    defaultLayout: "classic",
    holo: 0,
    frame: "linear-gradient(145deg,#f4d35e 0%,#e9b949 45%,#c9942a 100%)",
    badge: null,
  },
  rare: {
    id: "rare",
    label: "Rare Holo",
    description: "Foil holo yang bergerak mengikuti kursor.",
    symbol: "★",
    defaultLayout: "classic",
    holo: 0.6,
    frame: "linear-gradient(145deg,#e5e7eb 0%,#9ca3af 40%,#f3f4f6 60%,#6b7280 100%)",
    badge: null,
  },
  ultra: {
    id: "ultra",
    label: "Ultra Rare EX",
    description: "Full art, badge EX, bingkai emas, holo penuh.",
    symbol: "★★",
    defaultLayout: "fullart",
    holo: 1,
    frame: "linear-gradient(145deg,#fde68a 0%,#f5b400 35%,#b7791f 60%,#fcd34d 100%)",
    badge: "EX",
  },
};

export const RARITY_LIST = Object.values(RARITIES);

/** Perubahan data kartu saat user memilih rarity baru. */
export function applyRarity(data: CardData, rarity: Rarity): CardData {
  const cfg = RARITIES[rarity];
  return {
    ...data,
    rarity,
    layout: cfg.defaultLayout,
    showRule: rarity === "ultra" ? true : false,
  };
}
