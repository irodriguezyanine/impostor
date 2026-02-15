import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Jugar Impostor Sin Publicidad - Juego Limpio y Gratis",
  description:
    "Jugar impostor sin publicidad. El juego impostor 100% gratis, sin anuncios ni interrupciones. Descubre al impostor con una experiencia limpia.",
  keywords: [
    "jugar impostor sin publicidad",
    "impostor sin publicidad",
    "juego impostor gratis sin anuncios",
    "impostor sin ads",
  ],
  alternates: { canonical: `${siteUrl}/jugar-impostor-sin-publicidad` },
};

export default function JugarImpostorSinPublicidadPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Jugar Impostor Sin Publicidad
        </h1>
        <p className="text-slate-400 text-lg">
          Jugar impostor sin publicidad ni anuncios. Experiencia limpia y 100%
          gratis. Descubre al impostor sin interrupciones.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Sin Publicidad
        </Link>
      </div>
    </div>
  );
}
