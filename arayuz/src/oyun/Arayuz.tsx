// arayuz.json düzenleyicisi: oyunun menü ve ekran görünüşü (renkler, yazı tipleri, logo, menü müziği, ana menü ışığı)
// ve Yapımcılar ekranı. Renk/yazı alanları sema.ts'deki ARAYUZ_GRUPLARI'ndan çizilir; yapımcılar listesi burada.
import { ArrowDown, ArrowUp, Plus, Trash2, Clapperboard } from "lucide-react";
import { useOyun } from "./durum";
import { Kart } from "../editor/Ortak";
import { GrupKarti } from "./GrupKarti";
import { YaziAlani } from "./girisler";
import { ARAYUZ_GRUPLARI, tanimliYollar } from "./sema";

export interface YapimciBolumu { baslik: string; satirlar: string[] }

/** "Ad | açıklama" satırını iki sütuna ayırır (açıklama yoksa ikinci boş). */
export function satirAyir(satir: string): [string, string] {
  const i = satir.indexOf("|");
  return i < 0 ? [satir.trim(), ""] : [satir.slice(0, i).trim(), satir.slice(i + 1).trim()];
}
/** İki sütunu oyunun beklediği "Ad | açıklama" biçimine birleştirir. */
export function satirBirlestir(sol: string, sag: string): string {
  return sag.trim() ? `${sol.trim()} | ${sag.trim()}` : sol.trim();
}
/** Listede bir öğeyi yukarı (-1) ya da aşağı (+1) taşır; sınırdaysa olduğu gibi bırakır. */
export function tasi<T>(l: T[], i: number, yon: -1 | 1): T[] {
  const j = i + yon;
  if (j < 0 || j >= l.length) return l;
  const y = [...l];
  [y[i], y[j]] = [y[j], y[i]];
  return y;
}

function YapimcilarKarti({ dosya, liste }: { dosya: string; liste: YapimciBolumu[] }) {
  const degistir = useOyun.getState().degistir;
  const yaz = (fn: (l: YapimciBolumu[]) => YapimciBolumu[], anahtar?: string) =>
    degistir(dosya, d => { d.yapimcilar = fn(Array.isArray(d.yapimcilar) ? d.yapimcilar.map((b: YapimciBolumu) => ({ ...b, satirlar: [...(b.satirlar || [])] })) : []); }, anahtar);
  return (
    <Kart baslik={`Yapımcılar ekranı (${liste.length} bölüm)`} ikon={<Clapperboard size={14} />}>
      <div className="grup-aciklama" style={{ gridColumn: "1 / -1" }}>
        Ana menüdeki Yapımcılar ekranı. Her bölümün bir başlığı ve satırları var; satır iki sütundur (solda iş ya da eser, sağda kişi ya da kaynak).
        Sağ sütun boş bırakılırsa satır tek sütun yazılır.
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 10 }} data-testid="yapimcilar">
        {liste.map((b, i) => (
          <div key={i} className="liste-karti" data-testid={"yapimci-bolum-" + i}>
            <div className="liste-karti-baslik">
              <div style={{ flex: 1 }}><YaziAlani deger={b.baslik} ipucu="Bölüm başlığı (ör. Animasyonlar)" testId={"yapimci-baslik-" + i}
                degisti={v => yaz(l => { l[i].baslik = v; return l; })} /></div>
              <button className="ikon-dugme" title="Yukarı" disabled={i === 0} onClick={() => yaz(l => tasi(l, i, -1))}><ArrowUp size={13} /></button>
              <button className="ikon-dugme" title="Aşağı" disabled={i === liste.length - 1} onClick={() => yaz(l => tasi(l, i, 1))}><ArrowDown size={13} /></button>
              <button className="ikon-dugme" title="Bölümü sil" data-testid={"yapimci-bolum-sil-" + i} onClick={() => yaz(l => l.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 8px" }}>
              {(b.satirlar || []).map((s, k) => {
                const [sol, sag] = satirAyir(s);
                return (
                  <div key={k} className="puan-satiri">
                    <div style={{ flex: 1 }}><YaziAlani deger={sol} ipucu="İş ya da eser" testId={`yapimci-sol-${i}-${k}`}
                      degisti={v => yaz(l => { l[i].satirlar[k] = satirBirlestir(v, sag); return l; })} /></div>
                    <div style={{ flex: 1 }}><YaziAlani deger={sag} ipucu="Kişi ya da kaynak" testId={`yapimci-sag-${i}-${k}`}
                      degisti={v => yaz(l => { l[i].satirlar[k] = satirBirlestir(sol, v); return l; })} /></div>
                    <button className="ikon-dugme" title="Yukarı" disabled={k === 0} onClick={() => yaz(l => { l[i].satirlar = tasi(l[i].satirlar, k, -1); return l; })}><ArrowUp size={12} /></button>
                    <button className="ikon-dugme" title="Aşağı" disabled={k === b.satirlar.length - 1} onClick={() => yaz(l => { l[i].satirlar = tasi(l[i].satirlar, k, 1); return l; })}><ArrowDown size={12} /></button>
                    <button className="ikon-dugme" title="Satırı sil" onClick={() => yaz(l => { l[i].satirlar.splice(k, 1); return l; })}><Trash2 size={12} /></button>
                  </div>
                );
              })}
              <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid={"yapimci-satir-ekle-" + i}
                onClick={() => yaz(l => { l[i].satirlar.push("Yeni satır"); return l; })}><Plus size={13} /> Satır ekle</button>
            </div>
          </div>
        ))}
        <button className="dugme" style={{ alignSelf: "flex-start" }} data-testid="yapimci-bolum-ekle"
          onClick={() => yaz(l => [...l, { baslik: "Yeni bölüm", satirlar: [] }])}><Plus size={14} /> Bölüm ekle</button>
      </div>
    </Kart>
  );
}

export function ArayuzSayfasi({ dosya }: { dosya: string }) {
  const veri = useOyun(o => o.veri[dosya]);
  const tanimli = tanimliYollar(ARAYUZ_GRUPLARI);
  return (
    <div className="icerik-sayfa" data-testid="arayuz-sayfasi">
      <p className="sayfa-aciklama">Oyunun menülerinin ve ekran yazılarının görünüşü. Boş bırakılan her şey oyunun kendi varsayılanını kullanır.
        Kaydet, oyunu yeniden başlat: derleme gerekmez.</p>
      <div className="kartlar">
        {ARAYUZ_GRUPLARI.map(g => <GrupKarti key={g.baslik} grup={g} dosya={dosya} onEk="" kok={veri || {}} tanimli={tanimli} />)}
        <YapimcilarKarti dosya={dosya} liste={Array.isArray(veri?.yapimcilar) ? veri.yapimcilar : []} />
      </div>
    </div>
  );
}
