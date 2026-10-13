/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        card: "#ffffff",
        background: "#f8fafc",
        foreground: "#0f172a",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        secondary: {
          DEFAULT: "#e2e8f0",
          foreground: "#1e293b",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#fef2f2",
        },
        border: "#e2e8f0",
        physician: "#1d4ed8",
        patient: "#b45309",
        hpi: "#c2410c",
        obj: "#1e40af",
        plan: "#047857",
        edit: "#d97706",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
