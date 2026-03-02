import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  platform: "node",
  outDir: "build",
  splitting: false,
  sourcemap: true,
  clean: true,
});
