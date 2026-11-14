// Oyun dünyası: bir sahnenin oynatılan hali. Editörden bağımsızdır; dışa aktarılan oyunlar da
// bunu kullanır. Projeye dokunmaz: oynatma başında örnekleri kopyalar.
//
// Bir adımın sırası:
//   1. davranışların tus kancaları (yeni basılan tuşlar)  2. davranışların kare kancaları
//   3. fizik (yerçekimi, sürtünme, en yüksek hız, hareket)  4. katı nesnelerden itme
//   5. çarpışma listesi  6. yok olacak nesneleri çıkarma
import type { NesneTuru, Proje, Sahne } from "../depo/proje";
import { ayarlariTamamla, davranisBul } from "./davranis";
import { cakisma, carpismaAlani } from "./carpisma";
import type { CalisanNesne, TusAdi } from "./tipler";
import "./davranislar"; // hazır davranışları kaydeder

/** Sabit fizik adımı (saniye). Kare hızından bağımsız, her bilgisayarda aynı sonuç. */
export const ADIM = 1 / 120;

export class Dunya {
  readonly sahne: Sahne;
  readonly turler: Map<string, NesneTuru>;
  nesneler: CalisanNesne[] = [];
  /** Son adımda birbirine değen nesne çiftleri (id). Aşama 2'de "çarpıştı" koşulu bunu kullanacak. */
  carpismalar: [string, string][] = [];
  /** Oynatma başından beri geçen süre (saniye). */
  zaman = 0;
  private basili = new Set<TusAdi>();
  private yeniBasilan: TusAdi[] = [];
  private birikim = 0;

  constructor(proje: Proje, sahneId?: string) {
    const sahne = proje.sahneler.find(s => s.id === (sahneId ?? proje.ayarlar.baslangicSahnesi)) ?? proje.sahneler[0];
    this.sahne = structuredClone(sahne);
    this.turler = new Map(structuredClone(proje.nesneTurleri).map(t => [t.id, t]));
    for (const o of this.sahne.ornekler) {
      const tur = this.turler.get(o.turId);
      if (!tur) continue;
      const f = tur.bilesenler.fizik;
      this.nesneler.push({
        id: o.id, turId: o.turId, tur, katman: o.katman, x: o.x, y: o.y, aci: o.aci, olcekX: o.olcekX, olcekY: o.olcekY,
        vx: f?.hizX ?? 0, vy: f?.hizY ?? 0, yerde: false, yokOlacak: false, durum: {},
      });
    }
    for (const n of this.nesneler) this.davranislar(n, (t, a) => t.baslat?.(n, a, this));
  }

  // ---------------------------------------------------------------- girdi
  tusBas(tus: TusAdi) {
    if (!this.basili.has(tus)) this.yeniBasilan.push(tus);
    this.basili.add(tus);
  }
  tusBirak(tus: TusAdi) { this.basili.delete(tus); }
  basiliMi(tus: TusAdi) { return this.basili.has(tus); }

  // ---------------------------------------------------------------- zaman
  /** Geçen gerçek süre kadar sabit adımlarla ilerler (çizim döngüsü bunu çağırır). */
  ilerle(gecen: number) {
    this.birikim += Math.min(gecen, 0.1); // takılmalarda dünya "ışınlanmasın"
    while (this.birikim >= ADIM - 1e-9) { this.adim(ADIM); this.birikim -= ADIM; }
  }

  /** Tek bir fizik adımı. */
  adim(dt: number) {
    this.zaman += dt;
    const tuslar = this.yeniBasilan; this.yeniBasilan = [];
    for (const n of this.nesneler) {
      for (const tus of tuslar) this.davranislar(n, (t, a) => t.tusBasildi?.(n, a, this, tus));
      this.davranislar(n, (t, a) => t.kare?.(n, a, this, dt));
    }
    for (const n of this.nesneler) this.fizik(n, dt);
    this.katilariCoz();
    this.carpismalariBul();
    if (this.nesneler.some(n => n.yokOlacak)) this.nesneler = this.nesneler.filter(n => !n.yokOlacak);
  }

