// Oyun içeriği düzenleyicisi: Harun'un 3D oyununun (hikaye_oyun) icerik/*.json dosyalarını
// kod yazmadan düzenleme ekranı. Şimdilik: karakterler.json (oyuncu ayarları ve kişilerin bedenleri)
// ve haritalar (Unreal ayarları, yol, ışık, yerdeki eşyalar). Diğer dosyalar salt okunur gösterilir.
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Undo2, Redo2, Save, FolderOpen, Home, Users, Map as HaritaIkon, MessageSquare, FileJson, Settings2, UserRound, Package,
  Plus, Trash2, Copy, AlertTriangle, RotateCcw, Hand,
} from "lucide-react";
import { useDurum } from "../depo/durum";
import { useOyun } from "./durum";
import { HARITA_GRUPLARI, OYUNCU_GRUPLARI, tanimliYollar, type Alan, type Grup } from "./sema";
import {
  anahtarDegistir, benzersizKimlik, dosyaTuru, esyaCogalt, esyaEkle, esyaUyarilari, haritaKisileri, kimlikGecerli, kisiUyarilari,
  unrealYoluSorunu, yolOku, yolYaz, type Esya, type Uyari,
} from "./icerik";
import { Kart, RenkGiris } from "../editor/Ortak";
import { MenuCubugu } from "../editor/Cerceve";
import { komut, kullanilabilir } from "../editor/komutlar";

// ================================================================== giriş kutuları
const yuvarla = (v: number) => Math.round(v * 1000) / 1000;

/** Sayı kutusu: boş bırakılabilir (oyun kendi varsayılanını kullanır). Virgül de kabul eder. */
function SayiAlani({ deger, degisti, alan, testId }: { deger: unknown; degisti: (v: number | undefined) => void; alan: Extract<Alan, { tur: "sayi" }>; testId?: string }) {
  const metinYap = (v: unknown) => (typeof v === "number" ? String(yuvarla(v)) : "");
  const [metin, setMetin] = useState(metinYap(deger));
  useEffect(() => setMetin(metinYap(deger)), [deger]);
  const sinirla = (v: number) => Math.min(alan.max ?? Infinity, Math.max(alan.min ?? -Infinity, v));
  const uygula = () => {
    const t = metin.trim().replace(",", ".");
    if (t === "") { if (deger !== undefined) degisti(undefined); return; }
    const v = Number(t);
    if (isNaN(v)) { setMetin(metinYap(deger)); return; }
    degisti(sinirla(v));
    setMetin(metinYap(sinirla(v)));
  };
  const kaydirici = alan.min !== undefined && alan.max !== undefined && alan.max - alan.min <= 2 && (alan.adim ?? 1) < 1;
  return (
    <div className="alan-satir">
      {kaydirici && typeof deger === "number" && (
        <input type="range" min={alan.min} max={alan.max} step={alan.adim} value={deger} onChange={e => degisti(Number(e.target.value))} />
      )}
      <div className="sayi-giris" style={{ width: kaydirici ? 90 : 140, flex: "none" }}>
        <input value={metin} placeholder="varsayılan" onChange={e => setMetin(e.target.value)} onBlur={uygula} data-testid={testId}
          onKeyDown={e => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if ((e.key === "ArrowUp" || e.key === "ArrowDown") && typeof deger === "number") {
              e.preventDefault();
              const adim = (alan.adim ?? 1) * (e.shiftKey ? 10 : 1);
              degisti(sinirla(yuvarla(deger + (e.key === "ArrowUp" ? adim : -adim))));
            }
          }} />
      </div>
      {alan.birim && <span className="birim">{alan.birim}</span>}
    </div>
  );
}

/** Yazı kutusu: her tuşta değil, kutudan çıkınca (ya da Enter'da) yazar; geri al adımları temiz kalır. */
function YaziAlani({ deger, degisti, ipucu, cokSatir, uyari, testId }: { deger: unknown; degisti: (v: string) => void; ipucu?: string; cokSatir?: boolean; uyari?: string; testId?: string }) {
  const [metin, setMetin] = useState(typeof deger === "string" ? deger : "");
  useEffect(() => setMetin(typeof deger === "string" ? deger : ""), [deger]);
  const uygula = () => { if (metin !== (deger ?? "")) degisti(metin); };
  const ortak = {
    className: "giris" + (uyari ? " uyarili" : ""), value: metin, placeholder: ipucu, "data-testid": testId,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMetin(e.target.value), onBlur: uygula,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {cokSatir ? <textarea rows={2} {...ortak} />
        : <input {...ortak} onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />}
      {uyari && <span className="alan-uyari"><AlertTriangle size={12} /> {uyari}</span>}
    </div>
  );
}

