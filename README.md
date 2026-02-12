# Imposter Clone

Clon del juego de fiesta "Imposter Who?" (Spyfall) en formato **Pass and Play** para jugar con un solo dispositivo móvil.

## Tecnologías

- **Next.js 14+** (App Router)
- **TypeScript** (modo estricto)
- **Tailwind CSS** (mobile-first)
- **Framer Motion** (animaciones)
- **Lucide React** (iconos)

## Idiomas

- Español (principal)
- Inglés
- Portugués
- Italiano
- Francés

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm run build
npm start
```

## Añadir categorías y palabras

Edita el archivo `src/data/categories.ts` para agregar nuevas categorías y palabras. La estructura es:

```typescript
{
  id: "mi-categoria",
  name: "Mi Categoría",
  icon: "📌",  // Emoji
  words: ["Palabra1", "Palabra2", ...],
}
```

Para que las categorías aparezcan traducidas en otros idiomas, añade las traducciones en `src/lib/i18n.ts` dentro del objeto `categories` de cada idioma.

## Despliegue en Vercel

Conecta tu repositorio a Vercel y despliega automáticamente. No requiere configuración adicional.
