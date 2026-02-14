"use client";

import React from "react";

/**
 * Sección de contenido SEO visible para crawlers y usuarios.
 * Incluye keywords objetivo de forma natural sin keyword stuffing.
 */
export function SeoContent() {
  return (
    <section
      className="sr-only"
      aria-labelledby="seo-about-title"
    >
      <h2
        id="seo-about-title"
        className="sr-only"
      >
        Sobre Impostor Chile - Jugar impostor gratis
      </h2>
      <p>
        <strong className="text-slate-400">Impostor Chile</strong> es el mejor{" "}
        <strong className="text-slate-400">juego impostor</strong> para jugar
        gratis en Chile. Sin publicidad, sin inscripción. Juega{" "}
        <strong className="text-slate-400">impostor fútbol</strong> con
        categorías de futbolistas, Real Madrid, Barcelona, River, Boca,
        Champions League y más. También incluye{" "}
        <strong className="text-slate-400">impostor</strong> con famosos
        chilenos, películas, lugares y objetos. Pasa el celular entre amigos,
        descubre al impostor y diviértete.{" "}
        <strong className="text-slate-400">Jugar impostor gratis</strong> nunca
        fue tan fácil.
      </p>
    </section>
  );
}
