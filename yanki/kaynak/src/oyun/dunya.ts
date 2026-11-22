// Yankı oyununun mantığı. Ekrandan (DOM, canvas) tamamen bağımsızdır: birim testleri bunu doğrudan çalıştırır.
//
// Dünya birimi: ekran yüksekliği her zaman H = 1000 birimdir; genişlik ekranın oranına göre değişir
// (dikey telefonda ~460, yatay bilgisayarda ~1800). Yarasa soldan sağa uçar, kamera onu izler.
// Mağara karanlıktır: duvarlar ancak yankı (sonar) dalgası değince bir süre görünür.

export const H = 1000;

/** Oyunun ayarları. Hepsi tek yerde; ileride Oyun Atölyesi'nden de düzenlenebilsin diye düz bir nesne. */
export const AYAR = {
  yercekimi: 2400,          // birim/sn²
  kanatGucu: 720,           // çırpınca yukarı hız
  enFazlaDusus: 1100,
  yarasaYaricap: 16,
  yarasaKonumu: 0.3,        // ekran genişliğinin oranı (yarasanın yatay yeri)
  hiz: 280,                 // başlangıç ilerleme hızı
  hizArtisi: 22,            // her 1000 birimde artış
  enFazlaHiz: 520,
  bosluk: 600,              // mağaranın başlangıç yüksekliği
  enDarBosluk: 270,
  daralma: 7,               // her 1000 birimde daralma
  guvenliBaslangic: 900,    // ilk bu kadar yol düz ve geniş
  kucukSonar: { hiz: 950, menzil: 430, guc: 0.85 },
  buyukSonar: { hiz: 1200, menzil: 1500, guc: 1 },
  buyukSonarEsigi: 0.3,     // bu kadar basılı tutunca büyük sonar
  enerjiDolumu: 0.2,        // büyük sonar enerjisi / sn (1 = dolu)
  dalgaKalinligi: 34,
  sonmeSuresi: 1.3,         // duvar ışığının sönme hızı (sn)
  belirmeSuresi: 0.09,      // yankı değince duvarın yumuşakça parlaması (sn; anında değil)
  ornekAraligi: 10,         // duvar örneklerinin aralığı
  bocekAraligi: [380, 760] as [number, number],
  bocekPuani: 5,
  bocekYaricap: 34,
  yenidenBaslamaBeklemesi: 0.7,
  isinma: 6000,             // zorluk bu kadar yol boyunca yavaş yavaş artar (ilk ~25 sn yumuşak başlangıç)
  sivriBaslangic: 2500,     // sarkıt ve dikitler bu noktadan sonra başlar
  sivriAraligi: [650, 1300] as [number, number],   // iki sivri arası (ilerledikçe sıklaşır)
  sivriBoyu: [60, 150] as [number, number],
  sivriTaban: [46, 74] as [number, number],
  sivriGecit: 230,          // sivrinin yanında her zaman kalan en dar geçit
};

/** Isınma eğrisi: ilk `L` birimde artış yavaş başlar (karesel), sonra normal hızda sürer. Sonuç "etkili ilerleme"dir. */
export function isinmaEgrisi(ilerleme: number, L = AYAR.isinma): number {
  if (ilerleme <= 0) return 0;
  return ilerleme < L ? (ilerleme * ilerleme) / (2 * L) : ilerleme - L / 2;
}

/** Üçgenin içinde mi (nokta, üç köşe). */
function ucgendeMi(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const eksi = d1 < 0 || d2 < 0 || d3 < 0, arti = d1 > 0 || d2 > 0 || d3 > 0;
  return !(eksi && arti);
}

/** Yumuşatma ağırlıkları (7 örnek, ortası en ağır). */
const PUS = [1, 2, 3, 4, 3, 2, 1];
const PUS_TOPLAM = PUS.reduce((a, b) => a + b, 0);

export type Durum = "menu" | "oyun" | "bitti";
export type Olay = "basla" | "cirp" | "buyuk_sonar" | "bocek" | "carpma";

