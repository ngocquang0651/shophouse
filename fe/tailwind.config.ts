import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./data/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515", "shopo-orange": "#c94516", porcelain: "#f7f4ef", smoke: "#ece8df", champagne: "#c9a96a", juno: "#c94516", blush: "#fff4f4", mist: "#f3f5f2", paper: "#fcfbf9", selected: "#fff6ec", field: "#8a8a8a",
        // Semantic tokens read by components/ui (shadcn/ui naming), mapped onto the palette above.
        background: "#ffffff",
        foreground: "#151515",
        primary: { DEFAULT: "#151515", foreground: "#ffffff" },
        secondary: { DEFAULT: "#ece8df", foreground: "#151515" },
        accent: { DEFAULT: "#f7f4ef", foreground: "#151515" },
        destructive: { DEFAULT: "#b91c1c", foreground: "#ffffff" },
        muted: { DEFAULT: "#f7f4ef", foreground: "#525252" },
        popover: { DEFAULT: "#ffffff", foreground: "#151515" },
        border: "#d4d4d4",
        input: "#8a8a8a",
        ring: "#151515"
      },
      // Radius scale: control 4px (chips, badges, kbd) / field 6px (buttons, inputs, menu items) / card 8px (panels, tables, menus) / dialog 12px.
      // Row dividers and matrix cells stay square; round the outer frame and clip with overflow-hidden.
      borderRadius: { card: "8px", control: "4px", field: "6px", dialog: "12px" },
      boxShadow: { soft: "0 20px 60px rgba(21,21,21,.10)" }
    }
  },
  plugins: []
};

export default config;
