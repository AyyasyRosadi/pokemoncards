"use client";

import { RARITIES } from "@/lib/rarity";
import { ELEMENTS } from "@/lib/themes";
import type { CardData } from "@/lib/types";
import { hexToRgba } from "@/lib/utils";
import { CardPhoto, EnergyCost, EnergyIcon, RetreatDots } from "./CardParts";

const GOLD = "#f5c518";

function Divider() {
  return <div className="h-px w-full bg-white/20" />;
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] leading-[1.35] text-white/80">
      <span>{label}</span>
      {children}
    </div>
  );
}

/** Layout full art: foto memenuhi kartu, info di bawah dengan gradient gelap. */
export function FullArtLayout({ data }: { data: CardData }) {
  const t = ELEMENTS[data.element];
  const rarity = RARITIES[data.rarity];

  const weakness =
    data.weaknessElement === "none" ? (
      <span>—</span>
    ) : (
      <>
        <EnergyIcon element={data.weaknessElement} size={14} />
        <span>{data.weaknessValue}</span>
      </>
    );
  const resistance =
    data.resistanceElement === "none" || !data.resistanceValue ? (
      <span>—</span>
    ) : (
      <>
        <EnergyIcon element={data.resistanceElement} size={14} />
        <span>{data.resistanceValue}</span>
      </>
    );

  return (
    <>
      <CardPhoto data={data} />

      {/* gradient: atas tipis (supaya nama terbaca), bawah gelap (supaya teks terbaca) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 20%), linear-gradient(to top, ${hexToRgba(t.shade, 0.98)} 0%, ${hexToRgba(t.shade, 0.95)} 36%, ${hexToRgba(t.shade, 0)} 66%)`,
        }}
      />

      {/* header */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-[14px] pt-[12px]">
        <div className="flex min-w-0 items-center gap-2">
          {data.stage.trim() && (
            <span
              className="whitespace-nowrap rounded-[6px] border px-2 py-[3px] text-[10px] font-extrabold leading-none tracking-wider"
              style={{ borderColor: GOLD, color: GOLD, background: "rgba(0,0,0,.45)" }}
            >
              {data.stage}
            </span>
          )}
          <h2 className="truncate text-[23px] font-extrabold leading-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]">
            {data.name || " "}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-[2px] text-white [text-shadow:0_2px_6px_rgba(0,0,0,.6)]">
          <span className="text-[11px] font-bold opacity-90">HP</span>
          <span className="text-[22px] font-extrabold leading-none">{data.hp}</span>
          <EnergyIcon element={data.element} size={20} />
        </div>
      </div>

      {rarity.badge && (
        <span
          className="absolute right-[14px] top-[56px] rounded-[6px] px-2 py-[3px] text-[11px] font-extrabold leading-none tracking-wider text-white"
          style={{ background: "#c1121f", boxShadow: "0 2px 6px rgba(0,0,0,.45)" }}
        >
          {rarity.badge}
        </span>
      )}

      {/* konten bawah */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[7px] px-[14px] pb-[10px]">
        {data.showAbility && (
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#d62828] px-2.5 py-[3px] text-[10px] font-extrabold leading-none tracking-wide text-white">
                {data.abilityLabel || "ABILITY"}
              </span>
              <span className="text-[17px] font-extrabold leading-none" style={{ color: GOLD }}>
                {data.abilityName}
              </span>
            </div>
            <p className="line-clamp-4 text-[12.5px] leading-[1.35] text-white/90">{data.abilityText}</p>
          </div>
        )}

        <Divider />

        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-2">
            <EnergyCost element={data.element} count={data.attackCost} size={15} />
            <span className="min-w-0 flex-1 truncate text-[19px] font-extrabold leading-tight text-white">
              {data.attackName}
            </span>
            <span className="text-[26px] font-extrabold leading-none" style={{ color: GOLD }}>
              {data.attackDamage}
            </span>
          </div>
          <p className="line-clamp-3 text-[12px] leading-[1.35] text-white/85">{data.attackText}</p>
        </div>

        <Divider />

        <div className="flex items-start gap-3">
          {data.showRule ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col pt-0.5">
                <Stat label="weakness">{weakness}</Stat>
                <Stat label="resistance">{resistance}</Stat>
                <Stat label="retreat">
                  <RetreatDots count={data.retreat} />
                </Stat>
              </div>
              <div
                className="w-[190px] shrink-0 rounded-[8px] border p-[9px]"
                style={{ borderColor: "rgba(255,255,255,.22)", background: "rgba(255,255,255,.07)" }}
              >
                <p className="text-[9.5px] font-extrabold uppercase leading-tight tracking-[0.04em] text-white">
                  {data.ruleTitle}
                </p>
                <p className="mt-1 line-clamp-4 text-[10px] leading-[1.35] text-white/80">{data.ruleText}</p>
              </div>
            </>
          ) : (
            <div className="grid w-full grid-cols-3 gap-2 pt-0.5">
              <Stat label="weakness">{weakness}</Stat>
              <Stat label="resistance">{resistance}</Stat>
              <Stat label="retreat">
                <RetreatDots count={data.retreat} />
              </Stat>
            </div>
          )}
        </div>

        <p className="truncate text-[9.5px] italic leading-none text-white/55">
          Illus. {data.illustrator}
          {data.location ? ` · ${data.location}` : ""} · {data.collectorNumber} · {rarity.symbol}
        </p>
      </div>
    </>
  );
}
