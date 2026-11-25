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
/** Günlük programdaki işler (BICIM.md: kişide "program"). */
export const PROGRAM_ISLERI: [string, string][] = [["dolas", "Dolaşır"], ["bekle", "Bekler"], ["otur", "Oturur"]];
export interface ProgramDuragi { saat: number; is: string; yer?: [number, number]; yaricap?: number; aci?: number; [diger: string]: unknown }
/** Kişi nitelikleri (karakterler.json kisi_nitelikler; kişide "nitelikler" bunların üstüne yazılır): [alan, ad, birim]. */
export const KISI_NITELIKLERI: [string, string, string][] = [
  ["can", "Can", ""], ["hafif_darbe", "Hafif darbede kayıp", "can"], ["guclu_darbe", "Güçlü darbede kayıp", "can"],
  ["blok_hasar_carpani", "Gardda kayıp oranı", "×"], ["can_yenilenme", "Can yenilenmesi", "/sn"],
  ["can_yenilenme_gecikmesi", "Yenilenme gecikmesi", "sn"], ["kalkis_can_orani", "Kalkınca can oranı", "0–1"],
];

/** Program durağı ekler: son durağın 2 saat sonrası, alanın ortasında bekler. */
export function programDuragiEkle(n: Npc): void {
  const liste = ((n.program as ProgramDuragi[] | undefined) ||= []);
  const son = liste[liste.length - 1];
  const saat = son ? Math.min(23.5, (Number(son.saat) || 0) + 2) : 8;
  const yer = son?.yer ? [...son.yer] as [number, number] : n.alan?.merkez ? [n.alan.merkez[0], n.alan.merkez[1]] as [number, number] : [0, 0] as [number, number];
  liste.push({ saat, is: "bekle", yer });
}

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
    const prog = n.program as ProgramDuragi[] | undefined;
    if (prog !== undefined && !Array.isArray(prog)) sonuc.push({ yer, metin: "Günlük program bir liste olmalı" });
    (Array.isArray(prog) ? prog : []).forEach((p, i) => {
      const py = `${yer}, program ${i + 1}`;
      if (typeof p.saat !== "number" || p.saat < 0 || p.saat > 24) sonuc.push({ yer: py, metin: "Saat 0–24 arasında olmalı" });
      if (!PROGRAM_ISLERI.some(t => t[0] === p.is)) sonuc.push({ yer: py, metin: `Bilinmeyen iş: ${p.is}` });
    });
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

// ------------------------------------------------------------------ sandıklar ve görevler (harita içinde)
// BICIM.md: sandık { id, ad, konum, aci, icerik: { ad, aciklama, puanlar, mesaj }, model_govde?, model_kapak?,
// unreal_on_duzeltme?, kapak_mentesesi? [x,y,z] cm, kapak_ekseni? "roll"|"pitch", kapak_acisi? }.
// Görev { id, ad, aciklama, adimlar: [ { metin, tur, hedef } ] }; adım "tur:hedef" kararıyla tamamlanır, hedef boşsa herhangi biri.
export interface Sandik {
  id: string; ad: string; konum: [number, number, number]; aci: number;
  icerik: { ad: string; aciklama?: string; puanlar: Record<string, number>; mesaj?: string };
  [diger: string]: unknown;
}
export interface GorevAdimi { metin: string; tur: string; hedef: string }
export interface Gorev { id: string; ad: string; aciklama?: string; adimlar: GorevAdimi[]; [diger: string]: unknown }

/** Adım türleri (oyunun karar kaynakları) ve ekranda görünen adları. */
export const GOREV_TURLERI: [string, string][] = [
  ["diyalog", "Biriyle konuş"], ["esya", "Eşya al"], ["sandik", "Sandık aç"], ["kapi", "Kapı seç"], ["bitis", "Yolun sonuna var"],
];

/** Bir adım türü için haritadaki olası hedefler: [kimlik, görünen ad]. `bitis` hedef almaz. */
export function gorevHedefleri(harita: any, tur: string): [string, string][] {
  const ad = (x: any) => (x.ad && x.ad !== x.id ? `${x.ad} (${x.id})` : x.id);
  switch (tur) {
    case "diyalog": return (harita?.npcler || []).map((n: any) => [n.id, ad(n)]);
    case "esya": return (harita?.esyalar || []).map((e: any) => [e.id, ad(e)]);
    case "sandik": return (harita?.sandiklar || []).map((s: any) => [s.id, ad(s)]);
    case "kapi": return (harita?.kapilar || []).map((k: any) => [k.id, k.soru ? `${k.id}: ${k.soru}` : k.id]);
    default: return [];
  }
}

