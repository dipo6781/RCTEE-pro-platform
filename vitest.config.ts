/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · vitest.config.ts
   Configuración de tests unitarios integrada con el stack Vite 6 + React.
   Coverage acotado a los módulos críticos: engine.ts y supabase.ts (≥ 60 %).
   ──────────────────────────────────────────────────────────────────────────── */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 5000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/engine.ts", "src/supabase.ts"],
      thresholds: {
        statements: 60,
        lines: 60,
        functions: 50,
        branches: 45,
      },
    },
  },
});
