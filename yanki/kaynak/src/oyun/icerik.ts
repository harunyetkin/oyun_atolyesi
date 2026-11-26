// Oyunun içerik dosyası (yanki/icerik/yanki.json): ayarlar ve el yapımı bölümler. Biçim: yanki/icerik/BICIM.md.
// Bu dosya Oyun Atölyesi'nden düzenlenebilsin diye ayarlar ve bölümler koddan ayrıdır.
// Okuma sırası (main.ts): tek dosyalık Yanki.html'e gömülü `window.YANKI_ICERIK` → yayındaki `icerik.json` → koddaki varsayılanlar.
// Eksik ya da hatalı alan varsayılana düşer; oyun hiçbir durumda içerik yüzünden açılamaz hâle gelmez.
import { AYAR, H, Oyun, type Bolum, type Sivri } from "./dunya";

export const ICERIK_SURUMU = 1;

export interface Icerik { surum: number; ayarlar?: Record<string, unknown>; bolumler?: unknown[] }

/** Koddaki varsayılan ayarların kopyası (içerik uygulanmadan önce; testler ve sıfırlama için). */
export const VARSAYILAN_AYAR = JSON.parse(JSON.stringify(AYAR)) as typeof AYAR;

const sayiMi = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** İçerikteki ayarları AYAR'a yazar. Yalnız bilinen ve türü uyan alanlar alınır (sayı, iki sayılı aralık, sayılı alt nesne).
 *  Dönüş: alınmayan alanların adları (uyarı için). */
export function ayarlariUygula(ayarlar: Record<string, unknown> | undefined): string[] {
  const atlanan: string[] = [];
  const hedef = AYAR as unknown as Record<string, unknown>;
  // önce varsayılana dön (aynı sayfada ikinci kez uygulanırsa eski değer kalmasın)
  for (const [k, v] of Object.entries(VARSAYILAN_AYAR)) hedef[k] = JSON.parse(JSON.stringify(v));
  if (!ayarlar || typeof ayarlar !== "object") return atlanan;
  for (const [k, v] of Object.entries(ayarlar)) {
    if (k.startsWith("_")) continue;   // açıklama notları
    const eski = hedef[k];
    if (eski === undefined) { atlanan.push(k); continue; }
    if (sayiMi(eski)) { if (sayiMi(v)) hedef[k] = v; else atlanan.push(k); continue; }
    if (Array.isArray(eski)) {
      if (Array.isArray(v) && v.length === 2 && v.every(sayiMi) && v[0] <= v[1]) hedef[k] = [v[0], v[1]]; else atlanan.push(k);
      continue;
    }
    if (eski && typeof eski === "object" && v && typeof v === "object") {
      const ic = { ...(eski as Record<string, number>) };
      for (const [a, b] of Object.entries(v as Record<string, unknown>)) {
        if (a in ic && sayiMi(b)) ic[a] = b; else atlanan.push(`${k}.${a}`);
      }
      hedef[k] = ic;
      continue;
    }
    atlanan.push(k);
  }
  return atlanan;
}

const sinirla = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Ham bölüm listesini oyunun kullanacağı biçime getirir: hatalı bölüm atlanır, sayılar sınırlanır, noktalar sıralanır.
 *  Dönüş: geçerli bölümler ve uyarılar. */
