import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic", jsxImportSource: "wdl" },
  resolve: {
    alias: { wdl: fileURLToPath(new URL("./src/wdl", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/**/*.spec.ts", "node_modules/**", ".next/**"],
  },
});
