// Çarpışma alanlarını hesaplama, çakışma testi ve katı nesnelerden itme.
import type { Alan, CalisanNesne } from "./tipler";

/** Nesnenin görünüm boyutu (görünüm bileşeni yoksa 40x40). */
export function nesneBoyutu(n: CalisanNesne) {
  const g = n.tur.bilesenler.gorunum;
  return { w: (g?.genislik ?? 40) * Math.abs(n.olcekX), h: (g?.yukseklik ?? 40) * Math.abs(n.olcekY) };
}

/** Nesnenin çarpışma alanı; çarpışma bileşeni yoksa null.
 *  Kutu, döndürülmüş nesnelerde döndürülmüş dikdörtgeni saran eksene hizalı kutudur. */
export function carpismaAlani(n: CalisanNesne): Alan | null {
  const c = n.tur.bilesenler.carpisma;
  if (!c) return null;
  const { w, h } = nesneBoyutu(n);
  if (c.bicim === "daire") return { bicim: "daire", x: n.x, y: n.y, r: ((w + h) / 4) * c.olcek };
  const a = (n.aci * Math.PI) / 180, cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
  const yw = ((w * cs + h * sn) / 2) * c.olcek, yh = ((w * sn + h * cs) / 2) * c.olcek;
  return { bicim: "kutu", x: n.x, y: n.y, yw, yh };
}

/** İki alanın çakışması. Çakışıyorsa A'yı B'den çıkarmak için gereken yön (nx, ny; birim) ve
 *  derinliği döndürür; çakışmıyorsa null. */
export function cakisma(A: Alan, B: Alan): { nx: number; ny: number; derinlik: number } | null {
  if (A.bicim === "daire" && B.bicim === "daire") {
    const dx = A.x - B.x, dy = A.y - B.y, d = Math.hypot(dx, dy), t = A.r + B.r;
    if (d >= t) return null;
    return d > 1e-6 ? { nx: dx / d, ny: dy / d, derinlik: t - d } : { nx: 0, ny: -1, derinlik: t };
  }
  if (A.bicim === "kutu" && B.bicim === "kutu") {
    const dx = A.x - B.x, dy = A.y - B.y;
    const ox = A.yw + B.yw - Math.abs(dx), oy = A.yh + B.yh - Math.abs(dy);
    if (ox <= 0 || oy <= 0) return null;
    return ox < oy ? { nx: Math.sign(dx) || 1, ny: 0, derinlik: ox } : { nx: 0, ny: Math.sign(dy) || -1, derinlik: oy };
  }
  // daire - kutu
  const ters = A.bicim === "kutu";
  const D = (ters ? B : A) as Extract<Alan, { bicim: "daire" }>;
  const K = (ters ? A : B) as Extract<Alan, { bicim: "kutu" }>;
  const ex = Math.max(K.x - K.yw, Math.min(D.x, K.x + K.yw));
  const ey = Math.max(K.y - K.yh, Math.min(D.y, K.y + K.yh));
  let dx = D.x - ex, dy = D.y - ey, d = Math.hypot(dx, dy);
  let sonuc: { nx: number; ny: number; derinlik: number } | null;
  if (d > 1e-6) {
    if (d >= D.r) return null;
    sonuc = { nx: dx / d, ny: dy / d, derinlik: D.r - d };
  } else {
    // dairenin merkezi kutunun içinde: en yakın kenardan dışarı it
    const sol = D.x - (K.x - K.yw), sag = K.x + K.yw - D.x, ust = D.y - (K.y - K.yh), alt = K.y + K.yh - D.y;
    const m = Math.min(sol, sag, ust, alt);
    sonuc = m === ust ? { nx: 0, ny: -1, derinlik: ust + D.r } : m === alt ? { nx: 0, ny: 1, derinlik: alt + D.r }
      : m === sol ? { nx: -1, ny: 0, derinlik: sol + D.r } : { nx: 1, ny: 0, derinlik: sag + D.r };
  }
  // yön her zaman "A'yı B'den dışarı" olmalı
  return ters ? { nx: -sonuc.nx, ny: -sonuc.ny, derinlik: sonuc.derinlik } : sonuc;
}
