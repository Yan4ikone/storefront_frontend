import type { Config } from "tailwindcss";

// Все брендовые цвета заведены через CSS-переменные (см. app/globals.css).
// Чтобы поменять фирменные цвета в будущем — правится только один файл (globals.css),
// а не каждый компонент.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
        },
        ink: "var(--ink)",
        muted: "var(--muted)",
        surface: "var(--surface)",
        border: "var(--border-color)",
      },
      borderRadius: {
        card: "14px",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
