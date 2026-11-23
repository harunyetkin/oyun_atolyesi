// Harita → Mekânlar: kapılar ve geçişler (iç mekânlara giriş/çıkış), iç mekânlar (hazır Unreal seviyeleri), meşaleler,
// zeminler, görünmez duvarlar ve ot serpilmeyen alanlar. Biçim: hikaye_oyun/icerik/BICIM.md (2026-11-18) ve meşaleler için
// oyunun kodu (HikayeOyunModu.cpp: tur, konum [x, z], yukseklik, aci; mesale_ayari: guc, yaricap).
// Listeler uzun olabildiği için (köyde 88 geçiş, 43 meşale) her öğe kart değil, tek satırdır; krokide sürüklenebilir.
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRightLeft, DoorOpen, Flame, Home, Plus, Square, Trash2 } from "lucide-react";
import { useOyun } from "./durum";
import { benzersizKimlik, donusGecisi, gecisCiftiEkle, kimlikGecerli, mekanUyarilari, type Gecis } from "./icerik";
import { KimlikGiris, SayiAlani, SayiKutusu, SecimAlani, Uyarilar, YaziAlani } from "./girisler";
import { RenkGiris } from "../editor/Ortak";
import { Kroki } from "./Kroki";

/** Etiketli küçük sayı kutusu (satır içinde). */
function Kutu({ etiket, deger, degisti, genislik = 82, testId, ipucu }: { etiket: string; deger: number | undefined; degisti: (v: number) => void; genislik?: number; testId?: string; ipucu?: string }) {
  return <div className="sayi-giris" style={{ width: genislik, flex: "none" }} title={ipucu || etiket}><span>{etiket}</span>
    <SayiKutusu deger={typeof deger === "number" ? deger : 0} degisti={degisti} testId={testId} /></div>;
}

/** Açılır-kapanır bölüm başlığı (öğe sayısıyla). */
function Bolum({ baslik, ikon, sayi, children, testId, aciklama }: { baslik: string; ikon: ReactNode; sayi: number; children: ReactNode; testId: string; aciklama?: string }) {
  return (
    <details className="mekan-bolumu" open data-testid={testId}>
      <summary>{ikon}<b>{baslik}</b><span className="rozet">{sayi}</span></summary>
      {aciklama && <div className="grup-aciklama" style={{ margin: "2px 0 8px" }}>{aciklama}</div>}
      <div className="mekan-satirlari">{children}</div>
    </details>
  );
}

