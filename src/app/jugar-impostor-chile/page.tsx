import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Jugar Impostor Chile - Juego de Fiesta Chile Gratis",
  description:
    "Jugar impostor Chile: el juego de fiesta chileno para descubrir al impostor. Categorías de famosos chilenos, películas, palabras chilenas y más. Gratis sin publicidad.",
  keywords: [
    "jugar impostor chile",
    "impostor chile",
    "juego impostor chile",
    "impostor juego chile",
    "juego de fiesta chile",
  ],
  alternates: { canonical: `${siteUrl}/jugar-impostor-chile` },
};

export default function JugarImpostorChilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Jugar Impostor Chile
        </h1>
        <p className="text-slate-400 text-lg">
          El juego impostor chileno para jugar gratis. Categorías de famosos
          chilenos, películas, palabras chilenas, países turísticos y más.
          Descubre al impostor con amigos en Chile.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Chile
        </Link>
      </div>
    </div>
  );
}
