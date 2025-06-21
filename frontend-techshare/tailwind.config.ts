import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1e40af",
        secondary: "#f59e42",
        "secondary-dark": "#b45309",
        accent: "#10b981",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
