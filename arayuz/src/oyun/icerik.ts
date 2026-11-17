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
  puanlar: Record<string, number>; aciklama?: string; eldeki_konum?: [number, number, number]; eldeki_aci?: [number, number, number];
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

// ------------------------------------------------------------------ kişiler (harita içinde, npcler)
// BICIM.md: kişi { id, ad, gorunum, alan: { merkez: [x, z], yaricap }, hiz, diyalog, selamlar, selamlasma,
// tepkiler, davranis, savas_tavri, durma_mesafesi, serit_y, serit_x_min/max (cm, Unreal ekseni), unreal_govde }.
export interface Npc {
  id: string; ad?: string; gorunum?: any;
  alan?: { merkez: [number, number]; yaricap: number };
  hiz?: number; diyalog?: string; selamlar?: string[];
  selamlasma?: string; tepkiler?: Record<string, string[]>; davranis?: string; savas_tavri?: string;
  durma_mesafesi?: number; serit_y?: number; serit_x_min?: number; serit_x_max?: number; unreal_govde?: string;
  [diger: string]: unknown;
}

/** Seçmeli alanların değerleri (oyunun okuduğu yazımlar) ve ekranda görünen adları. İlk değer oyunun varsayılanıdır. */
export const DAVRANISLAR: [string, string, string][] = [
  ["dolas", "Dolaşır", "Alanının içinde rastgele dolaşır."],
  ["bekle", "Yerinde bekler", "Alanın ortasında durur, yanına gelene döner."],
  ["otur", "Oturur", "Alanın ortasına en yakın boş banka oturur (oturma animasyonu gerekir)."],
  ["yol", "Yolda yürür", "Bir yaya şeridi boyunca ileri geri yürür."],
];
export const SELAMLASMALAR: [string, string][] = [["tokalas", "Tokalaşır"], ["el_salla", "El sallar"], ["yok", "Selamlaşmaz"]];
export const SAVAS_TAVIRLARI: [string, string, string][] = [
  ["karisik", "Karışık", "Kişiye göre (ama hep aynı) bir tavır seçilir."],
  ["kac", "Kaçar", "Saldırıya uğrayınca uzaklaşır."],
  ["savun", "Savunur", "Gard alır, bloklar, geri çekilir."],
  ["karsilik", "Karşılık verir", "Yumrukla karşılık verir."],
];
export const TEPKI_TURLERI: [string, string][] = [["carpma", "Çarpınca"], ["itilme", "İtilince"], ["vurulma", "Vurulunca"]];
/** Oyunun varsayılanları (Konusan.cpp): yarıçap 6 m, hız 1.2 m/sn (0–3), durma mesafesi 3 m, şerit merkez ±20 m. */
export const NPC_VARSAYILAN = { yaricap: 6, hiz: 1.2, hizEnFazla: 3, durma: 3, seritYari: 20 };

/** Godot konumu (x, z; metre) → Unreal (X ileri, Y sağ; cm). FIcerik::GodotKonum ile aynı. */
export const unrealX = (z: number) => -z * 100;
export const unrealY = (x: number) => x * 100;

/** "yol" davranışındaki kişinin yaya şeridi, metre ve kroki ekseninde (x: yana, zBas/zSon: yol boyunca).
 *  Alanlar yoksa oyunun varsayılanı: alan merkezinden geçen, ±20 m'lik şerit. */
export function npcSeridi(n: Npc): { x: number; zBas: number; zSon: number } {
  const [mx, mz] = n.alan?.merkez ?? [0, 0];
  const y = typeof n.serit_y === "number" ? n.serit_y : unrealY(mx);
  const xMin = typeof n.serit_x_min === "number" ? n.serit_x_min : unrealX(mz) - NPC_VARSAYILAN.seritYari * 100;
  const xMax = typeof n.serit_x_max === "number" ? n.serit_x_max : unrealX(mz) + NPC_VARSAYILAN.seritYari * 100;
  return { x: y / 100, zBas: -xMin / 100, zSon: -xMax / 100 };
}

