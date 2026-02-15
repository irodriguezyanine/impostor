import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Juego Impostor Gratis - Sin Publicidad ni Registro",
  description:
    "Juego impostor gratis para jugar con amigos. Sin publicidad, sin inscripción, sin descargas. Descubre al impostor en el mejor juego de fiesta gratuito online.",
  keywords: [
    "juego impostor gratis",
    "impostor gratis",
    "jugar impostor gratis",
    "juego gratis impostor",
    "impostor sin publicidad",
  ],
  alternates: { canonical: `${siteUrl}/juego-impostor-gratis` },
};

export default function JuegoImpostorGratisPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Juego Impostor Gratis
        </h1>
        <p className="text-slate-400 text-lg">
          Juego impostor gratis sin publicidad ni registro. Pasa el celular entre
          amigos y descubre al impostor. El mejor juego de fiesta gratuito para
          jugar ahora.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Gratis
        </Link>
      </div>
    </div>
  );
}