/** Haritadaki bir kimlik değişince görev adımlarındaki hedefi de günceller (aynı türde). */
export function gorevHedefiniYenile(harita: any, tur: string, eski: string, yeni: string): void {
  for (const g of harita?.gorevler || []) for (const a of g.adimlar || []) if (a.tur === tur && a.hedef === eski) a.hedef = yeni;
}

/** Haritaya yeni bir sandık ekler (yolun kenarına) ve kimliğini döner. */
export function sandikEkle(harita: any): string {
  const liste: Sandik[] = (harita.sandiklar ||= []);
  const id = benzersizKimlik("sandik", liste.map(s => s.id));
  const son = liste[liste.length - 1];
  const z = son ? Math.round((son.konum?.[2] ?? 0) - 8) : (harita.baslangic?.konum?.[2] ?? 0) - 10;
  const genislik = harita.yol?.genislik ?? 7;
  liste.push({ id, ad: "Yeni sandık", konum: [-Math.round((genislik / 2 + 1.5) * 10) / 10, 0, z], aci: 90,
    icerik: { ad: "", aciklama: "", puanlar: {}, mesaj: "" } });
  return id;
}

/** Bir sandığın kopyasını hemen arkasına ekler; yeni kimliği döner. */
export function sandikCogalt(harita: any, id: string): string | null {
  const liste: Sandik[] = harita.sandiklar || [];
  const i = liste.findIndex(s => s.id === id);
  if (i < 0) return null;
  const kopya: Sandik = JSON.parse(JSON.stringify(liste[i]));
  kopya.id = benzersizKimlik(id, liste.map(s => s.id));
  kopya.konum = [kopya.konum[0], kopya.konum[1], kopya.konum[2] - 2];
  liste.splice(i + 1, 0, kopya);
  return kopya.id;
}

/** Haritaya boş bir görev ekler (bir adımla) ve kimliğini döner. */
export function gorevEkle(harita: any): string {
  const liste: Gorev[] = (harita.gorevler ||= []);
  const id = benzersizKimlik("gorev", liste.map(g => g.id));
  liste.push({ id, ad: "Yeni görev", aciklama: "", adimlar: [{ metin: "", tur: "diyalog", hedef: "" }] });
  return id;
}

/** Sandıkların sorunları: kimlik, tekrar, eksik ad/içerik, bilinmeyen ölçek, kapak ekseni. */
export function sandikUyarilari(harita: any, olcekler: string[]): Uyari[] {
  const sonuc: Uyari[] = [];
  const gorulen = new Set<string>();
  for (const s of (harita?.sandiklar || []) as Sandik[]) {
    const yer = "Sandık " + (s.ad || s.id);
    if (!kimlikGecerli(s.id || "")) sonuc.push({ yer, metin: `Kimlik "${s.id}" yalnız küçük harf, rakam ve _ içermeli` });
    if (gorulen.has(s.id)) sonuc.push({ yer, metin: `"${s.id}" kimliği iki kez kullanılmış` });
    gorulen.add(s.id);
    if (!s.icerik?.ad) sonuc.push({ yer, metin: "İçindeki eşyanın adı boş (açılınca çantaya bu ad girer)" });
    for (const o of Object.keys(s.icerik?.puanlar || {})) if (olcekler.length && !olcekler.includes(o)) sonuc.push({ yer, metin: `Bilinmeyen ölçek: ${o}` });
    if (s.kapak_ekseni !== undefined && s.kapak_ekseni !== "roll" && s.kapak_ekseni !== "pitch") sonuc.push({ yer, metin: `Kapak ekseni "roll" ya da "pitch" olmalı` });
  }
  return sonuc;
}

