import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        champagne: "#c9a96a",
        rosewood: "#b23a48",
        juno: "#e30613",
        blush: "#fff4f4",
        porcelain: "#f7f4ef",
        smoke: "#ece8df",
        mist: "#f3f5f2"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(21, 21, 21, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
