export type Rarity = "basic" | "rare" | "ultra";
export type CardLayout = "classic" | "fullart";

export type ElementType =
  | "psychic"
  | "fire"
  | "water"
  | "grass"
  | "lightning"
  | "fighting"
  | "darkness"
  | "metal"
  | "dragon"
  | "fairy"
  | "colorless";

export type FoilStyle = "rainbow" | "cosmos" | "gold" | "sparkle";

export type PhotoFilter = "none" | "vivid" | "noir" | "warm" | "cool" | "dreamy";

export interface PhotoTransform {
  /** 0.5 – 3 */
  zoom: number;
  /** -100 – 100 (persen dari lebar kartu) */
  x: number;
  /** -100 – 100 (persen dari tinggi kartu) */
  y: number;
  flip: boolean;
}

export interface CardData {
  // Identitas
  /** Nama Pokémon di kartu, mis. "Charizard ex". */
  name: string;
  /** Nama kamu. Jika diisi, kartu tampil bergaya TCG: "Budi's Charizard ex". */
  ownerName: string;
  /** Kategori, mis. "Flame Pokémon". */
  species: string;
  /** Baris pokédex, mis. "NO. 006  HT: 5′07″  WT: 199.5 lbs." */
  dexLine: string;
  stage: string; // "BASIC" | "STAGE 1" | "STAGE 2" | teks bebas
  hp: number;
  element: ElementType;
  rarity: Rarity;
  layout: CardLayout;
  /** Gaya foil untuk kartu Rare / Ultra Rare. */
  foilStyle: FoilStyle;

  // Ability
  showAbility: boolean;
  abilityLabel: string;
  abilityName: string;
  abilityText: string;

  // Attack
  attackName: string;
  attackCost: number; // jumlah energy
  attackDamage: string; // string supaya bisa "120", "30+", "x2"
  attackText: string;

  // Footer stats
  weaknessElement: ElementType | "none";
  weaknessValue: string;
  resistanceElement: ElementType | "none";
  resistanceValue: string;
  retreat: number;

  // Rule box (misal: MEGA EVOLUTION EX RULE)
  showRule: boolean;
  ruleTitle: string;
  ruleText: string;

  // Flavor (khusus layout classic, di bawah attack)
  flavorText: string;

  // Credit
  illustrator: string;
  location: string;
  collectorNumber: string;

  // Foto
  photo: string | null;
  photoTransform: PhotoTransform;
  photoFilter: PhotoFilter;
}

export const CARD_WIDTH = 390;
export const CARD_HEIGHT = 545;
