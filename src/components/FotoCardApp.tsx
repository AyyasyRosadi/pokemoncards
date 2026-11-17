"use client";

import { Button, Tabs } from "@heroui/react";
import { Camera, LayoutGrid, PenLine, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HoloTilt } from "./card/HoloTilt";
import { TradingCard } from "./card/TradingCard";
import { CardEditor } from "./editor/CardEditor";
import { ExportBar } from "./editor/ExportBar";
import { PhotoControls } from "./editor/PhotoControls";
import { PhotoUploader } from "./editor/PhotoUploader";
import { RaritySelector } from "./editor/RaritySelector";
import { TemplatePicker } from "./editor/TemplatePicker";
import { Panel } from "./ui/Panel";
import { applyRarity, RARITIES } from "@/lib/rarity";
import { BASE_CARD } from "@/lib/templates";
import type { CardData, Rarity } from "@/lib/types";
import { buildCardFromTemplate, clearDraft, loadDraft, saveDraft } from "@/lib/utils";

const INITIAL_TEMPLATE = "fullstack-ex";

export function FotoCardApp() {
  const [card, setCard] = useState<CardData>(() => buildCardFromTemplate(INITIAL_TEMPLATE, BASE_CARD));
  const [templateId, setTemplateId] = useState<string | null>(INITIAL_TEMPLATE);
  const [tab, setTab] = useState("foto");
  const [hydrated, setHydrated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ambil draft terakhir dari browser
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setCard(draft);
      setTemplateId(null);
    }
    setHydrated(true);
  }, []);

  // simpan otomatis (debounce)
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => saveDraft(card), 400);
    return () => clearTimeout(id);
  }, [card, hydrated]);

  const update = useCallback((patch: Partial<CardData>) => setCard((c) => ({ ...c, ...patch })), []);

  const selectTemplate = (id: string) => {
    setCard((c) => buildCardFromTemplate(id, c));
    setTemplateId(id);
  };

  const selectRarity = (rarity: Rarity) => setCard((c) => applyRarity(c, rarity));

  const reset = () => {
    clearDraft();
    setCard(buildCardFromTemplate(INITIAL_TEMPLATE, BASE_CARD));
    setTemplateId(INITIAL_TEMPLATE);
  };

  const rarity = RARITIES[card.rarity];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
            <Sparkles size={20} className="text-white" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold leading-tight text-white">FotoCard</h1>
            <p className="text-xs text-white/55">Ubah fotomu jadi kartu Pokémon — Basic, Rare, atau Ultra Rare EX.</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onPress={reset}>
          <RotateCcw size={14} /> Reset semua
        </Button>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
        {/* Preview — tampil di atas pada layar kecil */}
        <aside className="flex flex-col items-center gap-4 lg:sticky lg:top-6 lg:order-2">
          <HoloTilt floating={false} className="py-2">
            <TradingCard data={card} cardRef={cardRef} />
          </HoloTilt>

          <div className="flex w-full max-w-[390px] flex-col gap-3">
            <RaritySelector value={card.rarity} onChange={selectRarity}>
              <p className="text-center text-[11px] text-white/45">{rarity.description}</p>
            </RaritySelector>
            <ExportBar cardRef={cardRef} fileName={card.name} />
          </div>
        </aside>

        {/* Editor */}
        <div className="min-w-0 lg:order-1">
          <Tabs selectedKey={tab} onSelectionChange={(k) => setTab(String(k))}>
            <Tabs.ListContainer>
              <Tabs.List aria-label="Editor kartu">
                <Tabs.Tab id="foto">
                  <span className="flex items-center gap-1.5">
                    <Camera size={15} /> Foto
                  </span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="template">
                  <span className="flex items-center gap-1.5">
                    <LayoutGrid size={15} /> Template
                  </span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="konten">
                  <span className="flex items-center gap-1.5">
                    <PenLine size={15} /> Konten
                  </span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="foto" className="pt-4">
              <div className="flex flex-col gap-4">
                <Panel title="1. Upload foto" description="Fotomu tidak diunggah ke server — semua diproses di browser.">
                  <PhotoUploader value={card.photo} onChange={(photo) => update({ photo })} />
                </Panel>
                {card.photo && <PhotoControls transform={card.photoTransform} filter={card.photoFilter} onChange={update} />}
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="template" className="pt-4">
              <Panel title="2. Pilih template" description="15 template siap pakai. Teks dan warnanya masih bisa diubah di tab Konten.">
                <TemplatePicker current={card} activeId={templateId} onSelect={selectTemplate} />
              </Panel>
            </Tabs.Panel>

            <Tabs.Panel id="konten" className="pt-4">
              <CardEditor
                data={card}
                onChange={(patch) => {
                  update(patch);
                  setTemplateId(null);
                }}
              />
            </Tabs.Panel>
          </Tabs>
        </div>
      </main>

      <footer className="pb-4 text-center text-[11px] text-white/35">
        Proyek fan-made, tidak berafiliasi dengan Nintendo, Creatures, atau The Pokémon Company.
      </footer>
    </div>
  );
}
