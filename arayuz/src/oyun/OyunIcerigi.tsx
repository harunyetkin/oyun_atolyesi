// Oyun içeriği düzenleyicisi: Harun'un 3D oyununun (hikaye_oyun) icerik/*.json dosyalarını
// kod yazmadan düzenleme ekranı. Şimdilik: karakterler.json (oyuncu ayarları ve kişilerin bedenleri)
// ve haritalar (kişiler ve kalabalık, yerdeki eşyalar, Unreal ayarları, yol, ışık). Diğer dosyalar salt okunur gösterilir.
// Giriş kutuları girisler.tsx'te, kroki Kroki.tsx'te, kişiler sayfası Kisiler.tsx'tedir.
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
  yolOku, yolYaz, type Esya, type Uyari,
} from "./icerik";
import { Kart, RenkGiris } from "../editor/Ortak";
import { AlanGirisi, AlanSatiri, KimlikGiris, PuanDuzenleyici, SayiAlani, Uyarilar, VektorAlani, YaziAlani } from "./girisler";
import { Kroki } from "./Kroki";
import { KisilerListesi as HaritaKisileri } from "./Kisiler";
import { MenuCubugu } from "../editor/Cerceve";
import { komut, kullanilabilir } from "../editor/komutlar";


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


// ================================================================== haritalar
function HaritaSayfasi({ dosya }: { dosya: string }) {
  const veri = useOyun(o => o.veri[dosya]);
  const oyun = useOyun(o => o.veri["oyun.json"]);
  const [sekme, setSekme] = useState<"kisiler" | "esyalar" | "ayarlar">("kisiler");
  const olcekler: { id: string; ad: string }[] = oyun?.olcekler || [];
  const tanimli = tanimliYollar(HARITA_GRUPLARI);
  return (
    <>
      <SayfaSekmeleri aktif={sekme} sec={t => { setSekme(t); useOyun.getState().sec(null); }} sekmeler={[
        { id: "kisiler", ad: "Kişiler", ikon: <Users size={14} />, sayi: (veri?.npcler || []).length },
        { id: "esyalar", ad: "Eşyalar", ikon: <Package size={14} />, sayi: (veri?.esyalar || []).length },
        { id: "ayarlar", ad: "Harita ayarları", ikon: <Settings2 size={14} /> }]} />
      <div className="icerik-sayfa">
        {sekme === "ayarlar"
          ? <div className="kartlar">{HARITA_GRUPLARI.map(g => <GrupKarti key={g.baslik} grup={g} dosya={dosya} onEk="" kok={veri} tanimli={tanimli} />)}</div>
          : sekme === "kisiler" ? <HaritaKisileri dosya={dosya} harita={veri} />
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
            <label title="Çantada eşyanın altında görünen açıklama">Açıklama</label>
            <YaziAlani deger={e.aciklama} cokSatir ipucu="Çantada görünen açıklama (isteğe bağlı)" testId={"esya-aciklama-" + e.id}
              degisti={v => esyaDegistir(e.id, x => { if (v) x.aciklama = v; else delete x.aciklama; })} />
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
