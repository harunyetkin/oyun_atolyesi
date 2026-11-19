// Harita → Sandıklar ve Harita → Görevler sayfaları. Biçim: hikaye_oyun/icerik/BICIM.md.
// Görevlerin içeriği (hangi görev, ne anlatır) Harun'undur; burası yalnızca düzenleme aracıdır.
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, Box, Copy, Flag, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useOyun } from "./durum";
import {
  GOREV_TURLERI, gorevEkle, gorevHedefiniYenile, gorevHedefleri, gorevUyarilari, kimlikGecerli, sandikCogalt, sandikEkle,
  sandikUyarilari, type Gorev, type GorevAdimi, type Sandik,
} from "./icerik";
import { KimlikGiris, PuanDuzenleyici, SayiAlani, SecimAlani, Uyarilar, VektorAlani, YaziAlani } from "./girisler";
import { Kroki } from "./Kroki";

/** Sandığın içindeki eşyanın bir alanını yazar (icerik yoksa oluşturur). */
function icerikYaz(s: Sandik, alan: "ad" | "aciklama" | "mesaj", v: string) {
  if (!s.icerik) s.icerik = { ad: "", puanlar: {} };
  s.icerik[alan] = v;
}

/** Seçili kart görünür alana kaysın. */
function useSeciliyeKay(veriAdi: string) {
  const secili = useOyun(o => o.secili);
  const kap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (secili) kap.current?.querySelector(`[${veriAdi}="${CSS.escape(secili)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [secili, veriAdi]);
  return { secili, kap };
}

// ================================================================== sandıklar
export function SandiklarListesi({ dosya, harita, olcekler }: { dosya: string; harita: any; olcekler: { id: string; ad: string }[] }) {
  const { degistir, sec } = useOyun.getState();
  const { secili, kap } = useSeciliyeKay("data-sandik");
  const sandiklar: Sandik[] = harita?.sandiklar || [];
  const uyarilar = sandikUyarilari(harita, olcekler.map(o => o.id));
  const sDegistir = (id: string, fn: (s: Sandik) => void, anahtar?: string) =>
    degistir(dosya, d => { const s = (d.sandiklar || []).find((x: Sandik) => x.id === id); if (s) fn(s); }, anahtar);
  /** İsteğe bağlı alan: boşsa silinir (oyun varsayılanı). */
  const secimli = (id: string, alan: string, v: unknown, anahtar?: string) =>
    sDegistir(id, s => { if (v === undefined || v === "") delete s[alan]; else s[alan] = v; }, anahtar);
  return <>
    <p className="sayfa-aciklama">Açılabilir sandıklar. Oyuncu açınca içindeki eşya çantaya girer, mesaj ekranda görünür ve puanlar
      “sandik:kimlik” kararı olarak kaydedilir. Krokide bir sandığı sürükleyerek yerini değiştirebilirsin.</p>
    <Kroki dosya={dosya} harita={harita} mod="sandik" />
    <Uyarilar liste={uyarilar} />
    {!sandiklar.length && <div className="bos-durum" style={{ padding: 16 }}>Bu haritada sandık yok. Aşağıdan ekleyebilirsin.</div>}
    <div className="kartlar" ref={kap}>
      {sandiklar.map(s => (
        <div key={s.id} data-sandik={s.id} className={"liste-karti" + (secili === s.id ? " secili" : "")} data-testid={"sandik-" + s.id}
          onPointerDown={() => secili !== s.id && sec(s.id)}>
          <div className="liste-karti-baslik">
            <Box size={15} /><b>{s.ad || s.id}</b><span className="soluk">{s.id}</span>
            <span style={{ marginLeft: "auto" }} />
            <button className="ikon-dugme" title="Çoğalt" data-testid={"sandik-cogalt-" + s.id}
              onClick={() => { let yeni: string | null = null; degistir(dosya, d => { yeni = sandikCogalt(d, s.id); }); sec(yeni); }}><Copy size={14} /></button>
            <button className="ikon-dugme" title="Sil" data-testid={"sandik-sil-" + s.id}
              onClick={() => degistir(dosya, d => { d.sandiklar = d.sandiklar.filter((x: Sandik) => x.id !== s.id); })}><Trash2 size={14} /></button>
          </div>
          <div className="kart-icerik">
            <label>Kimlik</label>
            <KimlikGiris deger={s.id} testId={"sandik-kimlik-" + s.id} dene={yeni => {
              if (!kimlikGecerli(yeni)) return "Yalnız küçük harf, rakam ve _";
              if (yeni !== s.id && sandiklar.some(x => x.id === yeni)) return "Bu kimlik zaten var";
              degistir(dosya, d => {
                const x = (d.sandiklar || []).find((q: Sandik) => q.id === s.id); if (x) x.id = yeni;
                gorevHedefiniYenile(d, "sandik", s.id, yeni);
              });
              if (secili === s.id) sec(yeni);
              return "";
            }} />
            <label>Ad</label>
            <YaziAlani deger={s.ad} ipucu="Oyunda “[F] Aç: …” yazısında görünür" testId={"sandik-ad-" + s.id} degisti={v => sDegistir(s.id, x => { x.ad = v; })} />
            <label title="Metre; X sağ-sol, Y yukarı, Z yol boyunca (ileri = eksi)">Konum</label>
            <VektorAlani alan={{ tur: "vektor", ad: "", birim: "m" }} deger={s.konum} degisti={v => sDegistir(s.id, x => { x.konum = v as Sandik["konum"]; })} />
            <label>Açı</label>
            <SayiAlani alan={{ tur: "sayi", ad: "", birim: "°" }} deger={s.aci} testId={"sandik-aci-" + s.id}
              degisti={v => sDegistir(s.id, x => { x.aci = v ?? 0; }, "aci:" + s.id)} />

            <div className="kart-alt-baslik">İçindeki eşya</div>
            <label>Eşyanın adı</label>
            <YaziAlani deger={s.icerik?.ad} ipucu="ör. Gümüş pusula" testId={"sandik-esya-ad-" + s.id}
              degisti={v => sDegistir(s.id, x => { icerikYaz(x, "ad", v); })} />
            <label>Açıklama</label>
            <YaziAlani deger={s.icerik?.aciklama} cokSatir ipucu="Çantada görünen açıklama" testId={"sandik-esya-aciklama-" + s.id}
              degisti={v => sDegistir(s.id, x => { icerikYaz(x, "aciklama", v); })} />
            <label>Mesaj</label>
            <YaziAlani deger={s.icerik?.mesaj} cokSatir ipucu="Açınca ekranda görünen yazı (isteğe bağlı)"
              degisti={v => sDegistir(s.id, x => { icerikYaz(x, "mesaj", v); })} />
            <label>Puanlar</label>
            <PuanDuzenleyici puanlar={s.icerik?.puanlar || {}} olcekler={olcekler} testId={"sandik-puan-" + s.id}
              degisti={p => sDegistir(s.id, x => { x.icerik = { ...x.icerik, puanlar: p }; }, "puan:" + s.id)} />

            <div className="kart-alt-baslik">Unreal'de görünüş (isteğe bağlı; boş = oyunun hazır sandığı)</div>
            <label>Gövde modeli</label>
            <YaziAlani deger={s.model_govde} ipucu="/Game/... (boş = hazır sandık)" testId={"sandik-govde-" + s.id} degisti={v => secimli(s.id, "model_govde", v)} />
            <label>Kapak modeli</label>
            <YaziAlani deger={s.model_kapak} ipucu="/Game/..." degisti={v => secimli(s.id, "model_kapak", v)} />
            <label title="Model yanlış yöne bakıyorsa">Ön yön düzeltmesi</label>
            <SayiAlani alan={{ tur: "sayi", ad: "", birim: "°" }} deger={s.unreal_on_duzeltme} degisti={v => secimli(s.id, "unreal_on_duzeltme", v, "on:" + s.id)} />
            <label title="Kapağın döndüğü nokta, sandığın merkezine göre (cm)">Kapak menteşesi</label>
            {Array.isArray(s.kapak_mentesesi)
              ? <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <VektorAlani alan={{ tur: "vektor", ad: "", birim: "cm" }} deger={s.kapak_mentesesi} degisti={v => secimli(s.id, "kapak_mentesesi", v)} />
                <button className="dugme hayalet" onClick={() => secimli(s.id, "kapak_mentesesi", undefined)}><RotateCcw size={13} /> Varsayılan</button>
              </div>
              : <button className="dugme hayalet" style={{ justifySelf: "start" }} onClick={() => secimli(s.id, "kapak_mentesesi", [0, 0, 0])}>Menteşeyi ayarla</button>}
            <label>Kapak ekseni</label>
            <SecimAlani deger={s.kapak_ekseni} secenekler={[["roll", "Yana (roll)"], ["pitch", "Öne-arkaya (pitch)"]]} varsayilan="(oyunun varsayılanı)"
              testId={"sandik-eksen-" + s.id} degisti={v => secimli(s.id, "kapak_ekseni", v)} />
            <label>Kapak açılma açısı</label>
            <SayiAlani alan={{ tur: "sayi", ad: "", birim: "°" }} deger={s.kapak_acisi} degisti={v => secimli(s.id, "kapak_acisi", v, "kapak:" + s.id)} />
          </div>
        </div>
      ))}
    </div>
    <div className="ekle-satiri">
      <button className="dugme birincil" data-testid="sandik-ekle" onClick={() => { let id = ""; degistir(dosya, d => { id = sandikEkle(d); }); sec(id); }}>
        <Plus size={14} /> Sandık ekle</button>
    </div>
  </>;
}

// ================================================================== görevler
export function GorevlerListesi({ dosya, harita }: { dosya: string; harita: any }) {
  const { degistir, sec } = useOyun.getState();
  const { secili, kap } = useSeciliyeKay("data-gorev");
  const gorevler: Gorev[] = harita?.gorevler || [];
  const uyarilar = gorevUyarilari(harita);
  const gDegistir = (id: string, fn: (g: Gorev) => void, anahtar?: string) =>
    degistir(dosya, d => { const g = (d.gorevler || []).find((x: Gorev) => x.id === id); if (g) fn(g); }, anahtar);
  const adimDegistir = (id: string, i: number, fn: (a: GorevAdimi) => void) => gDegistir(id, g => { if (g.adimlar?.[i]) fn(g.adimlar[i]); });
  return <>
    <p className="sayfa-aciklama">Görevler ve adımları. Bir adım, oyuncu o işi yaptığında (biriyle konuşunca, bir eşyayı alınca, bir sandığı açınca,
      bir kapıdan geçince ya da yolun sonuna varınca) tamamlanır. Hedef “herhangi biri” ise o türden herhangi bir şey yeter.</p>
    <Uyarilar liste={uyarilar} />
    {!gorevler.length && <div className="bos-durum" style={{ padding: 16 }}>Bu haritada görev yok. Aşağıdan ekleyebilirsin.</div>}
    <div className="kartlar" ref={kap}>
      {gorevler.map(g => (
        <div key={g.id} data-gorev={g.id} className={"liste-karti" + (secili === g.id ? " secili" : "")} data-testid={"gorev-" + g.id}
          onPointerDown={() => secili !== g.id && sec(g.id)}>
          <div className="liste-karti-baslik">
            <Flag size={15} /><b>{g.ad || g.id}</b><span className="soluk">{g.id} · {(g.adimlar || []).length} adım</span>
            <span style={{ marginLeft: "auto" }} />
            <button className="ikon-dugme" title="Sil" data-testid={"gorev-sil-" + g.id}
              onClick={() => degistir(dosya, d => { d.gorevler = d.gorevler.filter((x: Gorev) => x.id !== g.id); })}><Trash2 size={14} /></button>
          </div>
          <div className="kart-icerik">
            <label>Kimlik</label>
            <KimlikGiris deger={g.id} testId={"gorev-kimlik-" + g.id} dene={yeni => {
              if (!kimlikGecerli(yeni)) return "Yalnız küçük harf, rakam ve _";
              if (yeni !== g.id && gorevler.some(x => x.id === yeni)) return "Bu kimlik zaten var";
              gDegistir(g.id, x => { x.id = yeni; }); if (secili === g.id) sec(yeni);
              return "";
            }} />
            <label>Ad</label>
            <YaziAlani deger={g.ad} testId={"gorev-ad-" + g.id} degisti={v => gDegistir(g.id, x => { x.ad = v; })} />
            <label>Açıklama</label>
            <YaziAlani deger={g.aciklama} cokSatir ipucu="Görev listesinde görünen kısa açıklama" degisti={v => gDegistir(g.id, x => { x.aciklama = v; })} />
            <label>Adımlar</label>
            <div className="gorev-adimlari" data-testid={"gorev-adimlar-" + g.id}>
              {(g.adimlar || []).map((a, i) => {
                const hedefler = gorevHedefleri(harita, a.tur);
                return (
                  <div key={i} className="gorev-adimi">
                    <span className="adim-no">{i + 1}</span>
                    <div style={{ flex: 2, minWidth: 160 }}>
                      <YaziAlani deger={a.metin} ipucu="Oyuncunun gördüğü yazı, ör. Kuyu bilgesiyle konuş" testId={`gorev-adim-metin-${g.id}-${i}`}
                        degisti={v => adimDegistir(g.id, i, x => { x.metin = v; })} />
                    </div>
                    <div style={{ flex: 1.3, minWidth: 160 }}>
                      <SecimAlani deger={a.tur} secenekler={GOREV_TURLERI} testId={`gorev-adim-tur-${g.id}-${i}`}
                        degisti={v => adimDegistir(g.id, i, x => { x.tur = v || "diyalog"; x.hedef = ""; })} />
                    </div>
                    <div style={{ flex: 1.3, minWidth: 160 }}>
                      {a.tur === "bitis" ? <span className="cok-soluk">—</span>
                        : <SecimAlani deger={a.hedef} secenekler={hedefler} varsayilan="(herhangi biri)" testId={`gorev-adim-hedef-${g.id}-${i}`}
                          degisti={v => adimDegistir(g.id, i, x => { x.hedef = v ?? ""; })} />}
                    </div>
                    <button className="ikon-dugme" title="Yukarı" disabled={i === 0} data-testid={`gorev-adim-yukari-${g.id}-${i}`}
                      onClick={() => gDegistir(g.id, x => { [x.adimlar[i - 1], x.adimlar[i]] = [x.adimlar[i], x.adimlar[i - 1]]; })}><ArrowUp size={13} /></button>
                    <button className="ikon-dugme" title="Aşağı" disabled={i === g.adimlar.length - 1}
                      onClick={() => gDegistir(g.id, x => { [x.adimlar[i + 1], x.adimlar[i]] = [x.adimlar[i], x.adimlar[i + 1]]; })}><ArrowDown size={13} /></button>
                    <button className="ikon-dugme" title="Adımı sil" data-testid={`gorev-adim-sil-${g.id}-${i}`}
                      onClick={() => gDegistir(g.id, x => { x.adimlar.splice(i, 1); })}><Trash2 size={13} /></button>
                  </div>
                );
              })}
              <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid={`gorev-adim-ekle-${g.id}`}
                onClick={() => gDegistir(g.id, x => { (x.adimlar ||= []).push({ metin: "", tur: "diyalog", hedef: "" }); })}><Plus size={13} /> Adım ekle</button>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="ekle-satiri">
      <button className="dugme birincil" data-testid="gorev-ekle" onClick={() => { let id = ""; degistir(dosya, d => { id = gorevEkle(d); }); sec(id); }}>
        <Plus size={14} /> Görev ekle</button>
    </div>
  </>;
}
