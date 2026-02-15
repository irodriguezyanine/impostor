import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://elimpostor.cl";

/**
 * Sitemap desarrollado para SEO - Impostor Chile
 * Optimizado para: jugar impostor, jugar impostor futbol, jugar impostor chile,
 * el impostor, juego impostor tenis y más keywords.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/game`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Páginas SEO por keyword - prioridad alta para indexación
  const seoPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/jugar-impostor`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/jugar-impostor-futbol`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/jugar-impostor-chile`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/el-impostor`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/juego-impostor-tenis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/juego-impostor-gratis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/impostor-peliculas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/impostor-famosos-chilenos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/impostor-real-madrid`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/impostor-barcelona`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/juego-de-fiesta`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteUrl}/jugar-impostor-sin-publicidad`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
  ];

  return [...baseUrls, ...seoPages];
}
