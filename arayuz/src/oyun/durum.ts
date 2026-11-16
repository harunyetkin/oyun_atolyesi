// Oyun içeriği düzenleyicisinin durumu (zustand). 2D projeden ayrıdır: kendi geri al geçmişi,
// kendi kayıt durumu var. Bütün içerik değişiklikleri `degistir()`'den geçer.
import { create } from "zustand";
import type { Depo } from "../depo/api";
import { dosyaTuru } from "./icerik";

const GECMIS_SINIRI = 200;
const BIRLESME_SURESI = 1200;

interface Adim { yol: string; metin: string; secili: string | null }

interface OyunDurum {
  depo: Depo | null;
  klasor: string;
  dosyalar: string[];
  /** Açılan dosyaların içeriği (göreli yol → JSON). */
  veri: Record<string, any>;
  /** Son kaydedilen hâlin metni: farkı "kaydedilmedi" diye göstermek için. */
  kayitli: Record<string, string>;
  acik: string | null;
  /** Açık sayfada seçili öğe (ör. eşya kimliği, kişi kimliği). */
  secili: string | null;
  kaydediliyor: boolean;
  geri: Adim[];
  ileri: Adim[];

  /** Klasördeki bütün içerik dosyalarını okur. */
  yukle(depo: Depo, klasor: string): Promise<void>;
  dosyaAc(yol: string): void;
  sec(id: string | null): void;
  /** Bir dosyayı değiştirir. Aynı `anahtar`la art arda yapılan değişiklikler tek geri al adımı sayılır. */
  degistir(yol: string, fn: (v: any) => void, anahtar?: string): void;
  geriAl(): void;
  yinele(): void;
  degisenler(): string[];
  /** Değişen bütün dosyaları yazar. Başarılıysa kaydedilen dosya sayısını döner, hatada -1. */
  kaydet(): Promise<number>;
  /** Kaydedilmemiş değişiklikleri atar (dosyalardaki son hâle döner). */
  degisiklikleriAt(): void;
}

let sonAnahtar: string | null = null;
let sonZaman = 0;

/** Sol listede dosyaların sırası: önce karakterler, sonra haritalar, diyaloglar, diğerleri. */
const SIRA: Record<string, number> = { karakterler: 0, harita: 1, diyalog: 2, oyun: 3, karakter_olusturma: 4, diger: 5 };
const sirala = (liste: string[]) => [...liste].sort((a, b) => SIRA[dosyaTuru(a)] - SIRA[dosyaTuru(b)] || a.localeCompare(b));

export const useOyun = create<OyunDurum>((set, get) => ({
  depo: null, klasor: "", dosyalar: [], veri: {}, kayitli: {}, acik: null, secili: null, kaydediliyor: false, geri: [], ileri: [],

  async yukle(depo, klasor) {
    const dosyalar = sirala(await depo.icerik_listesi());
    const veri: Record<string, any> = {}, kayitli: Record<string, string> = {};
    for (const yol of dosyalar) {
      try { veri[yol] = await depo.icerik_oku(yol); kayitli[yol] = JSON.stringify(veri[yol]); }
      catch { /* bozuk JSON: listede kalır, açılınca uyarı gösterilir */ }
    }
    const onceki = get().acik;
    const acik = onceki && onceki in veri ? onceki : dosyalar.find(d => d in veri) || null;
    set({ depo, klasor, dosyalar, veri, kayitli, acik, secili: null, geri: [], ileri: [] });
  },

  dosyaAc(yol) { set({ acik: yol, secili: null }); },
  sec(id) { set({ secili: id }); },

  degistir(yol, fn, anahtar) {
    const st = get();
    if (!(yol in st.veri)) return;
    const simdi = Date.now();
    const birlestir = !!anahtar && anahtar === sonAnahtar && simdi - sonZaman < BIRLESME_SURESI;
    sonAnahtar = anahtar || null; sonZaman = simdi;
    const yeni = structuredClone(st.veri[yol]);
    fn(yeni);
    const eskiMetin = JSON.stringify(st.veri[yol]);
    if (JSON.stringify(yeni) === eskiMetin) return;
    set({
      veri: { ...st.veri, [yol]: yeni },
      geri: birlestir ? st.geri : [...st.geri.slice(-(GECMIS_SINIRI - 1)), { yol, metin: eskiMetin, secili: st.secili }],
      ileri: [],
    });
  },

  geriAl() {
    const st = get(), adim = st.geri[st.geri.length - 1];
    if (!adim) return;
    sonAnahtar = null;
    set({
      veri: { ...st.veri, [adim.yol]: JSON.parse(adim.metin) },
      geri: st.geri.slice(0, -1),
      ileri: [...st.ileri, { yol: adim.yol, metin: JSON.stringify(st.veri[adim.yol]), secili: st.secili }],
      acik: adim.yol, secili: adim.secili,
    });
  },

  yinele() {
    const st = get(), adim = st.ileri[st.ileri.length - 1];
    if (!adim) return;
    sonAnahtar = null;
    set({
      veri: { ...st.veri, [adim.yol]: JSON.parse(adim.metin) },
      ileri: st.ileri.slice(0, -1),
      geri: [...st.geri, { yol: adim.yol, metin: JSON.stringify(st.veri[adim.yol]), secili: st.secili }],
      acik: adim.yol, secili: adim.secili,
    });
  },

  degisenler() {
    const st = get();
    return st.dosyalar.filter(y => y in st.veri && JSON.stringify(st.veri[y]) !== st.kayitli[y]);
  },

  async kaydet() {
    const st = get();
    if (!st.depo) return -1;
    const liste = st.degisenler();
    set({ kaydediliyor: true });
    try {
      const kayitli = { ...get().kayitli };
      for (const yol of liste) {
        const v = get().veri[yol];
        await st.depo.icerik_yaz(yol, v);
        kayitli[yol] = JSON.stringify(v);
      }
      set({ kayitli, kaydediliyor: false });
      return liste.length;
    } catch {
      set({ kaydediliyor: false });
      return -1;
    }
  },

  degisiklikleriAt() {
    const st = get();
    const veri = { ...st.veri };
    for (const yol of st.degisenler()) veri[yol] = JSON.parse(st.kayitli[yol]);
    set({ veri, geri: [], ileri: [] });
  },
}));

if (typeof window !== "undefined") (window as any).__oyun = useOyun;
