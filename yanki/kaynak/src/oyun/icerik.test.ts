import { afterEach, describe, expect, it } from "vitest";
import dosya from "../../../icerik/yanki.json";
import { AYAR, H, noktalardanSinir, Oyun } from "./dunya";
import { ayarlariUygula, bolumleriDogrula, gecitDenetimi, icerigiUygula, VARSAYILAN_AYAR } from "./icerik";

const DOSYA = dosya as any;

/** Geçidin ortasında tutan otomatik pilot (dunya.test.ts ile aynı). */
function pilot(o: Oyun, sn: number, adim = 1 / 120) {
  for (let t = 0; t < sn && o.durum === "oyun"; t += adim) {
    let ust = -1e9, alt = 1e9;
    for (let dx = 0; dx <= 160; dx += 20) { const [u, a] = o.serbestAralik(o.yarasaX + dx); ust = Math.max(ust, u); alt = Math.min(alt, a); }
    if (o.y > (ust + alt) / 2 + 10 && o.vy > -100) { o.dokun(); o.birak(); }
    o.adim(adim);
  }
}

afterEach(() => ayarlariUygula(undefined));   // başka testleri etkilemesin

describe("içerik dosyası (yanki.json)", () => {
  it("dosyadaki ayarlar koddaki bütün ayarları içerir ve hepsi kabul edilir (değerleri Harun değiştirebilir)", () => {
    const { _aciklama, ...ayarlar } = DOSYA.ayarlar;
    void _aciklama;
    expect(Object.keys(ayarlar).sort()).toEqual(Object.keys(VARSAYILAN_AYAR).sort());
    expect(ayarlariUygula(DOSYA.ayarlar)).toEqual([]);
  });

  it("ayarlar uygulanır; bilinmeyen ve türü yanlış alanlar atlanır, varsayılan kalır", () => {
    const atlanan = ayarlariUygula({ kanatGucu: 800, yercekimi: "çok", bilinmeyen: 1, sivriBoyu: [70, 160], bocekAraligi: [5], kucukSonar: { hiz: 1000, renk: 3 } });
    expect(AYAR.kanatGucu).toBe(800);
    expect(AYAR.yercekimi).toBe(VARSAYILAN_AYAR.yercekimi);
    expect(AYAR.sivriBoyu).toEqual([70, 160]);
    expect(AYAR.bocekAraligi).toEqual(VARSAYILAN_AYAR.bocekAraligi);
    expect(AYAR.kucukSonar).toEqual({ ...VARSAYILAN_AYAR.kucukSonar, hiz: 1000 });
    expect(atlanan.sort()).toEqual(["bilinmeyen", "bocekAraligi", "kucukSonar.renk", "yercekimi"]);
    ayarlariUygula(undefined);
    expect(AYAR.kanatGucu).toBe(VARSAYILAN_AYAR.kanatGucu);   // tekrar uygulayınca eskisi kalmaz
  });

  it("bölüm doğrulama: hatalı bölüm atlanır, noktalar sıralanır, sayılar sınırlanır", () => {
    const { bolumler, uyarilar } = bolumleriDogrula([
      { id: "a", ad: "A", uzunluk: 2000, duvar: { noktalar: [{ x: 1000, ust: 300, alt: 320 }, { x: 0, ust: -50, alt: 900 }] },
        sivriler: [{ x: 500, ust: true, boy: 5000, taban: 50 }, { x: "?" }], tehlikeler: [{ tur: "yilan", x: 3 }, { tur: "ag", x: 900 }], bocekler: [{ x: 100, y: 2000 }] },
      { id: "a", ad: "Tekrar", uzunluk: 2000, duvar: { tohum: 1 } },
      { id: "Kötü kimlik", uzunluk: 2000, duvar: { tohum: 1 } },
      { id: "kisa", uzunluk: 100, duvar: { tohum: 1 } },
      { id: "duvarsiz", uzunluk: 2000, duvar: {} },
    ]);
    expect(bolumler.map(b => b.id)).toEqual(["a"]);
    expect(uyarilar.length).toBe(4);
    const a = bolumler[0];
    expect(a.duvar.noktalar!.map(n => n.x)).toEqual([0, 1000]);
    expect(a.duvar.noktalar![0].ust).toBe(0);
    expect(a.duvar.noktalar![1].alt).toBe(360);          // tavanın en az 60 altında
    expect(a.sivriler).toEqual([{ x: 500, ust: true, boy: 700, taban: 50 }]);
    expect(a.tehlikeler).toEqual([{ tur: "ag", x: 900 }]);
    expect(a.bocekler).toEqual([{ x: 100, y: H }]);
  });

  it("noktalı duvar: noktalardan geçer, arası yumuşak, uçlarda düz devam eder", () => {
    const n = [{ x: 0, ust: 200, alt: 800 }, { x: 1000, ust: 400, alt: 600 }];
    expect(noktalardanSinir(n, -100)).toEqual([200, 800]);
    expect(noktalardanSinir(n, 0)).toEqual([200, 800]);
    expect(noktalardanSinir(n, 500)[0]).toBeCloseTo(300);
    expect(noktalardanSinir(n, 1000)).toEqual([400, 600]);
    expect(noktalardanSinir(n, 5000)).toEqual([400, 600]);
    // yumuşak: başta ve sonda eğim küçük
    expect(noktalardanSinir(n, 50)[0] - 200).toBeLessThan(5);
  });

  it("bölüm aynı kalır: aynı bölüm iki kez başlatılınca aynı mağara, sivri, tehlike ve böcekler", () => {
    const { bolumler } = icerigiUygula(DOSYA);
    for (const b of bolumler) {
      const o1 = new Oyun(1), o2 = new Oyun(999);
      o1.bolumBaslat(b); o2.bolumBaslat(b);
      for (let x = 0; x < b.uzunluk; x += 250) expect(o1.sinir(x)).toEqual(o2.sinir(x));
      expect(o1.sivriler).toEqual(o2.sivriler);
      expect(o1.tehlikeler.map(t => [t.tur, t.x, t.y])).toEqual(o2.tehlikeler.map(t => [t.tur, t.x, t.y]));
      expect(o1.bocekler.map(t => [t.x, t.y0])).toEqual(o2.bocekler.map(t => [t.x, t.y0]));
      // rastgele üretim yok: uçtukça listede olmayan sivri/tehlike/böcek eklenmez
      pilot(o1, 6);
      expect(o1.sivriler.every(s => b.sivriler.some(k => k.x === s.x))).toBe(true);
      expect(o1.bocekler.every(s => b.bocekler.some(k => k.x === s.x))).toBe(true);
    }
  });

  it("örnek bölümlerin hiçbir yerinde yarasanın geçemeyeceği darlık yok", () => {
    const { bolumler, uyarilar } = icerigiUygula(DOSYA);
    expect(uyarilar).toEqual([]);
    expect(bolumler.length).toBe(3);
    for (const b of bolumler) {
      const g = gecitDenetimi(b);
      expect(g.darYerler, `${b.id}: en dar ${Math.round(g.enDar)} (x=${g.enDarX})`).toEqual([]);
    }
  });

  it("geçit denetimi dar yeri bulur", () => {
    const { bolumler } = bolumleriDogrula([{ id: "dar", uzunluk: 2000, duvar: { noktalar: [{ x: 0, ust: 200, alt: 800 }, { x: 2000, ust: 200, alt: 800 }] },
      sivriler: [{ x: 1000, ust: true, boy: 500, taban: 60 }] }]);
    const g = gecitDenetimi(bolumler[0]);
    expect(g.enDar).toBeLessThan(150);
    expect(g.darYerler.every(x => Math.abs(x - 1000) <= 30)).toBe(true);
  });

  it("otomatik pilot her örnek bölümü baştan sona bitirir: 'tamam', süre ve puan; rekor değişmez", () => {
    const { bolumler } = icerigiUygula(DOSYA);
    for (const b of bolumler) {
      const o = new Oyun(5);
      o.bolumBaslat(b);
      pilot(o, 120);
      expect(o.durum, `${b.id}: ${o.carpmaNedeni} @ ${Math.round(o.yarasaX)}`).toBe("tamam");
      expect(o.sure).toBeGreaterThan(5);
      expect(o.bonus).toBeGreaterThan(0);
      expect(o.rekor).toBe(0);
      expect(o.olaylariAl()).toContain("tamam");
      // bölüm bitti ekranında bir süre sonra dokununca başlangıç ekranına döner
      for (let t = 0; t < 1; t += 1 / 120) o.adim(1 / 120);
      o.dokun();
      expect(o.durum).toBe("menu");
      expect(o.bolum).toBeNull();
    }
  });

  it("bölümde çarpınca dokunuş aynı bölümü baştan açar; duraklatıp yeniden başla da aynı bölüm", () => {
    const { bolumler } = icerigiUygula(DOSYA);
    const o = new Oyun(3);
    o.bolumBaslat(bolumler[0]);
    for (let t = 0; t < 6 && o.durum === "oyun"; t += 1 / 120) o.adim(1 / 120);   // çırpmadan düşer
    expect(o.durum).toBe("bitti");
    for (let t = 0; t < 1; t += 1 / 120) o.adim(1 / 120);
    o.dokun();
    expect(o.durum).toBe("oyun");
    expect(o.bolum?.id).toBe("ilk_ucus");
    expect(o.sinir(2000)).toEqual(bolumler[0].duvar.noktalar ? noktalardanSinir(bolumler[0].duvar.noktalar, 2000) : []);
    o.duraklat(); o.yenidenBasla();
    expect(o.bolum?.id).toBe("ilk_ucus");
    o.menuyeDon();
    expect(o.durum).toBe("menu");
    expect(o.bolum).toBeNull();
  });

  it("bölümün çıkışı da yalnız yankıyla görünür", () => {
    const { bolumler } = icerigiUygula(DOSYA);
    const o = new Oyun(3);
    o.bolumBaslat(bolumler[0]);
    expect(o.cikisIsik).toBe(0);
  });
});
