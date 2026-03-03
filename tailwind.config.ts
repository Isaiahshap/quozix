import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#08090c",
          secondary: "#0d0f14",
          tertiary: "#12141a",
        },
        panel: {
          DEFAULT: "#0e1118",
          hover: "#131720",
          border: "#1e2433",
        },
        accent: {
          cyan: "#00d4ff",
          purple: "#8b5cf6",
          green: "#00ff88",
          amber: "#f59e0b",
          red: "#ef4444",
        },
        text: {
          primary: "#e2e8f0",
          secondary: "#94a3b8",
          muted: "#475569",
          accent: "#00d4ff",
        },
        border: {
          DEFAULT: "#1e2433",
          subtle: "#151c29",
          glow: "rgba(0,212,255,0.3)",
        },
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "panel-gradient":
          "linear-gradient(135deg, rgba(14,17,24,0.95) 0%, rgba(18,20,26,0.9) 100%)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "glow-purple":
          "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        panel: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        "panel-hover": "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        glow: "0 0 20px rgba(0,212,255,0.2), 0 0 40px rgba(0,212,255,0.1)",
        "glow-purple": "0 0 20px rgba(139,92,246,0.2), 0 0 40px rgba(139,92,246,0.1)",
        "inner-glow": "inset 0 1px 0 rgba(0,212,255,0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "grain": "grain 8s steps(10) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -2%)" },
          "20%": { transform: "translate(2%, 2%)" },
          "30%": { transform: "translate(-1%, 1%)" },
          "40%": { transform: "translate(1%, -1%)" },
          "50%": { transform: "translate(-2%, 2%)" },
          "60%": { transform: "translate(2%, -2%)" },
          "70%": { transform: "translate(-1%, -1%)" },
          "80%": { transform: "translate(1%, 1%)" },
          "90%": { transform: "translate(-2%, -1%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
