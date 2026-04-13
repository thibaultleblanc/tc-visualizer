import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: "./",
  server: {
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws",
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
