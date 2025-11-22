import type { Config } from "tailwindcss";

const config: Config = {
  // ❌ ON ASSURE QU'IL N'Y A PAS DE DARK MODE ICI
  darkMode: 'class', // ou false, mais 'class' sans l'activer permet de l'ignorer
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // On utilise les couleurs par défaut
    },
  },
  plugins: [],
};

export default config;