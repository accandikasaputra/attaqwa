import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    host: true, // agar bisa diakses dari jaringan luar (ngrok, LAN, dll)
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "meanderingly-authorisable-aden.ngrok-free.dev", // ✅ domain ngrok
      "all", // biar fleksibel (opsional)
    ],
    hmr: {
      overlay: false, // Disables the full-screen error overlay
    },
  },
  preview: {
    allowedHosts: ["all"],
  },
});