export function bolumleriDogrula(ham: unknown[] | undefined): { bolumler: Bolum[]; uyarilar: string[] } {
  const bolumler: Bolum[] = [], uyarilar: string[] = [];
  if (!Array.isArray(ham)) return { bolumler, uyarilar };
  const kimlikler = new Set<string>();
  ham.forEach((h: any, i) => {
    const ad = typeof h?.ad === "string" && h.ad ? h.ad : `Bölüm ${i + 1}`;
    const id = typeof h?.id === "string" && /^[a-z0-9_]+$/.test(h.id) ? h.id : "";
    if (!id || kimlikler.has(id)) { uyarilar.push(`${ad}: kimlik eksik, hatalı ya da tekrar ediyor; atlandı`); return; }
    if (!sayiMi(h.uzunluk) || h.uzunluk < 500) { uyarilar.push(`${ad}: uzunluk en az 500 olmalı; atlandı`); return; }
    const duvar: Bolum["duvar"] = {};
    const d = h.duvar ?? {};
    if (Array.isArray(d.noktalar) && d.noktalar.length >= 2) {
      duvar.noktalar = d.noktalar
        .filter((n: any) => sayiMi(n?.x) && sayiMi(n?.ust) && sayiMi(n?.alt))
        .map((n: any) => {
          const ust = sinirla(n.ust, 0, H - 60), alt = sinirla(n.alt, ust + 60, H);
          return { x: n.x, ust, alt };
        })
        .sort((a: any, b: any) => a.x - b.x);
      if (duvar.noktalar!.length < 2) { uyarilar.push(`${ad}: duvarın en az 2 geçerli noktası olmalı; atlandı`); return; }
    } else if (sayiMi(d.tohum)) {
      duvar.tohum = Math.floor(d.tohum);
    } else { uyarilar.push(`${ad}: duvar ne noktalı ne tohumlu; atlandı`); return; }
    const sivriler: Sivri[] = (Array.isArray(h.sivriler) ? h.sivriler : [])
      .filter((s: any) => sayiMi(s?.x) && sayiMi(s?.boy) && sayiMi(s?.taban))
      .map((s: any) => ({ x: s.x, ust: !!s.ust, boy: sinirla(s.boy, 10, 700), taban: sinirla(s.taban, 10, 400) }));
    const tehlikeler = (Array.isArray(h.tehlikeler) ? h.tehlikeler : [])
      .filter((t: any) => (t?.tur === "ag" || t?.tur === "damla") && sayiMi(t.x))
      .map((t: any) => (sayiMi(t.y) ? { tur: t.tur, x: t.x, y: sinirla(t.y, 0, H) } : { tur: t.tur, x: t.x }));
    const bocekler = (Array.isArray(h.bocekler) ? h.bocekler : [])
      .filter((b: any) => sayiMi(b?.x))
      .map((b: any) => (sayiMi(b.y) ? { x: b.x, y: sinirla(b.y, 0, H) } : { x: b.x }));
    kimlikler.add(id);
    bolumler.push({ id, ad, aciklama: typeof h.aciklama === "string" ? h.aciklama : undefined, uzunluk: h.uzunluk, duvar, sivriler, tehlikeler, bocekler });
  });
  return { bolumler, uyarilar };
}

/** İçeriği uygular: ayarlar AYAR'a yazılır, bölümler doğrulanır. */
export function icerigiUygula(ic: Icerik | null | undefined): { bolumler: Bolum[]; uyarilar: string[] } {
  if (!ic || typeof ic !== "object") { ayarlariUygula(undefined); return { bolumler: [], uyarilar: [] }; }
  const uyarilar: string[] = [];
  if (ic.surum !== ICERIK_SURUMU) uyarilar.push(`içerik sürümü ${ic.surum}; oyun ${ICERIK_SURUMU} bekliyor (bilinen alanlar yine okunur)`);
  const atlanan = ayarlariUygula(ic.ayarlar);
  if (atlanan.length) uyarilar.push(`bilinmeyen ya da hatalı ayar: ${atlanan.join(", ")}`);
  const b = bolumleriDogrula(ic.bolumler);
  return { bolumler: b.bolumler, uyarilar: [...uyarilar, ...b.uyarilar] };
}

/** Bölümün en dar yerleri: her 10 birimde (sivriler dahil) serbest geçit ölçülür. `esik`ten dar yerler yarasanın
 *  geçemeyeceği kadar dar sayılır (Oyun Atölyesi'nde kırmızı gösterilecek). */
export function gecitDenetimi(b: Bolum, esik = 150): { enDar: number; enDarX: number; darYerler: number[] } {
  const o = new Oyun(1);
  o.bolum = b;
  o.sifirla();
  let enDar = Infinity, enDarX = 0;
  const darYerler: number[] = [];
  for (let x = 0; x <= b.uzunluk; x += 10) {
    const [u, a] = o.serbestAralik(x);
    const g = a - u;
    if (g < enDar) { enDar = g; enDarX = x; }
    if (g < esik) darYerler.push(x);
  }
  return { enDar, enDarX, darYerler };
}
