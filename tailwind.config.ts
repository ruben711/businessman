import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas:   "rgb(var(--canvas) / <alpha-value>)",
        panel:    "rgb(var(--panel) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        hover:    "rgb(var(--hover) / <alpha-value>)",
        inset:    "rgb(var(--inset) / <alpha-value>)",
        line:     "rgb(var(--line) / <alpha-value>)",
        ink:      "rgb(var(--ink) / <alpha-value>)",
        "ink-2":  "rgb(var(--ink-2) / <alpha-value>)",
        "ink-3":  "rgb(var(--ink-3) / <alpha-value>)",
        "ink-4":  "rgb(var(--ink-4) / <alpha-value>)",
        acc:      "rgb(var(--acc) / <alpha-value>)",
        "acc-h":  "rgb(var(--acc-hover) / <alpha-value>)",
        "acc-d":  "rgb(var(--acc-deep) / <alpha-value>)",
        warn:     "rgb(var(--warn) / <alpha-value>)",
        err:      "rgb(var(--err) / <alpha-value>)",
        info:     "rgb(var(--info) / <alpha-value>)",
      },
      fontFamily: {
        body:  ["var(--font-body)", "system-ui", "sans-serif"],
        pixel: ["var(--font-pixel)", "monospace"],
        mono:  ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "6px",
        lg: "10px",
      },
      boxShadow: {
        soft: "0 1px 0 rgb(255 255 255 / 0.02), 0 1px 2px rgb(0 0 0 / 0.4)",
        lift: "0 1px 0 rgb(255 255 255 / 0.03), 0 8px 24px -8px rgb(0 0 0 / 0.5)",
        glow: "0 0 0 1px rgb(110 231 183 / 0.12), 0 8px 24px -8px rgb(110 231 183 / 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
