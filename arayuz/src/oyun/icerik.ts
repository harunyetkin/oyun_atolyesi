// Oyun içeriği (hikaye_oyun/icerik/*.json) üzerinde çalışan, ekrandan bağımsız küçük yardımcılar.
// Biçimin tek kaynağı oyundaki icerik/BICIM.md'dir. Burada bilinmeyen alanlara dokunulmaz:
// dosya olduğu gibi okunur, yalnızca değiştirilen alan yazılır, geri kalanı aynen korunur.

/** "a.b.c" gibi noktalı yolla değer okur; yoksa undefined. */
export function yolOku(nesne: any, yol: string): any {
  if (!yol) return nesne;
  let n = nesne;
  for (const parca of yol.split(".")) {
    if (n == null || typeof n !== "object") return undefined;
    n = n[parca];
  }
  return n;
}

/** Noktalı yola değer yazar; aradaki sözlükler yoksa oluşturur. `undefined` alanı siler. */
export function yolYaz(nesne: any, yol: string, deger: any): void {
  const parcalar = yol.split(".");
  let n = nesne;
  for (const parca of parcalar.slice(0, -1)) {
    if (n[parca] == null || typeof n[parca] !== "object" || Array.isArray(n[parca])) n[parca] = {};
    n = n[parca];
  }
  const son = parcalar[parcalar.length - 1];
  if (deger === undefined) delete n[son];
  else n[son] = deger;
}

/** Kimlik kuralı (BICIM.md): ASCII, küçük harf, rakam ve alt çizgi. */
export const kimlikGecerli = (id: string) => /^[a-z0-9_]+$/.test(id);

/** Türkçe harfleri ASCII'ye çevirip kimliğe uygun hâle getirir ("Eski Defter" → "eski_defter"). */
export function kimlikYap(metin: string): string {
  const tablo: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
  return metin.replace(/[çğıöşüÇĞİÖŞÜ]/g, h => tablo[h]).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "yeni";
}

/** Var olanlarla çakışmayan kimlik: "esya", "esya_2", "esya_3"... */
export function benzersizKimlik(taban: string, varOlanlar: Iterable<string>): string {
  const kume = new Set(varOlanlar);
  if (!kume.has(taban)) return taban;
  for (let i = 2; ; i++) if (!kume.has(`${taban}_${i}`)) return `${taban}_${i}`;
}

/** Sözlükte bir anahtarın adını, sırasını bozmadan değiştirir (yeni sözlük döner). */
export function anahtarDegistir<T>(sozluk: Record<string, T>, eski: string, yeni: string): Record<string, T> {
  const sonuc: Record<string, T> = {};
  for (const [k, v] of Object.entries(sozluk)) sonuc[k === eski ? yeni : k] = v;
  return sonuc;
}

/** Unreal içerik yolu denetimi: boş ya da /Game/ ile başlayan, uzantısız yol. Sorun varsa açıklama döner. */
export function unrealYoluSorunu(yol: string): string {
  if (!yol) return "";
  if (!yol.startsWith("/Game/")) return "Unreal yolu /Game/ ile başlamalı";
  if (/\.[a-z0-9]+$/i.test(yol.split("/").pop() || "")) return "Uzantı yazma (ör. .uasset olmadan)";
  if (/\s/.test(yol)) return "Yolda boşluk olmamalı";
  return "";
}

// ------------------------------------------------------------------ eşyalar (harita içinde)
export interface Esya {
  id: string; ad: string; konum: [number, number, number]; aci: number; renk: string; mesaj: string;
  puanlar: Record<string, number>; eldeki_konum?: [number, number, number]; eldeki_aci?: [number, number, number];
  [diger: string]: unknown;
}

/** Haritaya yeni bir eşya ekler (yolun kenarına, öncekinin biraz ilerisine) ve kimliğini döner. */
export function esyaEkle(harita: any): string {
  const liste: Esya[] = (harita.esyalar ||= []);
  const id = benzersizKimlik("esya", liste.map(e => e.id));
  const son = liste[liste.length - 1];
  const z = son ? Math.round((son.konum?.[2] ?? 0) - 6) : -10;
  const genislik = harita.yol?.genislik ?? 7;
  liste.push({ id, ad: "Yeni eşya", konum: [Math.round((genislik / 2 + 1) * 10) / 10, 0, z], aci: 0, renk: "#a0703c", mesaj: "", puanlar: {} });
  return id;
}