export function MekanlarListesi({ dosya, harita }: { dosya: string; harita: any }) {
  const { degistir, sec } = useOyun.getState();
  const secili = useOyun(o => o.secili);
  const kap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (secili) kap.current?.querySelector(`[data-mekan="${CSS.escape(secili)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [secili]);
  const d = (fn: (h: any) => void, anahtar?: string) => degistir(dosya, fn, anahtar);
  const satir = (anahtar: string) => ({
    "data-mekan": anahtar, className: "gorev-adimi mekan-satiri" + (secili === anahtar ? " secili" : ""),
    onPointerDown: () => secili !== anahtar && sec(anahtar),
  });
  const gecisler: Gecis[] = harita?.gecisler || [];
  const icler: any[] = harita?.ic_mekanlar || [];
  const mesaleler: any[] = harita?.mesaleler || [];
  const ayar = harita?.mesale_ayari || {};
  const uyarilar = mekanUyarilari(harita);
  const merkez = (): [number, number] => { const b = harita?.baslangic?.konum ?? [0, 0, 0]; return [Math.round(b[0] * 10) / 10, Math.round((b[2] - 4) * 10) / 10]; };

  const dikdortgenBolumu = (liste: "zeminler" | "gorunmez_duvarlar" | "serpme_yok", baslik: string, onek: string, aciklama: string, ikon: ReactNode) => {
    const l: any[] = harita?.[liste] || [];
    const r = (i: number, fn: (x: any) => void, anahtar?: string) => d(h => { const x = h[liste]?.[i]; if (x) fn(x); }, anahtar);
    return (
      <Bolum baslik={baslik} ikon={ikon} sayi={l.length} testId={"mekan-" + liste} aciklama={aciklama}>
        {l.map((x, i) => (
          <div key={i} {...satir(`${onek}:${i}`)} data-testid={`${liste}-${i}`}>
            <span className="adim-no">{i + 1}</span>
            <Kutu etiket="X" deger={x.merkez?.[0]} ipucu="Merkez X (m)" degisti={v => r(i, y => { y.merkez = [v, y.merkez?.[1] ?? 0]; })} />
            <Kutu etiket="Z" deger={x.merkez?.[1]} ipucu="Merkez Z (m)" degisti={v => r(i, y => { y.merkez = [y.merkez?.[0] ?? 0, v]; })} />
            <Kutu etiket="En" deger={x.boyut?.[0]} genislik={88} ipucu="En, X yönünde (m)" testId={`${liste}-en-${i}`} degisti={v => r(i, y => { y.boyut = [Math.max(0.1, v), y.boyut?.[1] ?? 1]; })} />
            <Kutu etiket="Boy" deger={x.boyut?.[1]} genislik={90} ipucu="Boy, Z yönünde (m)" degisti={v => r(i, y => { y.boyut = [y.boyut?.[0] ?? 1, Math.max(0.1, v)]; })} />
            {liste === "zeminler" && <>
              <Kutu etiket="Y" deger={x.yukseklik} ipucu="Yükseklik (m)" degisti={v => r(i, y => { y.yukseklik = v; })} />
              <div style={{ width: 150, flex: "none" }}><RenkGiris deger={/^#[0-9a-f]{6}$/i.test(x.renk || "") ? x.renk : "#8a8070"} degisti={v => r(i, y => { y.renk = v; }, `renk:${liste}:${i}`)} /></div>
              <div style={{ flex: 1, minWidth: 180 }}><YaziAlani deger={x.unreal_klasor} ipucu="Malzeme: /Game/.../MI_..." degisti={v => r(i, y => { if (v) y.unreal_klasor = v; else delete y.unreal_klasor; })} /></div>
              <div style={{ flex: "none" }} title="Malzemenin bir kez tekrarladığı boy (m)"><SayiAlani alan={{ tur: "sayi", ad: "", birim: "m karo", min: 0, adim: 0.5 }} deger={x.unreal_karo}
                degisti={v => r(i, y => { if (v === undefined) delete y.unreal_karo; else y.unreal_karo = v; })} /></div>
            </>}
            <button className="ikon-dugme" title="Sil" data-testid={`${liste}-sil-${i}`} onClick={() => d(h => { h[liste].splice(i, 1); })}><Trash2 size={13} /></button>
          </div>
        ))}
        <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid={`${liste}-ekle`} onClick={() => {
          d(h => { (h[liste] ||= []).push(liste === "zeminler" ? { merkez: merkez(), boyut: [6, 6], yukseklik: 0.05, renk: "#8a8070" } : { merkez: merkez(), boyut: [4, 4] }); });
          sec(`${onek}:${l.length}`);
        }}><Plus size={13} /> Ekle</button>
      </Bolum>
    );
  };

  return <>
    <p className="sayfa-aciklama">Kapılar ve iç mekânlar, meşaleler ve haritadaki özel alanlar. Krokide bir kapıyı, meşaleyi ya da alanı sürükleyerek
      yerini değiştirebilirsin; listede bir satıra tıklayınca krokide seçilir.</p>
    <Kroki dosya={dosya} harita={harita} mod="mekan" />
    <Uyarilar liste={uyarilar} />
    <div className="kartlar" ref={kap}>
      <Bolum baslik="Kapılar ve geçişler" ikon={<DoorOpen size={15} />} sayi={gecisler.length} testId="mekan-gecisler"
        aciklama="Oyuncu kapıya yaklaşınca “[F] yazı” görünür; basınca ekran kararır ve oyuncu “gidilen yer”e geçer. Her girişin, varılan yerde bir dönüş kapısı olmalı (çoğu zaman iç mekândan “Dışarı çık”).">
        {gecisler.map(g => {
          const geri = donusGecisi(harita, g);
          const gd = (fn: (x: Gecis) => void, anahtar?: string) => d(h => { const x = h.gecisler.find((q: Gecis) => q.id === g.id); if (x) fn(x); }, anahtar);
          return (
            <div key={g.id} {...satir("gecis:" + g.id)} data-testid={"gecis-" + g.id}>
              <div style={{ width: 80, flex: "none" }}>
                <KimlikGiris deger={g.id} testId={"gecis-kimlik-" + g.id} dene={yeni => {
                  if (!kimlikGecerli(yeni)) return "küçük harf, rakam, _";
                  if (yeni !== g.id && gecisler.some(x => x.id === yeni)) return "zaten var";
                  gd(x => { x.id = yeni; }); if (secili === "gecis:" + g.id) sec("gecis:" + yeni);
                  return "";
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}><YaziAlani deger={g.metin} ipucu="ör. Gir: Han" testId={"gecis-metin-" + g.id} degisti={v => gd(x => { x.metin = v; })} /></div>
              <span className="soluk" style={{ fontSize: 11 }}>kapı</span>
              {[0, 1, 2].map(k => <Kutu key={k} etiket={"XYZ"[k]} deger={g.konum?.[k]} genislik={72} testId={k === 0 ? "gecis-x-" + g.id : undefined}
                degisti={v => gd(x => { const y = [...(x.konum ?? [0, 0, 0])] as [number, number, number]; y[k] = v; x.konum = y; })} />)}
              <span className="soluk" style={{ fontSize: 11 }}>→</span>
              {[0, 1, 2].map(k => <Kutu key={k} etiket={"XYZ"[k]} deger={g.hedef?.[k]} genislik={80}
                degisti={v => gd(x => { const y = [...(x.hedef ?? [0, 0, 0])] as [number, number, number]; y[k] = v; x.hedef = y; })} />)}
              <Kutu etiket="°" deger={g.hedef_aci} genislik={62} ipucu="Varınca bakılan yön (°)" degisti={v => gd(x => { x.hedef_aci = v; })} />
              <button className="ikon-dugme" title={geri ? `Dönüş kapısına git: ${geri.metin || geri.id}` : "Dönüş kapısı yok"} disabled={!geri}
                data-testid={"gecis-donus-" + g.id} onClick={() => geri && sec("gecis:" + geri.id)}><ArrowRightLeft size={13} /></button>
              <button className="ikon-dugme" title="Sil" data-testid={"gecis-sil-" + g.id}
                onClick={() => d(h => { h.gecisler = h.gecisler.filter((x: Gecis) => x.id !== g.id); })}><Trash2 size={13} /></button>
            </div>
          );
        })}
        <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid="gecis-ekle"
          onClick={() => { let id = ""; d(h => { id = gecisCiftiEkle(h); }); sec("gecis:" + id); }}><Plus size={13} /> Kapı çifti ekle (giriş + dönüş)</button>
      </Bolum>

      <Bolum baslik="İç mekânlar" ikon={<Home size={15} />} sayi={icler.length} testId="mekan-ic"
        aciklama="Hazır bir Unreal seviyesi (ör. Fab paketinin dükkân sahnesi) bu konuma kopya olarak yüklenir; seviyenin kendi güneşi, gökyüzü ve kameraları silinir. Silme kutusu verilirse (metre, seviyenin kendi koordinatında) kutunun dışındaki her şey silinir.">
        {icler.map((im, i) => {
          const id_ = (fn: (x: any) => void) => d(h => { const x = h.ic_mekanlar?.[i]; if (x) fn(x); });
          return (
            <div key={i} {...satir("ic:" + im.id)} data-testid={"ic-" + im.id}>
              <div style={{ width: 110, flex: "none" }}><YaziAlani deger={im.id} ipucu="kimlik" degisti={v => id_(x => { x.id = v; })} /></div>
              <div style={{ width: 150, flex: "none" }}><YaziAlani deger={im.ad} ipucu="Ad" degisti={v => id_(x => { x.ad = v; })} /></div>
              <div style={{ flex: 1, minWidth: 200 }}><YaziAlani deger={im.seviye} ipucu="/Game/.../Maps/Seviye" testId={"ic-seviye-" + im.id} degisti={v => id_(x => { x.seviye = v; })} /></div>
              {[0, 1, 2].map(k => <Kutu key={k} etiket={"XYZ"[k]} deger={im.konum?.[k]} genislik={80}
                degisti={v => id_(x => { const y = [...(x.konum ?? [0, 0, 0])]; y[k] = v; x.konum = y; })} />)}
              <Kutu etiket="°" deger={im.aci} genislik={70} degisti={v => id_(x => { x.aci = v; })} />
              {Array.isArray(im.sil_kutu)
                ? <>{["x1", "z1", "x2", "z2"].map((e, k) => <Kutu key={e} etiket={e} deger={im.sil_kutu[k]} genislik={82} ipucu="Silme kutusu (m, seviyenin kendi koordinatında)"
                  degisti={v => id_(x => { const y = [...x.sil_kutu]; y[k] = v; x.sil_kutu = y; })} />)}
                  <button className="dugme hayalet" onClick={() => id_(x => { delete x.sil_kutu; })}>kutusuz</button></>
                : <button className="dugme hayalet" onClick={() => id_(x => { x.sil_kutu = [-10, -10, 10, 10]; })}>Silme kutusu ekle</button>}
              <button className="ikon-dugme" title="Sil" onClick={() => d(h => { h.ic_mekanlar.splice(i, 1); })}><Trash2 size={13} /></button>
            </div>
          );
        })}
        <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid="ic-ekle" onClick={() => {
          let id = ""; d(h => { const l = (h.ic_mekanlar ||= []); id = benzersizKimlik("ic_mekan", l.map((x: any) => x.id)); l.push({ id, ad: "Yeni iç mekân", seviye: "", konum: [-60, 0, -1200], aci: 0 }); });
          sec("ic:" + id);
        }}><Plus size={13} /> İç mekân ekle</button>
      </Bolum>

      <Bolum baslik="Meşaleler" ikon={<Flame size={15} />} sayi={mesaleler.length} testId="mekan-mesaleler"
        aciklama="Akşam yanan, gündüz sönen meşaleler. Direk yere dikilir; duvar meşalesi bir duvara asılır (yüksekliği ve yönü önemlidir).">
        <div className="gorev-adimi">
          <span className="soluk" style={{ minWidth: 120 }}>Bütün meşaleler:</span>
          <span className="soluk">ışık gücü</span>
          <div style={{ flex: "none" }}><SayiAlani alan={{ tur: "sayi", ad: "", birim: "kandela", min: 0 }} deger={ayar.guc} ipucu="60" testId="mesale-guc"
            degisti={v => d(h => { h.mesale_ayari = { ...(h.mesale_ayari || {}) }; if (v === undefined) delete h.mesale_ayari.guc; else h.mesale_ayari.guc = v; }, "mesale-guc")} /></div>
          <span className="soluk">erim</span>
          <div style={{ flex: "none" }}><SayiAlani alan={{ tur: "sayi", ad: "", birim: "m", min: 0 }} deger={ayar.yaricap} ipucu="12"
            degisti={v => d(h => { h.mesale_ayari = { ...(h.mesale_ayari || {}) }; if (v === undefined) delete h.mesale_ayari.yaricap; else h.mesale_ayari.yaricap = v; }, "mesale-yaricap")} /></div>
        </div>
        {mesaleler.map((m, i) => {
          const md = (fn: (x: any) => void, anahtar?: string) => d(h => { const x = h.mesaleler?.[i]; if (x) fn(x); }, anahtar);
          return (
            <div key={i} {...satir("mesale:" + i)} data-testid={"mesale-" + i}>
              <span className="adim-no">{i + 1}</span>
              <div style={{ width: 120, flex: "none" }}><SecimAlani deger={m.tur} secenekler={[["direk", "Direk"], ["duvar", "Duvar"]]} varsayilan="Direk"
                testId={"mesale-tur-" + i} degisti={v => md(x => { if (v) x.tur = v; else delete x.tur; })} /></div>
              <Kutu etiket="X" deger={m.konum?.[0]} testId={"mesale-x-" + i} degisti={v => md(x => { x.konum = [v, x.konum?.[1] ?? 0]; })} />
              <Kutu etiket="Z" deger={m.konum?.[1]} degisti={v => md(x => { x.konum = [x.konum?.[0] ?? 0, v]; })} />
              <Kutu etiket="Y" deger={m.yukseklik ?? (m.tur === "duvar" ? 2.1 : 0)} ipucu="Zeminden yükseklik (m)" degisti={v => md(x => { x.yukseklik = v; })} />
              <Kutu etiket="°" deger={m.aci} genislik={70} ipucu="Yön (°)" degisti={v => md(x => { x.aci = v; })} />
              <button className="ikon-dugme" title="Sil" data-testid={"mesale-sil-" + i} onClick={() => d(h => { h.mesaleler.splice(i, 1); })}><Trash2 size={13} /></button>
            </div>
          );
        })}
        <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid="mesale-ekle"
          onClick={() => { d(h => { (h.mesaleler ||= []).push({ tur: "direk", konum: merkez() }); }); sec("mesale:" + mesaleler.length); }}><Plus size={13} /> Meşale ekle</button>
      </Bolum>

      {dikdortgenBolumu("zeminler", "Zeminler", "zemin", "Kaldırım, meydan gibi üstünde yürünen düz alanlar (ince kutu; malzeme verilirse üstü karo karo döşenir). Aynı yükseklikte üst üste binen zeminleri önle.", <Square size={15} />)}
      {dikdortgenBolumu("gorunmez_duvarlar", "Görünmez duvarlar", "duvar", "Oyuncunun geçemeyeceği görünmez duvarlar (10 m yüksek).", <Square size={15} />)}
      {dikdortgenBolumu("serpme_yok", "Ot serpilmeyen alanlar", "serpme", "Bu dikdörtgenlere ot ve eğrelti serpilmez.", <Square size={15} />)}
    </div>
  </>;
}
