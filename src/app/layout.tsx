import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { LocaleSync } from "@/components/LocaleSync";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

const seoTitle =
  "Impostor Chile - Jugar Impostor Gratis | Juego Impostor Fútbol y Más";
const seoDescription =
  "Juega Impostor gratis en Chile. El mejor juego impostor de fiesta sin publicidad ni inscripción. Impostor fútbol, futbolistas, equipos, famosos chilenos y más. Pasa el celular entre amigos y descubre al impostor.";
const seoKeywords = [
  "impostor",
  "juego impostor",
  "impostor fútbol",
  "impostor chile",
  "jugar impostor gratis",
  "impostor gratis",
  "juego impostor chile",
  "impostor juego de fiesta",
  "juego de impostor",
  "descubrir impostor",
  "spyfall",
  "paso y juego",
  "juego de fiesta chile",
  "jugar impostor",
  "impostor futbol",
  "impostor futbolistas",
  "impostor real madrid",
  "impostor barcelona",
  "impostor river",
  "impostor boca",
  "impostor gratis sin publicidad",
];

export const metadata: Metadata = {
  title: {
    default: seoTitle,
    template: "%s | Impostor Chile",
  },
  description: seoDescription,
  keywords: seoKeywords,
  authors: [{ name: "Impostor Chile", url: siteUrl }],
  creator: "Impostor Chile",
  publisher: "Impostor Chile",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
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
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "Impostor Chile - Juego impostor gratis, impostor fútbol y más categorías",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: [`${siteUrl}/logo.png`],
    creator: "@impostorchile",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "games",
  verification: {
    google: "YZXehpM15tw-xdepmt05VKMsiJ7zqJdmxqq5com39KY",
  },
  other: {
    "geo.region": "CL",
    "application-name": "Impostor Chile",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: "Impostor Chile",
      alternateName: ["Juego Impostor", "Impostor Fútbol", "Jugar Impostor Gratis"],
      description: seoDescription,
      url: siteUrl,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CLP",
      },
      image: `${siteUrl}/logo.png`,
      inLanguage: "es-CL",
      featureList: [
        "Juego impostor gratis sin publicidad",
        "Impostor fútbol y futbolistas",
        "Múltiples categorías",
        "Paso y juego entre amigos",
      ],
    },
    {
      "@type": "Game",
      "@id": `${siteUrl}/#game`,
      name: "Impostor Chile",
      description: "Juego de fiesta tipo impostor. Descubre quién miente entre tus amigos. Incluye categorías de impostor fútbol, famosos chilenos, películas y más.",
      gamePlatform: ["Web", "Mobile"],
      genre: "Party Game",
      playMode: "MultiPlayer",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Impostor Chile",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
