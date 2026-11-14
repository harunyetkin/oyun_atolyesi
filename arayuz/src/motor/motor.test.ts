// Motor birim testleri: fizik, çarpışma, katı nesneler ve hazır davranışlar.
import { describe, expect, it } from "vitest";
import { bosProje, ornekProje, type Bilesenler, type Proje } from "../depo/proje";
import { Dunya, ADIM } from "./dunya";
import { cakisma } from "./carpisma";
import { davranisBul, davranisListesi, varsayilanAyarlar } from "./davranis";
import { tusAdiBul } from "./tipler";

/** Test için küçük proje: verilen türleri ve örnekleri koyar. */
function proje(turler: Record<string, Bilesenler>, ornekler: [string, number, number][]): Proje {
  const p = bosProje("test");
  p.nesneTurleri = Object.entries(turler).map(([id, b]) => ({ id, ad: id, etiketler: [], bilesenler: b }));
  p.sahneler[0].ornekler = ornekler.map(([turId, x, y], i) => ({ id: turId + i, turId, x, y, aci: 0, olcekX: 1, olcekY: 1, katman: "oyun" }));
  return p;
}
const gorunum = (w: number, h: number) => ({ sekil: "kare" as const, renk: "#fff", genislik: w, yukseklik: h, saydamlik: 1 });
const sure = (d: Dunya, saniye: number) => { for (let i = Math.round(saniye / ADIM); i > 0; i--) d.adim(ADIM); };

describe("fizik", () => {
  it("yerçekimiyle düşer ve hız en yüksek hızı geçmez", () => {
    const d = new Dunya(proje({ top: { gorunum: gorunum(20, 20), fizik: { yercekimi: 1000, hizX: 0, hizY: 0, enYuksekHiz: 300, surtunme: 0 } } }, [["top", 100, 0]]));
    sure(d, 0.1);
    expect(d.nesneler[0].vy).toBeCloseTo(100, 0);
    sure(d, 2);
    expect(d.nesneler[0].vy).toBeCloseTo(300, 5);
    expect(d.nesneler[0].y).toBeGreaterThan(400);
  });
  it("başlangıç hızıyla hareket eder, sürtünme yavaşlatır", () => {
    const p = proje({ a: { fizik: { yercekimi: 0, hizX: 100, hizY: 0, enYuksekHiz: 0, surtunme: 0 } },
      b: { fizik: { yercekimi: 0, hizX: 100, hizY: 0, enYuksekHiz: 0, surtunme: 0.2 } } }, [["a", 0, 0], ["b", 0, 0]]);
    const d = new Dunya(p);
    sure(d, 1);
    expect(d.nesneler[0].x).toBeCloseTo(100, 0);
    expect(d.nesneler[1].x).toBeLessThan(60);
    expect(d.nesneler[1].vx).toBeCloseTo(100 * 0.8 ** 10, 3); // 0,1 sn başına %20 kayıp
  });
  it("oynatma projeyi değiştirmez", () => {
    const p = ornekProje();
    const once = JSON.stringify(p);
    const d = new Dunya(p);
    sure(d, 1);
    expect(JSON.stringify(p)).toBe(once);
  });
  it("ilerle() kare hızından bağımsız aynı sonucu verir", () => {
    const yap = () => new Dunya(proje({ top: { fizik: { yercekimi: 900, hizX: 0, hizY: 0, enYuksekHiz: 0, surtunme: 0 } } }, [["top", 0, 0]]));
    const a = yap(), b = yap();
    for (let i = 0; i < 60; i++) a.ilerle(1 / 60);
    for (let i = 0; i < 144; i++) b.ilerle(1 / 144);
    expect(a.nesneler[0].y).toBeCloseTo(b.nesneler[0].y, 0);
  });
});

