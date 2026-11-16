// Bütün komutlar tek yerde: menüler, komut paleti ve klavye kısayolları buradan beslenir.
import { aktifSahne, seciliOrnekler, useDurum } from "../depo/durum";
import { useOyun } from "../oyun/durum";
import { oyunIceriginiAc } from "../oyun/ac";
import { HIZALAMA_ADLARI, hizala, type HizalamaModu } from "../depo/hizalama";

export interface Komut {
  id: string;
  ad: string;
  kategori: "Dosya" | "Düzen" | "Hizala" | "Görünüm" | "Oyun" | "Oyun içeriği" | "Yardım" | "Araç";
  kisayol?: string;          // görünen metin, ör. "Ctrl+S"
  tus?: (e: KeyboardEvent) => boolean;  // kısayol eşleşmesi
  calistir: (e?: KeyboardEvent) => void;
  menudeGizli?: boolean;     // menülerde ve komut paletinde gösterme (yalnız kısayol)
  yaziyorkenDegil?: boolean; // yazı kutusundayken kısayol tarayıcıya kalsın (ör. Ctrl+A)
  etkin?: () => boolean;
  yakinda?: string;          // henüz yoksa hangi aşamada geleceği
}

const d = () => useDurum.getState();
const editorde = () => d().ekran === "editor";
const duzenlemede = () => editorde() && d().oynatma === "duruyor";  // oynarken W/A/S/D oyuna gider
const ctrl = (k: string, shift = false, alt = false) => (e: KeyboardEvent) =>
  (e.ctrlKey || e.metaKey) && e.shiftKey === shift && e.altKey === alt && e.key.toLowerCase() === k;
const yalin = (k: string) => (e: KeyboardEvent) => !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === k;

/** Oyun içeriği ekranındayız (3D oyunun JSON dosyaları). */
const oyunda = () => d().ekran === "oyun";
const o = () => useOyun.getState();

/** Oyun içeriğindeki değişiklikleri kaydeder ve sonucu bildirir. */
async function oyunuKaydet() {
  const n = await o().kaydet();
  if (n < 0) d().bildir("Kaydedilemedi! Dosya açık ya da salt okunur olabilir.", "hata");
  else d().bildir(n ? `${n} dosya kaydedildi. Oyunu yeniden başlatınca görünür.` : "Kaydedilecek değişiklik yok.", n ? "basari" : "bilgi");
}

const ornekSecili = () => duzenlemede() && seciliOrnekler(d().secim).length > 0;

/** Seçili örnekleri hizalar: tek nesne sahneye göre, birden fazla nesne birbirine göre. */
function hizalaCalistir(mod: HizalamaModu) {
  const st = d(), sahne = aktifSahne(st);
  if (!sahne || !st.proje) return;
  const idler = seciliOrnekler(st.secim);
  const ornekler = sahne.ornekler.filter(o => idler.includes(o.id));
  const turler = new Map(st.proje.nesneTurleri.map(t => [t.id, t]));
  const yeni = hizala(ornekler, turler, mod, { x0: 0, y0: 0, x1: sahne.genislik, y1: sahne.yukseklik });
  if (!yeni.size) { if (mod.endsWith("Dagit")) st.bildir("Eşit dağıtmak için en az 3 nesne seç (Shift ile)"); return; }
  st.degistir(p => p.sahneler.find(s => s.id === sahne.id)!.ornekler.forEach(o => {
    const k = yeni.get(o.id); if (k) { o.x = k.x; o.y = k.y; }
  }));
}
const HIZALAMA_KISAYOL: Partial<Record<HizalamaModu, string>> = {
  sol: "Alt+A", yatayOrta: "Alt+H", sag: "Alt+D", ust: "Alt+W", dikeyOrta: "Alt+V", alt: "Alt+S",
};
const altTus = (k: string) => (e: KeyboardEvent) => e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key.toLowerCase() === k;

export const sahneOlay = (ad: "sigdir" | "yakinlas" | "uzaklas") => window.dispatchEvent(new CustomEvent("sahne-" + ad));

