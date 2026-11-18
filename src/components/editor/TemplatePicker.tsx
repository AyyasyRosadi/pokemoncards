"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TEMPLATES, type TemplateGroup } from "@/lib/templates";
import { buildCardFromTemplate } from "@/lib/utils";
import type { CardData } from "@/lib/types";
import { TradingCard } from "../card/TradingCard";

const FILTERS: { id: TemplateGroup | "all"; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "ultra", label: "Ultra Rare ex" },
  { id: "rare", label: "Rare Holo" },
  { id: "basic", label: "Basic" },
];

export interface TemplatePickerProps {
  /** Data kartu saat ini — dipakai agar preview template memakai fotomu. */
  current: CardData;
  /** id template yang sedang aktif. */
  activeId?: string | null;
  onSelect: (templateId: string) => void;
  className?: string;
  /** Konten tambahan di bawah grid. */
  children?: ReactNode;
}

/** Grid template Pokémon dengan filter rarity. Tiap item adalah preview kartu mini memakai fotomu. */
export function TemplatePicker({ current, activeId, onSelect, className, children }: TemplatePickerProps) {
  const [filter, setFilter] = useState<TemplateGroup | "all">("all");
  const items = TEMPLATES.filter((t) => filter === "all" || t.group === filter || t.group === "custom");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              filter === f.id ? "border-indigo-400 bg-indigo-500/25 text-white" : "border-white/15 text-white/60 hover:border-white/30 hover:text-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((tpl) => {
          const Icon = tpl.icon;
          const preview = buildCardFromTemplate(tpl.id, current);
          const active = activeId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              aria-pressed={active}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border p-2.5 text-left transition",
                active ? "border-indigo-400 bg-indigo-500/15" : "border-white/10 bg-white/[0.03] hover:border-white/30",
              )}
            >
              <TradingCard data={preview} scale={0.36} disableHolo withBack={false} />
              <span className="flex w-full items-center gap-1.5">
                <Icon size={13} className="shrink-0 text-indigo-300" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-white">{tpl.label}</span>
                  <span className="block truncate text-[10px] text-white/50">{tpl.tagline}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