/** Bir eşyanın kopyasını hemen arkasına ekler; yeni kimliği döner. */
export function esyaCogalt(harita: any, id: string): string | null {
  const liste: Esya[] = harita.esyalar || [];
  const i = liste.findIndex(e => e.id === id);
  if (i < 0) return null;
  const kopya: Esya = JSON.parse(JSON.stringify(liste[i]));
  kopya.id = benzersizKimlik(id, liste.map(e => e.id));
  kopya.konum = [kopya.konum[0], kopya.konum[1], kopya.konum[2] - 2];
  liste.splice(i + 1, 0, kopya);
  return kopya.id;
}

// ------------------------------------------------------------------ denetim
export interface Uyari { yer: string; metin: string }

/** Haritadaki eşyaların sorunları: kimlik kuralı, tekrar eden kimlik, eksik ad, bilinmeyen ölçek. */
export function esyaUyarilari(harita: any, olcekler: string[]): Uyari[] {
  const sonuc: Uyari[] = [];
  const gorulen = new Set<string>();
  for (const e of (harita?.esyalar || []) as Esya[]) {
    const yer = "Eşya " + (e.ad || e.id);
    if (!kimlikGecerli(e.id || "")) sonuc.push({ yer, metin: `Kimlik "${e.id}" yalnız küçük harf, rakam ve _ içermeli` });
    if (gorulen.has(e.id)) sonuc.push({ yer, metin: `"${e.id}" kimliği iki kez kullanılmış` });
    gorulen.add(e.id);
    if (!e.ad) sonuc.push({ yer, metin: "Adı boş (oyunda “[F] Al:” yazısında görünür)" });
    for (const o of Object.keys(e.puanlar || {})) if (olcekler.length && !olcekler.includes(o)) sonuc.push({ yer, metin: `Bilinmeyen ölçek: ${o}` });
  }
  return sonuc;
}

/** karakterler.json'daki kişilerin sorunları: kimlik kuralı, haritalarda olmayan kişi, Unreal yolu. */
export function kisiUyarilari(karakterler: any, npcIdleri: string[]): Uyari[] {
  const sonuc: Uyari[] = [];
  for (const [id, k] of Object.entries<any>(karakterler?.kisiler || {})) {
    const yer = "Kişi " + id;
    if (!kimlikGecerli(id)) sonuc.push({ yer, metin: "Kimlik yalnız küçük harf, rakam ve _ içermeli" });
    if (npcIdleri.length && !npcIdleri.includes(id)) sonuc.push({ yer, metin: "Hiçbir haritada bu kimlikte kişi yok" });
    for (const alan of ["unreal_govde", "unreal_anim_sinifi"]) {
      const s = unrealYoluSorunu(k?.[alan] || "");
      if (s) sonuc.push({ yer, metin: s });
    }
  }
  return sonuc;
}

/** Bütün haritalardaki kişi (npc) kimlikleri, harita adlarıyla. */
export function haritaKisileri(veriler: Record<string, any>): { id: string; ad: string; harita: string }[] {
  const sonuc: { id: string; ad: string; harita: string }[] = [];
  for (const [yol, v] of Object.entries(veriler)) {
    if (!yol.startsWith("haritalar/")) continue;
    for (const n of v?.npcler || []) sonuc.push({ id: n.id, ad: n.ad || n.id, harita: v.ad || yol });
  }
  return sonuc;
}

/** Dosyanın içeriğe göre türü: editör hangi sayfayı göstereceğini buna göre seçer. */
export type DosyaTuru = "karakterler" | "harita" | "diyalog" | "oyun" | "karakter_olusturma" | "diger";
export function dosyaTuru(yol: string): DosyaTuru {
  if (yol === "karakterler.json") return "karakterler";
  if (yol === "oyun.json") return "oyun";
  if (yol === "karakter_olusturma.json") return "karakter_olusturma";
  if (yol.startsWith("haritalar/")) return "harita";
  if (yol.startsWith("diyaloglar/")) return "diyalog";
  return "diger";
}
