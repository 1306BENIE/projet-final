import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
