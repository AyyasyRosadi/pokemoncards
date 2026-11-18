import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "./globals.css";

export const metadata: Metadata = {
  title: "FotoCard — Ubah fotomu jadi kartu Pokémon",
  description:
    "Upload foto, pilih Basic, Rare, atau Ultra Rare EX, lalu pakai salah satu dari 14+ template atau edit sendiri. Unduh sebagai PNG.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b14",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
