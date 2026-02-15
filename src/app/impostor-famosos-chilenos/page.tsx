import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Impostor Famosos Chilenos - Juego con Personajes de TV y Farándula",
  description:
    "Impostor famosos chilenos: categoría con personajes de TV, historia y farándula chilena. Descubre al impostor con el juego de fiesta chileno.",
  keywords: [
    "impostor famosos chilenos",
    "juego impostor chilenos",
    "impostor personajes chile",
    "jugar impostor famosos",
  ],
  alternates: { canonical: `${siteUrl}/impostor-famosos-chilenos` },
};

export default function ImpostorFamososChilenosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Impostor Famosos Chilenos
        </h1>
        <p className="text-slate-400 text-lg">
          Impostor famosos chilenos: personajes de TV, historia y farándula
          chilena. Descubre al impostor entre tus amigos con el juego de fiesta
          más chileno.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Famosos
        </Link>
      </div>
    </div>
  );
}
