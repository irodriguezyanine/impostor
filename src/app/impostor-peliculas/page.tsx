import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Impostor Películas - Juego con Películas Famosas",
  description:
    "Impostor películas: categoría con películas famosas mundiales y chilenas. Descubre al impostor con Titanic, Harry Potter, Machuca y más. Juego de fiesta gratis.",
  keywords: [
    "impostor peliculas",
    "juego impostor peliculas",
    "impostor películas famosas",
    "jugar impostor peliculas",
  ],
  alternates: { canonical: `${siteUrl}/impostor-peliculas` },
};

export default function ImpostorPeliculasPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Impostor Películas
        </h1>
        <p className="text-slate-400 text-lg">
          Impostor películas con categoría de películas famosas mundiales y
          chilenas. Descubre al impostor entre tus amigos con Titanic, Harry
          Potter, Machuca y más.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Películas
        </Link>
      </div>
    </div>
  );
}
