import { describe, expect, it } from "vitest";
import ORNEK from "../../../yanki/icerik/yanki.json";
import {
  araliklaraBol, bolumCogalt, bolumDenetimi, bolumEkle, bolumOyunu, cizimBolumu, nesneY, noktaEkle, noktalaraCevir, varsayilanAyar, yeniKimlik, type HamBolum,
} from "./yankiIcerik";
import { YANKI_GRUPLARI } from "./sema";
import { yolOku } from "./icerik";

const kopya = () => structuredClone(ORNEK) as any;

describe("Yankı düzenleyicisi hesapları", () => {
  it("şemadaki her ayar Yankı'nın dosyasında ve kodunda var; dosyadaki her ayar şemada", () => {
    const v = kopya(), vars = varsayilanAyar();
    const sema = new Set(YANKI_GRUPLARI.flatMap(g => g.alanlar.map(([y]) => y)));
    for (const y of sema) {
      expect(yolOku(v, y), y).not.toBeUndefined();
      expect(yolOku({ ayarlar: vars }, y), y).not.toBeUndefined();
    }
    const dosyadakiler: string[] = [];
    for (const [k, d] of Object.entries(v.ayarlar)) {
      if (k.startsWith("_")) continue;
      if (d && typeof d === "object" && !Array.isArray(d)) for (const a of Object.keys(d)) dosyadakiler.push(`ayarlar.${k}.${a}`);
      else dosyadakiler.push("ayarlar." + k);
    }
    expect(dosyadakiler.filter(y => !sema.has(y))).toEqual([]);
  });

  it("örnek bölümlerde dar yer yok, oyun bölümleri kabul ediyor", () => {
    for (const b of kopya().bolumler) {
      const d = bolumDenetimi(kopya().ayarlar, b);
      expect(d.darAraliklar, b.id).toEqual([]);
      expect(d.uyarilar, b.id).toEqual([]);
    }
  });

  it("sivri geçidi kapatınca dar yer bulunur ve aralık olarak verilir", () => {
    const v = kopya(); const b: HamBolum = v.bolumler[0];
    b.sivriler!.push({ x: 1500, ust: true, boy: 500, taban: 80 });
    const d = bolumDenetimi(v.ayarlar, b);
    expect(d.darAraliklar.length).toBe(1);
    expect(d.darAraliklar[0][0]).toBeGreaterThan(1450);
    expect(d.darAraliklar[0][1]).toBeLessThan(1550);
    expect(araliklaraBol([0, 10, 20, 50, 60], 10)).toEqual([[0, 20], [50, 60]]);
  });

  it("hatalı kimlik uyarı verir (oyun bu bölümü atlar)", () => {
    const v = kopya(); v.bolumler[0].id = "Kötü Kimlik";
    expect(bolumDenetimi(v.ayarlar, v.bolumler[0]).uyarilar.length).toBe(1);
  });

  it("bölüm ekle/çoğalt: benzersiz kimlik, boş düz bölüm, kopya hemen altta", () => {
    const v = kopya();
    const id = bolumEkle(v);
    expect(id).toBe("bolum_4");
    const yeni = v.bolumler.at(-1);
    expect(yeni.duvar.noktalar.length).toBe(3);
    expect(bolumDenetimi(v.ayarlar, yeni).darAraliklar).toEqual([]);
    const k = bolumCogalt(v, "ilk_ucus");
    expect(k).toBe("ilk_ucus_kopya");
    expect(v.bolumler[1].id).toBe("ilk_ucus_kopya");
    expect(bolumCogalt(v, "ilk_ucus")).toBe("ilk_ucus_kopya_2");
    expect(yeniKimlik("a", ["a", "a_2"])).toBe("a_3");
  });

  it("duvara nokta eklenince şekil değişmez; tohumlu duvar noktalara çevrilince şekle yakın kalır", () => {
    const v = kopya(); const b: HamBolum = v.bolumler[0];
    const once = bolumOyunu(v.ayarlar, b).sinir(1600);
    const k = noktaEkle(v.ayarlar, b, 1600);
    expect(b.duvar.noktalar![k].x).toBe(1600);
    const sonra = bolumOyunu(v.ayarlar, b).sinir(1600);
    expect(Math.abs(sonra[0] - once[0])).toBeLessThan(1);
    const t: HamBolum = v.bolumler[2];
    expect(t.duvar.tohum).toBeDefined();
    const tOnce = bolumOyunu(v.ayarlar, t).sinir(3000);
    noktalaraCevir(v.ayarlar, t, 100);
    expect(t.duvar.noktalar!.length).toBeGreaterThan(80);
    const tSonra = bolumOyunu(v.ayarlar, t).sinir(3000);
    expect(Math.abs(tSonra[0] - tOnce[0])).toBeLessThan(2);
  });

  it("ayarlar düzenleyicideki mağarayı etkiler (tohumlu duvar ayarla daralır); boş y'li nesneler geçidin ortasında", () => {
    const v = kopya(); const t: HamBolum = v.bolumler[2];
    const genis = bolumOyunu(v.ayarlar, t); const [u1, a1] = genis.sinir(8000);
    v.ayarlar.daralma = 40;
    const dar = bolumOyunu(v.ayarlar, t); const [u2, a2] = dar.sinir(8000);
    expect(a2 - u2).toBeLessThan(a1 - u1);
    const o = bolumOyunu(v.ayarlar, v.bolumler[0]);
    const [u, a] = o.serbestAralik(800);
    expect(nesneY(o, "bocek", 800)).toBeCloseTo((u + a) / 2);
    expect(nesneY(o, "bocek", 800, 300)).toBe(300);
    expect(nesneY(o, "damla", 800, 999)).toBeCloseTo(o.sinir(800)[0] + 8);
  });

  it("çizim bölümü: eksik listeler boş, sırasız noktalar sıralı, eksik duvar tohumlu", () => {
    const c = cizimBolumu({ id: "x", ad: "X", uzunluk: 100, duvar: { noktalar: [{ x: 500, ust: 1, alt: 900 }, { x: 0, ust: 2, alt: 800 }] } });
    expect(c.uzunluk).toBe(500);
    expect(c.duvar.noktalar!.map(n => n.x)).toEqual([0, 500]);
    expect(c.sivriler).toEqual([]);
    expect(cizimBolumu({ id: "y", ad: "Y", uzunluk: 900, duvar: {} }).duvar.tohum).toBe(1);
  });
});
