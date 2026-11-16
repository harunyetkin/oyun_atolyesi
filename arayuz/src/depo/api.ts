// Masaüstü kabuğuyla (atolye.py / pywebview) konuşan katman.
// Tarayıcıda ?test=1 ile açılınca bellekte çalışan sahte depo kullanılır.

import { ORNEK_ICERIK } from "../oyun/ornekIcerik";

export interface SurumBilgi { dosya: string; tarih: string; not: string }

export interface Depo {
  proje_listesi(): Promise<string[]>;
  proje_yukle(ad: string): Promise<any>;
  proje_kaydet(ad: string, veri: any): Promise<boolean>;
  surum_kaydet(ad: string, not: string, veri: any): Promise<string>;
  surum_listesi(ad: string): Promise<SurumBilgi[]>;
  surum_yukle(ad: string, dosya: string): Promise<any>;
  disa_aktar(ad: string, html: string): Promise<string>;
  klasoru_ac(): Promise<boolean>;
  // ---- Oyun içeriği (hikaye_oyun/icerik/*.json)
  /** Hatırlanan oyun klasörü; yoksa "". */
  oyun_klasoru(): Promise<string>;
  /** Klasör seçme penceresi. Dönüş: yol, vazgeçilirse "", oyun klasörü değilse "!açıklama". */
  oyun_klasoru_sec(): Promise<string>;
  /** icerik/ altındaki JSON dosyalarının göreli yolları ("haritalar/deneme_yolu.json"). */
  icerik_listesi(): Promise<string[]>;
  icerik_oku(yol: string): Promise<any>;
  icerik_yaz(yol: string, veri: any): Promise<boolean>;
}

function bellekDepo(): Depo {
  // Testte örnek oyun içeriği bellekte tutulur (dosyaya dokunulmaz)
  const icerik: Record<string, string> = {};
  for (const [yol, veri] of Object.entries(ORNEK_ICERIK)) icerik[yol] = JSON.stringify(veri);
  let oyunKlasoru = "";
  const projeler: Record<string, string> = {};
  const surumler: Record<string, { dosya: string; tarih: string; not: string; veri: string }[]> = {};
  return {
    async proje_listesi() { return Object.keys(projeler).sort(); },
    async proje_yukle(ad) { return JSON.parse(projeler[ad]); },
    async proje_kaydet(ad, veri) { projeler[ad] = JSON.stringify(veri); return true; },
    async surum_kaydet(ad, not, veri) {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      const t = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
      (surumler[ad] = surumler[ad] || []).unshift({ dosya: t + ".json", tarih: t, not, veri: JSON.stringify(veri) });
      return t;
    },
    async surum_listesi(ad) { return (surumler[ad] || []).map(({ dosya, tarih, not }) => ({ dosya, tarih, not })); },
    async surum_yukle(ad, dosya) { return JSON.parse((surumler[ad] || []).find(s => s.dosya === dosya)!.veri); },
    async disa_aktar(ad) { return "(tarayıcı testi) " + ad + ".html"; },
    async klasoru_ac() { return true; },
    async oyun_klasoru() { return oyunKlasoru; },
    async oyun_klasoru_sec() { oyunKlasoru = "(test) hikaye_oyun"; return oyunKlasoru; },
    async icerik_listesi() { return Object.keys(icerik).sort(); },
    async icerik_oku(yol) {
      if (!(yol in icerik)) throw new Error("dosya yok: " + yol);
      return JSON.parse(icerik[yol]);
    },
    async icerik_yaz(yol, veri) { icerik[yol] = JSON.stringify(veri); return true; },
  };
}

declare global { interface Window { pywebview?: { api: Depo } } }

export const testModu = new URLSearchParams(location.search).has("test");

/** Masaüstü uygulamasında pywebview hazır olunca, testte hemen çözülür. */
export function depoyuBekle(): Promise<Depo> {
  if (testModu) return Promise.resolve(bellekDepo());
  if (window.pywebview?.api) return Promise.resolve(window.pywebview.api);
  return new Promise((coz) => {
    window.addEventListener("pywebviewready", () => coz(window.pywebview!.api), { once: true });
  });
}
