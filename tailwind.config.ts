import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#a3e635",
          dark: "#65a30d",
          glow: "#c6f04a",
        },
        background: "#0f172a",
        surface: "#1e293b",
        "surface-light": "#334155",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(163, 230, 53, 0.3)",
        "glow-lg": "0 0 40px rgba(163, 230, 53, 0.2)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px rgba(163, 230, 53, 0.4))" },
          "50%": { opacity: "0.9", filter: "drop-shadow(0 0 16px rgba(163, 230, 53, 0.6))" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
