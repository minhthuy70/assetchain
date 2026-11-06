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
        background: "var(--background)",
        foreground: "var(--foreground)",
        slate: {
          950: "#090A0F", // Nền chính
          900: "#11131A", // Nền thẻ
          850: "#171A23", // Card elevated / row hover
          800: "#1E222F", // Viền 1px chuẩn
          750: "#272D3D", // Viền hover
          700: "#363C50", // Viền input
          600: "#4B5569", // Icon phụ
          500: "#6B7280", // Muted label
          400: "#9CA3AF", // Secondary text
          300: "#D1D5DB", // Body text
          200: "#E5E7EB", // Subheadings
          100: "#F3F4F6", // Headings
          50:  "#FAFAFA",
        },
        brand: {
          orange: "#F6851B",
          hover: "#E2761B",
          active: "#CD6116",
          subtle: "rgba(246, 133, 27, 0.12)",
          border: "rgba(246, 133, 27, 0.35)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      fontSize: {
        // Typography Hierarchy Tokens
        "display": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.025em" }], // 36px / 44px
        "h1": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],      // 28px / 36px
        "h2": ["1.375rem", { lineHeight: "1.875rem", letterSpacing: "-0.018em" }],   // 22px / 30px
        "h3": ["1.0625rem", { lineHeight: "1.5rem", letterSpacing: "-0.014em" }],     // 17px / 24px
        "subhead": ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "-0.01em" }],// 14px / 22px
        "body": ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "-0.006em" }],  // 13px / 20px
        "caption": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],    // 11px / 16px
        "label": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],      // 11px uppercase
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
