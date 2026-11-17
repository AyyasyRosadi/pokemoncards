"use client";

import { RARITIES } from "@/lib/rarity";
import { ELEMENTS } from "@/lib/themes";
import type { CardData } from "@/lib/types";
import { hexToRgba } from "@/lib/utils";
import { CardPhoto, EnergyCost, EnergyIcon, RetreatDots } from "./CardParts";

const INK = "#1b2433";

function FooterCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[2px]">
      <span className="text-[8px] font-bold uppercase leading-none tracking-wider opacity-60">{label}</span>
      <span className="flex h-[16px] items-center gap-1 text-[11px] font-bold leading-none">{children}</span>
    </div>
  );
}

/** Layout classic: nama di atas, foto dalam jendela, teks di bawah. Dipakai Basic & Rare. */
export function ClassicLayout({ data }: { data: CardData }) {
  const t = ELEMENTS[data.element];
  const rarity = RARITIES[data.rarity];

  return (
    <div
      className="absolute inset-0 flex flex-col gap-[6px] px-[11px] pb-[8px] pt-[9px]"
      style={{
        color: INK,
        background: `linear-gradient(168deg, ${hexToRgba(t.body, 1)} 0%, #ffffff 46%, ${hexToRgba(t.body, 0.9)} 100%)`,
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {data.stage.trim() && (
            <span className="whitespace-nowrap rounded-[4px] bg-[#1b2433] px-1.5 py-[3px] text-[8.5px] font-extrabold leading-none tracking-wider text-white">
              {data.stage}
            </span>
          )}
          <h2 className="truncate text-[21px] font-extrabold leading-tight">{data.name || " "}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[10px] font-bold opacity-70">HP</span>
          <span className="text-[21px] font-extrabold leading-none">{data.hp}</span>
          <EnergyIcon element={data.element} size={20} />
        </div>
      </div>

      {/* jendela foto */}
      <div
        className="relative min-h-[150px] flex-1 overflow-hidden rounded-[6px]"
        style={{
          border: `3px solid ${t.main}`,
          boxShadow: `0 0 0 1.5px ${hexToRgba(t.dark, 0.7)}, inset 0 0 14px rgba(0,0,0,.25)`,
        }}
      >
        <CardPhoto data={data} />
      </div>

      <div className="-mt-[2px] border-y border-black/20 bg-white/50 py-[2px] text-center text-[8.5px] italic leading-none">
        {t.label} Pokémon{data.location ? ` · ${data.location}` : ""}
      </div>

      {/* ability */}
      {data.showAbility && (
        <div className="flex flex-col gap-[3px]">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#d62828] px-2 py-[2.5px] text-[8.5px] font-extrabold leading-none tracking-wide text-white">
              {data.abilityLabel || "ABILITY"}
            </span>
            <span className="text-[14px] font-extrabold leading-none text-[#c1121f]">{data.abilityName}</span>
          </div>
          <p className="line-clamp-3 text-[10.5px] leading-[1.3]">{data.abilityText}</p>
        </div>
      )}

      {/* attack */}
      <div className="flex flex-col gap-[3px] border-t border-black/15 pt-[5px]">
        <div className="flex items-center gap-2">
          <EnergyCost element={data.element} count={data.attackCost} size={15} />
          <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-tight">{data.attackName}</span>
          <span className="text-[21px] font-extrabold leading-none">{data.attackDamage}</span>
        </div>
        <p className="line-clamp-3 text-[10.5px] leading-[1.3]">{data.attackText}</p>
      </div>

      {data.showRule && (
        <div className="rounded-[6px] border border-black/25 bg-black/[0.05] px-2 py-[5px]">
          <p className="text-[8.5px] font-extrabold uppercase leading-tight tracking-wide">{data.ruleTitle}</p>
          <p className="line-clamp-2 text-[9.5px] leading-[1.3] opacity-80">{data.ruleText}</p>
        </div>
      )}

      {/* flavor */}
      <p className="line-clamp-2 shrink-0 text-center text-[9.5px] italic leading-[1.3] opacity-70">
        {data.flavorText}
      </p>

      {/* weakness / resistance / retreat */}
      <div className="grid grid-cols-3 border-t border-black/20 pt-[5px]">
        <FooterCell label="weakness">
          {data.weaknessElement === "none" ? (
            "—"
          ) : (
            <>
              <EnergyIcon element={data.weaknessElement} size={14} />
              {data.weaknessValue}
            </>
          )}
        </FooterCell>
        <FooterCell label="resistance">
          {data.resistanceElement === "none" || !data.resistanceValue ? (
            "—"
          ) : (
            <>
              <EnergyIcon element={data.resistanceElement} size={14} />
              {data.resistanceValue}
            </>
          )}
        </FooterCell>
        <FooterCell label="retreat">
          <RetreatDots count={data.retreat} />
        </FooterCell>
      </div>

      <div className="flex items-center justify-between gap-2 text-[8.5px] italic leading-none opacity-70">
        <span className="truncate">Illus. {data.illustrator}</span>
        <span className="shrink-0">
          {data.collectorNumber} · {rarity.symbol}
        </span>
      </div>
    </div>
  );
}
