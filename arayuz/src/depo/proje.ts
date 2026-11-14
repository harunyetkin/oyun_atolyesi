// Proje formatı (v2): sahneler, nesne türleri, örnekler, değişkenler, kurallar, varlıklar.
// Şema değişirse PROJE_SURUMU artar ve gocEt() eski dosyaları yeni biçime çevirir.

export const PROJE_SURUMU = 2;

export type Sekil = "daire" | "kare" | "ucgen" | "elmas" | "yildiz" | "yarasa" | "kus";

/** Bir nesne türüne eklenebilen bileşenler. Her biri isteğe bağlıdır. */
export interface Bilesenler {
  gorunum?: { sekil: Sekil; renk: string; genislik: number; yukseklik: number; saydamlik: number };
  fizik?: { yercekimi: number; hizX: number; hizY: number; enYuksekHiz: number; surtunme: number };
  carpisma?: { bicim: "daire" | "kutu"; olcek: number; kati: boolean };
  isik?: { yaricap: number; guc: number; renk: string };
  davranislar?: { tur: string; ayarlar: Record<string, number | string | boolean> }[];
}

export interface NesneTuru {
  id: string;
  ad: string;
  etiketler: string[];
  bilesenler: Bilesenler;
}

export interface Ornek {
  id: string;
  turId: string;
  x: number;
  y: number;
  aci: number;
  olcekX: number;
  olcekY: number;
  katman: string;
}

export interface Katman { id: string; ad: string; gorunur: boolean; kilitli: boolean }

export interface Sahne {
  id: string;
  ad: string;
  genislik: number;
  yukseklik: number;
  arkaplan: string;
  katmanlar: Katman[];
  ornekler: Ornek[];
}

export interface Degisken { id: string; ad: string; tur: "sayi" | "metin" | "mantik"; deger: number | string | boolean; kalici: boolean }

/** Kural satırı: koşullar sağlanınca eylemler çalışır (Aşama 2'de işlevsel olacak). */
export interface Kural {
  id: string;
  aciklama?: string;
  kosullar: { tur: string; metin: string }[];
  eylemler: { tur: string; metin: string }[];
  etkin: boolean;
}

export interface Varlik { id: string; ad: string; tur: "cizim" | "resim" | "ses" | "yazitipi"; veri?: string }

export interface Proje {
  surum: number;
  ad: string;
  ayarlar: { ekranGenislik: number; ekranYukseklik: number; baslangicSahnesi: string };
  sahneler: Sahne[];
  nesneTurleri: NesneTuru[];
  degiskenler: Degisken[];
  kurallar: Kural[];
  varliklar: Varlik[];
  eski_v01?: unknown;
}

let sayac = 0;
export const yeniId = (on = "id") => on + "_" + Date.now().toString(36) + (sayac++).toString(36);

export function varsayilanKatmanlar(): Katman[] {
  return [
    { id: "arka", ad: "Arka plan", gorunur: true, kilitli: false },
    { id: "oyun", ad: "Oyun", gorunur: true, kilitli: false },
    { id: "arayuz", ad: "Arayüz", gorunur: true, kilitli: false },
  ];
}

export function bosProje(ad: string): Proje {
  const sahneId = "sahne_ana";
  return {
    surum: PROJE_SURUMU,
    ad,
    ayarlar: { ekranGenislik: 960, ekranYukseklik: 540, baslangicSahnesi: sahneId },
    sahneler: [{ id: sahneId, ad: "Ana sahne", genislik: 960, yukseklik: 540, arkaplan: "#1d2230", katmanlar: varsayilanKatmanlar(), ornekler: [] }],
    nesneTurleri: [],
    degiskenler: [],
    kurallar: [],
    varliklar: [],
  };
}

