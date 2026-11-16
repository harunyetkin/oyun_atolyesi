// Editörün ortak durumu (zustand). Bileşenler buradan okur ve buraya yazar.
import { create } from "zustand";
import type { Depo, SurumBilgi } from "./api";
import { bosProje, gocEt, ornekProje, yeniId, type NesneTuru, type Ornek, type Proje } from "./proje";

export type Arac = "sec" | "tasi" | "dondur" | "olcekle" | "el";
export type MerkezSekme = "sahne" | "olaylar" | "arayuz";
export type SolSekme = "nesneler" | "agac";
export type AltSekme = "varliklar" | "degiskenler" | "konsol" | "surumler";
export type Pencere = null | "ayarlar" | "kisayollar" | "komut" | "hakkinda" | "yeniProje" | "projeAyarlari";
/** Seçim. Örneklerde `id` asıl seçili nesnedir (özellik paneli onu gösterir); `digerleri` Shift ya da
 *  kutu seçimiyle eklenen diğer nesnelerdir. Taşıma, silme, çoğaltma, hizalama hepsine uygulanır. */
export type Secim = null | { tur: "ornek"; id: string; digerleri?: string[] } | { tur: "nesneTuru"; id: string } | { tur: "sahne"; id: string };

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

/** Seçili bütün örneklerin kimlikleri (asıl seçili olan başta). */
export const seciliOrnekler = (s: Secim): string[] => (s?.tur === "ornek" ? [s.id, ...(s.digerleri || [])] : []);

/** Geri al geçmişinde tutulan en fazla adım. */
const GECMIS_SINIRI = 200;
/** Aynı yazı kutusunda ya da aynı anahtarla bu süre içindeki değişiklikler tek adım sayılır (ms). */
const BIRLESME_SURESI = 1200;

interface Durum {
  depo: Depo | null;
  /** "oyun": 3D oyunun içerik dosyalarını düzenleme ekranı (oyun/OyunIcerigi.tsx). */
  ekran: "yukleniyor" | "baslangic" | "editor" | "oyun";
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
  /** Geri al / yinele yığınları: her biri projenin o anki tam kopyası. */
  geriYigini: Proje[];
  ileriYigini: Proje[];

  baslat(depo: Depo): Promise<void>;
  projeyiAc(ad: string): Promise<void>;
  yeniProje(ad: string, sablon: "bos" | "ornek"): Promise<boolean>;
  baslangicaDon(): void;
  /** Bütün proje değişiklikleri buradan geçer. `anahtar` verilirse aynı anahtarlı ardışık değişiklikler
   *  (ör. ok tuşuyla kaydırma) geri al geçmişinde tek adım sayılır. */
  degistir(fn: (p: Proje) => void, sessiz?: boolean, anahtar?: string): void;
  /** Sürükleme gibi çok parçalı bir işlemi başlatır/bitirir: arada kaç değişiklik olursa olsun tek adım. */
  islemBaslat(): void;
  islemBitir(): void;
  geriAl(): void;
  yinele(): void;
  sec(s: Secim): void;
  ornekEkle(turId: string, x: number, y: number): void;
  turEkle(): void;
  secileniSil(): void;
  secileniCogalt(): void;
  tumunuSec(): void;
  /** Seçili örnekleri dx, dy kadar kaydırır (ok tuşları). */
  secileniKaydir(dx: number, dy: number): void;
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
// Geri al birleştirme bilgisi (durumun parçası değil; ekranı etkilemez)
let sonAnahtar: unknown = null;
let sonZaman = 0;
let islemDerinligi = 0;
let islemKaydedildi = false;
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
  geriYigini: [],
  ileriYigini: [],

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
    set({ geriYigini: [], ileriYigini: [] }); sonAnahtar = null;
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

  degistir(fn, sessiz, anahtar) {
    const { proje } = get();
    if (!proje) return;
    const kopya = structuredClone(proje);
    fn(kopya);
    // Geri al geçmişi: gerçekten bir şey değiştiyse önceki hali yığına koy
    if (JSON.stringify(kopya) !== JSON.stringify(proje)) {
      // Anahtar verilmediyse ve bir yazı kutusundaysak, o kutu anahtar olur (harf harf yazmak tek adım)
      const odak = typeof document !== "undefined" ? document.activeElement : null;
      const k = anahtar ?? (odak && ["INPUT", "TEXTAREA"].includes(odak.tagName) ? odak : null);
      const simdi = Date.now();
      let yeniAdim: boolean;
      if (islemDerinligi > 0) { yeniAdim = !islemKaydedildi; islemKaydedildi = true; }
      else yeniAdim = !(k !== null && k === sonAnahtar && simdi - sonZaman < BIRLESME_SURESI);
      sonAnahtar = islemDerinligi > 0 ? null : k; sonZaman = simdi;
      if (yeniAdim) set({ geriYigini: [...get().geriYigini.slice(-(GECMIS_SINIRI - 1)), proje], ileriYigini: [] });
    }
    set({ proje: kopya });
    kaydetPlanla(sessiz);
  },

  islemBaslat() { if (islemDerinligi++ === 0) islemKaydedildi = false; },
  islemBitir() { islemDerinligi = Math.max(0, islemDerinligi - 1); sonAnahtar = null; },