export const KOMUTLAR: Komut[] = [
  // ---- Dosya
  { id: "yeni", ad: "Yeni proje…", kategori: "Dosya", kisayol: "Ctrl+N", tus: ctrl("n"), calistir: () => d().set("pencere", "yeniProje") },
  { id: "ac", ad: "Proje aç…", kategori: "Dosya", kisayol: "Ctrl+O", tus: ctrl("o"), calistir: () => d().baslangicaDon() },
  { id: "kaydet", ad: "Kaydet", kategori: "Dosya", kisayol: "Ctrl+S", tus: ctrl("s"), etkin: () => editorde() || oyunda(),
    calistir: () => {
      if (!oyunda()) { d().degistir(() => {}, true); return; }
      (document.activeElement as HTMLElement | null)?.blur?.();  // yazılmakta olan kutu önce işlensin
      void oyunuKaydet();
    } },
  { id: "surum", ad: "Sürüm kaydet…", kategori: "Dosya", kisayol: "Ctrl+Shift+S", tus: ctrl("s", true), etkin: editorde,
    calistir: () => { d().duzenAyarla({ alt: true }); d().set("altSekme", "surumler"); setTimeout(() => document.getElementById("surum-notu")?.focus(), 50); } },
  { id: "projeAyar", ad: "Proje ayarları…", kategori: "Dosya", etkin: editorde, calistir: () => d().set("pencere", "projeAyarlari") },
  { id: "klasor", ad: "Proje klasörünü aç", kategori: "Dosya", calistir: () => d().depo?.klasoru_ac() },
  { id: "disaHtml", ad: "Dışa aktar: HTML oyun", kategori: "Dosya", calistir: () => {}, yakinda: "Aşama 5" },
  { id: "disaExe", ad: "Dışa aktar: Windows .exe", kategori: "Dosya", calistir: () => {}, yakinda: "Aşama 5" },
  // ---- Düzen
  { id: "geri", ad: "Geri al", kategori: "Düzen", kisayol: "Ctrl+Z", tus: ctrl("z"),
    etkin: () => (oyunda() ? o().geri.length > 0 : duzenlemede() && d().geriYigini.length > 0),
    calistir: () => { if (oyunda()) { (document.activeElement as HTMLElement | null)?.blur?.(); o().geriAl(); } else d().geriAl(); } },
  { id: "yinele", ad: "Yinele", kategori: "Düzen", kisayol: "Ctrl+Y", tus: e => ctrl("y")(e) || ctrl("z", true)(e),
    etkin: () => (oyunda() ? o().ileri.length > 0 : duzenlemede() && d().ileriYigini.length > 0),
    calistir: () => { if (oyunda()) { (document.activeElement as HTMLElement | null)?.blur?.(); o().yinele(); } else d().yinele(); } },
  { id: "tumunuSec", ad: "Sahnedeki her şeyi seç", kategori: "Düzen", kisayol: "Ctrl+A", tus: ctrl("a"), yaziyorkenDegil: true,
    etkin: duzenlemede, calistir: () => d().tumunuSec() },
  { id: "secimiKaldir", ad: "Seçimi kaldır", kategori: "Düzen", kisayol: "Esc", tus: e => e.key === "Escape" && !e.ctrlKey && !e.altKey,
    yaziyorkenDegil: true, etkin: () => duzenlemede() && !!d().secim && !d().pencere, calistir: () => d().sec(null) },
  { id: "okKaydir", ad: "Seçileni 1 px kaydır (Shift ile 10 px)", kategori: "Düzen", kisayol: "Ok tuşları", menudeGizli: true, yaziyorkenDegil: true,
    tus: e => !e.ctrlKey && !e.metaKey && !e.altKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key),
    etkin: ornekSecili,
    calistir: e => {
      if (!e) return;
      const adim = e.shiftKey ? 10 : 1;
      const dx = e.key === "ArrowLeft" ? -adim : e.key === "ArrowRight" ? adim : 0;
      const dy = e.key === "ArrowUp" ? -adim : e.key === "ArrowDown" ? adim : 0;
      d().secileniKaydir(dx, dy);
    } },
  { id: "cogalt", ad: "Çoğalt", kategori: "Düzen", kisayol: "Ctrl+D", tus: ctrl("d"), etkin: () => editorde() && !!d().secim,
    calistir: () => d().secileniCogalt() },
  { id: "sil", ad: "Sil", kategori: "Düzen", kisayol: "Delete", tus: e => e.key === "Delete", etkin: () => editorde() && !!d().secim,
    calistir: () => d().secileniSil() },
  { id: "yeniTur", ad: "Yeni nesne türü", kategori: "Düzen", kisayol: "Ctrl+Shift+N", tus: ctrl("n", true), etkin: editorde,
    calistir: () => d().turEkle() },
  { id: "ayarlar", ad: "Ayarlar…", kategori: "Düzen", kisayol: "Ctrl+,", tus: e => (e.ctrlKey || e.metaKey) && e.key === ",",
    calistir: () => d().set("pencere", "ayarlar") },
  // ---- Hizala (Düzen menüsünde ayrı bölüm)
  ...(Object.keys(HIZALAMA_ADLARI) as HizalamaModu[]).map((mod): Komut => ({
    id: "hizala_" + mod, ad: HIZALAMA_ADLARI[mod], kategori: "Hizala",
    kisayol: HIZALAMA_KISAYOL[mod], tus: HIZALAMA_KISAYOL[mod] ? altTus(HIZALAMA_KISAYOL[mod]!.slice(-1).toLowerCase()) : undefined,
    etkin: mod.endsWith("Dagit") ? () => duzenlemede() && seciliOrnekler(d().secim).length >= 3 : ornekSecili,
    calistir: () => hizalaCalistir(mod),
  })),
  // ---- Araçlar
  { id: "aracSec", ad: "Araç: Seç", kategori: "Araç", kisayol: "V", tus: yalin("v"), etkin: duzenlemede, calistir: () => d().set("arac", "sec") },
  { id: "aracTasi", ad: "Araç: Taşı", kategori: "Araç", kisayol: "W", tus: yalin("w"), etkin: duzenlemede, calistir: () => d().set("arac", "tasi") },
  { id: "aracDondur", ad: "Araç: Döndür", kategori: "Araç", kisayol: "E", tus: yalin("e"), etkin: duzenlemede, calistir: () => d().set("arac", "dondur") },
  { id: "aracOlcek", ad: "Araç: Ölçekle", kategori: "Araç", kisayol: "R", tus: yalin("r"), etkin: duzenlemede, calistir: () => d().set("arac", "olcekle") },
  { id: "aracEl", ad: "Araç: Kaydır (el)", kategori: "Araç", kisayol: "H", tus: yalin("h"), etkin: duzenlemede, calistir: () => d().set("arac", "el") },
  // ---- Görünüm
  { id: "komut", ad: "Komut paleti", kategori: "Görünüm", kisayol: "Ctrl+K", tus: ctrl("k"), calistir: () => d().set("pencere", "komut") },
  { id: "solPanel", ad: "Sol paneli göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+B", tus: ctrl("b"), calistir: () => d().duzenAyarla({ sol: !d().duzen.sol }) },
  { id: "sagPanel", ad: "Sağ paneli göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+Alt+B", tus: ctrl("b", false, true), calistir: () => d().duzenAyarla({ sag: !d().duzen.sag }) },
  { id: "altPanel", ad: "Alt paneli göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+J", tus: ctrl("j"), calistir: () => d().duzenAyarla({ alt: !d().duzen.alt }) },
  { id: "izgara", ad: "Izgarayı göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+'", tus: e => (e.ctrlKey || e.metaKey) && e.key === "'",
    calistir: () => d().tercihAyarla({ izgaraGoster: !d().tercih.izgaraGoster }) },
  { id: "carpismaGoster", ad: "Çarpışma alanlarını göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+Shift+C", tus: ctrl("c", true),
    calistir: () => d().tercihAyarla({ carpismaGoster: !d().tercih.carpismaGoster }) },
  { id: "miknatis", ad: "Izgaraya yapış (mıknatıs)", kategori: "Görünüm", kisayol: "Shift+M", tus: e => e.shiftKey && !e.ctrlKey && e.key.toLowerCase() === "m",
    calistir: () => d().tercihAyarla({ miknatis: !d().tercih.miknatis }) },
  { id: "yakinlas", ad: "Yakınlaştır", kategori: "Görünüm", kisayol: "Ctrl++", tus: e => (e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "="), calistir: () => sahneOlay("yakinlas") },
  { id: "uzaklas", ad: "Uzaklaştır", kategori: "Görünüm", kisayol: "Ctrl+-", tus: e => (e.ctrlKey || e.metaKey) && e.key === "-", calistir: () => sahneOlay("uzaklas") },
  { id: "sigdir", ad: "Sahneyi ekrana sığdır", kategori: "Görünüm", kisayol: "Ctrl+0", tus: ctrl("0"), calistir: () => sahneOlay("sigdir") },
  { id: "sekmeSahne", ad: "Sahne düzenleyici", kategori: "Görünüm", kisayol: "Ctrl+1", tus: ctrl("1"), calistir: () => d().set("merkez", "sahne") },
  { id: "sekmeOlay", ad: "Olay kuralları", kategori: "Görünüm", kisayol: "Ctrl+2", tus: ctrl("2"), calistir: () => d().set("merkez", "olaylar") },
  { id: "sekmeArayuz", ad: "Arayüz (HUD) düzenleyici", kategori: "Görünüm", kisayol: "Ctrl+3", tus: ctrl("3"), calistir: () => d().set("merkez", "arayuz") },
  // ---- Oyun
  { id: "oynat", ad: "Oynat", kategori: "Oyun", kisayol: "F5", tus: e => e.key === "F5" && !e.shiftKey, etkin: editorde,
    calistir: () => { d().set("merkez", "sahne"); d().set("oynatma", "oynuyor"); } },
  { id: "duraklat", ad: "Duraklat / devam", kategori: "Oyun", kisayol: "F6", tus: e => e.key === "F6", etkin: () => d().oynatma !== "duruyor",
    calistir: () => d().set("oynatma", d().oynatma === "oynuyor" ? "duraklatildi" : "oynuyor") },
  { id: "durdur", ad: "Durdur", kategori: "Oyun", kisayol: "Shift+F5", tus: e => e.key === "F5" && e.shiftKey, etkin: () => d().oynatma !== "duruyor",
    calistir: () => d().set("oynatma", "duruyor") },
  // ---- Oyun içeriği (3D hikâye oyunu: hikaye_oyun/icerik/*.json)
  { id: "oyunIcerigi", ad: "Oyun içeriğini aç…", kategori: "Oyun içeriği", kisayol: "Ctrl+Shift+O", tus: ctrl("o", true),
    calistir: () => void oyunIceriginiAc() },
  { id: "oyunKlasoru", ad: "Oyun klasörünü değiştir…", kategori: "Oyun içeriği",
    calistir: () => {
      if (oyunda() && o().degisenler().length) { d().bildir("Önce değişiklikleri kaydet (Ctrl+S) ya da at.", "hata"); return; }
      void oyunIceriginiAc(true);
    } },
  { id: "oyunYenile", ad: "Oyun içeriğini dosyalardan yeniden oku", kategori: "Oyun içeriği", etkin: oyunda,
    calistir: () => {
      if (o().degisenler().length) { d().bildir("Önce değişiklikleri kaydet (Ctrl+S) ya da at.", "hata"); return; }
      const st = o(); if (st.depo) void st.yukle(st.depo, st.klasor).then(() => d().bildir("Dosyalar yeniden okundu."));
    } },
  { id: "olumsuz", ad: "Ölümsüz test modu", kategori: "Oyun", calistir: () => {}, yakinda: "Aşama 2" },
  // ---- Yardım
  { id: "kisayollar", ad: "Klavye kısayolları", kategori: "Yardım", kisayol: "F1", tus: e => e.key === "F1", calistir: () => d().set("pencere", "kisayollar") },
  { id: "hakkinda", ad: "Oyun Atölyesi hakkında", kategori: "Yardım", calistir: () => d().set("pencere", "hakkinda") },
];

export const komut = (id: string) => KOMUTLAR.find(k => k.id === id)!;
export const kullanilabilir = (k: Komut) => !k.yakinda && (k.etkin ? k.etkin() : true);

/** Genel klavye dinleyicisi: yazı kutularındayken tek harfli kısayollar çalışmaz. */
export function kisayollariBagla() {
  const dinle = (e: KeyboardEvent) => {
    const hedef = e.target as HTMLElement;
    const yaziyor = ["INPUT", "TEXTAREA", "SELECT"].includes(hedef.tagName);
    for (const k of KOMUTLAR) {
      if (!k.tus || !k.tus(e)) continue;
      const tekTus = !e.ctrlKey && !e.metaKey && !e.altKey && !k.kisayol?.startsWith("F") && k.id !== "sil";
      if (yaziyor && (tekTus || k.id === "sil" || k.yaziyorkenDegil)) return;
      if (!kullanilabilir(k)) return;
      e.preventDefault();
      k.calistir(e);
      return;
    }
  };
  addEventListener("keydown", dinle);
  return () => removeEventListener("keydown", dinle);
}
