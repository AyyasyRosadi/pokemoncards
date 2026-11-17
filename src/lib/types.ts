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
  name: string;
  stage: string; // "BASIC" | "STAGE 1" | "STAGE 2" | teks bebas
  hp: number;
  element: ElementType;
  rarity: Rarity;
  layout: CardLayout;

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
