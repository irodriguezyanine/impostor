import { Metadata } from "next";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

export const metadata: Metadata = {
  title: "El Impostor - Juego para Descubrir Quién Miente",
  description:
    "El impostor: juego de fiesta donde uno es el impostor y debe engañar a los demás. Descubre quién es el impostor entre tus amigos. Juega gratis online.",
  keywords: [
    "el impostor",
    "juego el impostor",
    "descubrir impostor",
    "quien es el impostor",
    "juego impostor",
  ],
  alternates: { canonical: `${siteUrl}/el-impostor` },
};

export default function ElImpostorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
          El Impostor
        </h1>
        <p className="text-slate-400 text-lg">
          El impostor es el juego de fiesta donde uno debe engañar a los demás.
          Los civiles conocen la palabra secreta; el impostor no. Pregunta,
          discute y descubre quién es el impostor.
        </p>
        <Link
          href="/"
          className="inline-block py-4 px-8 rounded-2xl bg-primary text-gray-900 font-bold text-lg hover:shadow-glow transition-all"
        >
          Jugar El Impostor
        </Link>
      </div>
    </div>
  );
}