/** Arayüzü tanıtmak için içi dolu örnek proje (Kanat Çırp benzeri). */
export function ornekProje(): Proje {
  const p = bosProje("Örnek: Kanat Çırp");
  const kus: NesneTuru = {
    id: "tur_kus", ad: "Kuş", etiketler: ["oyuncu"],
    bilesenler: {
      gorunum: { sekil: "kus", renk: "#f0c030", genislik: 34, yukseklik: 34, saydamlik: 1 },
      fizik: { yercekimi: 1800, hizX: 0, hizY: 0, enYuksekHiz: 900, surtunme: 0 },
      carpisma: { bicim: "daire", olcek: 0.8, kati: false },
      davranislar: [{ tur: "tusla_zipla", ayarlar: { tus: "Boşluk", guc: 560 } }],
    },
  };
  const boru: NesneTuru = {
    id: "tur_boru", ad: "Boru", etiketler: ["engel"],
    bilesenler: {
      gorunum: { sekil: "kare", renk: "#60b440", genislik: 84, yukseklik: 220, saydamlik: 1 },
      carpisma: { bicim: "kutu", olcek: 1, kati: true },
      davranislar: [{ tur: "sabit_kay", ayarlar: { hiz: 210 } }, { tur: "ekrandan_cikinca_yok_ol", ayarlar: {} }],
    },
  };
  const zemin: NesneTuru = {
    id: "tur_zemin", ad: "Zemin", etiketler: ["engel"],
    bilesenler: {
      gorunum: { sekil: "kare", renk: "#ded696", genislik: 960, yukseklik: 90, saydamlik: 1 },
      carpisma: { bicim: "kutu", olcek: 1, kati: true },
    },
  };
  const bulut: NesneTuru = {
    id: "tur_bulut", ad: "Bulut", etiketler: ["süs"],
    bilesenler: { gorunum: { sekil: "daire", renk: "#ffffff", genislik: 90, yukseklik: 50, saydamlik: 0.9 } },
  };
  p.nesneTurleri = [kus, boru, zemin, bulut];
  const s = p.sahneler[0];
  s.arkaplan = "#78c4d8";
  const ekle = (turId: string, x: number, y: number, katman = "oyun", olcekY = 1) =>
    s.ornekler.push({ id: yeniId("o"), turId, x, y, aci: 0, olcekX: 1, olcekY, katman });
  ekle("tur_bulut", 160, 90, "arka"); ekle("tur_bulut", 520, 140, "arka"); ekle("tur_bulut", 820, 70, "arka");
  ekle("tur_kus", 200, 260);
  ekle("tur_boru", 560, 110); ekle("tur_boru", 560, 420, "oyun", 0.75);
  ekle("tur_boru", 840, 150, "oyun", 1.2); ekle("tur_boru", 840, 470, "oyun", 0.5);
  ekle("tur_zemin", 480, 495);
  p.degiskenler = [
    { id: "d_skor", ad: "Skor", tur: "sayi", deger: 0, kalici: false },
    { id: "d_rekor", ad: "Rekor", tur: "sayi", deger: 0, kalici: true },
  ];
  p.kurallar = [
    { id: "k1", aciklama: "Oyun başlayınca", etkin: true, kosullar: [{ tur: "sahne_basladi", metin: "Sahne başladı" }],
      eylemler: [{ tur: "degisken_ata", metin: "Skor = 0" }] },
    { id: "k2", aciklama: "Borular", etkin: true, kosullar: [{ tur: "her_x_saniye", metin: "Her 1,4 saniyede" }],
      eylemler: [{ tur: "nesne_olustur", metin: "Boru oluştur (sağ kenar, rastgele yükseklik)" }] },
    { id: "k3", etkin: true, kosullar: [{ tur: "carpisti", metin: "Kuş, «engel» etiketli bir nesneye çarptı" }],
      eylemler: [{ tur: "ses", metin: "Çarpma sesi çal" }, { tur: "sarsinti", metin: "Ekranı 0,3 sn sars" }, { tur: "oyun_bitti", metin: "Oyunu bitir" }] },
    { id: "k4", etkin: true, kosullar: [{ tur: "gecti", metin: "Kuş bir Boru'yu geçti" }],
      eylemler: [{ tur: "degisken_ekle", metin: "Skor'a 1 ekle" }] },
    { id: "k5", etkin: true, kosullar: [{ tur: "karsilastir", metin: "Skor > Rekor" }],
      eylemler: [{ tur: "degisken_ata", metin: "Rekor = Skor (kalıcı)" }] },
  ];
  p.varliklar = [
    { id: "v1", ad: "kus_cizimi", tur: "cizim" },
    { id: "v2", ad: "boru_dokusu", tur: "resim" },
    { id: "v3", ad: "zipla.wav", tur: "ses" },
    { id: "v4", ad: "carpma.wav", tur: "ses" },
  ];
  return p;
}

/** Eski biçimleri (v0.1 ayar paneli projeleri) v2'ye çevirir. */
export function gocEt(veri: any, ad: string): Proje {
  if (veri && veri.surum >= 2 && Array.isArray(veri.sahneler)) return veri as Proje;
  const p = bosProje(veri?.ad || ad);
  if (veri && veri.dunya && veri.oyuncu) {
    const d = veri.dunya, o = veri.oyuncu;
    const s = p.sahneler[0];
    s.arkaplan = d.arka_renk || s.arkaplan;
    p.nesneTurleri.push({
      id: "tur_oyuncu", ad: "Oyuncu", etiketler: ["oyuncu"],
      bilesenler: {
        gorunum: { sekil: o.sekil || "daire", renk: o.renk || "#f0a040", genislik: (o.boyut || 14) * 2.4, yukseklik: (o.boyut || 14) * 2.4, saydamlik: 1 },
        fizik: { yercekimi: o.yercekimi || 1500, hizX: 0, hizY: 0, enYuksekHiz: o.max_dusus || 800, surtunme: 0 },
        carpisma: { bicim: "daire", olcek: 0.8, kati: false },
        davranislar: [{ tur: "tusla_zipla", ayarlar: { tus: "Boşluk", guc: o.kanat_gucu || 450 } }],
      },
    });
    s.ornekler.push({ id: yeniId("o"), turId: "tur_oyuncu", x: 200, y: 270, aci: 0, olcekX: 1, olcekY: 1, katman: "oyun" });
    (veri.nesneler || []).forEach((n: any, i: number) => {
      const id = "tur_" + (n.id || i);
      const ol = n.etki?.tip === "olum";
      p.nesneTurleri.push({
        id, ad: n.ad || "Nesne " + (i + 1), etiketler: [ol ? "engel" : n.etki?.tip === "puan" ? "toplanabilir" : "tehlike"],
        bilesenler: {
          gorunum: { sekil: n.sekil || "daire", renk: n.renk || "#cccccc", genislik: (n.boyut || 20) * 2, yukseklik: (n.boyut || 20) * 2, saydamlik: 1 },
          carpisma: { bicim: "daire", olcek: 0.85, kati: false },
          ...(n.parlar ? { isik: { yaricap: (n.boyut || 10) * 3.5, guc: 0.7, renk: n.renk || "#ffffff" } } : {}),
        },
      });
      s.ornekler.push({ id: yeniId("o"), turId: id, x: 420 + i * 110, y: n.konum === "tavan" ? 90 : n.konum === "taban" ? 450 : 270, aci: 0, olcekX: 1, olcekY: 1, katman: "oyun" });
    });
    p.eski_v01 = veri;
  }
  return p;
}