/** Haritaya yeni bir kişi ekler (yolun yanına, sonuncunun biraz ilerisine) ve kimliğini döner. */
export function npcEkle(harita: any): string {
  const liste: Npc[] = (harita.npcler ||= []);
  const id = benzersizKimlik("kisi", liste.map(n => n.id));
  const son = liste[liste.length - 1];
  // Sonuncunun 12 m ilerisi; yolun sonuna yaklaşırsa başa yakın bir yere (yol -z yönünde ilerler)
  const sinir = (harita.bitis?.z ?? -(harita.yol?.uzunluk ?? 120)) + 15;
  let z = son?.alan?.merkez ? Math.round(son.alan.merkez[1] - 12) : -20;
  if (z < sinir) z = -20;
  const genislik = harita.yol?.genislik ?? 7;
  liste.push({ id, ad: "Yeni kişi", alan: { merkez: [Math.round(genislik / 2 + 3), z], yaricap: 5 }, hiz: 1.2, diyalog: "", selamlar: [], selamlasma: "yok" });
  return id;
}

/** Bir kişinin kopyasını hemen arkasına ekler (alanı biraz ileride); yeni kimliği döner. */
export function npcCogalt(harita: any, id: string): string | null {
  const liste: Npc[] = harita.npcler || [];
  const i = liste.findIndex(n => n.id === id);
  if (i < 0) return null;
  const kopya: Npc = JSON.parse(JSON.stringify(liste[i]));
  // "gezgin_1" → "gezgin_3" (gezgin_2 varsa); "yolcu" → "yolcu_2"
  const taban = id.replace(/_\d+$/, "") || id, kume = new Set(liste.map(n => n.id));
  let no = 2;
  while (kume.has(`${taban}_${no}`)) no++;
  kopya.id = `${taban}_${no}`;
  if (kopya.alan?.merkez) kopya.alan.merkez = [kopya.alan.merkez[0], kopya.alan.merkez[1] - 4];
  liste.splice(i + 1, 0, kopya);
  return kopya.id;
}

/** Haritadaki kişilerin sorunları. `diyaloglar`: klasördeki diyalog dosyaları (boşsa denetlenmez). */
export function npcUyarilari(harita: any, diyaloglar: string[]): Uyari[] {
  const sonuc: Uyari[] = [];
  const gorulen = new Set<string>();
  const secenekte = (liste: [string, ...string[]][], v: unknown) => v === undefined || v === "" || liste.some(s => s[0] === v);
  for (const n of (harita?.npcler || []) as Npc[]) {
    const yer = "Kişi " + (n.ad || n.id);
    if (!kimlikGecerli(n.id || "")) sonuc.push({ yer, metin: `Kimlik "${n.id}" yalnız küçük harf, rakam ve _ içermeli` });
    if (gorulen.has(n.id)) sonuc.push({ yer, metin: `"${n.id}" kimliği iki kez kullanılmış` });
    gorulen.add(n.id);
    if (!n.alan?.merkez) sonuc.push({ yer, metin: "Dolaşma alanı yok (kişi haritanın ortasında durur)" });
    if (typeof n.hiz === "number" && (n.hiz < 0 || n.hiz > NPC_VARSAYILAN.hizEnFazla)) sonuc.push({ yer, metin: `Hız 0–${NPC_VARSAYILAN.hizEnFazla} m/sn arasında olmalı (oyun kırpar)` });
    if (n.diyalog && diyaloglar.length && !diyaloglar.includes(n.diyalog)) sonuc.push({ yer, metin: `Konuşma dosyası bulunamadı: ${n.diyalog}` });
    if (!secenekte(DAVRANISLAR, n.davranis)) sonuc.push({ yer, metin: `Bilinmeyen davranış: ${n.davranis}` });
    if (!secenekte(SELAMLASMALAR, n.selamlasma)) sonuc.push({ yer, metin: `Bilinmeyen selamlaşma: ${n.selamlasma}` });
    if (!secenekte(SAVAS_TAVIRLARI, n.savas_tavri)) sonuc.push({ yer, metin: `Bilinmeyen saldırı tavrı: ${n.savas_tavri}` });
    const s = unrealYoluSorunu(n.unreal_govde || "");
    if (s) sonuc.push({ yer, metin: "Beden yolu: " + s });
    if (n.davranis === "yol" && typeof n.serit_x_min === "number" && typeof n.serit_x_max === "number" && n.serit_x_min >= n.serit_x_max)
      sonuc.push({ yer, metin: "Yaya şeridinin başı sonundan önce olmalı" });
  }
  const k = harita?.kalabalik;
  if (k) {
    if (k.klasor) { const s = unrealYoluSorunu(k.klasor); if (s) sonuc.push({ yer: "Kalabalık", metin: s }); }
    if (k.diyalog && diyaloglar.length && !diyaloglar.includes(k.diyalog)) sonuc.push({ yer: "Kalabalık", metin: `Konuşma dosyası bulunamadı: ${k.diyalog}` });
  }
  return sonuc;
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