export interface Dalga { x: number; y: number; r: number; hiz: number; menzil: number; guc: number; buyuk: boolean }
/** Sarkıt (tavandan, ust = true) ya da dikit (tabandan): x'te tabanı duvarda, ucu `boy` kadar içeride. */
export interface Sivri { x: number; ust: boolean; boy: number; taban: number }
export interface Bocek { x: number; y0: number; y: number; faz: number; alindi: boolean }

/** Tohumlu rastgele sayı üretici (mulberry32): aynı tohum, aynı mağara. */
export function rastgeleUretici(tohum: number): () => number {
  let a = tohum >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Oyun {
  durum: Durum = "menu";
  /** Ekran genişliği (dünya birimi). */
  W = 560;
  kam = 0;
  y = H / 2;
  vy = 0;
  t = 0;
  kanatT = 1;
  bonus = 0;
  rekor = 0;
  enerji = 1;
  bitisT = 0;
  basili = false;
  basiliSure = 0;
  buyukKullanildi = false;
  dalgalar: Dalga[] = [];
  bocekler: Bocek[] = [];
  sivriler: Sivri[] = [];
  /** Duraklatıldıysa zaman durur; dokununca devam eder (kanat çırpmadan). */
  duraklatildi = false;
  /** Duvar örneklerinin ışığı: örnek sırası → [tavan, taban, tavan hedefi, taban hedefi] (0–1).
   *  Yankı değince hedef yükselir; görünen parlaklık hedefe kısa sürede yumuşakça yaklaşır, hedef zamanla söner. */
  isik = new Map<number, [number, number, number, number]>();
  olaylar: Olay[] = [];
  carpmaNedeni = "";
  private rnd: () => number;
  private faz: number[] = [];
  private sonrakiBocek = 0;
  private sonrakiSivri = 0;
  private menuDalga = 0;

  constructor(public tohum = (Math.random() * 1e9) | 0) {
    this.rnd = rastgeleUretici(tohum);
    this.sifirla();
  }

  get skor(): number { return Math.floor(this.kam / 100) + this.bonus; }
  get yarasaX(): number { return this.kam + this.W * AYAR.yarasaKonumu; }
  get hiz(): number { return Math.min(AYAR.enFazlaHiz, AYAR.hiz + AYAR.hizArtisi * (isinmaEgrisi(this.kam) / 1000)); }

  /** Ekran oranı (genişlik / yükseklik) değişince çağrılır. */
  boyutla(oran: number): void {
    this.W = Math.max(420, Math.min(3200, H * oran));
  }

  /** Yeni bir mağara (yeni tohumdan) ve başa dönüş. */
  sifirla(yeniTohum?: number): void {
    if (yeniTohum !== undefined) { this.tohum = yeniTohum; this.rnd = rastgeleUretici(yeniTohum); }
    this.faz = [0, 0, 0, 0].map(() => this.rnd() * Math.PI * 2);
    this.kam = 0; this.y = H / 2; this.vy = 0; this.t = 0; this.kanatT = 1;
    this.bonus = 0; this.enerji = 1; this.bitisT = 0; this.basiliSure = 0; this.buyukKullanildi = false;
    this.dalgalar = []; this.bocekler = []; this.sivriler = []; this.isik.clear(); this.carpmaNedeni = "";
    this.duraklatildi = false;
    this.sonrakiBocek = AYAR.guvenliBaslangic * 0.6;
    this.sonrakiSivri = AYAR.sivriBaslangic;
    this.menuDalga = 0.4;
  }

  /** x noktasında mağaranın tavanı ve tabanı (dünya birimi; y aşağı doğru artar). */
  sinir(x: number): [number, number] {
    const ilerleme = Math.max(0, x - AYAR.guvenliBaslangic);
    // daralma ısınma eğrisiyle yavaş başlar; kıvrım başta 0, 3000 birimde tam
    const bosluk = Math.max(AYAR.enDarBosluk, AYAR.bosluk - AYAR.daralma * isinmaEgrisi(ilerleme) / 1000);
    const kivrim = Math.min(1, ilerleme / 3000);
    const genlik = Math.max(0, (H - bosluk) / 2 - 50) * kivrim;
    const [a, b, c, d] = this.faz;
    const dalga = 0.5 * Math.sin(x * 0.0029 + a) + 0.3 * Math.sin(x * 0.0071 + b) + 0.14 * Math.sin(x * 0.0163 + c) + 0.06 * Math.sin(x * 0.041 + d);
    const orta = H / 2 + genlik * dalga;
    return [orta - bosluk / 2, orta + bosluk / 2];
  }

  // ------------------------------------------------------------------ girdi
  /** Ekrana dokunma / tuşa basma. */
  dokun(): void {
    if (this.duraklatildi) { this.devam(); return; }
    this.basili = true;
    this.basiliSure = 0;
    this.buyukKullanildi = false;
    if (this.durum === "menu") {
      this.durum = "oyun";
      this.dalgalar = [];
      this.olaylar.push("basla");
      this.cirp();
    } else if (this.durum === "oyun") {
      this.cirp();
    } else if (this.durum === "bitti" && this.bitisT >= AYAR.yenidenBaslamaBeklemesi) {
      this.sifirla((this.rnd() * 1e9) | 0);
      this.durum = "oyun";
      this.olaylar.push("basla");
      this.cirp();
    }
  }

  /** Oyunu duraklatır (yalnız oyun sürerken). */
  duraklat(): void {
    if (this.durum !== "oyun") return;
    this.duraklatildi = true;
    this.basili = false;
  }
  devam(): void { this.duraklatildi = false; this.basili = false; }
  /** Duraklatma ekranından "yeniden başla": yeni mağara, menüye dönmeden hemen başlar. */
  yenidenBasla(): void {
    this.sifirla((this.rnd() * 1e9) | 0);
    this.durum = "oyun";
    this.olaylar.push("basla");
    this.cirp();
  }

  /** x'teki serbest geçit: duvarlar ve o noktadaki sivrilerin ucu çıkarılmış [üst, alt]. */
  serbestAralik(x: number): [number, number] {
    let [ust, alt] = this.sinir(x);
    for (const sv of this.sivriler) {
      const yari = sv.taban / 2;
      if (Math.abs(x - sv.x) > yari) continue;
      const derinlik = sv.boy * (1 - Math.abs(x - sv.x) / yari);
      const [u, a] = this.sinir(sv.x);
      if (sv.ust) ust = Math.max(ust, u + derinlik); else alt = Math.min(alt, a - derinlik);
    }
    return [ust, alt];
  }

  /** Parmak kalkınca / tuş bırakılınca. */
  birak(): void { this.basili = false; }

  /** Kanat çırp: yukarı it ve küçük bir yankı gönder. */
  cirp(): void {
    this.vy = -AYAR.kanatGucu;
    this.kanatT = 0;
    this.sonar(false);
    this.olaylar.push("cirp");
  }

  /** Yankı dalgası gönderir. Büyük sonar enerji ister; enerji yoksa false döner. */
  sonar(buyuk: boolean): boolean {
    if (buyuk) {
      if (this.enerji < 1) return false;
      this.enerji = 0;
      this.olaylar.push("buyuk_sonar");
    }
    const s = buyuk ? AYAR.buyukSonar : AYAR.kucukSonar;
    this.dalgalar.push({ x: this.yarasaX, y: this.y, r: 0, hiz: s.hiz, menzil: s.menzil, guc: s.guc, buyuk });
    return true;
  }

  // ------------------------------------------------------------------ zaman
  adim(dt: number): void {
    if (this.duraklatildi) return;
    this.t += dt;
    this.kanatT += dt;
    this.dalgalariIlerlet(dt);

    if (this.durum === "menu") {
      // menüde mağara yavaşça akar, yarasa süzülür, ara ara yankı gider (oyunu tanıtmak için)
      this.kam += AYAR.hiz * 0.35 * dt;
      this.y = H / 2 + Math.sin(this.t * 2.4) * 18;
      if (this.kanatT > 0.55) this.kanatT = 0;
      this.menuDalga -= dt;
      if (this.menuDalga <= 0) { this.sonar(false); this.menuDalga = 1.3; }
      return;
    }
    if (this.durum === "bitti") {
      this.bitisT += dt;
      this.vy = Math.min(this.vy + AYAR.yercekimi * dt, AYAR.enFazlaDusus);
      this.y = Math.min(this.y + this.vy * dt, H + 80);
      return;
    }

    // büyük sonar: basılı tutunca
    if (this.basili) {
      this.basiliSure += dt;
      if (!this.buyukKullanildi && this.basiliSure >= AYAR.buyukSonarEsigi) {
        this.buyukKullanildi = true;
        this.sonar(true);
      }
    }
    this.enerji = Math.min(1, this.enerji + AYAR.enerjiDolumu * dt);

    this.kam += this.hiz * dt;
    this.vy = Math.min(this.vy + AYAR.yercekimi * dt, AYAR.enFazlaDusus);
    this.y += this.vy * dt;

    this.sivrileriUret();
    this.bocekleriGuncelle(dt);
    this.carpismalar();
  }

  private dalgalariIlerlet(dt: number): void {
    const ara = AYAR.ornekAraligi, kalinlik = AYAR.dalgaKalinligi;
    const son = Math.exp(-dt / AYAR.sonmeSuresi);
    const yaklas = Math.min(1, dt / AYAR.belirmeSuresi);
    // ışık söner (hedef azalır), görünen parlaklık hedefe yumuşakça yaklaşır; kameranın gerisi silinir
    const ilk = Math.floor((this.kam - 100) / ara);
    for (const [i, v] of this.isik) {
      if (i < ilk) { this.isik.delete(i); continue; }
      v[2] *= son; v[3] *= son;
      v[0] += (v[2] - v[0]) * yaklas; v[1] += (v[3] - v[1]) * yaklas;
    }
    for (const d of this.dalgalar) {
      const r0 = d.r;
      d.r += d.hiz * dt;
      // dalga ilerledikçe zayıflar
      const guc = d.guc * (1 - 0.6 * d.r / d.menzil);
      const xBas = Math.max(Math.ceil((d.x - d.r - kalinlik) / ara), ilk);
      const xSon = Math.floor((d.x + d.r + kalinlik) / ara);
      for (let i = xBas; i <= xSon; i++) {
        const x = i * ara;
        const [ust, alt] = this.sinir(x);
        let v = this.isik.get(i);
        for (const [k, yy] of [[0, ust], [1, alt]] as const) {
          const mesafe = Math.hypot(x - d.x, yy - d.y);
          // dalganın bu adımda süpürdüğü halka (hızlı dalga örnek atlamasın diye r0..r arası)
          if (mesafe >= r0 - kalinlik && mesafe <= d.r + kalinlik) {
            if (!v) { v = [0, 0, 0, 0]; this.isik.set(i, v); }
            v[k + 2] = Math.max(v[k + 2], guc);
          }
        }
      }
    }
    this.dalgalar = this.dalgalar.filter(d => d.r < d.menzil);
  }

  /** Sarkıt ve dikitleri ekranın sağından önce üretir. Her sivrinin yanında en az `sivriGecit` kadar geçit kalır. */
  private sivrileriUret(): void {
    while (this.sonrakiSivri < this.kam + this.W + 300) {
      const x = this.sonrakiSivri;
      const [u, a] = this.sinir(x);
      const ust = this.rnd() < 0.5;
      const [b0, b1] = AYAR.sivriBoyu, [t0, t1] = AYAR.sivriTaban;
      const boy = Math.min(b0 + this.rnd() * (b1 - b0), a - u - AYAR.sivriGecit);
      const taban = t0 + this.rnd() * (t1 - t0);
      if (boy >= 45) this.sivriler.push({ x, ust, boy, taban });
      // ilerledikçe sıklaşır (aralık en fazla %40 kısalır)
      const sik = Math.max(0.6, 1 - (x - AYAR.sivriBaslangic) / 40000);
      const [a0, a1] = AYAR.sivriAraligi;
      this.sonrakiSivri += (a0 + this.rnd() * (a1 - a0)) * sik;
    }
    this.sivriler = this.sivriler.filter(sv => sv.x > this.kam - 120);
  }

  private bocekleriGuncelle(dt: number): void {
    // yeni ateş böcekleri ekranın sağından gelir
    while (this.sonrakiBocek < this.kam + this.W + 100) {
      const x = this.sonrakiBocek;
      const [ust, alt] = this.serbestAralik(x);   // sivrilerin içine düşmesin
      const pay = 60;
      const y0 = ust + pay + this.rnd() * Math.max(1, alt - ust - 2 * pay);
      this.bocekler.push({ x, y0, y: y0, faz: this.rnd() * Math.PI * 2, alindi: false });
      const [a, b] = AYAR.bocekAraligi;
      this.sonrakiBocek += a + this.rnd() * (b - a);
    }
    for (const b of this.bocekler) {
      b.faz += dt;
      b.y = b.y0 + Math.sin(b.faz * 2.2) * 14;
    }
    this.bocekler = this.bocekler.filter(b => !b.alindi && b.x > this.kam - 60);
  }

  private carpismalar(): void {
    const r = AYAR.yarasaYaricap, x = this.yarasaX;
    // kanat ucu da çarpabilsin diye yarasanın önü, ortası ve arkası denetlenir
    for (const dx of [-r * 0.8, 0, r * 0.8]) {
      const [ust, alt] = this.sinir(x + dx);
      if (this.y - r * 0.85 < ust || this.y + r * 0.85 > alt) {
        this.ol(this.y - r < ust ? "Tavana çarptın" : "Yere çarptın");
        return;
      }
    }
    // sarkıt ve dikitler: yarasanın çevresindeki 8 nokta üçgenin içine girerse çarpar
    for (const sv of this.sivriler) {
      if (Math.abs(sv.x - x) > sv.taban / 2 + r) continue;
      const [u, a] = this.sinir(sv.x);
      const tabanY = sv.ust ? u - 4 : a + 4, ucY = sv.ust ? u + sv.boy : a - sv.boy;
      for (let k = 0; k < 8; k++) {
        const aci = (k / 8) * Math.PI * 2;
        const px = x + Math.cos(aci) * r * 0.8, py = this.y + Math.sin(aci) * r * 0.8;
        if (ucgendeMi(px, py, sv.x - sv.taban / 2, tabanY, sv.x + sv.taban / 2, tabanY, sv.x, ucY)) {
          this.ol(sv.ust ? "Sarkıta çarptın" : "Dikite çarptın");
          return;
        }
      }
    }
    for (const b of this.bocekler) {
      if (!b.alindi && Math.hypot(b.x - x, b.y - this.y) < AYAR.bocekYaricap + r) {
        b.alindi = true;
        this.bonus += AYAR.bocekPuani;
        this.olaylar.push("bocek");
      }
    }
  }

  private ol(neden: string): void {
    this.durum = "bitti";
    this.carpmaNedeni = neden;
    this.bitisT = 0;
    this.vy = Math.max(this.vy, 0);
    if (this.skor > this.rekor) this.rekor = this.skor;
    this.olaylar.push("carpma");
  }

  /** Bir duvar örneğinin ekranda görünen parlaklığı (k: 0 tavan, 1 taban). Komşu örneklerle yumuşatılır ki
   *  duvar parça parça (pencere pencere) değil, akarak belirsin ve sönsün. */
  parlaklik(i: number, k: 0 | 1): number {
    let top = 0;
    for (let j = -3; j <= 3; j++) {
      const v = this.isik.get(i + j);
      if (v) top += v[k] * PUS[j + 3];
    }
    return top / PUS_TOPLAM;
  }

  /** Biriken olayları verir ve listeyi boşaltır (ses, titreşim için). */
  olaylariAl(): Olay[] {
    const l = this.olaylar;
    this.olaylar = [];
    return l;
  }
}
