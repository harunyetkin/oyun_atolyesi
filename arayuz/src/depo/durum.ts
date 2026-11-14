// Editörün ortak durumu (zustand). Bileşenler buradan okur ve buraya yazar.
import { create } from "zustand";
import type { Depo, SurumBilgi } from "./api";
import { bosProje, gocEt, ornekProje, yeniId, type NesneTuru, type Ornek, type Proje } from "./proje";

export type Arac = "sec" | "tasi" | "dondur" | "olcekle" | "el";
export type MerkezSekme = "sahne" | "olaylar" | "arayuz";
export type SolSekme = "nesneler" | "agac";
export type AltSekme = "varliklar" | "degiskenler" | "konsol" | "surumler";
export type Pencere = null | "ayarlar" | "kisayollar" | "komut" | "hakkinda" | "yeniProje" | "projeAyarlari";
export type Secim = null | { tur: "ornek"; id: string } | { tur: "nesneTuru"; id: string } | { tur: "sahne"; id: string };

export interface KonsolSatiri { zaman: string; seviye: "bilgi" | "uyari" | "hata"; metin: string }
export interface Bildirim { id: number; metin: string; seviye: "bilgi" | "basari" | "hata" }

interface Duzen {
  sol: boolean; sag: boolean; alt: boolean;
  solGenislik: number; sagGenislik: number; altYukseklik: number;
}
interface Tercihler { izgaraBoyutu: number; izgaraGoster: boolean; carpismaGoster: boolean; miknatis: boolean; otomatikKayit: boolean; arayuzOlcek: number }

const okuYerel = <T,>(anahtar: string, varsayilan: T): T => {
  try { const v = localStorage.getItem(anahtar); return v ? { ...varsayilan, ...JSON.parse(v) } : varsayilan; }
  catch { return varsayilan; }
};
const yazYerel = (anahtar: string, deger: unknown) => {
  try { localStorage.setItem(anahtar, JSON.stringify(deger)); } catch { /* depolama kapalı olabilir */ }
};

interface Durum {
  depo: Depo | null;
  ekran: "yukleniyor" | "baslangic" | "editor";
  projeler: string[];
  projeAdi: string | null;
  proje: Proje | null;
  aktifSahneId: string | null;
  secim: Secim;
  arac: Arac;
  merkez: MerkezSekme;
  solSekme: SolSekme;
  altSekme: AltSekme;
  duzen: Duzen;
  tercih: Tercihler;
  yakinlastirma: number;
  imlec: { x: number; y: number } | null;
  oynatma: "duruyor" | "oynuyor" | "duraklatildi";
  kayit: "kayitli" | "kaydediliyor" | "hata" | "";
  surumler: SurumBilgi[];
  konsol: KonsolSatiri[];
  bildirimler: Bildirim[];
  pencere: Pencere;

  baslat(depo: Depo): Promise<void>;
  projeyiAc(ad: string): Promise<void>;
  yeniProje(ad: string, sablon: "bos" | "ornek"): Promise<boolean>;
  baslangicaDon(): void;
  degistir(fn: (p: Proje) => void, sessiz?: boolean): void;
  sec(s: Secim): void;
  ornekEkle(turId: string, x: number, y: number): void;
  turEkle(): void;
  secileniSil(): void;
  secileniCogalt(): void;
  surumKaydet(not: string): Promise<void>;
  surumleriYenile(): Promise<void>;
  surumYukle(dosya: string): Promise<void>;
  log(metin: string, seviye?: KonsolSatiri["seviye"]): void;
  bildir(metin: string, seviye?: Bildirim["seviye"]): void;
  set<K extends keyof Durum>(k: K, v: Durum[K]): void;
  duzenAyarla(d: Partial<Duzen>): void;
  tercihAyarla(t: Partial<Tercihler>): void;
}

let kayitZamanlayici: ReturnType<typeof setTimeout> | undefined;
let bildirimSayac = 0;
const saat = () => new Date().toLocaleTimeString("tr-TR");

