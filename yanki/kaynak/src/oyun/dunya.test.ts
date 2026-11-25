import { describe, expect, it } from "vitest";
import { AYAR, H, isinmaEgrisi, Oyun, rastgeleUretici } from "./dunya";

/** Oyunu sabit adımlarla ilerletir. */
function ilerlet(o: Oyun, sn: number, adim = 1 / 120) {
  for (let t = 0; t < sn; t += adim) o.adim(adim);
}

/** Yarasayı önündeki serbest geçidin ortasında tutan "otomatik pilot": düşüyorsa ve ortanın altındaysa çırpar. */
function pilot(o: Oyun, sn: number, adim = 1 / 120) {
  for (let t = 0; t < sn && o.durum === "oyun"; t += adim) {
    let ust = -1e9, alt = 1e9;
    for (let dx = 0; dx <= 160; dx += 20) { const [u, a] = o.serbestAralik(o.yarasaX + dx); ust = Math.max(ust, u); alt = Math.min(alt, a); }
    const hedef = (ust + alt) / 2;
    if (o.y > hedef + 10 && o.vy > -100) { o.dokun(); o.birak(); }
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

  it("ısınma: zorluk ilk ~6000 birimde yumuşak başlar, sonra eski hızında artar", () => {
    expect(isinmaEgrisi(0)).toBe(0);
    expect(isinmaEgrisi(1000)).toBeLessThan(100);         // eskiden 1000 olurdu
    expect(isinmaEgrisi(6000)).toBe(3000);
    expect(isinmaEgrisi(10000) - isinmaEgrisi(9000)).toBe(1000);
    const o = new Oyun(3);
    const [u, a] = o.sinir(AYAR.guvenliBaslangic + 3000);
    expect(a - u).toBeGreaterThan(AYAR.bosluk - 10);         // ilk 3000 birimde neredeyse hiç daralmaz
  });

  it("sarkıt ve dikitler: her birinin yanında geçit kalır, iyi uçan yarasa 50 sn yaşar", () => {
    for (const tohum of [21, 3, 5, 7]) {
      const o = new Oyun(tohum);
      o.dokun(); o.birak();
      pilot(o, 50);
      expect(o.durum, `tohum ${tohum}: ${o.carpmaNedeni}`).toBe("oyun");
    }
    const o2 = new Oyun(21);
    o2.kam = 30000; o2.W = 6000;
    (o2 as any).sivrileriUret();
    expect(o2.sivriler.length).toBeGreaterThan(5);
    for (const sv of o2.sivriler) {
      const [u, a] = o2.serbestAralik(sv.x);
      expect(a - u).toBeGreaterThanOrEqual(AYAR.sivriGecit - 1e-6);
      expect(sv.boy).toBeGreaterThanOrEqual(45);
    }
    expect(o2.sivriler.some(s => s.ust) && o2.sivriler.some(s => !s.ust)).toBe(true);
  });

  it("sarkıta çarpınca oyun biter", () => {
    const o = new Oyun(2);
    o.dokun(); o.birak();
    const x = o.yarasaX, [u] = o.sinir(x);
    o.sivriler = [{ x, ust: true, boy: 200, taban: 60 }];
    o.y = u + 120; o.vy = 0;
    o.adim(1 / 120);
    expect(o.durum).toBe("bitti");
    expect(o.carpmaNedeni).toBe("Sarkıta çarptın");
    // ucun altından geçen yarasa çarpmaz
    const o2 = new Oyun(2);
    o2.dokun(); o2.birak();
    const [u2] = o2.sinir(o2.yarasaX);
    o2.sivriler = [{ x: o2.yarasaX, ust: true, boy: 100, taban: 60 }];
    o2.y = u2 + 140; o2.vy = 0;
    o2.adim(1 / 120);
    expect(o2.durum).toBe("oyun");
  });

  it("duraklat: zaman durur, dokunuş devam ettirir (kanat çırpmadan); yeniden başla yeni mağara açar", () => {
    const o = new Oyun(6);
    o.dokun(); o.birak();
    o.adim(0.1);
    o.duraklat();
    const [kam, y] = [o.kam, o.y];
    for (let i = 0; i < 60; i++) o.adim(1 / 60);
    expect([o.kam, o.y]).toEqual([kam, y]);
    o.olaylariAl();
    o.dokun(); o.birak();
    expect(o.duraklatildi).toBe(false);
    expect(o.olaylariAl()).toEqual([]);   // devam ederken kanat çırpmadı
    o.adim(0.1);
    expect(o.kam).toBeGreaterThan(kam);
    const eski = o.tohum;
    o.duraklat(); o.yenidenBasla();
    expect(o.durum).toBe("oyun"); expect(o.kam).toBe(0); expect(o.tohum).not.toBe(eski); expect(o.duraklatildi).toBe(false);
    // menüde ya da bittiğinde duraklatılamaz
    const m = new Oyun(1); m.duraklat(); expect(m.duraklatildi).toBe(false);
  });

  it("örümcek ağı: takılınca kanat zayıflar ve biraz yavaşlar, yazı çıkar, süre bitince geçer", () => {
    const o = new Oyun(8);
    o.dokun(); o.birak();
    const hiz0 = o.hiz;
    o.tehlikeler = [{ tur: "ag", x: o.yarasaX + 5, y: o.y, vy: 0, dustu: false, alindi: false, isik: 0 }];
    o.adim(1 / 120);
    expect(o.olaylariAl()).toContain("ag");
    expect(o.etkiler.ag).toBeGreaterThan(2);
    expect(o.yazilar.map(y => y.metin)).toContain("Ağa takıldın!");
    expect(o.hiz).toBeLessThan(hiz0);
    o.dokun(); o.birak();
    expect(o.vy).toBeCloseTo(-AYAR.kanatGucu * AYAR.agKanatCarpani);
    for (let i = 0; i < 300; i++) { o.y = H / 2; o.vy = 0; o.adim(1 / 120); }   // 2.5 sn
    expect(o.etkiler.ag).toBe(0);
    o.dokun(); o.birak();
    expect(o.vy).toBe(-AYAR.kanatGucu);
    expect(o.durum).toBe("oyun");   // öldürmez
  });

  it("su damlası: yarasa yaklaşınca kopup düşer; değerse ağırlaştırır (yerçekimi artar), öldürmez", () => {
    const o = new Oyun(8);
    o.dokun(); o.birak();
    const [u] = o.sinir(o.yarasaX + 600);
    o.tehlikeler = [{ tur: "damla", x: o.yarasaX + 600, y: u + 8, vy: 0, dustu: false, alindi: false, isik: 0 }];
    for (let i = 0; i < 30; i++) { o.y = H / 2; o.vy = 0; o.adim(1 / 120); }
    expect(o.tehlikeler[0].dustu).toBe(false);
    o.tehlikeler[0].x = o.yarasaX + 200;
    o.y = H / 2; o.vy = 0; o.adim(1 / 120);
    expect(o.tehlikeler[0].dustu).toBe(true);
    expect(o.tehlikeler[0].vy).toBeGreaterThan(0);
    // damla yarasaya değer
    o.tehlikeler = [{ tur: "damla", x: o.yarasaX, y: o.y, vy: 0, dustu: true, alindi: false, isik: 0 }];
    o.y = H / 2; o.vy = 0; o.adim(1 / 120);
    expect(o.olaylariAl()).toContain("damla");
    expect(o.etkiler.islak).toBeGreaterThan(3.5);
    const y0 = o.y; o.vy = 0; o.adim(0.1);
    const islakDusus = o.y - y0;
    o.etkiler.islak = 0; const y1 = o.y; o.vy = 0; o.adim(0.1);
    expect(islakDusus).toBeGreaterThan((o.y - y1) * 1.2);
    expect(o.durum).toBe("oyun");
  });

  it("tehlikeler 3600'den sonra üretilir, sivrilerin dibine konmaz, yankıyla görünür olur", () => {
    const o = new Oyun(12);
    o.kam = 20000; o.W = 8000;
    (o as any).sivrileriUret();
    (o as any).tehlikeleriGuncelle(0.01);
    expect(o.tehlikeler.length).toBeGreaterThan(2);
    expect(o.tehlikeler.some(t => t.tur === "ag") && o.tehlikeler.some(t => t.tur === "damla")).toBe(true);
    for (const t of o.tehlikeler) {
      expect(o.sivriler.some(sv => Math.abs(sv.x - t.x) < 120)).toBe(false);
      if (t.tur === "ag") { const [u, a] = o.serbestAralik(t.x); expect(t.y).toBeGreaterThan(u); expect(t.y).toBeLessThan(a); }
    }
    const o2 = new Oyun(12);
    expect(o2.tehlikeler.length).toBe(0);
    const t = { tur: "ag" as const, x: o2.yarasaX + 150, y: o2.y, vy: 0, dustu: false, alindi: false, isik: 0 };
    o2.tehlikeler = [t];
    o2.dokun(); o2.birak();
    for (let i = 0; i < 25; i++) { o2.y = H / 2; o2.vy = 0; o2.adim(1 / 120); }
    expect(t.isik).toBeGreaterThan(0.3);
  });

  it("önü kör: ateş böcekleri ve tehlikeler kendiliğinden görünmez, yalnız yankı değince görünür ve söner", () => {
    const o = new Oyun(13);
    o.dokun(); o.birak();
    for (let i = 0; i < 240; i++) { o.y = H / 2; o.vy = 0; o.adim(1 / 120); }   // ilk yankı söndü
    o.dalgalar = [];
    const b = { x: o.yarasaX + 700, y0: o.y + 150, y: o.y + 150, faz: 0, alindi: false, isik: 0 };   // yarasanın yolunda değil
    o.bocekler.push(b);
    for (let i = 0; i < 60; i++) { o.y = H / 2; o.vy = 0; o.adim(1 / 120); }
    expect(b.isik).toBe(0);                    // yankı yoksa görünmez
    o.enerji = 1; o.sonar(true);
    for (let i = 0; i < 70; i++) { o.y = H / 2; o.vy = 0; o.adim(1 / 120); }
    expect(b.isik).toBeGreaterThan(0.3);       // yankı değdi
    const tepe = b.isik;
    for (let i = 0; i < 180; i++) { o.y = H / 2; o.vy = 0; o.dalgalar = []; o.adim(1 / 120); }
    expect(b.isik).toBeLessThan(tepe * 0.4);   // ve sönüyor
  });

  it("böceğe değince puan verir", () => {
    const o = new Oyun(2);
    o.dokun(); o.birak();
    o.bocekler.push({ x: o.yarasaX + 5, y0: o.y, y: o.y, faz: 0, alindi: false, isik: 0 });
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
