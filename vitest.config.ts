import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror the tsconfig "@/*" path alias so route handlers that import
    // "@/lib/*" resolve under the Node test environment.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)).replace(/[/\\]$/, ""),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
});
