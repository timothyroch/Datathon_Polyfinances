/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // couleurs nécessaires pour les utilitaires générés par shadcn
        border: "hsl(240 5% 84%)",   // ~ slate-200
        ring: "hsl(240 4.9% 46%)",   // ~ slate-500

        // tes couleurs à toi (facultatif)
        background: "#0a0a0a",
        surface: "#111111",
        text: "#f5f5f5",
        accent: "#4f46e5",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // si tu l’utilises
  ],
};
