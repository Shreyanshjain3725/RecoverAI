import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090B0E",
        surface: "#11151C",
        "surface-border": "#1E2633",
        "surface-hover": "#171D27",
        card: "#121721",
        "card-border": "#212A3A",
        muted: "#8A99AD",
        primary: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          foreground: "#000000",
        },
        accent: {
          indigo: "#6366F1",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          cyan: "#06B6D4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
