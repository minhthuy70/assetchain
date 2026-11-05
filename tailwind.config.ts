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
        // Chuyển toàn bộ hệ thống slate xám lạnh sang Tông Tím Hoàng Gia MetaMask sâu thẳm
        slate: {
          950: "#140026", // Nền chính sâu nhất (Deep Royal Purple)
          900: "#1F0238", // Nền thẻ / surfaces card (MetaMask Dark Plum)
          850: "#2A054A", // Thẻ nổi nhẹ / card surface elevated
          800: "#3D086A", // Đường viền thẻ & đường phân cách
          700: "#581294", // Viền hover & input border nổi
          600: "#7C1DCB", // Tím trung tính nhấn mạnh
          500: "#A855F7", // Tím sáng (Electric Violet)
          400: "#C48DF6", // Tím nhạt cho văn bản phụ
          300: "#E2C8FD", // Chữ nội dung dễ đọc, sáng và êm mắt
          200: "#F0E2FE", // Chữ tiêu đề phụ
          100: "#FAF5FF", // Gần trắng tinh khiết
          50:  "#FDFAFF",
        },
        // Bảng màu nhận diện thương hiệu MetaMask (Fox Orange & Lilac)
        metamask: {
          orange: "#F6851B",
          hover: "#E2761B",
          glow: "#FF9838",
          light: "#FA9F5A",
          dark: "#8A2E05",
          purple: {
            DEFAULT: "#240046",
            dark: "#140026",
            card: "#1F0238",
            border: "#3D086A",
          },
          lilac: {
            DEFAULT: "#EEDCFF",
            text: "#2B0054",
            hover: "#E5CBFF",
          },
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
    },
  },
  plugins: [],
};
export default config;