/** Görevlerin sorunları: kimlik, adımsız görev, bilinmeyen tür, haritada olmayan hedef. */
export function gorevUyarilari(harita: any): Uyari[] {
  const sonuc: Uyari[] = [];
  const gorulen = new Set<string>();
  for (const g of (harita?.gorevler || []) as Gorev[]) {
    const yer = "Görev " + (g.ad || g.id);
    if (!kimlikGecerli(g.id || "")) sonuc.push({ yer, metin: `Kimlik "${g.id}" yalnız küçük harf, rakam ve _ içermeli` });
    if (gorulen.has(g.id)) sonuc.push({ yer, metin: `"${g.id}" kimliği iki kez kullanılmış` });
    gorulen.add(g.id);
    if (!(g.adimlar || []).length) sonuc.push({ yer, metin: "Hiç adımı yok" });
    (g.adimlar || []).forEach((a, i) => {
      const ay = `${yer}, adım ${i + 1}`;
      if (!GOREV_TURLERI.some(t => t[0] === a.tur)) { sonuc.push({ yer: ay, metin: `Bilinmeyen tür: ${a.tur}` }); return; }
      if (!a.metin) sonuc.push({ yer: ay, metin: "Yazısı boş (oyuncu görev listesinde bunu görür)" });
      if (a.tur === "bitis" && a.hedef) sonuc.push({ yer: ay, metin: "“Yolun sonu” adımının hedefi olmaz" });
      if (a.tur !== "bitis" && a.hedef && !gorevHedefleri(harita, a.tur).some(h => h[0] === a.hedef))
        sonuc.push({ yer: ay, metin: `Haritada "${a.hedef}" bulunamadı` });
    });
  }
  return sonuc;
}

// ------------------------------------------------------------------ mekânlar (harita içinde)
// BICIM.md (2026-11-18): gecisler { id, metin, konum [x,y,z], hedef [x,y,z], hedef_aci }; ic_mekanlar { id, ad, seviye, konum, aci,
// sil_kutu [x1,z1,x2,z2] }; zeminler / gorunmez_duvarlar / serpme_yok { merkez [x,z], boyut [en,boy] (+ zeminde yukseklik, renk,
// unreal_klasor, unreal_karo) }. Oyunun kodundan (HikayeOyunModu.cpp): mesaleler { tur: "direk"|"duvar", konum [x,z], yukseklik?, aci? },
// mesale_ayari { guc (kandela), yaricap (m) }.
export interface Gecis { id: string; metin: string; konum: [number, number, number]; hedef: [number, number, number]; hedef_aci?: number; [d: string]: unknown }

/** Bir kapı çifti ekler: giriş (yolun yanında) ve dönüş (hedefte); kimlikleri gir_NN / cik_NN. Girişin kimliğini döner. */
export function gecisCiftiEkle(harita: any, ad = "Yeni yer"): string {
  const liste: Gecis[] = (harita.gecisler ||= []);
  const kume = new Set(liste.map(g => g.id));
  let no = 0;
  while (kume.has(`gir_${String(no).padStart(2, "0")}`) || kume.has(`cik_${String(no).padStart(2, "0")}`)) no++;
  const n = String(no).padStart(2, "0");
  const b = harita.baslangic?.konum ?? [0, 0, 0];
  const kapi: [number, number, number] = [Math.round((b[0] + 3) * 10) / 10, 0, Math.round((b[2] - 3) * 10) / 10];
  // iç mekânın yeri: varsayılan olarak köyün çok uzağı (oyun iç sahneleri uzağa koyar)
  const ic: [number, number, number] = [-60 - no * 10, 0.05, -1200];
  liste.push({ id: `gir_${n}`, metin: `Gir: ${ad}`, konum: kapi, hedef: [ic[0] - 0.9, ic[1], ic[2]], hedef_aci: 90 });
  liste.push({ id: `cik_${n}`, metin: "Dışarı çık", konum: ic, hedef: [kapi[0] + 0.9, 0.05, kapi[2]], hedef_aci: -90 });
  return `gir_${n}`;
}

/** Bir geçişin dönüş geçişi: konumu bu geçişin hedefine 3 m'den yakın olan ilk geçiş. */
export function donusGecisi(harita: any, g: Gecis): Gecis | undefined {
  if (!Array.isArray(g.hedef)) return undefined;
  return (harita?.gecisler || []).find((x: Gecis) => x !== g && Array.isArray(x.konum)
    && Math.hypot(x.konum[0] - g.hedef[0], x.konum[2] - g.hedef[2]) < 3);
}

