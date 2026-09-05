import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pp: {
          primary: "var(--pp-primary)",
          "primary-dark": "var(--pp-primary-dark)",
          "primary-light": "var(--pp-primary-light)",
          secondary: "var(--pp-secondary)",
          "secondary-dark": "var(--pp-secondary-dark)",
          "secondary-light": "var(--pp-secondary-light)",
          gray: "var(--pp-gray)",
          bg: "var(--pp-background)",
          surface: "var(--pp-surface)",
          border: "var(--pp-border)",
          text: "var(--pp-text)",
          muted: "var(--pp-text-secondary)",
          success: "var(--pp-success)",
          "success-light": "var(--pp-success-light)",
          warning: "var(--pp-warning)",
          "warning-light": "var(--pp-warning-light)",
          danger: "var(--pp-danger)",
          "danger-light": "var(--pp-danger-light)",
          hover: "var(--pp-row-hover)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pp: "8px",
      },
      boxShadow: {
        pp: "none",
      },
    },
  },
  plugins: [],
};

export default config;
