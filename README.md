# FotoCard

Ubah fotomu jadi **kartu trading ala Pokémon**. Pilih jenis kartu **Basic**, **Rare Holo**, atau **Ultra Rare ex**, pakai salah satu dari **20 template Pokémon** atau isi sendiri semua teksnya, lalu unduh sebagai PNG (1170×1635, sudut transparan).

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · HeroUI v3 · lucide-react · html-to-image.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Butuh Node.js 20+. Semua proses (foto, render, export) berjalan di browser; tidak ada foto yang diunggah ke server.

## Cara pakai

1. **Foto**: upload, seret & lepas, atau paste (Ctrl/Cmd + V). Atur zoom, geser, mirror, dan filter. Di sini juga bisa mengganti **belakang kartu**.
2. **Rarity** (di bawah preview): Basic, Rare Holo, atau Ultra Rare ex. Rarity mengatur layout bawaan, bingkai, kekuatan foil, dan badge EX.
3. **Template**: 20 Pokémon (Charizard ex, Pikachu ex, Mewtwo ex, Gengar, Blastoise, Eevee, dst.) dengan nama, kategori, ability, attack, weakness, dan kotak rule yang sesuai. Ada filter Ultra Rare / Rare / Basic dan tombol **Acak**.
4. **Konten**: ubah nama Pokémon, **nama kamu** (tampil gaya TCG: "Budi's Charizard ex"), kategori, baris pokédex, HP, elemen, **gaya foil** (Rainbow / Cosmos / Gold / Sparkle), ability, attack, weakness, rule, dan kredit.
5. **Simpan**: pilih sisi **Depan / Belakang / Keduanya**.
   - **Simpan ke Galeri** (HP): membuka menu share iPhone/Android, pilih *Simpan Gambar* agar masuk Galeri. Di desktop tombolnya menjadi **Unduh PNG** (1170×1635, sudut transparan).
   - **3D interaktif**: file `.html` mandiri. Seret untuk memutar, balik kartu, foil mengikuti sudut, dan sensor gerak di HP.
   - **Video 360°**: kartu berputar penuh (MP4 di iPhone, WebM di browser lain). Ini cara terbaik membagikan versi 3D lewat Galeri iPhone.

Klik/tap kartu di preview untuk membaliknya. Di HP ada tombol **Sensor gerak** untuk memiringkan kartu dengan gerakan ponsel.

Draft tersimpan otomatis di browser (localStorage). Tombol **Reset semua** menghapusnya.

## Belakang kartu

Urutan sumber gambar belakang:

1. Gambar yang kamu upload di tab **Foto → Belakang kartu** (disimpan di browser).
2. File `public/card-back.jpg` (jadi bawaan untuk semua pengunjung).
3. Desain bawaan orisinal FotoCard.

Gunakan gambar yang kamu punya hak pakainya, terutama jika situs di-deploy untuk publik.

## Jenis kartu

| Rarity | Layout bawaan | Efek |
| --- | --- | --- |
| Basic | Classic (foto dalam jendela) | Tanpa foil, bingkai kuning |
| Rare Holo | Classic | Foil + bingkai perak |
| Ultra Rare ex | Full art | Foil penuh, bingkai emas, badge EX, kotak rule |

Layout bisa diganti terpisah dari rarity di tab **Konten → Layout**.

### Menambah template sendiri

Buka `src/lib/templates.ts` dan tambahkan objek ke array `TEMPLATES`:

```ts
{
  id: "my-template",
  label: "Nama Template",
  tagline: "Deskripsi singkat",
  icon: Star, // dari lucide-react
  data: {
    stage: "STAGE 1",
    hp: 150,
    element: "fire",      // psychic | fire | water | grass | lightning | fighting | darkness | metal | dragon | fairy | colorless
    rarity: "rare",       // basic | rare | ultra
    layout: "fullart",    // classic | fullart
    abilityName: "Currently",
    abilityText: "Teks ability…",
    attackName: "Signature Move",
    attackCost: 2,
    attackDamage: "90",
    attackText: "Teks attack…",
  },
},
```

Field yang tidak diisi memakai nilai dari `BASE_CARD`. Daftar lengkap field ada di `src/lib/types.ts` (`CardData`).

### Menambah elemen / warna

Tambahkan entri di `ELEMENTS` (`src/lib/themes.ts`) dan nilai barunya ke tipe `ElementType` di `src/lib/types.ts`.

## Struktur project

```
src/
  app/                  layout, halaman, CSS global
  components/
    FotoCardApp.tsx     halaman utama (state, tab, preview)
    card/               TradingCard, FullArtLayout, ClassicLayout, HoloTilt, CardParts
    editor/             PhotoUploader, PhotoControls, TemplatePicker, RaritySelector, CardEditor, ExportBar
    ui/                 Panel, Fields (wrapper HeroUI: TextInput, SelectField, SliderField, ...)
  lib/
    types.ts            tipe data kartu + ukuran kartu
    templates.ts        BASE_CARD + 20 template Pokémon
    foil.ts             gaya foil (Rainbow, Cosmos, Gold, Sparkle)
    device.ts           deteksi HP, izin sensor gerak
    saveToDevice.ts     share sheet (Simpan ke Galeri) + unduh
    viewer3d.ts         pembuat file HTML 3D interaktif
    spinVideo.ts        perekam video putar 360°
    themes.ts           warna & ikon tiap elemen, filter foto
    rarity.ts           konfigurasi Basic / Rare / Ultra
    utils.ts            fungsi util (resize foto, draft, build dari template, dll)
    exportCard.ts       export PNG & salin ke clipboard
```

## Memakai komponen kartu di halaman lain

```tsx
import { TradingCard } from "@/components/card/TradingCard";
import { HoloTilt } from "@/components/card/HoloTilt";
import { BASE_CARD } from "@/lib/templates";
import { buildCardFromTemplate } from "@/lib/utils";

const data = { ...buildCardFromTemplate("fullstack-ex", BASE_CARD), name: "Budi" };

<HoloTilt>
  <TradingCard data={data} scale={0.8}>
    {/* children = overlay tambahan di atas kartu */}
  </TradingCard>
</HoloTilt>
```

`TradingCard` menerima `data`, `scale`, `className`, `disableHolo`, `cardRef`, dan `children`.

## Catatan

- Proyek fan-made, tidak berafiliasi dengan Nintendo, Creatures, atau The Pokémon Company.
- Font Nunito dipaket lewat `@fontsource-variable/nunito`, jadi ikut tertanam di PNG hasil export.