  geriAl() {
    const { geriYigini, ileriYigini, proje } = get();
    if (!geriYigini.length || !proje) return;
    const onceki = geriYigini[geriYigini.length - 1];
    set({ proje: onceki, geriYigini: geriYigini.slice(0, -1), ileriYigini: [...ileriYigini, proje] });
    sonAnahtar = null;
    secimiDogrula();
    kaydetPlanla();
  },
  yinele() {
    const { geriYigini, ileriYigini, proje } = get();
    if (!ileriYigini.length || !proje) return;
    const sonraki = ileriYigini[ileriYigini.length - 1];
    set({ proje: sonraki, ileriYigini: ileriYigini.slice(0, -1), geriYigini: [...geriYigini, proje] });
    sonAnahtar = null;
    secimiDogrula();
    kaydetPlanla();
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
      const idler = new Set(seciliOrnekler(s));
      get().degistir(p => p.sahneler.forEach(sh => { sh.ornekler = sh.ornekler.filter(o => !idler.has(o.id)); }));
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
      // seçili bütün örnekleri 24 px kaydırarak kopyala; kopyalar seçili olur
      const yeniler: Ornek[] = [];
      const idler = seciliOrnekler(s);
      get().degistir(pp => pp.sahneler.forEach(sh => {
        for (const id of idler) {
          const o = sh.ornekler.find(x => x.id === id);
          if (!o) continue;
          const yeni: Ornek = { ...o, id: yeniId("o"), x: o.x + 24, y: o.y + 24 };
          sh.ornekler.push(yeni); yeniler.push(yeni);
        }
      }));
      if (yeniler.length) set({ secim: { tur: "ornek", id: yeniler[0].id, digerleri: yeniler.slice(1).map(o => o.id) } });
    } else if (s.tur === "nesneTuru") {
      const t = p.nesneTurleri.find(t => t.id === s.id)!;
      const yeni = { ...structuredClone(t), id: yeniId("tur"), ad: t.ad + " (kopya)" };
      get().degistir(pp => { pp.nesneTurleri.push(yeni); });
      set({ secim: { tur: "nesneTuru", id: yeni.id } });
    }
  },

  tumunuSec() {
    const sahne = aktifSahne(get());
    if (!sahne) return;
    const kilitli = new Set(sahne.katmanlar.filter(k => k.kilitli || !k.gorunur).map(k => k.id));
    const idler = sahne.ornekler.filter(o => !kilitli.has(o.katman)).map(o => o.id);
    set({ secim: idler.length ? { tur: "ornek", id: idler[0], digerleri: idler.slice(1) } : null });
  },

  secileniKaydir(dx, dy) {
    const idler = new Set(seciliOrnekler(get().secim));
    if (!idler.size) return;
    get().degistir(p => p.sahneler.forEach(sh => sh.ornekler.forEach(o => { if (idler.has(o.id)) { o.x += dx; o.y += dy; } })), false, "ok-tusu");
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
    // geri yükleme de geri alınabilir bir adım
    if (proje) set({ geriYigini: [...get().geriYigini.slice(-(GECMIS_SINIRI - 1)), proje], ileriYigini: [] });
    set({ proje: veri, secim: null });
    kaydetPlanla();
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

/** Otomatik kayıt: son değişiklikten 600 ms sonra diske yazar. */
function kaydetPlanla(sessiz?: boolean) {
  const { get, set } = { get: useDurum.getState, set: useDurum.setState };
  if (!get().tercih.otomatikKayit && !sessiz) { set({ kayit: "" }); return; }
  set({ kayit: "kaydediliyor" });
  clearTimeout(kayitZamanlayici);
  kayitZamanlayici = setTimeout(async () => {
    const { depo, projeAdi, proje } = get();
    try { await depo!.proje_kaydet(projeAdi!, proje); set({ kayit: "kayitli" }); }
    catch (e) { set({ kayit: "hata" }); get().log("Kaydedilemedi: " + e, "hata"); }
  }, 600);
}

/** Geri al/yinele sonrası artık var olmayan nesneleri seçimden çıkar. */
function secimiDogrula() {
  const { secim, proje, aktifSahneId } = useDurum.getState();
  if (!proje) return;
  if (!proje.sahneler.some(s => s.id === aktifSahneId)) useDurum.setState({ aktifSahneId: proje.sahneler[0]?.id || null });
  if (!secim) return;
  if (secim.tur === "ornek") {
    const var_ = new Set(proje.sahneler.flatMap(s => s.ornekler.map(o => o.id)));
    const kalan = seciliOrnekler(secim).filter(id => var_.has(id));
    useDurum.setState({ secim: kalan.length ? { tur: "ornek", id: kalan[0], digerleri: kalan.slice(1) } : null });
  } else if (secim.tur === "nesneTuru" && !proje.nesneTurleri.some(t => t.id === secim.id)) useDurum.setState({ secim: null });
  else if (secim.tur === "sahne" && !proje.sahneler.some(s => s.id === secim.id)) useDurum.setState({ secim: null });
}

/** Kısayol: aktif sahne. */
export const aktifSahne = (d: { proje: Proje | null; aktifSahneId: string | null }) =>
  d.proje?.sahneler.find(s => s.id === d.aktifSahneId) || null;
