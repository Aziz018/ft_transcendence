import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ["**/*.svg"],
  plugins: [],
  server: {
    proxy: {
      "/api": {
        target: process.env.BACKEND_INTERNAL_URL || "http://backend:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    allowedHosts: ["pong.rush.io", "pongrush.game"]
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
