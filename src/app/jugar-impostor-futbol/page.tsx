import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Jugar Impostor Fútbol - Juego con Futbolistas y Equipos",
  description:
    "Jugar impostor fútbol con categorías de Messi, Ronaldo, Real Madrid, Barcelona, River, Boca, Champions League y más. El juego impostor de fútbol para jugar gratis con amigos.",
  keywords: [
    "jugar impostor futbol",
    "impostor futbol",
    "juego impostor futbol",
    "impostor futbolistas",
    "impostor real madrid",
    "impostor barcelona",
  ],
  alternates: { canonical: `${siteUrl}/jugar-impostor-futbol` },
};

export default function JugarImpostorFutbolPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Jugar Impostor Fútbol
        </h1>
        <p className="text-slate-400 text-lg">
          Jugar impostor fútbol con categorías de futbolistas, Real Madrid,
          Barcelona, River Plate, Boca Juniors, Champions League y más. Descubre
          al impostor entre tus amigos con el mejor juego de fútbol.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Fútbol
        </Link>
      </div>
    </div>
  );
}
