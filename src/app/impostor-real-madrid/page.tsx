import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Impostor Real Madrid - Juego con Jugadores del Real Madrid",
  description:
    "Impostor Real Madrid: categoría con jugadores del Real Madrid. Descubre al impostor con Vinícius, Bellingham, Modrić y más. Juego impostor fútbol gratis.",
  keywords: [
    "impostor real madrid",
    "juego impostor real madrid",
    "impostor futbol real madrid",
    "jugar impostor real madrid",
  ],
  alternates: { canonical: `${siteUrl}/impostor-real-madrid` },
};

export default function ImpostorRealMadridPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Impostor Real Madrid
        </h1>
        <p className="text-slate-400 text-lg">
          Impostor Real Madrid con jugadores del equipo merengue. Descubre al
          impostor entre tus amigos con Vinícius Jr, Bellingham, Modrić y más
          leyendas del Real.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Real Madrid
        </Link>
      </div>
    </div>
  );
}
