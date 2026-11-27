// Yankı düzenleyicisinin hesapları (DOM'suz; birim testleri doğrudan çalıştırır).
// Duvar, sivri ve geçit hesapları Yankı'nın KENDİ kodundan gelir (yanki/kaynak/src/oyun): düzenleyicide görünen mağara
// oyundakiyle birebir aynıdır. Yankı'nın biçimi: yanki/icerik/BICIM.md.
import { AYAR, H, Oyun, type Bolum } from "../../../yanki/kaynak/src/oyun/dunya";
import { ayarlariUygula, bolumleriDogrula, gecitDenetimi } from "../../../yanki/kaynak/src/oyun/icerik";

export { H };
export type { Bolum };

/** Dosyadaki ham bölüm (düzenlenirken eksik/hatalı alan olabilir). */
export interface HamBolum {
  id: string; ad: string; aciklama?: string; uzunluk: number;
  duvar: { tohum?: number; noktalar?: { x: number; ust: number; alt: number }[] };
  sivriler?: { x: number; ust: boolean; boy: number; taban: number }[];
  tehlikeler?: { tur: "ag" | "damla"; x: number; y?: number }[];
  bocekler?: { x: number; y?: number }[];
  [diger: string]: unknown;
}

/** Geçit denetiminde "yarasa geçemez" sayılan darlık (birim). Yankı'nın gecitDenetimi ile aynı varsayılan. */
export const DAR_ESIK = 150;

/** Ham bölümü çizilebilir hâle getirir: listeler boşsa boş dizi, noktalar sıralı. Sıralar korunur (liste sırası = düzenleme sırası). */
export function cizimBolumu(h: HamBolum): Bolum {
  const n = Array.isArray(h.duvar?.noktalar) ? [...h.duvar.noktalar].sort((a, b) => a.x - b.x) : undefined;
  const duvar = n && n.length >= 2 ? { noktalar: n } : { tohum: typeof h.duvar?.tohum === "number" ? h.duvar.tohum : 1 };
  return {
    id: h.id, ad: h.ad, uzunluk: Math.max(500, Number(h.uzunluk) || 500), duvar,
    sivriler: (h.sivriler || []).map(s => ({ x: s.x, ust: !!s.ust, boy: s.boy, taban: s.taban })),
    tehlikeler: (h.tehlikeler || []).map(t => ({ ...t })),
    bocekler: (h.bocekler || []).map(b => ({ ...b })),
  };
}

/** Bölümün oyundaki hâli: Yankı'nın ayarları uygulanmış bir Oyun (duvar ve serbest geçit sorguları için). */
export function bolumOyunu(ayarlar: Record<string, unknown> | undefined, h: HamBolum): Oyun {
  ayarlariUygula(ayarlar);
  const o = new Oyun(1);
  o.bolum = cizimBolumu(h);
  o.sifirla();
  return o;
}

/** Ayarlar uygulanmış hâlde geçit denetimi ve oyunun bölümü kabul edip etmediği (uyarılarıyla). */
export function bolumDenetimi(ayarlar: Record<string, unknown> | undefined, h: HamBolum) {
  ayarlariUygula(ayarlar);
  const gecit = gecitDenetimi(cizimBolumu(h), DAR_ESIK);
  const { uyarilar } = bolumleriDogrula([h]);
  return { ...gecit, darAraliklar: araliklaraBol(gecit.darYerler, 10), uyarilar };
}

/** Sıralı x noktalarını kesintisiz aralıklara böler (adım `ara`). */
export function araliklaraBol(xler: number[], ara: number): [number, number][] {
  const sonuc: [number, number][] = [];
  for (const x of xler) {
    const son = sonuc[sonuc.length - 1];
    if (son && x - son[1] <= ara + 1e-6) son[1] = x; else sonuc.push([x, x]);
  }
  return sonuc;
}

/** Tehlike ve böceklerin oyunda duracağı y (boş y: ağ ve böcek geçidin ortasında, damla tavanda). */
export function nesneY(o: Oyun, tur: "ag" | "damla" | "bocek", x: number, y?: number): number {
  if (tur === "damla") return o.sinir(x)[0] + 8;
  if (typeof y === "number") return y;
  const [u, a] = o.serbestAralik(x);
  return (u + a) / 2;
}

/** Listede olmayan ilk kimlik: on, on_2, on_3… */
export function yeniKimlik(on: string, var_: string[]): string {
  if (!var_.includes(on)) return on;
  for (let i = 2; ; i++) if (!var_.includes(`${on}_${i}`)) return `${on}_${i}`;
}

/** Boş (düz, geniş) yeni bölüm. */
export function bolumEkle(veri: any): string {
  const l: HamBolum[] = (veri.bolumler ||= []);
  const id = yeniKimlik("bolum_" + (l.length + 1), l.map(b => b.id));
  l.push({ id, ad: "Yeni bölüm", aciklama: "", uzunluk: 4000,
    duvar: { noktalar: [{ x: 0, ust: 200, alt: 800 }, { x: 2000, ust: 220, alt: 780 }, { x: 4000, ust: 200, alt: 800 }] },
    sivriler: [], tehlikeler: [], bocekler: [] });
  return id;
}

/** Bölümün kopyasını hemen altına koyar. */
export function bolumCogalt(veri: any, id: string): string {
  const l: HamBolum[] = veri.bolumler || [];
  const i = l.findIndex(b => b.id === id);
  if (i < 0) return "";
  const k = structuredClone(l[i]);
  k.id = yeniKimlik(id + "_kopya", l.map(b => b.id));
  k.ad = l[i].ad + " (kopya)";
  l.splice(i + 1, 0, k);
  return k.id;
}

/** Tohumlu duvarı, oyundaki şekline en yakın noktalı duvara çevirir (her `ara` birimde bir nokta): artık elle düzenlenebilir. */
export function noktalaraCevir(ayarlar: Record<string, unknown> | undefined, h: HamBolum, ara = 400): void {
  const o = bolumOyunu(ayarlar, h);
  const noktalar: { x: number; ust: number; alt: number }[] = [];
  for (let x = 0; x <= h.uzunluk + ara; x += ara) {
    const [u, a] = o.sinir(x);
    noktalar.push({ x, ust: Math.round(u), alt: Math.round(a) });
  }
  h.duvar = { noktalar };
}

/** x'te duvara yeni nokta ekler (o noktadaki tavan/taban yüksekliğiyle); eklenen noktanın sırası döner. */
export function noktaEkle(ayarlar: Record<string, unknown> | undefined, h: HamBolum, x: number): number {
  const o = bolumOyunu(ayarlar, h);
  const [u, a] = o.sinir(x);
  const l = (h.duvar.noktalar ||= []);
  l.push({ x: Math.round(x), ust: Math.round(u), alt: Math.round(a) });
  l.sort((p, q) => p.x - q.x);
  return l.findIndex(p => p.x === Math.round(x));
}

/** Sivrinin yerinde serbest kalan geçit (yalnız duvara göre): sivri boyu bundan uzun olursa geçit kapanır. */
export function sivriIcinYer(o: Oyun, x: number): number {
  const [u, a] = o.sinir(x);
  return a - u;
}

/** Ayarların varsayılan değerleri (Yankı kodundan): düzenleyicide "varsayılan" ipucu için. */
export function varsayilanAyar(): Record<string, unknown> {
  ayarlariUygula(undefined);
  return JSON.parse(JSON.stringify(AYAR));
}
