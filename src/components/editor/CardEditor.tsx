"use client";

import type { ReactNode } from "react";
import { BookOpen, Shield, Swords, User2, Sparkles, ScrollText } from "lucide-react";
import { FOIL_LIST } from "@/lib/foil";
import { ELEMENT_LIST } from "@/lib/themes";
import type { CardData, CardLayout, ElementType, FoilStyle } from "@/lib/types";
import { getDisplayName } from "@/lib/utils";
import { EnergyIcon } from "../card/CardParts";
import { NumberInput, SelectField, SwitchField, TextAreaField, TextInput, type SelectOption } from "../ui/Fields";
import { Panel } from "../ui/Panel";

const ELEMENT_OPTIONS: SelectOption<ElementType>[] = ELEMENT_LIST.map((e) => ({
  value: e.id,
  label: e.label,
  leading: <EnergyIcon element={e.id} size={16} />,
}));

const WEAKNESS_OPTIONS: SelectOption<ElementType | "none">[] = [{ value: "none", label: "Tidak ada" }, ...ELEMENT_OPTIONS];

const STAGE_OPTIONS: SelectOption<string>[] = ["BASIC", "STAGE 1", "STAGE 2", "MEGA", "V", "VMAX", "ex"].map((s) => ({
  value: s,
  label: s,
}));

const FOIL_OPTIONS: SelectOption<FoilStyle>[] = FOIL_LIST.map((f) => ({ value: f.id, label: `${f.label} — ${f.description}` }));

const LAYOUT_OPTIONS: SelectOption<CardLayout>[] = [
  { value: "classic", label: "Classic (foto di jendela)" },
  { value: "fullart", label: "Full art (foto penuh)" },
];

export interface CardEditorProps {
  data: CardData;
  onChange: (patch: Partial<CardData>) => void;
  className?: string;
  children?: ReactNode;
}

