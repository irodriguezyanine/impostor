import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { LocaleSync } from "@/components/LocaleSync";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://impostorchile.vercel.app";

export const metadata: Metadata = {
  title: "Impostor - Juega gratis sin publicidad ni inscripción.",
  description:
    "Pasa y juega el celular con tus amigos, con todo tipo de temas que conoces.",
  keywords: ["impostor", "juego", "fiesta", "chile", "spyfall", "paso y juego"],
  authors: [{ name: "Impostor Chile" }],
  creator: "Impostor Chile",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "Impostor Chile",
    title: "Impostor - Juega gratis sin publicidad ni inscripción.",
    description:
      "Pasa y juega el celular con tus amigos, con todo tipo de temas que conoces.",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 400,
        height: 400,
        alt: "Impostor Chile - Logo del juego",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impostor - Juega gratis sin publicidad ni inscripción.",
    description:
      "Pasa y juega el celular con tus amigos, con todo tipo de temas que conoces.",
    images: [`${siteUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
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