/** Açık/kapalı düğmesi. Oyunda bazı alanlar 1/0, bazıları true/false; var olan türü korur. */
function Anahtar({ deger, degisti, alan, testId }: { deger: unknown; degisti: (v: unknown) => void; alan: Extract<Alan, { tur: "anahtar" }>; testId?: string }) {
  const acik = deger === true || (typeof deger === "number" && deger !== 0);
  const mantik = typeof deger === "boolean" || (deger === undefined && alan.mantik);
  return (
    <label className="anahtar-kap">
      <button className={"anahtar" + (acik ? " acik" : "")} role="switch" aria-checked={acik} data-testid={testId}
        onClick={() => degisti(mantik ? !acik : acik ? 0 : 1)}><span /></button>
      <span className="soluk">{acik ? alan.acik || "Açık" : alan.kapali || "Kapalı"}</span>
    </label>
  );
}

function VektorAlani({ deger, degisti, alan }: { deger: unknown; degisti: (v: number[]) => void; alan: Extract<Alan, { tur: "vektor" }> }) {
  const v = Array.isArray(deger) && deger.length === 3 ? (deger as number[]) : [0, 0, 0];
  const eksen = alan.eksenler || ["X", "Y", "Z"];
  return (
    <div className="vektor">
      {[0, 1, 2].map(i => (
        <div key={i} className="sayi-giris" title={eksen[i]}>
          <span>{eksen[i]}</span>
          <SayiKutusu deger={v[i]} degisti={n => { const y = [...v]; y[i] = n; degisti(y); }} />
        </div>
      ))}
      {alan.birim && <span className="birim">{alan.birim}</span>}
    </div>
  );
}

/** Çıplak sayı kutusu (vektör ve puan gibi yerlerde). */
function SayiKutusu({ deger, degisti, testId }: { deger: number; degisti: (v: number) => void; testId?: string }) {
  const [metin, setMetin] = useState(String(yuvarla(deger)));
  useEffect(() => setMetin(String(yuvarla(deger))), [deger]);
  return <input value={metin} onChange={e => setMetin(e.target.value)} data-testid={testId}
    onBlur={() => { const n = Number(metin.replace(",", ".")); if (!isNaN(n) && metin.trim() !== "") degisti(n); else setMetin(String(yuvarla(deger))); }}
    onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />;
}