/** Form untuk mengedit semua teks dan angka di kartu. */
export function CardEditor({ data, onChange, className, children }: CardEditorProps) {
  const stageOptions = STAGE_OPTIONS.some((o) => o.value === data.stage)
    ? STAGE_OPTIONS
    : [...STAGE_OPTIONS, { value: data.stage, label: data.stage || "—" }];

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        <Panel title="Identitas" icon={User2}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput label="Nama Pokémon" value={data.name} maxLength={22} onChange={(name) => onChange({ name })} />
            <TextInput label="Nama kamu (opsional)" value={data.ownerName} maxLength={14} onChange={(ownerName) => onChange({ ownerName })}>
              <p className="text-[11px] text-white/40">Tampil di kartu: {getDisplayName(data) || "—"}</p>
            </TextInput>
            <TextInput label="Kategori" value={data.species} maxLength={26} onChange={(species) => onChange({ species })} />
            <TextInput label="Baris pokédex (layout Classic)" value={data.dexLine} maxLength={44} onChange={(dexLine) => onChange({ dexLine })} />
            <SelectField label="Stage" value={data.stage} options={stageOptions} onChange={(stage) => onChange({ stage })} />
            <NumberInput label="HP" value={data.hp} min={10} max={999} step={10} onChange={(hp) => onChange({ hp })} />
            <SelectField label="Elemen / warna tema" value={data.element} options={ELEMENT_OPTIONS} onChange={(element) => onChange({ element })} />
            <SelectField label="Layout" value={data.layout} options={LAYOUT_OPTIONS} onChange={(layout) => onChange({ layout })} />
            <SelectField className="sm:col-span-2" label="Gaya foil (aktif di Rare Holo & Ultra Rare)" value={data.foilStyle} options={FOIL_OPTIONS} onChange={(foilStyle) => onChange({ foilStyle })} />
          </div>
        </Panel>

        <Panel
          title="Ability"
          description="Cocok untuk posisi / peran saat ini."
          icon={Sparkles}
          actions={<SwitchField label="Tampilkan" isSelected={data.showAbility} onChange={(showAbility) => onChange({ showAbility })} />}
        >
          {data.showAbility && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextInput label="Label" value={data.abilityLabel} maxLength={14} onChange={(abilityLabel) => onChange({ abilityLabel })} />
              <TextInput label="Nama ability" value={data.abilityName} maxLength={22} onChange={(abilityName) => onChange({ abilityName })} />
              <TextAreaField className="sm:col-span-2" label="Deskripsi" value={data.abilityText} rows={3} maxLength={190} onChange={(abilityText) => onChange({ abilityText })} />
            </div>
          )}
        </Panel>

        <Panel title="Attack" description="Skill andalan atau pencapaian terbesarmu." icon={Swords}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextInput className="sm:col-span-3" label="Nama attack" value={data.attackName} maxLength={24} onChange={(attackName) => onChange({ attackName })} />
            <NumberInput label="Biaya energy" value={data.attackCost} min={0} max={5} step={1} onChange={(attackCost) => onChange({ attackCost })} />
            <TextInput className="sm:col-span-2" label="Damage (boleh 30+, 20×)" value={data.attackDamage} maxLength={6} onChange={(attackDamage) => onChange({ attackDamage })} />
            <TextAreaField className="sm:col-span-3" label="Deskripsi" value={data.attackText} rows={3} maxLength={150} onChange={(attackText) => onChange({ attackText })} />
          </div>
        </Panel>

        <Panel title="Weakness, resistance & retreat" icon={Shield}>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Weakness" value={data.weaknessElement} options={WEAKNESS_OPTIONS} onChange={(weaknessElement) => onChange({ weaknessElement })} />
            <TextInput label="Nilai weakness" value={data.weaknessValue} maxLength={5} onChange={(weaknessValue) => onChange({ weaknessValue })} />
            <SelectField label="Resistance" value={data.resistanceElement} options={WEAKNESS_OPTIONS} onChange={(resistanceElement) => onChange({ resistanceElement })} />
            <TextInput label="Nilai resistance" value={data.resistanceValue} maxLength={5} onChange={(resistanceValue) => onChange({ resistanceValue })} />
            <NumberInput label="Retreat cost" value={data.retreat} min={0} max={5} step={1} onChange={(retreat) => onChange({ retreat })} />
          </div>
        </Panel>

        <Panel
          title="Kotak rule"
          description="Contoh: MEGA EVOLUTION EX RULE."
          icon={ScrollText}
          actions={<SwitchField label="Tampilkan" isSelected={data.showRule} onChange={(showRule) => onChange({ showRule })} />}
        >
          {data.showRule && (
            <div className="flex flex-col gap-3">
              <TextInput label="Judul" value={data.ruleTitle} maxLength={34} onChange={(ruleTitle) => onChange({ ruleTitle })} />
              <TextAreaField label="Isi" value={data.ruleText} rows={3} maxLength={110} onChange={(ruleText) => onChange({ ruleText })} />
            </div>
          )}
        </Panel>

        {data.layout === "classic" && (
          <Panel title="Flavor text" description="Tampil di bagian bawah layout classic." icon={BookOpen}>
            <TextAreaField label="Teks" value={data.flavorText} rows={2} maxLength={100} onChange={(flavorText) => onChange({ flavorText })} />
          </Panel>
        )}

        <Panel title="Kredit" icon={BookOpen}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextInput label="Illustrator" value={data.illustrator} maxLength={20} onChange={(illustrator) => onChange({ illustrator })} />
            <TextInput label="Lokasi" value={data.location} maxLength={22} onChange={(location) => onChange({ location })} />
            <TextInput label="Nomor kartu" value={data.collectorNumber} maxLength={9} onChange={(collectorNumber) => onChange({ collectorNumber })} />
          </div>
        </Panel>

        {children}
      </div>
    </div>
  );
}
