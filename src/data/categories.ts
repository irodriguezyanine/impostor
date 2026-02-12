/**
 * Categorías del juego Imposter Clone
 *
 * Edita este archivo para agregar más categorías y palabras.
 * Puedes agregar cientos de palabras por categoría.
 *
 * Al agregar una nueva categoría:
 * 1. Añade el objeto con id, name, icon y words
 * 2. Agrega la traducción en src/lib/i18n.ts en TRANSLATIONS[*].categories[id]
 */
export type Category = {
  id: string;
  name: string;
  icon: string; // Emoji o nombre de icono
  words: string[]; // Las palabras secretas
};

export const CATEGORIES: Category[] = [
  {
    id: "lugares",
    name: "Lugares",
    icon: "📍",
    words: [
      "Restaurante",
      "Hospital",
      "Aeropuerto",
      "Playa",
      "Museo",
      "Escuela",
      "Supermercado",
      "Gimnasio",
      "Biblioteca",
      "Cine",
    ],
  },
  {
    id: "comidas",
    name: "Comidas",
    icon: "🍕",
    words: [
      "Pizza",
      "Hamburguesa",
      "Sushi",
      "Tacos",
      "Ensalada",
      "Pasta",
      "Paella",
      "Ceviche",
      "Croissant",
      "Helado",
    ],
  },
  {
    id: "objetos",
    name: "Objetos",
    icon: "🔧",
    words: [
      "Reloj",
      "Paraguas",
      "Cámara",
      "Libro",
      "Teléfono",
      "Llaves",
      "Gafas",
      "Bolígrafo",
      "Mochila",
      "Lámpara",
    ],
  },
];