describe("çarpışma", () => {
  it("geometri: daire-daire, kutu-kutu, daire-kutu", () => {
    expect(cakisma({ bicim: "daire", x: 0, y: 0, r: 5 }, { bicim: "daire", x: 8, y: 0, r: 5 })).toMatchObject({ nx: -1, derinlik: 2 });
    expect(cakisma({ bicim: "daire", x: 0, y: 0, r: 5 }, { bicim: "daire", x: 11, y: 0, r: 5 })).toBeNull();
    expect(cakisma({ bicim: "kutu", x: 0, y: 0, yw: 10, yh: 10 }, { bicim: "kutu", x: 0, y: 18, yw: 10, yh: 10 })).toMatchObject({ nx: 0, ny: -1, derinlik: 2 });
    const dk = cakisma({ bicim: "daire", x: 0, y: -12, r: 5 }, { bicim: "kutu", x: 0, y: 0, yw: 50, yh: 10 })!;
    expect(dk.ny).toBe(-1); expect(dk.derinlik).toBeCloseTo(3);
    const kd = cakisma({ bicim: "kutu", x: 0, y: 0, yw: 50, yh: 10 }, { bicim: "daire", x: 0, y: -12, r: 5 })!;
    expect(kd.ny).toBe(1);
    expect(cakisma({ bicim: "daire", x: 70, y: 0, r: 5 }, { bicim: "kutu", x: 0, y: 0, yw: 50, yh: 10 })).toBeNull();
  });
  it("katı zeminin içinden geçmez ve üstünde durur (daire ve kutu)", () => {
    for (const bicim of ["daire", "kutu"] as const) {
      const d = new Dunya(proje({
        top: { gorunum: gorunum(20, 20), fizik: { yercekimi: 1500, hizX: 0, hizY: 0, enYuksekHiz: 2000, surtunme: 0 }, carpisma: { bicim, olcek: 1, kati: false } },
        zemin: { gorunum: gorunum(400, 40), carpisma: { bicim: "kutu", olcek: 1, kati: true } },
      }, [["top", 200, 0], ["zemin", 200, 300]]));
      sure(d, 2);
      const top = d.nesneler[0];
      expect(top.y).toBeCloseTo(270, 0);   // zeminin üstü 280, topun yarıçapı 10
      expect(Math.abs(top.vy)).toBeLessThan(20);
      expect(top.yerde).toBe(true);
      expect(d.degiyor("top0", "zemin1")).toBe(true);
    }
  });
  it("hızlı düşen nesne de ince zeminden geçmez", () => {
    const d = new Dunya(proje({
      top: { gorunum: gorunum(20, 20), fizik: { yercekimi: 0, hizX: 0, hizY: 1200, enYuksekHiz: 0, surtunme: 0 }, carpisma: { bicim: "daire", olcek: 1, kati: false } },
      zemin: { gorunum: gorunum(400, 30), carpisma: { bicim: "kutu", olcek: 1, kati: true } },
    }, [["top", 200, 0], ["zemin", 200, 300]]));
    sure(d, 1);
    expect(d.nesneler[0].y).toBeLessThan(290);
  });
  it("katı olmayan nesnenin içinden geçer ama çarpışma kaydedilir", () => {
    const d = new Dunya(proje({
      top: { gorunum: gorunum(20, 20), fizik: { yercekimi: 0, hizX: 300, hizY: 0, enYuksekHiz: 0, surtunme: 0 }, carpisma: { bicim: "daire", olcek: 1, kati: false } },
      altin: { gorunum: gorunum(20, 20), carpisma: { bicim: "daire", olcek: 1, kati: false } },
    }, [["top", 0, 100], ["altin", 100, 100]]));
    let degdi = false;
    for (let t = 0; t < 1; t += ADIM) { d.adim(ADIM); degdi ||= d.degiyor("top0", "altin1"); }
    expect(degdi).toBe(true);
    expect(d.nesneler[0].x).toBeGreaterThan(250);
  });
  it("yandan katı duvara çarpınca durur", () => {
    const d = new Dunya(proje({
      top: { gorunum: gorunum(20, 20), fizik: { yercekimi: 0, hizX: 400, hizY: 0, enYuksekHiz: 0, surtunme: 0 }, carpisma: { bicim: "kutu", olcek: 1, kati: false } },
      duvar: { gorunum: gorunum(40, 400), carpisma: { bicim: "kutu", olcek: 1, kati: true } },
    }, [["top", 0, 100], ["duvar", 200, 100]]));
    sure(d, 1);
    expect(d.nesneler[0].x).toBeCloseTo(170, 0);
    expect(d.nesneler[0].vx).toBe(0);
  });
});

