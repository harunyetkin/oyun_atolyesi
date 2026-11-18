// Yankı derleme ayarı: çıktı yanki/oyun/ klasörüne yazılır ve commit edilir
// (Harun'un bilgisayarında Node gerekmez; GitHub Pages doğrudan bu klasörü sunar).
import { defineConfig, type Plugin } from "vitest/config";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** Derlemeden sonra sw.js'nin başına oyunun bütün dosyalarının listesini yazar:
 *  böylece oyun ilk açılıştan sonra internetsiz de tamamen çalışır. */
function cevrimdisiListe(): Plugin {
  const cikti = join(dirname(fileURLToPath(import.meta.url)), "../oyun");
  const tara = (k: string): string[] => readdirSync(k).flatMap(a => statSync(join(k, a)).isDirectory() ? tara(join(k, a)) : [join(k, a)]);
  return {
    name: "cevrimdisi-liste",
    apply: "build",
    closeBundle() {
      const dosyalar = ["./", ...tara(cikti).map(d => "./" + relative(cikti, d).split("\\").join("/")).filter(d => d !== "./sw.js")];
      const sw = join(cikti, "sw.js");
      const surum = Date.now().toString(36);
      writeFileSync(sw, `self.__DOSYALAR__ = ${JSON.stringify(dosyalar)};\nself.__SURUM__ = "${surum}";\n` + readFileSync(sw, "utf8"));
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [cevrimdisiListe()],
  build: { outDir: "../oyun", emptyOutDir: true, assetsInlineLimit: 0 },
  test: { environment: "node" },
});
