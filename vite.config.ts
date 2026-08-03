import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://app-backend-production-1306.up.railway.app",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "",
      },
      "/socket.io": {
        target: "https://app-backend-production-1306.up.railway.app",
        changeOrigin: true,
        secure: true,
        ws: true,
        cookieDomainRewrite: "",
      },
    },
  },
});
