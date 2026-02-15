import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Juego de Fiesta - Impostor para Jugar con Amigos",
  description:
    "Juego de fiesta para jugar con amigos. El impostor es el juego de fiesta donde descubres quién miente. Pasa el celular, haz preguntas y diviértete.",
  keywords: [
    "juego de fiesta",
    "juegos de fiesta",
    "juego fiesta amigos",
    "impostor juego de fiesta",
    "juegos para fiestas",
  ],
  alternates: { canonical: `${siteUrl}/juego-de-fiesta` },
};

export default function JuegoDeFiestaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Juego de Fiesta
        </h1>
        <p className="text-slate-400 text-lg">
          El mejor juego de fiesta para jugar con amigos. El impostor: pasa el
          celular, descubre quién miente y diviértete. Sin descargas, gratis.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Juego de Fiesta
        </Link>
      </div>
    </div>
  );
}
