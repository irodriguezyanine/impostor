import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "Impostor Barcelona - Juego con Jugadores del FC Barcelona",
  description:
    "Impostor Barcelona: categoría con jugadores del FC Barcelona. Descubre al impostor con Pedri, Gavi, Lewandowski y más. Juego impostor fútbol gratis.",
  keywords: [
    "impostor barcelona",
    "juego impostor barcelona",
    "impostor futbol barcelona",
    "jugar impostor barcelona",
  ],
  alternates: { canonical: `${siteUrl}/impostor-barcelona` },
};

export default function ImpostorBarcelonaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          Impostor Barcelona
        </h1>
        <p className="text-slate-400 text-lg">
          Impostor Barcelona con jugadores del FC Barcelona. Descubre al
          impostor entre tus amigos con Pedri, Gavi, Lewandowski y más
          culés.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar Impostor Barcelona
        </Link>
      </div>
    </div>
  );
}
