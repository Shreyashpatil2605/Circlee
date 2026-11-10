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
        background: {
          DEFAULT: "#000000",
          secondary: "#0D0D12",
        },
        surface: {
          DEFAULT: "#14141C",
          hover: "#1A1A24",
          active: "#20202E",
        },
        border: {
          DEFAULT: "#272733",
          subtle: "#1F1F2B",
          strong: "#3B3B4F",
        },
        circlee: {
          violet: "#8B5CF6",
          purple: "#A855F7",
          magenta: "#D946EF",
          orange: "#FF7A35",
          blue: "#3B82F6",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A5A0B2",
          muted: "#716C82",
        },
      },
      backgroundImage: {
        "circlee-gradient": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 35%, #D946EF 70%, #FF7A35 100%)",
        "circlee-glow": "radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
        "card-gradient": "linear-gradient(180deg, rgba(20, 20, 28, 0.8) 0%, rgba(13, 13, 18, 0.9) 100%)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        display: [
          '"Playfair Display"',
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-violet": "0 0 40px -10px rgba(139, 92, 246, 0.3)",
        "glow-orange": "0 0 40px -10px rgba(255, 122, 53, 0.25)",
        "card": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
