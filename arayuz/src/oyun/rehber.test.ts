// ALAN_REHBERI.md'nin otomatik bölümü (Karakterler ve Harita ayarları formları) sema.ts'den üretilir.
// Bu test iki şeyi denetler: (1) her alanın bir açıklaması var, (2) rehberdeki tablo sema.ts ile aynı.
// (tsconfig bu dosyayı tür denetiminden çıkarır: Node API kullanır; vitest çalıştırır.)
// Alan ekleyip rehberi yenilemek için: REHBER_YAZ=1 npx vitest run rehber
import { describe, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { ARAYUZ_GRUPLARI, YANKI_GRUPLARI, HARITA_GRUPLARI, KISI_NITELIK_GRUBU, OYUNCU_GRUPLARI, type Alan, type Grup } from "./sema";

const DOSYA = new URL("../../../ALAN_REHBERI.md", import.meta.url);
const BASLA = "<!-- OTOMATIK BASLA (sema.ts'den üretilir; elle düzenleme) -->";
const BITTI = "<!-- OTOMATIK BITTI -->";

const TUR_ADI: Record<Alan["tur"], string> = {
  sayi: "sayı", anahtar: "açık/kapalı", yazi: "yazı", unreal: "Unreal yolu", renk: "renk", vektor: "sayılar", yollar: "Unreal yolu listesi",
};
const kacis = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

function tur(a: Alan): string {
  let t = TUR_ADI[a.tur];
  if (a.tur === "vektor") t = `${(a.eksenler || ["X", "Y", "Z"]).join(", ")}`;
  if (a.tur === "renk" && a.bosOlabilir) t += a.saydam ? " (saydamlıkla; boş = varsayılan)" : " (boş = varsayılan)";
  if ((a.tur === "sayi" || a.tur === "vektor") && a.birim) t += ` (${a.birim})`;
  if (a.tur === "sayi") {
    if (a.min !== undefined && a.max !== undefined) t += ` ${a.min}–${a.max}`;
    else if (a.max !== undefined) t += `, en çok ${a.max}`;
    else if (a.min !== undefined && a.min !== 0) t += `, en az ${a.min}`;
  }
  if (a.tur === "anahtar" && a.acik) t = `açık: ${a.acik} / kapalı: ${a.kapali}`;
  return t;
}

function grupMd(g: Grup, onEk: string): string {
  const satirlar = [`#### ${g.baslik}`, ""];
  if (g.aciklama) satirlar.push(g.aciklama, "");
  satirlar.push("| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |", "|---|---|---|---|");
  for (const [yol, a] of g.alanlar) satirlar.push(`| **${kacis(a.ad)}** | ${kacis(a.aciklama ?? "")} | ${kacis(tur(a))} | \`${onEk}${yol}\` |`);
  if (g.digerleri) satirlar.push("", `_Oyuna sonradan eklenen ve burada adı olmayan \`${onEk}${g.digerleri.yol}\` alanları da kartın altında "yeni" rozetiyle görünür._`);
  return satirlar.join("\n");
}

export function otomatikBolum(): string {
  return [
    BASLA,
    "### Karakterler → Oyuncu (`karakterler.json` → `oyuncu`)", "",
    ...OYUNCU_GRUPLARI.map(g => grupMd(g, "oyuncu.") + "\n"),
    "### Karakterler → Kişiler: ortak can (`karakterler.json` → `kisi_nitelikler`)", "",
    grupMd(KISI_NITELIK_GRUBU, "kisi_nitelikler.") + "\n",
    "### Harita → Ayarlar (`haritalar/<ad>.json`)", "",
    ...HARITA_GRUPLARI.map(g => grupMd(g, "") + "\n"),
    "### Genel → Arayüz (`arayuz.json`)", "",
    ...ARAYUZ_GRUPLARI.map(g => grupMd(g, "") + "\n"),
    "### Yankı → Ayarlar (`yanki/icerik/yanki.json` → `ayarlar`)", "",
    "Dünya birimi: ekran yüksekliği 1000. Biçimin tek kaynağı `yanki/icerik/BICIM.md`.", "",
    ...YANKI_GRUPLARI.map(g => grupMd(g, "") + "\n"),
    BITTI,
  ].join("\n");
}

describe("alan rehberi", () => {
  it("her form alanının bir açıklaması var", () => {
    const eksik = [...OYUNCU_GRUPLARI, ...HARITA_GRUPLARI, KISI_NITELIK_GRUBU, ...ARAYUZ_GRUPLARI, ...YANKI_GRUPLARI]
      .flatMap(g => g.alanlar.filter(([, a]) => !a.aciklama?.trim()).map(([y]) => `${g.baslik}: ${y}`));
    expect(eksik).toEqual([]);
  });

  it("ALAN_REHBERI.md'nin otomatik bölümü sema.ts ile aynı", () => {
    const metin = readFileSync(DOSYA, "utf8");
    const bas = metin.indexOf(BASLA), son = metin.indexOf(BITTI);
    expect(bas).toBeGreaterThanOrEqual(0);
    expect(son).toBeGreaterThan(bas);
    const yeni = metin.slice(0, bas) + otomatikBolum() + metin.slice(son + BITTI.length);
    if (process.env.REHBER_YAZ) writeFileSync(DOSYA, yeni);
    else expect(metin, "Rehber eski: REHBER_YAZ=1 npx vitest run rehber").toBe(yeni);
  });
});
