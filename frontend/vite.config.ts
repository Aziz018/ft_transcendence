import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ["**/*.svg"],
  plugins: [],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
