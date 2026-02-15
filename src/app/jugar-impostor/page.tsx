import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Jugar Impostor Gratis - El Mejor Juego de Fiesta Online",
  description:
    "Jugar impostor gratis nunca fue tan fácil. El juego de fiesta donde descubres quién miente. Sin publicidad, sin registro. Pasa el celular entre amigos y diviértete con el impostor.",
  keywords: [
    "jugar impostor",
    "jugar impostor gratis",
    "juego impostor",
    "impostor juego",
    "juego de fiesta",
    "descubrir impostor",
  ],
  alternates: { canonical: `${siteUrl}/jugar-impostor` },
};

export default function JugarImpostorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Jugar Impostor Gratis
        </h1>
        <p className="text-slate-400 text-lg">
          El mejor juego impostor para jugar gratis. Sin publicidad, sin
          inscripción. Pasa el celular entre amigos, descubre quién es el
          impostor y diviértete. Jugar impostor nunca fue tan fácil.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Ahora
        </Link>
      </div>
    </div>
  );
}
