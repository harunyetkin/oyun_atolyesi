// Hizalama ve dağıtma: seçili nesneleri kenarlarına ya da ortalarına göre hizalar.
// Saf fonksiyonlar (arayüze bağımlı değil) — birim testleri hizalama.test.ts'de.
import type { NesneTuru, Ornek } from "./proje";

export type HizalamaModu = "sol" | "yatayOrta" | "sag" | "ust" | "dikeyOrta" | "alt" | "yatayDagit" | "dikeyDagit";

export interface Kutu { x0: number; y0: number; x1: number; y1: number }

export const HIZALAMA_ADLARI: Record<HizalamaModu, string> = {
  sol: "Sola hizala", yatayOrta: "Yatay ortala", sag: "Sağa hizala",
  ust: "Üste hizala", dikeyOrta: "Dikey ortala", alt: "Alta hizala",
  yatayDagit: "Yatay eşit dağıt", dikeyDagit: "Dikey eşit dağıt",
};

/** Nesnenin görünen boyutu (görünüm bileşeni yoksa 40×40). */
export const nesneBoyutu = (t: NesneTuru | undefined) => ({ w: t?.bilesenler.gorunum?.genislik ?? 40, h: t?.bilesenler.gorunum?.yukseklik ?? 40 });

/** Döndürülmüş ve ölçeklenmiş nesneyi saran eksenlere paralel kutu. */
export function ornekKutusu(o: Ornek, t: NesneTuru | undefined): Kutu {
  const { w, h } = nesneBoyutu(t);
  const yw = (w * Math.abs(o.olcekX)) / 2, yh = (h * Math.abs(o.olcekY)) / 2;
  const a = (o.aci * Math.PI) / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
  const ex = yw * c + yh * s, ey = yw * s + yh * c;
  return { x0: o.x - ex, y0: o.y - ey, x1: o.x + ex, y1: o.y + ey };
}

export const kutularinBirlesimi = (kutular: Kutu[]): Kutu => ({
  x0: Math.min(...kutular.map(k => k.x0)), y0: Math.min(...kutular.map(k => k.y0)),
  x1: Math.max(...kutular.map(k => k.x1)), y1: Math.max(...kutular.map(k => k.y1)),
});

export const kutularKesisir = (a: Kutu, b: Kutu) => a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;

/**
 * Hizalanmış yeni konumları döndürür (id → {x, y}).
 * Tek nesne seçiliyse `cerceve`ye (sahneye) göre, birden fazlaysa seçimin kapladığı alana göre hizalar.
 * Dağıtma en az 3 nesne ister: en uçtakiler yerinde kalır, aradaki boşluklar eşitlenir.
 */
export function hizala(ornekler: Ornek[], turler: Map<string, NesneTuru>, mod: HizalamaModu, cerceve: Kutu): Map<string, { x: number; y: number }> {
  const sonuc = new Map<string, { x: number; y: number }>();
  if (!ornekler.length) return sonuc;
  const kutular = ornekler.map(o => ornekKutusu(o, turler.get(o.turId)));

  if (mod === "yatayDagit" || mod === "dikeyDagit") {
    if (ornekler.length < 3) return sonuc;
    const yatay = mod === "yatayDagit";
    const sira = ornekler.map((o, i) => ({ o, k: kutular[i] }))
      .sort((a, b) => (yatay ? a.k.x0 - b.k.x0 : a.k.y0 - b.k.y0));
    const bas = yatay ? sira[0].k.x0 : sira[0].k.y0;
    const son = yatay ? Math.max(...sira.map(s => s.k.x1)) : Math.max(...sira.map(s => s.k.y1));
    const toplamBoy = sira.reduce((n, s) => n + (yatay ? s.k.x1 - s.k.x0 : s.k.y1 - s.k.y0), 0);
    const bosluk = (son - bas - toplamBoy) / (sira.length - 1);
    let konum = bas;
    for (const { o, k } of sira) {
      const boy = yatay ? k.x1 - k.x0 : k.y1 - k.y0;
      const fark = konum - (yatay ? k.x0 : k.y0);
      sonuc.set(o.id, yatay ? { x: Math.round(o.x + fark), y: o.y } : { x: o.x, y: Math.round(o.y + fark) });
      konum += boy + bosluk;
    }
    return sonuc;
  }

  const hedef = ornekler.length === 1 ? cerceve : kutularinBirlesimi(kutular);
  ornekler.forEach((o, i) => {
    const k = kutular[i];
    let dx = 0, dy = 0;
    if (mod === "sol") dx = hedef.x0 - k.x0;
    else if (mod === "sag") dx = hedef.x1 - k.x1;
    else if (mod === "yatayOrta") dx = (hedef.x0 + hedef.x1) / 2 - (k.x0 + k.x1) / 2;
    else if (mod === "ust") dy = hedef.y0 - k.y0;
    else if (mod === "alt") dy = hedef.y1 - k.y1;
    else if (mod === "dikeyOrta") dy = (hedef.y0 + hedef.y1) / 2 - (k.y0 + k.y1) / 2;
    sonuc.set(o.id, { x: Math.round(o.x + dx), y: Math.round(o.y + dy) });
  });
  return sonuc;
}

/**
 * Köşe tutamacından boyutlandırma: karşı köşe yerinde kalır.
 * `yerelX/yerelY` farenin, nesnenin döndürülmüş ekseninde karşı köşeye göre konumudur.
 * Yeni ölçek ve yeni merkez döner. `oranKoru` (Shift) en-boy oranını korur.
 */
export function koseBoyutlandir(
  o: Ornek, w: number, h: number, kose: [number, number], fare: { x: number; y: number }, oranKoru: boolean,
): { x: number; y: number; olcekX: number; olcekY: number } {
  const a = (o.aci * Math.PI) / 180, cs = Math.cos(a), sn = Math.sin(a);
  const bw = w * Math.abs(o.olcekX), bh = h * Math.abs(o.olcekY);
  // karşı köşenin dünya konumu
  const kx = (-kose[0] * bw) / 2, ky = (-kose[1] * bh) / 2;
  const karsi = { x: o.x + kx * cs - ky * sn, y: o.y + kx * sn + ky * cs };
  // farenin karşı köşeye göre yerel konumu
  const dx = fare.x - karsi.x, dy = fare.y - karsi.y;
  let lx = dx * cs + dy * sn, ly = -dx * sn + dy * cs;
  // tutamacın tarafında kal (nesne ters dönmesin), en az 4 px
  lx = Math.max(4, lx * kose[0]); ly = Math.max(4, ly * kose[1]);
  if (oranKoru) { const k = Math.max(lx / bw, ly / bh); lx = bw * k; ly = bh * k; }
  const isaretX = o.olcekX < 0 ? -1 : 1, isaretY = o.olcekY < 0 ? -1 : 1;
  const olcekX = Math.round((isaretX * lx / w) * 100) / 100, olcekY = Math.round((isaretY * ly / h) * 100) / 100;
  // yeni merkez: karşı köşeden yarım köşegen kadar tutamaç yönünde
  const mx = (kose[0] * lx) / 2, my = (kose[1] * ly) / 2;
  return { x: Math.round(karsi.x + mx * cs - my * sn), y: Math.round(karsi.y + mx * sn + my * cs), olcekX, olcekY };
}
