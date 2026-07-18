import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)), "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)) } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./tests/setup.ts"], fileParallelism: false },
});
