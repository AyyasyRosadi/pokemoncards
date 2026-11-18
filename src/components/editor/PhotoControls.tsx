"use client";

import { Button } from "@heroui/react";
import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PHOTO_FILTERS } from "@/lib/themes";
import { DEFAULT_TRANSFORM } from "@/lib/templates";
import type { CardData, PhotoFilter, PhotoTransform } from "@/lib/types";
import { SliderField, SwitchField } from "../ui/Fields";
import { Panel } from "../ui/Panel";

export interface PhotoControlsProps {
  transform: PhotoTransform;
  filter: PhotoFilter;
  onChange: (patch: Partial<Pick<CardData, "photoTransform" | "photoFilter">>) => void;
  className?: string;
  children?: ReactNode;
}

/** Zoom, geser, flip, dan filter foto. */
export function PhotoControls({ transform, filter, onChange, className, children }: PhotoControlsProps) {
  const set = (patch: Partial<PhotoTransform>) => onChange({ photoTransform: { ...transform, ...patch } });

  return (
    <Panel
      title="Atur foto"
      description="Geser dan zoom supaya wajahmu pas di kartu."
      className={className}
      actions={
        <Button size="sm" variant="ghost" onPress={() => onChange({ photoTransform: DEFAULT_TRANSFORM, photoFilter: "none" })}>
          <RotateCcw size={14} /> Reset
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <SliderField label="Zoom" value={transform.zoom} min={0.6} max={3} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(zoom) => set({ zoom })} />
        <SliderField label="Geser horizontal" value={transform.x} min={-60} max={60} format={(v) => `${v}%`} onChange={(x) => set({ x })} />
        <SliderField label="Geser vertikal" value={transform.y} min={-60} max={60} format={(v) => `${v}%`} onChange={(y) => set({ y })} />
        <SwitchField label="Balik horizontal (mirror)" isSelected={transform.flip} onChange={(flip) => set({ flip })} />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-white/70">Filter</span>
          <div className="flex flex-wrap gap-2">
            {PHOTO_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange({ photoFilter: f.id })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition",
                  filter === f.id
                    ? "border-indigo-400 bg-indigo-500/25 text-white"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {children}
      </div>
    </Panel>
  );
}
