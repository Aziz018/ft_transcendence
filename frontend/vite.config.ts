import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ["**/*.svg"],
  plugins: [],
  build: {
    lib: {
      entry: "./src/main.ts",
      name: "MyReactLikeLibrary",
      fileName: "my-react-like-library",
    },
  },
  optimizeDeps: {
    include: ["src/lib/jsx.d.ts"],
  },
});
