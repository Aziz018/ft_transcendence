import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ["**/*.svg"],
  plugins: [],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_ORIGIN || "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
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
