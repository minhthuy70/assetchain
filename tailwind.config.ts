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
        // Hệ màu Slate chuẩn SaaS: Tối sâu, trung tính, thanh lịch, chống mỏi mắt
        slate: {
          950: "#090A0F", // Nền chính (Deep Canvas)
          900: "#11131A", // Nền thẻ / card surface chuẩn
          850: "#171A23", // Card elevated / row hover
          800: "#1E222F", // Đường viền chuẩn (Subtle 1px border)
          750: "#272D3D", // Đường viền nổi / input focus ring
          700: "#363C50", // Viền input bình thường
          600: "#4B5569", // Icon phụ / phân cách
          500: "#6B7280", // Placeholder / nhãn mờ
          400: "#9CA3AF", // Văn bản phụ (Secondary text)
          300: "#D1D5DB", // Văn bản nội dung (Body text)
          200: "#E5E7EB", // Tiêu đề phụ (Subheadings)
          100: "#F3F4F6", // Tiêu đề chính (Headings)
          50:  "#FAFAFA",
        },
        // Điểm nhấn thương hiệu (Brand Accent): Cam MetaMask sắc sảo, dùng có chọn lọc
        brand: {
          orange: "#F6851B",
          hover: "#E2761B",
          active: "#CD6116",
          subtle: "rgba(246, 133, 27, 0.12)",
          border: "rgba(246, 133, 27, 0.35)",
        },
        // Điểm nhấn phụ (Subtle Royal Accent): Tím đậm nhận diện Web3
        accent: {
          purple: "#7C3AED",
          purpleSubtle: "rgba(124, 58, 237, 0.12)",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        // Chuẩn SaaS: Tối đa xl (12-14px) cho cards, tránh bo tròn quá đà 3xl
        card: "12px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