/** Mekânların sorunları: kimlik, eksik yazı/hedef, dönüşü olmayan geçiş, boyutsuz alan, yanlış seviye yolu, bilinmeyen meşale türü. */
export function mekanUyarilari(harita: any): Uyari[] {
  const sonuc: Uyari[] = [];
  const gorulen = new Set<string>();
  for (const g of (harita?.gecisler || []) as Gecis[]) {
    const yer = "Geçiş " + (g.metin || g.id);
    if (!kimlikGecerli(g.id || "")) sonuc.push({ yer, metin: `Kimlik "${g.id}" yalnız küçük harf, rakam ve _ içermeli` });
    if (gorulen.has(g.id)) sonuc.push({ yer, metin: `"${g.id}" kimliği iki kez kullanılmış` });
    gorulen.add(g.id);
    if (!g.metin) sonuc.push({ yer, metin: "Yazısı boş (oyunda “[F] …” yazısı)" });
    if (!Array.isArray(g.konum) || g.konum.length !== 3) sonuc.push({ yer, metin: "Kapının yeri yok" });
    if (!Array.isArray(g.hedef) || g.hedef.length !== 3) sonuc.push({ yer, metin: "Gidilecek yer (hedef) yok" });
    else if (!donusGecisi(harita, g)) sonuc.push({ yer, metin: "Varılan yerde geri dönüş kapısı yok (oyuncu orada kalır)" });
  }
  const icler = new Set<string>();
  for (const im of harita?.ic_mekanlar || []) {
    const yer = "İç mekân " + (im.ad || im.id);
    if (!kimlikGecerli(im.id || "")) sonuc.push({ yer, metin: `Kimlik "${im.id}" yalnız küçük harf, rakam ve _ içermeli` });
    if (icler.has(im.id)) sonuc.push({ yer, metin: `"${im.id}" kimliği iki kez kullanılmış` });
    icler.add(im.id);
    if (!im.seviye) sonuc.push({ yer, metin: "Unreal seviyesi boş" });
    else { const s = unrealYoluSorunu(im.seviye); if (s) sonuc.push({ yer, metin: s }); }
  }
  const adlar: Record<string, string> = { zeminler: "Zemin", gorunmez_duvarlar: "Görünmez duvar", serpme_yok: "Ot serpilmeyen alan" };
  for (const liste of Object.keys(adlar)) (harita?.[liste] || []).forEach((r: any, i: number) => {
    const yer = `${adlar[liste]} ${i + 1}`;
    if (!Array.isArray(r.merkez) || r.merkez.length !== 2) sonuc.push({ yer, metin: "Merkezi yok" });
    if (!Array.isArray(r.boyut) || r.boyut.length !== 2 || r.boyut[0] <= 0 || r.boyut[1] <= 0) sonuc.push({ yer, metin: "Eni ve boyu sıfırdan büyük olmalı" });
    if (r.unreal_klasor) { const s = unrealYoluSorunu(r.unreal_klasor); if (s) sonuc.push({ yer, metin: s }); }
  });
  (harita?.mesaleler || []).forEach((m: any, i: number) => {
    if (m.tur !== undefined && m.tur !== "direk" && m.tur !== "duvar") sonuc.push({ yer: `Meşale ${i + 1}`, metin: `Bilinmeyen tür: ${m.tur}` });
    if (!Array.isArray(m.konum) || m.konum.length !== 2) sonuc.push({ yer: `Meşale ${i + 1}`, metin: "Yeri [x, z] olmalı" });
  });
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
export type DosyaTuru = "karakterler" | "harita" | "diyalog" | "oyun" | "karakter_olusturma" | "arayuz" | "diger";
export function dosyaTuru(yol: string): DosyaTuru {
  if (yol === "karakterler.json") return "karakterler";
  if (yol === "oyun.json") return "oyun";
  if (yol === "arayuz.json") return "arayuz";
  if (yol === "karakter_olusturma.json") return "karakter_olusturma";
  if (yol.startsWith("haritalar/")) return "harita";
  if (yol.startsWith("diyaloglar/")) return "diyalog";
  return "diger";
}
