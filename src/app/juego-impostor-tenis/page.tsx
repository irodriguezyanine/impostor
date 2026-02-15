import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Juego Impostor Tenis - Descubre al Impostor con Tenistas",
  description:
    "Juego impostor tenis: categoría con tenistas famosos. Descubre al impostor jugando con Federer, Nadal, Djokovic y más. Juego de fiesta gratis.",
  keywords: [
    "juego impostor tenis",
    "impostor tenis",
    "jugar impostor tenis",
    "impostor tenistas",
  ],
  alternates: { canonical: `${siteUrl}/juego-impostor-tenis` },
};

export default function JuegoImpostorTenisPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Juego Impostor Tenis
        </h1>
        <p className="text-slate-400 text-lg">
          Juego impostor tenis con categoría de tenistas: Federer, Nadal,
          Djokovic y más. Descubre al impostor entre tus amigos con el juego de
          fiesta de tenis.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Tenis
        </Link>
      </div>
    </div>
  );
}
