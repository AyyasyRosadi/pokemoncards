"use client";

import { Circle, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RARITY_LIST } from "@/lib/rarity";
import type { Rarity } from "@/lib/types";

const ICONS: Record<Rarity, LucideIcon> = { basic: Circle, rare: Star, ultra: Sparkles };
const ACCENT: Record<Rarity, string> = {
  basic: "from-amber-300/25 to-amber-500/5 border-amber-300/50",
  rare: "from-slate-200/25 to-slate-400/5 border-slate-200/50",
  ultra: "from-fuchsia-400/25 via-amber-300/15 to-cyan-300/10 border-fuchsia-300/60",
};

export interface RaritySelectorProps {
  value: Rarity;
  onChange: (rarity: Rarity) => void;
  className?: string;
  children?: ReactNode;
}

/** Pilih jenis kartu: Basic, Rare Holo, atau Ultra Rare EX. */
export function RaritySelector({ value, onChange, className, children }: RaritySelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-3 gap-2">
        {RARITY_LIST.map((r) => {
          const Icon = ICONS[r.id];
          const active = value === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border bg-gradient-to-b px-2 py-2.5 text-center transition",
                active ? ACCENT[r.id] + " text-white shadow-lg" : "border-white/10 from-white/[0.03] to-transparent text-white/55 hover:border-white/25",
              )}
            >
              <Icon size={16} />
              <span className="text-[12px] font-extrabold leading-tight">{r.label}</span>
              <span className="text-[10px] leading-tight opacity-70">{r.symbol}</span>
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
