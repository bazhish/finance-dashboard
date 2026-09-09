import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Inter em títulos e rótulos de interface; Nunito no texto corrido.
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        "line-strong": "rgb(var(--color-line-strong) / <alpha-value>)",

        // Escala do trevo. `leaf` (DEFAULT 500) é a cor de ação do produto.
        leaf: {
          DEFAULT: "#2E9D5B",
          50: "#EFFAF1",
          100: "#D7F2DD",
          200: "#B0E5BE",
          300: "#7FD199",
          400: "#4FB877",
          500: "#2E9D5B",
          600: "#1F8049",
          700: "#19653B",
          800: "#145030",
          900: "#103F27"
        },
        // Acento de "sorte": usado com parcimônia, em destaques e conquistas.
        gold: {
          DEFAULT: "#D9A441",
          soft: "#F2DFB4",
          deep: "#96690F"
        },

        // Semânticas seguem os tokens de tema (viram claras no dark).
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 16px 38px rgb(var(--shadow-ink) / var(--shadow-soft-opacity))",
        lift: "0 24px 70px rgb(var(--shadow-ink) / var(--shadow-lift-opacity))",
        glow: "0 22px 60px rgb(var(--brand-ring) / 0.24)"
      },
      borderRadius: {
        app: "14px"
      }
    }
  },
  plugins: []
};

export default config;