  // ---------------------------------------------------------------- yardımcılar
  /** Nesnenin davranışlarını kayıttaki tanımlarıyla dolaşır (tanınmayanları atlar). */
  private davranislar(n: CalisanNesne, fn: (t: NonNullable<ReturnType<typeof davranisBul>>, a: Record<string, any>) => void) {
    for (const d of n.tur.bilesenler.davranislar ?? []) {
      const t = davranisBul(d.tur);
      if (t) fn(t, ayarlariTamamla(t, d.ayarlar));
    }
  }

  private fizik(n: CalisanNesne, dt: number) {
    const f = n.tur.bilesenler.fizik;
    if (!f) return;
    n.vy += f.yercekimi * dt;
    // Sürtünme (0–1): her 0,1 saniyede yatay hızın bu oranı kaybolur.
    if (f.surtunme > 0) n.vx *= Math.pow(1 - Math.min(1, f.surtunme), dt * 10);
    const v = Math.hypot(n.vx, n.vy);
    if (f.enYuksekHiz > 0 && v > f.enYuksekHiz) { const k = f.enYuksekHiz / v; n.vx *= k; n.vy *= k; }
    n.x += n.vx * dt;
    n.y += n.vy * dt;
  }

  /** Fizikli nesneleri katı nesnelerin içinden dışarı iter; çarptığı yöndeki hızını sıfırlar. */
  private katilariCoz() {
    const katilar = this.nesneler.filter(n => n.tur.bilesenler.carpisma?.kati && !n.yokOlacak);
    for (const n of this.nesneler) {
      n.yerde = false;
      if (!n.tur.bilesenler.fizik || !n.tur.bilesenler.carpisma || n.yokOlacak) continue;
      for (let tekrar = 0; tekrar < 3; tekrar++) {   // köşelerde birkaç tur
        let itildi = false;
        for (const k of katilar) {
          if (k === n) continue;
          const A = carpismaAlani(n), B = carpismaAlani(k);
          const c = A && B && cakisma(A, B);
          if (!c) continue;
          // Diğeri de fizikliyse itmeyi paylaştır
          const pay = k.tur.bilesenler.fizik && n.tur.bilesenler.carpisma?.kati ? 0.5 : 1;
          n.x += c.nx * c.derinlik * pay; n.y += c.ny * c.derinlik * pay;
          if (pay < 1) { k.x -= c.nx * c.derinlik * pay; k.y -= c.ny * c.derinlik * pay; }
          const vn = n.vx * c.nx + n.vy * c.ny;
          if (vn < 0) { n.vx -= vn * c.nx; n.vy -= vn * c.ny; }
          if (c.ny < -0.5) n.yerde = true;
          itildi = true;
        }
        if (!itildi) break;
      }
    }
  }

  private carpismalariBul() {
    this.carpismalar = [];
    const liste = this.nesneler.filter(n => n.tur.bilesenler.carpisma && !n.yokOlacak);
    const alanlar = liste.map(carpismaAlani);
    for (let i = 0; i < liste.length; i++)
      for (let j = i + 1; j < liste.length; j++) {
        const c = cakisma(alanlar[i]!, alanlar[j]!);
        // katı itmeden sonra tam temas eden yüzeyleri de "değiyor" say (küçük pay)
        if (c || this.temasta(alanlar[i]!, alanlar[j]!)) this.carpismalar.push([liste[i].id, liste[j].id]);
      }
  }
  private temasta(A: ReturnType<typeof carpismaAlani>, B: ReturnType<typeof carpismaAlani>) {
    if (!A || !B) return false;
    const P = 0.5;
    const buyut = (a: NonNullable<typeof A>) => a.bicim === "daire" ? { ...a, r: a.r + P } : { ...a, yw: a.yw + P, yh: a.yh + P };
    return !!cakisma(buyut(A), buyut(B));
  }

  /** İki nesne (id) bu adımda birbirine değiyor mu? */
  degiyor(a: string, b: string) {
    return this.carpismalar.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  }
  bul(id: string) { return this.nesneler.find(n => n.id === id); }
}