/** Şemadaki bir alanı türüne göre çizer. */
function AlanGirisi({ alan, deger, degisti, testId }: { alan: Alan; deger: unknown; degisti: (v: any) => void; testId?: string }) {
  switch (alan.tur) {
    case "sayi": return <SayiAlani alan={alan} deger={deger} degisti={degisti} testId={testId} />;
    case "anahtar": return <Anahtar alan={alan} deger={deger} degisti={degisti} testId={testId} />;
    case "renk": return <RenkGiris deger={typeof deger === "string" && /^#[0-9a-f]{6}$/i.test(deger) ? deger : "#808080"} degisti={degisti} />;
    case "vektor": return <VektorAlani alan={alan} deger={deger} degisti={degisti} />;
    case "unreal": return <YaziAlani deger={deger} degisti={degisti} ipucu={alan.ipucu} uyari={unrealYoluSorunu(String(deger ?? ""))} testId={testId} />;
    case "yazi": return <YaziAlani deger={deger} degisti={degisti} ipucu={alan.ipucu} cokSatir={alan.cokSatir} testId={testId} />;
  }
}

/** Bir şema grubunu kart olarak çizer. `onEk` dosya içindeki kök yol (ör. "oyuncu"). */
function GrupKarti({ grup, dosya, onEk, kok, tanimli }: { grup: Grup; dosya: string; onEk: string; kok: any; tanimli: Set<string> }) {
  const degistir = useOyun.getState().degistir;
  const tam = (yol: string) => (onEk ? onEk + "." + yol : yol);
  const yaz = (yol: string, v: unknown) => degistir(dosya, d => yolYaz(d, tam(yol), v), "alan:" + dosya + ":" + tam(yol));
  // Şemada olmayan ama dosyada bulunan alanlar (oyuna sonradan eklenenler)
  const digerleri: [string, Alan][] = [];
  if (grup.digerleri) {
    const sozluk = yolOku(kok, grup.digerleri.yol);
    if (sozluk && typeof sozluk === "object" && !Array.isArray(sozluk)) {
      for (const [k, v] of Object.entries(sozluk)) {
        const yol = grup.digerleri.yol + "." + k;
        if (tanimli.has(yol)) continue;
        const tur = typeof v === "number" ? "sayi" : grup.digerleri.tur;
        digerleri.push([yol, tur === "sayi" ? { tur: "sayi", ad: k } : tur === "unreal" ? { tur: "unreal", ad: k } : { tur: "yazi", ad: k }]);
      }
    }
  }
  return (
    <Kart baslik={grup.baslik} acikBaslar={grup.acikBaslar ?? false}>
      {grup.aciklama && <div className="grup-aciklama">{grup.aciklama}</div>}
      {[...grup.alanlar, ...digerleri].map(([yol, alan]) => (
        <AlanSatiri key={yol} alan={alan} yeni={digerleri.some(d => d[0] === yol)}>
          <AlanGirisi alan={alan} deger={yolOku(kok, yol)} degisti={v => yaz(yol, v)} testId={"alan-" + tam(yol)} />
        </AlanSatiri>
      ))}
    </Kart>
  );
}

function AlanSatiri({ alan, yeni, children }: { alan: Alan; yeni?: boolean; children: ReactNode }) {
  return <>
    <label title={alan.aciklama}>{alan.ad}{yeni && <span className="rozet" style={{ marginLeft: 6 }} title="Bu alanın açıklaması henüz yok">yeni</span>}</label>
    <div>{children}{alan.aciklama && alan.tur !== "unreal" && <div className="alan-aciklama">{alan.aciklama}</div>}</div>
  </>;
}

function Uyarilar({ liste }: { liste: Uyari[] }) {
  if (!liste.length) return null;
  return (
    <div className="uyari-kutusu" data-testid="uyarilar">
      <b><AlertTriangle size={14} /> Dikkat ({liste.length})</b>
      {liste.map((u, i) => <div key={i}><span className="soluk">{u.yer}:</span> {u.metin}</div>)}
    </div>
  );
}

function SayfaSekmeleri<T extends string>({ sekmeler, aktif, sec }: { sekmeler: { id: T; ad: string; ikon: ReactNode; sayi?: number }[]; aktif: T; sec: (t: T) => void }) {
  return (
    <div className="sekmeler" style={{ position: "sticky", top: 0, zIndex: 2 }}>
      {sekmeler.map(s => <button key={s.id} className={"sekme" + (s.id === aktif ? " aktif" : "")} onClick={() => sec(s.id)} data-testid={"oyun-sekme-" + s.id}>
        {s.ikon}{s.ad}{s.sayi !== undefined && <span className="rozet">{s.sayi}</span>}</button>)}
    </div>
  );
}

// ================================================================== karakterler.json
function KarakterlerSayfasi({ dosya }: { dosya: string }) {
  const veri = useOyun(o => o.veri[dosya]);
  const tum = useOyun(o => o.veri);
  const [sekme, setSekme] = useState<"oyuncu" | "kisiler">("oyuncu");
  const npcler = haritaKisileri(tum);
  const kisiler: Record<string, any> = veri?.kisiler || {};
  const uyarilar = kisiUyarilari(veri, npcler.map(n => n.id));
  const tanimli = tanimliYollar(OYUNCU_GRUPLARI);
  return (
    <>
      <SayfaSekmeleri aktif={sekme} sec={setSekme} sekmeler={[
        { id: "oyuncu", ad: "Oyuncu", ikon: <UserRound size={14} /> },
        { id: "kisiler", ad: "Kişilerin bedenleri", ikon: <Users size={14} />, sayi: Object.keys(kisiler).length }]} />
      <div className="icerik-sayfa">
        {sekme === "oyuncu" ? <>
          <p className="sayfa-aciklama">Oyuncunun Unreal'deki bedeni, hareketleri ve “his” ayarları. Bir kutuyu boş bırakırsan oyun kendi varsayılanını kullanır.
            Değişiklikler derleme gerektirmez: kaydet, oyunu yeniden başlat.</p>
          <div className="kartlar">
            {OYUNCU_GRUPLARI.map(g => <GrupKarti key={g.baslik} grup={g} dosya={dosya} onEk="oyuncu" kok={veri?.oyuncu || {}} tanimli={tanimli} />)}
          </div>
        </> : <KisilerListesi dosya={dosya} kisiler={kisiler} npcler={npcler} uyarilar={uyarilar} />}
      </div>
    </>
  );
}

function KisilerListesi({ dosya, kisiler, npcler, uyarilar }: { dosya: string; kisiler: Record<string, any>; npcler: { id: string; ad: string; harita: string }[]; uyarilar: Uyari[] }) {
  const degistir = useOyun.getState().degistir;
  const eksik = npcler.filter(n => !(n.id in kisiler));
  const ekle = (id: string) => degistir(dosya, d => { d.kisiler = { ...(d.kisiler || {}), [id]: { unreal_govde: "" } }; });
  return <>
    <p className="sayfa-aciklama">Haritalardaki her kişinin (npc) Unreal'deki bedeni. Kimlik, haritadaki kişinin kimliğiyle aynı olmalı.
      Bedeni seçilmeyen kişi oyuncunun bedenini kullanır.</p>
    <Uyarilar liste={uyarilar} />
    <div className="kartlar">
      {Object.entries(kisiler).map(([id, k]) => {
        const npc = npcler.find(n => n.id === id);
        return (
          <div className="liste-karti" key={id} data-testid={"kisi-" + id}>
            <div className="liste-karti-baslik">
              <UserRound size={15} /><b>{npc?.ad || id}</b><span className="soluk">{npc ? npc.harita : "haritada yok"}</span>
              <span style={{ marginLeft: "auto" }} />
              <button className="ikon-dugme" title="Kişiyi sil" data-testid={"kisi-sil-" + id}
                onClick={() => degistir(dosya, d => { delete d.kisiler[id]; })}><Trash2 size={14} /></button>
            </div>
            <div className="kart-icerik">
              <label>Kimlik</label>
              <KimlikGiris deger={id} testId={"kisi-kimlik-" + id} dene={yeni => {
                if (!kimlikGecerli(yeni)) return "Yalnız küçük harf, rakam ve _";
                if (yeni !== id && yeni in kisiler) return "Bu kimlik zaten var";
                if (yeni !== id) degistir(dosya, d => { d.kisiler = anahtarDegistir(d.kisiler, id, yeni); });
                return "";
              }} liste={npcler.map(n => n.id)} />
              <label>Beden (MetaHuman)</label>
              <AlanGirisi alan={{ tur: "unreal", ad: "", ipucu: "/Game/MetaHumans/Ad/BP_Ad" }} deger={k?.unreal_govde} testId={"kisi-govde-" + id}
                degisti={v => degistir(dosya, d => { d.kisiler[id].unreal_govde = v; })} />
              <label>Animasyon Blueprint'i</label>
              <AlanGirisi alan={{ tur: "unreal", ad: "", ipucu: "boş = oyuncununki" }} deger={k?.unreal_anim_sinifi}
                degisti={v => degistir(dosya, d => { if (v) d.kisiler[id].unreal_anim_sinifi = v; else delete d.kisiler[id].unreal_anim_sinifi; })} />
            </div>
          </div>
        );
      })}
    </div>
    <div className="ekle-satiri">
      {eksik.map(n => <button key={n.id} className="dugme" onClick={() => ekle(n.id)} data-testid={"kisi-ekle-" + n.id}><Plus size={14} /> {n.ad} <span className="soluk">({n.harita})</span></button>)}
      <button className="dugme hayalet" data-testid="kisi-ekle-bos"
        onClick={() => ekle(benzersizKimlik("yeni_kisi", Object.keys(kisiler)))}><Plus size={14} /> Boş kişi</button>
    </div>
  </>;
}

/** Kimlik kutusu: kutudan çıkınca dener; kural dışıysa eski hâline döner ve nedenini gösterir. */
function KimlikGiris({ deger, dene, liste, testId }: { deger: string; dene: (yeni: string) => string; liste?: string[]; testId?: string }) {
  const [metin, setMetin] = useState(deger);
  const [hata, setHata] = useState("");
  const listeId = useRef("kimlikler-" + Math.random().toString(36).slice(2)).current;
  useEffect(() => setMetin(deger), [deger]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <input className={"giris" + (hata ? " uyarili" : "")} value={metin} list={liste ? listeId : undefined} data-testid={testId}
        onChange={e => { setMetin(e.target.value); setHata(""); }}
        onBlur={() => { if (metin === deger) return; const h = dene(metin.trim()); if (h) { setHata(h); setMetin(deger); } }}
        onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
      {liste && <datalist id={listeId}>{liste.map(x => <option key={x} value={x} />)}</datalist>}
      {hata && <span className="alan-uyari"><AlertTriangle size={12} /> {hata}</span>}
    </div>
  );
}

// ================================================================== haritalar
function HaritaSayfasi({ dosya }: { dosya: string }) {
  const veri = useOyun(o => o.veri[dosya]);
  const oyun = useOyun(o => o.veri["oyun.json"]);
  const [sekme, setSekme] = useState<"ayarlar" | "esyalar">("esyalar");
  const olcekler: { id: string; ad: string }[] = oyun?.olcekler || [];
  const tanimli = tanimliYollar(HARITA_GRUPLARI);
  return (
    <>
      <SayfaSekmeleri aktif={sekme} sec={setSekme} sekmeler={[
        { id: "esyalar", ad: "Eşyalar", ikon: <Package size={14} />, sayi: (veri?.esyalar || []).length },
        { id: "ayarlar", ad: "Harita ayarları", ikon: <Settings2 size={14} /> }]} />
      <div className="icerik-sayfa">
        {sekme === "ayarlar"
          ? <div className="kartlar">{HARITA_GRUPLARI.map(g => <GrupKarti key={g.baslik} grup={g} dosya={dosya} onEk="" kok={veri} tanimli={tanimli} />)}</div>
          : <EsyalarListesi dosya={dosya} harita={veri} olcekler={olcekler} />}
      </div>
    </>
  );
}

function EsyalarListesi({ dosya, harita, olcekler }: { dosya: string; harita: any; olcekler: { id: string; ad: string }[] }) {
  const { degistir, sec } = useOyun.getState();
  const secili = useOyun(o => o.secili);
  const esyalar: Esya[] = harita?.esyalar || [];
  const uyarilar = esyaUyarilari(harita, olcekler.map(o => o.id));
  const kartlar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (secili) kartlar.current?.querySelector(`[data-esya="${CSS.escape(secili)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [secili]);
  const esyaDegistir = (id: string, fn: (e: Esya) => void, anahtar?: string) =>
    degistir(dosya, d => { const e = (d.esyalar || []).find((x: Esya) => x.id === id); if (e) fn(e); }, anahtar);
  return <>
    <p className="sayfa-aciklama">Yerdeki alınabilir eşyalar. Oyuncu yaklaşınca “[F] Al: ad” yazar; alınca mesaj görünür ve puanlar karar olarak kaydedilir.
      Krokide bir eşyayı sürükleyerek yerini değiştirebilirsin.</p>
    <Kroki dosya={dosya} harita={harita} />
    <Uyarilar liste={uyarilar} />
    <div className="kartlar" ref={kartlar}>
      {esyalar.map(e => (
        <div key={e.id} data-esya={e.id} className={"liste-karti" + (secili === e.id ? " secili" : "")} data-testid={"esya-" + e.id} onPointerDown={() => secili !== e.id && sec(e.id)}>
          <div className="liste-karti-baslik">
            <span className="renk-nokta" style={{ background: e.renk }} /><b>{e.ad || e.id}</b><span className="soluk">{e.id}</span>
            <span style={{ marginLeft: "auto" }} />
            <button className="ikon-dugme" title="Çoğalt" onClick={() => { let yeni: string | null = null; degistir(dosya, d => { yeni = esyaCogalt(d, e.id); }); sec(yeni); }}><Copy size={14} /></button>
            <button className="ikon-dugme" title="Sil" data-testid={"esya-sil-" + e.id}
              onClick={() => degistir(dosya, d => { d.esyalar = d.esyalar.filter((x: Esya) => x.id !== e.id); })}><Trash2 size={14} /></button>
          </div>
          <div className="kart-icerik">
            <label>Kimlik</label>
            <KimlikGiris deger={e.id} testId={"esya-kimlik-" + e.id} dene={yeni => {
              if (!kimlikGecerli(yeni)) return "Yalnız küçük harf, rakam ve _";
              if (yeni !== e.id && esyalar.some(x => x.id === yeni)) return "Bu kimlik zaten var";
              esyaDegistir(e.id, x => { x.id = yeni; }); if (secili === e.id) sec(yeni);
              return "";
            }} />
            <label>Ad</label>
            <YaziAlani deger={e.ad} degisti={v => esyaDegistir(e.id, x => { x.ad = v; })} testId={"esya-ad-" + e.id} />
            <label title="Metre; X sağ-sol, Y yukarı, Z yol boyunca (ileri = eksi)">Konum</label>
            <VektorAlani alan={{ tur: "vektor", ad: "", birim: "m" }} deger={e.konum} degisti={v => esyaDegistir(e.id, x => { x.konum = v as Esya["konum"]; })} />
            <label>Açı</label>
            <SayiAlani alan={{ tur: "sayi", ad: "", birim: "°" }} deger={e.aci} degisti={v => esyaDegistir(e.id, x => { x.aci = v ?? 0; }, "aci:" + e.id)} />
            <label>Renk</label>
            <RenkGiris deger={e.renk || "#808080"} degisti={v => esyaDegistir(e.id, x => { x.renk = v; }, "renk:" + e.id)} />
            <label>Mesaj</label>
            <YaziAlani deger={e.mesaj} cokSatir ipucu="Alınca ekranda görünen yazı" degisti={v => esyaDegistir(e.id, x => { x.mesaj = v; })} />
            <label>Puanlar</label>
            <PuanDuzenleyici puanlar={e.puanlar || {}} olcekler={olcekler} testId={"esya-puan-" + e.id}
              degisti={p => esyaDegistir(e.id, x => { x.puanlar = p; }, "puan:" + e.id)} />
            <label title="Eşyanın sağ eldeki duruşu (cm ve derece). İsteğe bağlı.">Elde duruşu</label>
            {e.eldeki_konum || e.eldeki_aci ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <VektorAlani alan={{ tur: "vektor", ad: "", birim: "cm" }} deger={e.eldeki_konum} degisti={v => esyaDegistir(e.id, x => { x.eldeki_konum = v as Esya["konum"]; })} />
              <VektorAlani alan={{ tur: "vektor", ad: "", birim: "°", eksenler: ["Pitch", "Yaw", "Roll"] }} deger={e.eldeki_aci} degisti={v => esyaDegistir(e.id, x => { x.eldeki_aci = v as Esya["konum"]; })} />
              <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} onClick={() => esyaDegistir(e.id, x => { delete x.eldeki_konum; delete x.eldeki_aci; })}>
                <RotateCcw size={13} /> Varsayılana dön</button>
            </div> : <button className="dugme hayalet" style={{ justifySelf: "start" }}
              onClick={() => esyaDegistir(e.id, x => { x.eldeki_konum = [0, 0, 0]; x.eldeki_aci = [0, 0, 0]; })}><Hand size={13} /> Elde duruşunu ayarla</button>}
          </div>
        </div>
      ))}
    </div>
    <div className="ekle-satiri">
      <button className="dugme birincil" data-testid="esya-ekle" onClick={() => { let id = ""; degistir(dosya, d => { id = esyaEkle(d); }); sec(id); }}>
        <Plus size={14} /> Eşya ekle</button>
    </div>
  </>;
}

/** Puanlar: { olcek_id: sayı }. Her satır bir ölçek. */
function PuanDuzenleyici({ puanlar, olcekler, degisti, testId }: { puanlar: Record<string, number>; olcekler: { id: string; ad: string }[]; degisti: (p: Record<string, number>) => void; testId?: string }) {
  const satirlar = Object.entries(puanlar);
  const bos = olcekler.find(o => !(o.id in puanlar));
  return (
    <div className="puanlar" data-testid={testId}>
      {satirlar.map(([o, v]) => (
        <div key={o} className="puan-satiri">
          <select className="giris" value={o} onChange={e => degisti(anahtarDegistir(puanlar, o, e.target.value))}>
            {!olcekler.some(x => x.id === o) && <option value={o}>{o} (bilinmiyor)</option>}
            {olcekler.map(x => <option key={x.id} value={x.id} disabled={x.id !== o && x.id in puanlar}>{x.ad}</option>)}
          </select>
          <div className="sayi-giris" style={{ width: 70, flex: "none" }}><SayiKutusu deger={v} degisti={n => degisti({ ...puanlar, [o]: n })} /></div>
          <button className="ikon-dugme" title="Kaldır" onClick={() => { const p = { ...puanlar }; delete p[o]; degisti(p); }}><Trash2 size={13} /></button>
        </div>
      ))}
      {bos ? <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} onClick={() => degisti({ ...puanlar, [bos.id]: 1 })} data-testid={testId && testId + "-ekle"}>
        <Plus size={13} /> Puan ekle</button>
        : !satirlar.length && <span className="cok-soluk">Ölçek tanımlı değil (oyun.json)</span>}
    </div>
  );
}

/** Haritanın üstten görünüşü (yaklaşık): yol soldan sağa ilerler. Eşyalar sürüklenebilir. */
function Kroki({ dosya, harita }: { dosya: string; harita: any }) {
  const svg = useRef<SVGSVGElement>(null);
  const secili = useOyun(o => o.secili);
  const { degistir, sec } = useOyun.getState();
  const yol = harita?.yol || {};
  const uzunluk = yol.uzunluk ?? 130, genislik = yol.genislik ?? 7;
  const basZ = (harita?.baslangic?.konum?.[2] ?? 4) + 2;
  const sonZ = Math.min(basZ - uzunluk, harita?.bitis?.z ?? -uzunluk);
  const esyalar: Esya[] = harita?.esyalar || [];
  const npcler: any[] = harita?.npcler || [];
  let w = genislik / 2 + 6;
  for (const n of npcler) if (n.alan?.merkez) w = Math.max(w, Math.abs(n.alan.merkez[0]) + (n.alan.yaricap || 0) + 1);
  for (const e of esyalar) w = Math.max(w, Math.abs(e.konum?.[0] ?? 0) + 2);
  w = Math.min(w, 60);
  // ekran: yatay = -z (ilerleme), dikey = x
  const vb = `${-basZ - 2} ${-w} ${basZ - sonZ + 4} ${2 * w}`;
  const surukle = (id: string) => (ev: React.PointerEvent) => {
    ev.preventDefault(); ev.stopPropagation(); sec(id);
    const el = svg.current; if (!el) return;
    const m = el.getScreenCTM(); if (!m) return;
    const ters = m.inverse();
    const hareket = (e: PointerEvent) => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ters);
      const x = Math.round(Math.max(-w, Math.min(w, p.y)) * 10) / 10, z = Math.round(-p.x * 10) / 10;
      degistir(dosya, d => { const es = d.esyalar.find((q: Esya) => q.id === id); if (es) es.konum = [x, es.konum?.[1] ?? 0, z]; }, "kroki:" + id);
    };
    const birak = () => { removeEventListener("pointermove", hareket); removeEventListener("pointerup", birak); };
    addEventListener("pointermove", hareket); addEventListener("pointerup", birak);
  };
  return (
    <div className="kroki" data-testid="kroki">
      <svg ref={svg} viewBox={vb} preserveAspectRatio="xMidYMid meet" style={{ aspectRatio: `${basZ - sonZ + 4} / ${2 * w}` }}>
        <rect x={-basZ} y={-genislik / 2} width={basZ - sonZ} height={genislik} fill={yol.renk || "#8d8478"} opacity={0.55} />
        {yol.serit !== false && <line x1={-basZ} x2={-sonZ} y1={0} y2={0} stroke="#e9e3d0" strokeWidth={0.15} strokeDasharray="1.5 1.5" opacity={0.6} />}
        {(harita?.nesneler || []).map((n: any, i: number) => n.konum && <circle key={i} cx={-n.konum[2]} cy={n.konum[0]} r={0.45} fill="#6f7686" opacity={0.7} />)}
        {npcler.map(n => n.alan?.merkez && <g key={n.id}>
          <circle cx={-n.alan.merkez[1]} cy={n.alan.merkez[0]} r={n.alan.yaricap || 1} fill="rgba(167,139,250,.08)" stroke="#a78bfa" strokeWidth={0.15} strokeDasharray="0.8 0.6" />
          <text x={-n.alan.merkez[1]} y={n.alan.merkez[0] + 0.7} className="kroki-yazi mor">{n.ad || n.id}</text>
        </g>)}
        {(harita?.kapilar || []).map((k: any) => <g key={k.id}>
          <line x1={-k.z} x2={-k.z} y1={-genislik / 2 - 1} y2={genislik / 2 + 1} stroke="#e9b949" strokeWidth={0.5} />
          <text x={-k.z} y={-genislik / 2 - 1.8} className="kroki-yazi sari">{k.id}</text>
        </g>)}
        {harita?.baslangic?.konum && <polygon points={`${-harita.baslangic.konum[2] - 1.2},${harita.baslangic.konum[0] - 1.2} ${-harita.baslangic.konum[2] + 1.6},${harita.baslangic.konum[0]} ${-harita.baslangic.konum[2] - 1.2},${harita.baslangic.konum[0] + 1.2}`} fill="#4cc38a" />}
        {harita?.bitis?.z !== undefined && <line x1={-harita.bitis.z} x2={-harita.bitis.z} y1={-genislik / 2 - 1} y2={genislik / 2 + 1} stroke="#4cc38a" strokeWidth={0.5} />}
        {esyalar.map(e => e.konum && <g key={e.id} className="kroki-esya" onPointerDown={surukle(e.id)} data-testid={"kroki-" + e.id}>
          <circle cx={-e.konum[2]} cy={e.konum[0]} r={secili === e.id ? 1.3 : 1} fill={e.renk || "#a0703c"} stroke={secili === e.id ? "#4f9cf7" : "#fff"} strokeWidth={secili === e.id ? 0.4 : 0.2} />
          <text x={-e.konum[2]} y={e.konum[0] + (e.konum[0] >= 0 ? 2.6 : -1.8)} className="kroki-yazi">{e.ad || e.id}</text>
        </g>)}
      </svg>
      <div className="kroki-lejant">
        <span><i style={{ background: "#4cc38a" }} /> başlangıç / bitiş</span><span><i style={{ background: "#e9b949" }} /> kapılar</span>
        <span><i style={{ background: "#a78bfa" }} /> kişilerin dolaşma alanı</span><span><i style={{ background: "#6f7686" }} /> dekor</span>
        <span className="cok-soluk" style={{ marginLeft: "auto" }}>üstten görünüş, yaklaşık · yol soldan sağa</span>
      </div>
    </div>
  );
}

// ================================================================== diğer dosyalar
function HamGorunum({ dosya }: { dosya: string }) {
  const veri = useOyun(o => o.veri[dosya]);
  const tur = dosyaTuru(dosya);
  const asama = tur === "diyalog" ? "Konuşma ağacı düzenleyici" : tur === "karakter_olusturma" ? "Karakter oluşturma düzenleyicisi" : tur === "oyun" ? "Ölçek düzenleyici" : "Düzenleyici";
  return (
    <div className="icerik-sayfa">
      <p className="sayfa-aciklama">{asama} henüz yok <span className="rozet yakinda">Aşama 4</span>. Şimdilik dosyanın içeriği yalnızca okunabilir.</p>
      {veri === undefined ? <div className="uyari-kutusu"><b><AlertTriangle size={14} /> Bu dosya okunamadı (JSON bozuk olabilir).</b></div>
        : <pre className="ham-json" data-testid="ham-json">{JSON.stringify(veri, null, 2)}</pre>}
    </div>
  );
}

// ================================================================== ekran
const dosyaIkonu = (yol: string) => {
  const t = dosyaTuru(yol);
  return t === "karakterler" ? <Users size={14} /> : t === "harita" ? <HaritaIkon size={14} /> : t === "diyalog" ? <MessageSquare size={14} /> : <FileJson size={14} />;
};
const dosyaAdi = (yol: string, veri: any) => {
  const t = dosyaTuru(yol);
  if (t === "karakterler") return "Karakterler";
  if (t === "oyun") return "Genel (ölçekler)";
  if (t === "karakter_olusturma") return "Karakter oluşturma";
  return veri?.ad || veri?.id || yol.split("/").pop()!.replace(/\.json$/, "");
};

function DosyaListesi() {
  const dosyalar = useOyun(o => o.dosyalar);
  const veri = useOyun(o => o.veri);
  const acik = useOyun(o => o.acik);
  const degisen = new Set(useOyun(o => o.degisenler().join("\n")).split("\n"));  // metin: her çizimde yeni dizi dönmesin
  const gruplar: [string, string[]][] = [
    ["Karakterler", dosyalar.filter(d => dosyaTuru(d) === "karakterler")],
    ["Haritalar", dosyalar.filter(d => dosyaTuru(d) === "harita")],
    ["Diyaloglar", dosyalar.filter(d => dosyaTuru(d) === "diyalog")],
    ["Diğer", dosyalar.filter(d => ["oyun", "karakter_olusturma", "diger"].includes(dosyaTuru(d)))],
  ];
  return (
    <div data-testid="oyun-dosyalari">
      {gruplar.filter(([, l]) => l.length).map(([baslik, liste]) => <div key={baslik}>
        <div className="liste-baslik">{baslik}</div>
        {liste.map(d => {
          const duzenlenir = ["karakterler", "harita"].includes(dosyaTuru(d));
          return (
            <div key={d} className={"satir" + (d === acik ? " secili" : "")} onClick={() => useOyun.getState().dosyaAc(d)} data-testid={"dosya-" + d} title={d}>
              {dosyaIkonu(d)}<span className="ad" style={duzenlenir ? undefined : { color: "var(--yazi3)" }}>{dosyaAdi(d, veri[d])}</span>
              {degisen.has(d) && <span className="nokta" style={{ background: "var(--sari)" }} title="Kaydedilmedi" />}
            </div>
          );
        })}
      </div>)}
    </div>
  );
}

function OyunAracCubugu() {
  const geri = useOyun(o => o.geri.length), ileri = useOyun(o => o.ileri.length);
  const degisen = useOyun(o => o.degisenler().length);
  const [cikisOnayi, setCikisOnayi] = useState(false);
  useEffect(() => { if (!cikisOnayi) return; const t = setTimeout(() => setCikisOnayi(false), 4000); return () => clearTimeout(t); }, [cikisOnayi]);
  const dugme = (id: string, ikon: ReactNode, yazi?: string, sinif = "") => {
    const k = komut(id);
    return <button className={yazi ? "dugme " + sinif : "ikon-dugme"} title={k.ad + (k.kisayol ? ` (${k.kisayol})` : "")} disabled={!kullanilabilir(k)}
      onClick={() => k.calistir()} data-testid={"oyun-" + id}>{ikon}{yazi}</button>;
  };
  void geri; void ileri;  // yalnız düğmelerin etkinliği yenilensin diye abone olundu
  return (
    <div className="arac-cubugu">
      {dugme("geri", <Undo2 size={16} />)}
      {dugme("yinele", <Redo2 size={16} />)}
      <span className="ayirici" />
      {dugme("kaydet", <Save size={15} />, degisen ? ` Kaydet (${degisen})` : " Kaydet", degisen ? "birincil" : "")}
      <button className="dugme hayalet" disabled={!degisen} onClick={() => useOyun.getState().degisiklikleriAt()} data-testid="oyun-at">
        <RotateCcw size={14} /> Değişiklikleri at</button>
      <span style={{ marginLeft: "auto" }} />
      {dugme("oyunKlasoru", <FolderOpen size={15} />, " Klasörü değiştir", "hayalet")}
      <button className={"dugme " + (cikisOnayi ? "tehlike" : "hayalet")} data-testid="oyun-cik" onClick={() => {
        if (degisen && !cikisOnayi) { setCikisOnayi(true); return; }
        useDurum.getState().baslangicaDon();
      }}><Home size={15} /> {cikisOnayi ? "Kaydetmeden çık?" : "Başlangıç"}</button>
    </div>
  );
}

export function OyunIcerigiEkrani() {
  const acik = useOyun(o => o.acik);
  const klasor = useOyun(o => o.klasor);
  const degisen = useOyun(o => o.degisenler().length);
  const kaydediliyor = useOyun(o => o.kaydediliyor);
  const solGenislik = useDurum(d => d.duzen.solGenislik);
  const tur = acik ? dosyaTuru(acik) : null;
  return (
    <div className="uygulama" data-testid="oyun-icerigi">
      <MenuCubugu sag={<>
        <span className="soluk">Oyun içeriği</span>
        <span className="soluk" style={{ display: "flex", alignItems: "center", gap: 4 }} data-testid="oyun-kayit-durumu">
          <Save size={13} />{kaydediliyor ? "Kaydediliyor…" : degisen ? `${degisen} dosya kaydedilmedi` : "Kaydedildi"}
        </span>
      </>} />
      <OyunAracCubugu />
      <div className="calisma">
        <div className="dock sol" style={{ width: Math.max(220, solGenislik) }}>
          <div className="sekmeler"><span className="sekme aktif"><FileJson size={14} />İçerik dosyaları</span></div>
          <div className="dock-icerik"><DosyaListesi /></div>
        </div>
        <div className="merkez" style={{ overflow: "auto" }}>
          {!acik ? <div className="bos-durum">Soldan bir dosya seç.</div>
            : tur === "karakterler" ? <KarakterlerSayfasi dosya={acik} />
            : tur === "harita" ? <HaritaSayfasi key={acik} dosya={acik} />
            : <HamGorunum dosya={acik} />}
        </div>
      </div>
      <div className="durum-cubugu">
        <span><FolderOpen size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{klasor}</span>
        <span>{acik}</span>
        <div className="sag"><span>Kayıtta eski hâl yedeklenir: Belgeler/OyunAtolyesi/icerik_yedekleri</span></div>
      </div>
    </div>
  );
}
