// Bütün komutlar tek yerde: menüler, komut paleti ve klavye kısayolları buradan beslenir.
import { useDurum } from "../depo/durum";

export interface Komut {
  id: string;
  ad: string;
  kategori: "Dosya" | "Düzen" | "Görünüm" | "Oyun" | "Yardım" | "Araç";
  kisayol?: string;          // görünen metin, ör. "Ctrl+S"
  tus?: (e: KeyboardEvent) => boolean;  // kısayol eşleşmesi
  calistir: () => void;
  etkin?: () => boolean;
  yakinda?: string;          // henüz yoksa hangi aşamada geleceği
}

const d = () => useDurum.getState();
const editorde = () => d().ekran === "editor";
const ctrl = (k: string, shift = false, alt = false) => (e: KeyboardEvent) =>
  (e.ctrlKey || e.metaKey) && e.shiftKey === shift && e.altKey === alt && e.key.toLowerCase() === k;
const yalin = (k: string) => (e: KeyboardEvent) => !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === k;

export const sahneOlay = (ad: "sigdir" | "yakinlas" | "uzaklas") => window.dispatchEvent(new CustomEvent("sahne-" + ad));

export const KOMUTLAR: Komut[] = [
  // ---- Dosya
  { id: "yeni", ad: "Yeni proje…", kategori: "Dosya", kisayol: "Ctrl+N", tus: ctrl("n"), calistir: () => d().set("pencere", "yeniProje") },
  { id: "ac", ad: "Proje aç…", kategori: "Dosya", kisayol: "Ctrl+O", tus: ctrl("o"), calistir: () => d().baslangicaDon() },
  { id: "kaydet", ad: "Kaydet", kategori: "Dosya", kisayol: "Ctrl+S", tus: ctrl("s"), etkin: editorde,
    calistir: () => d().degistir(() => {}, true) },
  { id: "surum", ad: "Sürüm kaydet…", kategori: "Dosya", kisayol: "Ctrl+Shift+S", tus: ctrl("s", true), etkin: editorde,
    calistir: () => { d().duzenAyarla({ alt: true }); d().set("altSekme", "surumler"); setTimeout(() => document.getElementById("surum-notu")?.focus(), 50); } },
  { id: "projeAyar", ad: "Proje ayarları…", kategori: "Dosya", etkin: editorde, calistir: () => d().set("pencere", "projeAyarlari") },
  { id: "klasor", ad: "Proje klasörünü aç", kategori: "Dosya", calistir: () => d().depo?.klasoru_ac() },
  { id: "disaHtml", ad: "Dışa aktar: HTML oyun", kategori: "Dosya", calistir: () => {}, yakinda: "Aşama 5" },
  { id: "disaExe", ad: "Dışa aktar: Windows .exe", kategori: "Dosya", calistir: () => {}, yakinda: "Aşama 5" },
  // ---- Düzen
  { id: "geri", ad: "Geri al", kategori: "Düzen", kisayol: "Ctrl+Z", calistir: () => {}, yakinda: "Aşama 1" },
  { id: "yinele", ad: "Yinele", kategori: "Düzen", kisayol: "Ctrl+Y", calistir: () => {}, yakinda: "Aşama 1" },
  { id: "cogalt", ad: "Çoğalt", kategori: "Düzen", kisayol: "Ctrl+D", tus: ctrl("d"), etkin: () => editorde() && !!d().secim,
    calistir: () => d().secileniCogalt() },
  { id: "sil", ad: "Sil", kategori: "Düzen", kisayol: "Delete", tus: e => e.key === "Delete", etkin: () => editorde() && !!d().secim,
    calistir: () => d().secileniSil() },
  { id: "yeniTur", ad: "Yeni nesne türü", kategori: "Düzen", kisayol: "Ctrl+Shift+N", tus: ctrl("n", true), etkin: editorde,
    calistir: () => d().turEkle() },
  { id: "ayarlar", ad: "Ayarlar…", kategori: "Düzen", kisayol: "Ctrl+,", tus: e => (e.ctrlKey || e.metaKey) && e.key === ",",
    calistir: () => d().set("pencere", "ayarlar") },
  // ---- Araçlar
  { id: "aracSec", ad: "Araç: Seç", kategori: "Araç", kisayol: "V", tus: yalin("v"), etkin: editorde, calistir: () => d().set("arac", "sec") },
  { id: "aracTasi", ad: "Araç: Taşı", kategori: "Araç", kisayol: "W", tus: yalin("w"), etkin: editorde, calistir: () => d().set("arac", "tasi") },
  { id: "aracDondur", ad: "Araç: Döndür", kategori: "Araç", kisayol: "E", tus: yalin("e"), etkin: editorde, calistir: () => d().set("arac", "dondur") },
  { id: "aracOlcek", ad: "Araç: Ölçekle", kategori: "Araç", kisayol: "R", tus: yalin("r"), etkin: editorde, calistir: () => d().set("arac", "olcekle") },
  { id: "aracEl", ad: "Araç: Kaydır (el)", kategori: "Araç", kisayol: "H", tus: yalin("h"), etkin: editorde, calistir: () => d().set("arac", "el") },
  // ---- Görünüm
  { id: "komut", ad: "Komut paleti", kategori: "Görünüm", kisayol: "Ctrl+K", tus: ctrl("k"), calistir: () => d().set("pencere", "komut") },
  { id: "solPanel", ad: "Sol paneli göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+B", tus: ctrl("b"), calistir: () => d().duzenAyarla({ sol: !d().duzen.sol }) },
  { id: "sagPanel", ad: "Sağ paneli göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+Alt+B", tus: ctrl("b", false, true), calistir: () => d().duzenAyarla({ sag: !d().duzen.sag }) },
  { id: "altPanel", ad: "Alt paneli göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+J", tus: ctrl("j"), calistir: () => d().duzenAyarla({ alt: !d().duzen.alt }) },
  { id: "izgara", ad: "Izgarayı göster/gizle", kategori: "Görünüm", kisayol: "Ctrl+'", tus: e => (e.ctrlKey || e.metaKey) && e.key === "'",
    calistir: () => d().tercihAyarla({ izgaraGoster: !d().tercih.izgaraGoster }) },
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
      if (yaziyor && (tekTus || k.id === "sil")) return;
      if (!kullanilabilir(k)) return;
      e.preventDefault();
      k.calistir();
      return;
    }
  };
  addEventListener("keydown", dinle);
  return () => removeEventListener("keydown", dinle);
}
