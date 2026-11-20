import { describe, expect, it } from "vitest";
import { AYAR, H, Oyun, rastgeleUretici } from "./dunya";

/** Oyunu sabit adımlarla ilerletir. */
function ilerlet(o: Oyun, sn: number, adim = 1 / 120) {
  for (let t = 0; t < sn; t += adim) o.adim(adim);
}

/** Yarasayı mağaranın ortasında tutan "otomatik pilot": düşüyorsa ve ortanın altındaysa çırpar. */
function pilot(o: Oyun, sn: number, adim = 1 / 120) {
  for (let t = 0; t < sn && o.durum === "oyun"; t += adim) {
    const [ust, alt] = o.sinir(o.yarasaX + 60);
    const hedef = (ust + alt) / 2;
    if (o.y > hedef + 20 && o.vy > -100) { o.dokun(); o.birak(); }
    o.adim(adim);
  }
}

describe("Yankı oyun mantığı", () => {
  it("aynı tohum aynı mağarayı üretir, farklı tohum farklısını", () => {
    const a = new Oyun(42), b = new Oyun(42), c = new Oyun(7);
    for (const x of [0, 1200, 5000, 20000]) expect(a.sinir(x)).toEqual(b.sinir(x));
    expect(a.sinir(5000)).not.toEqual(c.sinir(5000));
    const r = rastgeleUretici(1);
    const s = Array.from({ length: 100 }, r);
    expect(Math.min(...s)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...s)).toBeLessThan(1);
  });

  it("mağara başta düz ve geniş, ilerledikçe daralır ama hiçbir yerde kapanmaz ve ekranda kalır", () => {
    const o = new Oyun(3);
    const [u0, a0] = o.sinir(100);
    expect(a0 - u0).toBe(AYAR.bosluk);
    expect((u0 + a0) / 2).toBe(H / 2);
    for (let x = 0; x < 60000; x += 37) {
      const [u, a] = o.sinir(x);
      expect(a - u).toBeGreaterThanOrEqual(AYAR.enDarBosluk - 1e-9);
      expect(u).toBeGreaterThan(0);
      expect(a).toBeLessThan(H);
    }
    const [u1, a1] = o.sinir(40000);
    expect(a1 - u1).toBeLessThan(AYAR.bosluk);
  });

  it("menüde dokununca oyun başlar ve yarasa yükselir", () => {
    const o = new Oyun(1);
    ilerlet(o, 1);
    expect(o.durum).toBe("menu");
    const y0 = o.y;
    o.dokun(); o.birak();
    expect(o.durum).toBe("oyun");
    expect(o.olaylariAl()).toEqual(["basla", "cirp"]);
    ilerlet(o, 0.15);
    expect(o.y).toBeLessThan(y0 - 40);
  });

  it("hiç dokunmazsan yarasa düşer, yere çarpar, skor rekor olur; bekleyince yeniden başlar", () => {
    const o = new Oyun(5);
    o.dokun(); o.birak();
    ilerlet(o, 3);
    expect(o.durum).toBe("bitti");
    expect(o.carpmaNedeni).toBe("Yere çarptın");
    expect(o.olaylariAl()).toContain("carpma");
    expect(o.rekor).toBe(o.skor);
    // hemen dokunmak yeniden başlatmaz (yanlışlıkla geçmesin)
    o.bitisT = 0.1; o.dokun(); o.birak();
    expect(o.durum).toBe("bitti");
    ilerlet(o, 1);
    const eskiTohum = o.tohum;
    o.dokun(); o.birak();
    expect(o.durum).toBe("oyun");
    expect(o.kam).toBe(0);
    expect(o.tohum).not.toBe(eskiTohum);   // her seferinde yeni mağara
  });

  it("sürekli çırpan yarasa tavana çarpar", () => {
    const o = new Oyun(5);
    o.dokun(); o.birak();
    for (let i = 0; i < 200 && o.durum === "oyun"; i++) { o.dokun(); o.birak(); ilerlet(o, 0.05); }
    expect(o.carpmaNedeni).toBe("Tavana çarptın");
  });

  it("iyi uçan yarasa uzun süre yaşar, skor artar, ateş böceği toplar", () => {
    const o = new Oyun(11);
    o.dokun(); o.birak();
    pilot(o, 40);
    expect(o.durum).toBe("oyun");
    expect(o.skor).toBeGreaterThan(100);
    expect(o.hiz).toBeGreaterThan(AYAR.hiz);
  });

  it("böceğe değince puan verir", () => {
    const o = new Oyun(2);
    o.dokun(); o.birak();
    o.bocekler.push({ x: o.yarasaX + 5, y0: o.y, y: o.y, faz: 0, alindi: false });
    o.adim(1 / 120);
    expect(o.bonus).toBe(AYAR.bocekPuani);
    expect(o.olaylariAl()).toContain("bocek");
  });

  it("yankı dalgası duvarları aydınlatır, ışık zamanla söner", () => {
    const o = new Oyun(9);
    o.dokun(); o.birak();
    ilerlet(o, 0.4);
    const parlak = [...o.isik.values()].filter(v => v[0] > 0.3 || v[1] > 0.3);
    expect(parlak.length).toBeGreaterThan(10);
    const enCok = () => Math.max(...[...o.isik.values()].flat());
    const once = enCok();
    // dalga bitince ışık söner (yarasayı havada tut)
    for (let i = 0; i < 300; i++) { o.y = H / 2; o.vy = 0; o.adim(1 / 120); }
    expect(enCok()).toBeLessThan(once * 0.3);
  });

  it("duvar akarak belirir: komşu dilimler arasında ani parlaklık sıçraması yok, ışık hemen değil yumuşakça yükselir", () => {
    const o = new Oyun(9);
    o.dokun(); o.birak();
    o.adim(1 / 120);
    let enBuyukSicrama = 0, enParlak = 0;
    for (let n = 0; n < 120; n++) {
      o.y = H / 2; o.vy = 0;   // yarasayı havada tut
      o.adim(1 / 120);
      const ilk = Math.floor(o.kam / AYAR.ornekAraligi), son = ilk + Math.ceil(o.W / AYAR.ornekAraligi);
      for (let i = ilk; i < son; i++) for (const k of [0, 1] as const) {
        const a = o.parlaklik(i, k), b = o.parlaklik(i + 1, k);
        enBuyukSicrama = Math.max(enBuyukSicrama, Math.abs(a - b));
        enParlak = Math.max(enParlak, a);
      }
    }
    expect(enParlak).toBeGreaterThan(0.4);           // duvar gerçekten görünüyor
    expect(enBuyukSicrama).toBeLessThan(0.12);       // ama yan yana dilimler arasında keskin sınır yok
    // yankı değdiği anda görünen parlaklık hedefin altında başlar (yumuşak belirme)
    const o2 = new Oyun(9);
    o2.dokun(); o2.birak();
    let ilkGorulen: number[] | null = null;
    for (let n = 0; n < 60 && !ilkGorulen; n++) {
      o2.y = H / 2; o2.vy = 0; o2.adim(1 / 120);
      for (const v of o2.isik.values()) if (v[2] > 0.3) { ilkGorulen = [...v]; break; }
    }
    expect(ilkGorulen).not.toBeNull();
    expect(ilkGorulen![0]).toBeLessThan(ilkGorulen![2]);
  });

  it("basılı tutunca büyük sonar çıkar, enerji harcar ve dolana kadar tekrar çıkmaz", () => {
    const o = new Oyun(4);
    o.dokun(); o.birak();
    o.olaylariAl();
    o.dokun();
    for (let i = 0; i < 50; i++) { o.y = H / 2; o.adim(1 / 120); }   // 0.42 sn basılı
    o.birak();
    expect(o.olaylariAl()).toContain("buyuk_sonar");
    expect(o.dalgalar.some(d => d.buyuk)).toBe(true);
    expect(o.enerji).toBeLessThan(0.2);
    o.dokun();
    for (let i = 0; i < 50; i++) { o.y = H / 2; o.adim(1 / 120); }
    o.birak();
    expect(o.olaylariAl()).not.toContain("buyuk_sonar");
    // kısa dokunuş büyük sonar çıkarmaz
    o.enerji = 1;
    o.dokun(); o.y = H / 2; o.adim(0.1); o.birak(); o.adim(0.3);
    expect(o.olaylariAl()).not.toContain("buyuk_sonar");
  });

  it("ekran oranına göre genişlik ayarlanır (sınırlı)", () => {
    const o = new Oyun(1);
    o.boyutla(390 / 844);
    expect(o.W).toBeCloseTo(462, 0);
    o.boyutla(0.2); expect(o.W).toBe(420);
    o.boyutla(1916 / 939); expect(o.W).toBeCloseTo(2040, 0);   // Harun'un geniş ekranı: artık tam dolar
    o.boyutla(5); expect(o.W).toBe(3200);
  });
});
