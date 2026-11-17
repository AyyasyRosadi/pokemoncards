import clsx, { type ClassValue } from "clsx";

/** Gabungkan class name (kondisional) menjadi satu string. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
