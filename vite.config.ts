import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "IBKRGermanTaxReport",
      fileName: "index",
    },
    rollupOptions: {
      external: ["node:fs"],
    },
  },
});
