import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  publicDir: process.env.GAME_ARTIFACT_DIR ? resolve(process.env.GAME_ARTIFACT_DIR) : fileURLToPath(new URL("../godot-dotnet/generated", import.meta.url)),
  server: { host: "127.0.0.1", port: 5174, fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] } },
  build: { outDir: "../../.wdl/three-runtime", emptyOutDir: true },
});
