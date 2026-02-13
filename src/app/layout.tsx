import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { LocaleSync } from "@/components/LocaleSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Impostor Chile - Pasa y Juega",
  description: "Juego de fiesta estilo Spyfall. ¡Pasa el teléfono y descubre quién es el impostor!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased bg-background min-h-screen text-slate-100`}>
        <GameProvider>
          <LocaleSync />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
