import {
  Circle,
  Droplets,
  Eye,
  Flame,
  Gem,
  Heart,
  Leaf,
  Moon,
  Shield,
  Swords,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ElementType, PhotoFilter } from "./types";

export interface ElementTheme {
  id: ElementType;
  label: string;
  icon: LucideIcon;
  /** warna utama (energy, aksen) */
  main: string;
  /** warna terang untuk gradient */
  light: string;
  /** warna gelap untuk gradient */
  dark: string;
  /** warna overlay gelap di bagian bawah kartu fullart */
  shade: string;
  /** background body kartu classic */
  body: string;
}

export const ELEMENTS: Record<ElementType, ElementTheme> = {
  psychic: {
    id: "psychic",
    label: "Psychic",
    icon: Eye,
    main: "#a855f7",
    light: "#d8b4fe",
    dark: "#6b21a8",
    shade: "#0b1020",
    body: "#e9d5ff",
  },
  fire: {
    id: "fire",
    label: "Fire",
    icon: Flame,
    main: "#f97316",
    light: "#fdba74",
    dark: "#9a3412",
    shade: "#1c0d08",
    body: "#fed7aa",
  },
  water: {
    id: "water",
    label: "Water",
    icon: Droplets,
    main: "#0ea5e9",
    light: "#7dd3fc",
    dark: "#075985",
    shade: "#07131f",
    body: "#bae6fd",
  },
  grass: {
    id: "grass",
    label: "Grass",
    icon: Leaf,
    main: "#22c55e",
    light: "#86efac",
    dark: "#166534",
    shade: "#07150d",
    body: "#bbf7d0",
  },
  lightning: {
    id: "lightning",
    label: "Lightning",
    icon: Zap,
    main: "#facc15",
    light: "#fde68a",
    dark: "#a16207",
    shade: "#171204",
    body: "#fef08a",
  },
  fighting: {
    id: "fighting",
    label: "Fighting",
    icon: Swords,
    main: "#c2410c",
    light: "#fb923c",
    dark: "#7c2d12",
    shade: "#190c07",
    body: "#fdd9b5",
  },
  darkness: {
    id: "darkness",
    label: "Darkness",
    icon: Moon,
    main: "#475569",
    light: "#94a3b8",
    dark: "#0f172a",
    shade: "#05060a",
    body: "#cbd5e1",
  },
  metal: {
    id: "metal",
    label: "Metal",
    icon: Shield,
    main: "#94a3b8",
    light: "#e2e8f0",
    dark: "#475569",
    shade: "#0a0e14",
    body: "#e2e8f0",
  },
  dragon: {
    id: "dragon",
    label: "Dragon",
    icon: Gem,
    main: "#d97706",
    light: "#fcd34d",
    dark: "#78350f",
    shade: "#130d04",
    body: "#fde68a",
  },
  fairy: {
    id: "fairy",
    label: "Fairy",
    icon: Heart,
    main: "#ec4899",
    light: "#f9a8d4",
    dark: "#9d174d",
    shade: "#190812",
    body: "#fbcfe8",
  },
  colorless: {
    id: "colorless",
    label: "Colorless",
    icon: Circle,
    main: "#9ca3af",
    light: "#f3f4f6",
    dark: "#4b5563",
    shade: "#0b0c10",
    body: "#f3f4f6",
  },
};

export const ELEMENT_LIST: ElementTheme[] = Object.values(ELEMENTS);

export const PHOTO_FILTERS: { id: PhotoFilter; label: string; css: string }[] = [
  { id: "none", label: "Asli", css: "none" },
  { id: "vivid", label: "Vivid", css: "saturate(1.35) contrast(1.08)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.15)" },
  { id: "warm", label: "Warm", css: "sepia(0.35) saturate(1.2) hue-rotate(-8deg)" },
  { id: "cool", label: "Cool", css: "saturate(1.1) hue-rotate(12deg) brightness(1.03)" },
  { id: "dreamy", label: "Dreamy", css: "brightness(1.08) contrast(0.92) saturate(1.2)" },
];

export function getFilterCss(filter: PhotoFilter): string {
  return PHOTO_FILTERS.find((f) => f.id === filter)?.css ?? "none";
}