export const useDurum = create<Durum>((set, get) => ({
  depo: null,
  ekran: "yukleniyor",
  projeler: [],
  projeAdi: null,
  proje: null,
  aktifSahneId: null,
  secim: null,
  arac: "sec",
  merkez: "sahne",
  solSekme: "nesneler",
  altSekme: "varliklar",
  duzen: okuYerel<Duzen>("atolye.duzen", { sol: true, sag: true, alt: true, solGenislik: 260, sagGenislik: 330, altYukseklik: 220 }),
  tercih: okuYerel<Tercihler>("atolye.tercih", { izgaraBoyutu: 32, izgaraGoster: true, carpismaGoster: false, miknatis: false, otomatikKayit: true, arayuzOlcek: 1 }),
  yakinlastirma: 1,
  imlec: null,
  oynatma: "duruyor",
  kayit: "",
  surumler: [],
  konsol: [],
  bildirimler: [],
  pencere: null,

  async baslat(depo) {
    set({ depo });
    let liste = await depo.proje_listesi();
    if (!liste.length) {
      const ornek = ornekProje();
      await depo.proje_kaydet(ornek.ad, ornek);
      liste = await depo.proje_listesi();
    }
    set({ projeler: liste, ekran: "baslangic" });
    get().log("Oyun Atölyesi hazır.");
  },

  async projeyiAc(ad) {
    const { depo } = get();
    if (!depo) return;
    const ham = await depo.proje_yukle(ad);
    const proje = gocEt(ham, ad);
    if (ham?.surum !== proje.surum) get().log(`"${ad}" eski biçimdeydi, yeni biçime dönüştürüldü.`, "uyari");
    set({ proje, projeAdi: ad, aktifSahneId: proje.ayarlar.baslangicSahnesi || proje.sahneler[0]?.id, secim: null, ekran: "editor", oynatma: "duruyor", kayit: "kayitli" });
    get().log(`"${ad}" açıldı.`);
    get().surumleriYenile();
  },

  async yeniProje(ad, sablon) {
    const { depo } = get();
    if (!depo) return false;
    const liste = await depo.proje_listesi();
    if (liste.includes(ad)) return false;
    const p = sablon === "ornek" ? ornekProje() : bosProje(ad);
    p.ad = ad;
    await depo.proje_kaydet(ad, p);
    set({ projeler: await depo.proje_listesi() });
    await get().projeyiAc(ad);
    get().bildir(`"${ad}" oluşturuldu`, "basari");
    return true;
  },

  baslangicaDon() {
    set({ ekran: "baslangic", oynatma: "duruyor" });
    get().depo?.proje_listesi().then(projeler => set({ projeler }));
  },

  degistir(fn, sessiz) {
    const { proje } = get();
    if (!proje) return;
    const kopya = structuredClone(proje);
    fn(kopya);
    set({ proje: kopya });
    if (!get().tercih.otomatikKayit && !sessiz) { set({ kayit: "" }); return; }
    set({ kayit: "kaydediliyor" });
    clearTimeout(kayitZamanlayici);
    kayitZamanlayici = setTimeout(async () => {
      const { depo, projeAdi, proje } = get();
      try { await depo!.proje_kaydet(projeAdi!, proje); set({ kayit: "kayitli" }); }
      catch (e) { set({ kayit: "hata" }); get().log("Kaydedilemedi: " + e, "hata"); }
    }, 600);
  },

  sec(secim) { set({ secim }); },

  ornekEkle(turId, x, y) {
    const sahneId = get().aktifSahneId;
    const id = yeniId("o");
    get().degistir(p => {
      p.sahneler.find(s => s.id === sahneId)?.ornekler.push({ id, turId, x, y, aci: 0, olcekX: 1, olcekY: 1, katman: "oyun" });
    });
    set({ secim: { tur: "ornek", id } });
  },

  turEkle() {
    const id = yeniId("tur");
    const sayi = (get().proje?.nesneTurleri.length || 0) + 1;
    const tur: NesneTuru = {
      id, ad: "Yeni nesne " + sayi, etiketler: [],
      bilesenler: { gorunum: { sekil: "kare", renk: "#5aa9f0", genislik: 48, yukseklik: 48, saydamlik: 1 } },
    };
    get().degistir(p => { p.nesneTurleri.push(tur); });
    set({ secim: { tur: "nesneTuru", id } });
  },

  secileniSil() {
    const s = get().secim;
    if (!s) return;
    if (s.tur === "ornek") {
      get().degistir(p => p.sahneler.forEach(sh => { sh.ornekler = sh.ornekler.filter(o => o.id !== s.id); }));
    } else if (s.tur === "nesneTuru") {
      get().degistir(p => {
        p.nesneTurleri = p.nesneTurleri.filter(t => t.id !== s.id);
        p.sahneler.forEach(sh => { sh.ornekler = sh.ornekler.filter(o => o.turId !== s.id); });
      });
    }
    set({ secim: null });
  },

  secileniCogalt() {
    const s = get().secim;
    const p = get().proje;
    if (!s || !p) return;
    if (s.tur === "ornek") {
      const sahne = p.sahneler.find(sh => sh.ornekler.some(o => o.id === s.id))!;
      const o = sahne.ornekler.find(o => o.id === s.id)!;
      const yeni: Ornek = { ...o, id: yeniId("o"), x: o.x + 24, y: o.y + 24 };
      get().degistir(pp => pp.sahneler.find(sh => sh.id === sahne.id)!.ornekler.push(yeni));
      set({ secim: { tur: "ornek", id: yeni.id } });
    } else if (s.tur === "nesneTuru") {
      const t = p.nesneTurleri.find(t => t.id === s.id)!;
      const yeni = { ...structuredClone(t), id: yeniId("tur"), ad: t.ad + " (kopya)" };
      get().degistir(pp => { pp.nesneTurleri.push(yeni); });
      set({ secim: { tur: "nesneTuru", id: yeni.id } });
    }
  },

  async surumKaydet(not) {
    const { depo, projeAdi, proje } = get();
    await depo!.surum_kaydet(projeAdi!, not, proje);
    get().bildir("Sürüm kaydedildi", "basari");
    get().surumleriYenile();
  },
  async surumleriYenile() {
    const { depo, projeAdi } = get();
    if (depo && projeAdi) set({ surumler: await depo.surum_listesi(projeAdi) });
  },
  async surumYukle(dosya) {
    const { depo, projeAdi, proje } = get();
    await depo!.surum_kaydet(projeAdi!, "geri yüklemeden önceki hal", proje);
    const veri = gocEt(await depo!.surum_yukle(projeAdi!, dosya), projeAdi!);
    set({ proje: veri, secim: null });
    get().degistir(() => {});
    get().bildir("Sürüm geri yüklendi", "basari");
    get().surumleriYenile();
  },

  log(metin, seviye = "bilgi") {
    set({ konsol: [...get().konsol.slice(-199), { zaman: saat(), seviye, metin }] });
  },
  bildir(metin, seviye = "bilgi") {
    const id = ++bildirimSayac;
    set({ bildirimler: [...get().bildirimler, { id, metin, seviye }] });
    setTimeout(() => set({ bildirimler: get().bildirimler.filter(b => b.id !== id) }), 3200);
  },
  set(k, v) { set({ [k]: v } as any); },
  duzenAyarla(d) { const duzen = { ...get().duzen, ...d }; set({ duzen }); yazYerel("atolye.duzen", duzen); },
  tercihAyarla(t) { const tercih = { ...get().tercih, ...t }; set({ tercih }); yazYerel("atolye.tercih", tercih); },
}));

/** Kısayol: aktif sahne. */
export const aktifSahne = (d: { proje: Proje | null; aktifSahneId: string | null }) =>
  d.proje?.sahneler.find(s => s.id === d.aktifSahneId) || null;