describe("davranışlar", () => {
  it("kayıtta üç hazır davranış var ve her birinin ayarı tanımlı", () => {
    const turler = davranisListesi().map(t => t.tur);
    expect(turler).toEqual(expect.arrayContaining(["tusla_zipla", "sabit_kay", "ekrandan_cikinca_yok_ol"]));
    expect(varsayilanAyarlar(davranisBul("sabit_kay")!)).toEqual({ hiz: 200, yon: "sol" });
  });
  it("tuşla zıpla yalnızca seçilen tuşla çalışır", () => {
    for (const tus of ["Boşluk", "Yukarı ok", "W", "Fare tıklaması"] as const) {
      const d = new Dunya(proje({ kus: { fizik: { yercekimi: 1000, hizX: 0, hizY: 0, enYuksekHiz: 0, surtunme: 0 },
        davranislar: [{ tur: "tusla_zipla", ayarlar: { tus, guc: 500 } }] } }, [["kus", 100, 200]]));
      d.tusBas(tus === "W" ? "Boşluk" : "W"); d.adim(ADIM);
      expect(d.nesneler[0].vy).toBeGreaterThan(0);        // yanlış tuş: hâlâ düşüyor
      d.tusBas(tus); d.adim(ADIM);
      expect(d.nesneler[0].vy).toBeLessThan(-480);        // doğru tuş: yukarı fırladı
    }
  });
  it("basılı tutulan tuş tekrar zıplatmaz; bırakıp basınca zıplatır", () => {
    const d = new Dunya(proje({ kus: { fizik: { yercekimi: 1000, hizX: 0, hizY: 0, enYuksekHiz: 0, surtunme: 0 },
      davranislar: [{ tur: "tusla_zipla", ayarlar: { tus: "Boşluk", guc: 500 } }] } }, [["kus", 100, 200]]));
    d.tusBas("Boşluk"); d.adim(ADIM); sure(d, 0.6);
    d.tusBas("Boşluk"); d.adim(ADIM);
    expect(d.nesneler[0].vy).toBeGreaterThan(0);
    d.tusBirak("Boşluk"); d.tusBas("Boşluk"); d.adim(ADIM);
    expect(d.nesneler[0].vy).toBeLessThan(0);
  });
  it("sabit kay her yöne çalışır; eski projelerdeki yön'süz ayar sola kayar", () => {
    const d = new Dunya(proje({
      sol: { davranislar: [{ tur: "sabit_kay", ayarlar: { hiz: 100 } }] },
      asagi: { davranislar: [{ tur: "sabit_kay", ayarlar: { hiz: 50, yon: "asagi" } }] },
    }, [["sol", 500, 100], ["asagi", 100, 100]]));
    sure(d, 1);
    expect(d.nesneler[0].x).toBeCloseTo(400, 0);
    expect(d.nesneler[1].y).toBeCloseTo(150, 0);
  });
  it("ekrandan çıkınca yok olur; dışarıda doğan nesne önce içeri girer", () => {
    const d = new Dunya(proje({
      boru: { gorunum: gorunum(40, 100), davranislar: [{ tur: "sabit_kay", ayarlar: { hiz: 600 } }, { tur: "ekrandan_cikinca_yok_ol", ayarlar: {} }] },
    }, [["boru", 1000, 200]]));   // sahne 960 genişliğinde: sağ kenarın dışında doğuyor
    d.adim(ADIM);
    expect(d.nesneler).toHaveLength(1);
    sure(d, 1);
    expect(d.nesneler).toHaveLength(1);   // hâlâ sahnede
    sure(d, 1.2);
    expect(d.nesneler).toHaveLength(0);   // sol kenardan çıktı
  });
  it("örnek proje: kuş zıplar, borular kayar, motor hata vermez", () => {
    const d = new Dunya(ornekProje());
    const kus = d.nesneler.find(n => n.turId === "tur_kus")!;
    const boru = d.nesneler.find(n => n.turId === "tur_boru")!;
    const bx = boru.x;
    sure(d, 0.3);
    expect(kus.vy).toBeGreaterThan(0);
    d.tusBas("Boşluk"); d.adim(ADIM);
    expect(kus.vy).toBeLessThan(0);
    sure(d, 0.5);
    expect(boru.x).toBeLessThan(bx - 100);
  });
  it("tuş adları tarayıcı tuşlarından doğru çevrilir", () => {
    expect(tusAdiBul(" ")).toBe("Boşluk");
    expect(tusAdiBul("ArrowUp")).toBe("Yukarı ok");
    expect(tusAdiBul("w")).toBe("W");
    expect(tusAdiBul("x")).toBeNull();
  });
});
