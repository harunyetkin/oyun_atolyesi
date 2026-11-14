import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Derleme çıktısı depo kökündeki app/ klasörüne gider; exe_yap.bat onu paketler.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "../app", emptyOutDir: true, chunkSizeWarningLimit: 2000 },
  test: { environment: "node" },
});
