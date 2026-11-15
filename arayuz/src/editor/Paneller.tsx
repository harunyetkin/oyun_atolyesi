// Yan ve alt paneller: nesneler, sahne ağacı, özellikler, olaylar, varlıklar, değişkenler, konsol, sürümler.
import { useMemo, useState, type ReactNode } from "react";
import {
  Plus, Search, Eye, EyeOff, Lock, Unlock, Trash2, Copy, Box, Layers, Clapperboard, Palette, Atom, Shapes,
  Lightbulb, Footprints, Image, Music, Type, PenTool, Zap, MousePointerClick, Timer, Variable, Sparkles, Flag,
  Volume2, Skull, PlusCircle, Workflow, LayoutDashboard, History, RotateCcw,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter, AlignLeft,
} from "lucide-react";
import { komut, kullanilabilir } from "./komutlar";
import { aktifSahne, seciliOrnekler, useDurum } from "../depo/durum";
import type { Bilesenler, NesneTuru, Ornek, Sekil, Degisken, Sahne } from "../depo/proje";
import { yeniId } from "../depo/proje";
import { SEKIL_ADLARI } from "../motor/cizim";
import "../motor/davranislar";
import { ayarlariTamamla, davranisBul, davranisListesi, varsayilanAyarlar, type AyarDegeri, type AyarTanimi } from "../motor/davranis";
import { TUS_ADLARI } from "../motor/tipler";
import { Kart, Kaydirici, OnIzleme, RenkGiris, SayiGiris } from "./Ortak";

// ============================================================ Nesneler
export function NesnelerPaneli() {
  const turler = useDurum(d => d.proje?.nesneTurleri || []);
  const secim = useDurum(d => d.secim);
  const { sec, turEkle, ornekEkle } = useDurum.getState();
  const [ara, setAra] = useState("");
  const liste = turler.filter(t => (t.ad + " " + t.etiketler.join(" ")).toLocaleLowerCase("tr").includes(ara.toLocaleLowerCase("tr")));
  return (
    <>
      <div className="arama">
        <div className="sayi-giris" style={{ flex: 1 }}><span><Search size={13} /></span>
          <input placeholder="Nesne ara" value={ara} onChange={e => setAra(e.target.value)} /></div>
        <button className="ikon-dugme" title="Yeni nesne türü (Ctrl+Shift+N)" onClick={turEkle} data-testid="yeni-tur"><Plus size={16} /></button>
      </div>
      <div className="liste-baslik"><span>Nesne türleri</span><span>{turler.length}</span></div>
      {liste.map(t => (
        <div key={t.id} className={"satir" + (secim?.tur === "nesneTuru" && secim.id === t.id ? " secili" : "")}
          draggable onDragStart={e => { e.dataTransfer.setData("text/nesne-turu", t.id); e.dataTransfer.effectAllowed = "copy"; }}
          onClick={() => sec({ tur: "nesneTuru", id: t.id })}
          onDoubleClick={() => { const s = aktifSahne(useDurum.getState()); if (s) ornekEkle(t.id, s.genislik / 2, s.yukseklik / 2); }}
          title="Sahneye sürükle ya da çift tıkla">
          <div className="on-izleme"><OnIzleme tur={t} /></div>
          <span className="ad">{t.ad}</span>
          {t.etiketler[0] && <span className="rozet">{t.etiketler[0]}</span>}
        </div>
      ))}
      {!turler.length && <div className="bos-durum">Henüz nesne yok.<br />Yukarıdaki <b>+</b> ile ilk nesneni oluştur, sonra sahneye sürükle.</div>}
      {!!turler.length && <div className="cok-soluk" style={{ padding: "10px 12px", fontSize: 12 }}>İpucu: bir nesneyi sahneye sürükle ya da çift tıkla.</div>}
    </>
  );
}

// ============================================================ Sahne ağacı ve katmanlar
export function SahneAgaci() {
  const proje = useDurum(d => d.proje);
  const aktifId = useDurum(d => d.aktifSahneId);
  const secim = useDurum(d => d.secim);
  const { sec, degistir, set } = useDurum.getState();
  if (!proje) return null;
  const turler = new Map(proje.nesneTurleri.map(t => [t.id, t]));
  const sahne = proje.sahneler.find(s => s.id === aktifId);
  const sahneEkle = () => {
    const id = yeniId("sahne");
    degistir(p => p.sahneler.push({ id, ad: "Sahne " + (p.sahneler.length + 1), genislik: p.ayarlar.ekranGenislik, yukseklik: p.ayarlar.ekranYukseklik,
      arkaplan: "#1d2230", katmanlar: structuredClone(p.sahneler[0]?.katmanlar || []), ornekler: [] }));
    set("aktifSahneId", id);
  };
  return (
    <>
      <div className="liste-baslik"><span>Sahneler</span>
        <button className="ikon-dugme" style={{ width: 22, height: 22 }} title="Yeni sahne" onClick={sahneEkle}><Plus size={14} /></button></div>
      {proje.sahneler.map(s => (
        <div key={s.id} className={"satir" + (s.id === aktifId ? " secili" : "")} onClick={() => { set("aktifSahneId", s.id); sec({ tur: "sahne", id: s.id }); }}>
          <Clapperboard size={15} /><span className="ad">{s.ad}</span>
          {proje.ayarlar.baslangicSahnesi === s.id && <span className="rozet">başlangıç</span>}
        </div>
      ))}
      {sahne && <>
        <div className="liste-baslik"><span>Katmanlar ve nesneler</span><span>{sahne.ornekler.length}</span></div>
        {[...sahne.katmanlar].reverse().map(k => (
          <div key={k.id}>
            <div className="satir" style={{ fontWeight: 600 }}>
              <Layers size={15} /><span className="ad">{k.ad}</span>
              <button className="ikon-dugme" style={{ width: 22, height: 22 }} title={k.gorunur ? "Gizle" : "Göster"}
                onClick={e => { e.stopPropagation(); degistir(p => { const kk = p.sahneler.find(x => x.id === sahne.id)!.katmanlar.find(x => x.id === k.id)!; kk.gorunur = !kk.gorunur; }); }}>
                {k.gorunur ? <Eye size={13} /> : <EyeOff size={13} />}</button>
              <button className="ikon-dugme" style={{ width: 22, height: 22 }} title={k.kilitli ? "Kilidi aç" : "Kilitle"}
                onClick={e => { e.stopPropagation(); degistir(p => { const kk = p.sahneler.find(x => x.id === sahne.id)!.katmanlar.find(x => x.id === k.id)!; kk.kilitli = !kk.kilitli; }); }}>
                {k.kilitli ? <Lock size={13} /> : <Unlock size={13} />}</button>
            </div>
            {sahne.ornekler.filter(o => o.katman === k.id).map(o => {
              const t = turler.get(o.turId);
              return (
                <div key={o.id} className={"satir" + (seciliOrnekler(secim).includes(o.id) ? " secili" : "")} style={{ paddingLeft: 30 }}
                  onClick={e => {
                    // Shift ya da Ctrl ile tıklayınca seçime ekle / çıkar
                    const idler = seciliOrnekler(secim);
                    if (!(e.shiftKey || e.ctrlKey)) { sec({ tur: "ornek", id: o.id }); return; }
                    const yeni = idler.includes(o.id) ? idler.filter(x => x !== o.id) : [...idler, o.id];
                    sec(yeni.length ? { tur: "ornek", id: yeni[0], digerleri: yeni.slice(1) } : null);
                  }}>
                  {t ? <OnIzleme tur={t} boyut={18} /> : <Box size={15} />}
                  <span className="ad">{t?.ad || "?"}</span>
                  <span className="cok-soluk" style={{ fontSize: 11 }}>{Math.round(o.x)}, {Math.round(o.y)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </>}
    </>
  );
}

// ============================================================ Özellikler
const BILESEN_BILGI: Record<string, { ad: string; ikon: ReactNode; yakinda?: string }> = {
  gorunum: { ad: "Görünüm", ikon: <Palette size={14} /> },
  fizik: { ad: "Fizik", ikon: <Atom size={14} /> },
  carpisma: { ad: "Çarpışma alanı", ikon: <Shapes size={14} /> },
  isik: { ad: "Işık kaynağı", ikon: <Lightbulb size={14} /> },
  davranislar: { ad: "Davranışlar", ikon: <Footprints size={14} /> },
  parcacik: { ad: "Parçacık yayıcı", ikon: <Sparkles size={14} />, yakinda: "Aşama 3" },
  ses: { ad: "Ses kaynağı", ikon: <Volume2 size={14} />, yakinda: "Aşama 4" },
  animasyon: { ad: "Animasyon", ikon: <Image size={14} />, yakinda: "Aşama 5" },
};
const VARSAYILAN: Required<Pick<Bilesenler, "gorunum" | "fizik" | "carpisma" | "isik" | "davranislar">> = {
  gorunum: { sekil: "kare", renk: "#5aa9f0", genislik: 48, yukseklik: 48, saydamlik: 1 },
  fizik: { yercekimi: 1500, hizX: 0, hizY: 0, enYuksekHiz: 900, surtunme: 0 },
  carpisma: { bicim: "kutu", olcek: 1, kati: false },
  isik: { yaricap: 120, guc: 0.8, renk: "#fff2c0" },
  davranislar: [],
};
// Davranışlar motorun kayıt sisteminden gelir (motor/davranislar/). Burada yalnızca henüz
// yapılmamış olanların "yakında" listesi var.
const YAKINDA_DAVRANISLAR: { tur: string; ad: string; yakinda: string }[] = [
  { tur: "ureteci", ad: "Rastgele üretici", yakinda: "Aşama 2" },
  { tur: "suzul", ad: "Aşağı yukarı süzül", yakinda: "Aşama 3" },
  { tur: "platform", ad: "Platform karakteri", yakinda: "Aşama 5" },
  { tur: "ustten_hareket", ad: "Yukarıdan bakış hareketi", yakinda: "Aşama 5" },
];

/** Hizalama düğmeleri: tek nesne sahneye göre, birden fazla nesne birbirine göre hizalanır. */
function HizalamaKarti() {
  const secim = useDurum(d => d.secim);
  const sayi = seciliOrnekler(secim).length;
  const dugmeler: [string, ReactNode][] = [
    ["sol", <AlignStartVertical size={15} />], ["yatayOrta", <AlignCenterVertical size={15} />], ["sag", <AlignEndVertical size={15} />],
    ["ust", <AlignStartHorizontal size={15} />], ["dikeyOrta", <AlignCenterHorizontal size={15} />], ["alt", <AlignEndHorizontal size={15} />],
    ["yatayDagit", <AlignHorizontalDistributeCenter size={15} />], ["dikeyDagit", <AlignVerticalDistributeCenter size={15} />],
  ];
  return (
    <Kart baslik={sayi > 1 ? `Hizala · ${sayi} nesne seçili` : "Hizala · sahneye göre"} ikon={<AlignLeft size={14} />}>
      <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: 2 }} data-testid="hizalama">
        {dugmeler.map(([mod, ikon]) => {
          const k = komut("hizala_" + mod);
          return <button key={mod} className="ikon-dugme" disabled={!kullanilabilir(k)} data-testid={"hizala-" + mod}
            title={k.ad + (k.kisayol ? ` (${k.kisayol})` : "")} onClick={() => k.calistir()}>{ikon}</button>;
        })}
      </div>
      {sayi > 1 && <div className="soluk" style={{ gridColumn: "1 / -1", fontSize: 12 }}>Aşağıdaki ayarlar asıl seçili nesneye (koyu mavi çerçeveli) aittir. Taşıma, silme, çoğaltma ve hizalama seçili hepsine uygulanır.</div>}
    </Kart>
  );
}

export function Ozellikler() {
  const proje = useDurum(d => d.proje);
  const secim = useDurum(d => d.secim);
  const aktifId = useDurum(d => d.aktifSahneId);
  const { degistir } = useDurum.getState();
  if (!proje) return null;

  let ornek: Ornek | undefined, tur: NesneTuru | undefined;
  if (secim?.tur === "ornek") {
    for (const s of proje.sahneler) { ornek = s.ornekler.find(o => o.id === secim.id); if (ornek) break; }
    tur = proje.nesneTurleri.find(t => t.id === ornek?.turId);
  } else if (secim?.tur === "nesneTuru") tur = proje.nesneTurleri.find(t => t.id === secim.id);

  if (!ornek && !tur) {
    const sahne = proje.sahneler.find(s => s.id === (secim?.tur === "sahne" ? secim.id : aktifId));
    if (!sahne) return null;
    const sd = (fn: (s: Sahne) => void) => degistir(p => fn(p.sahneler.find(x => x.id === sahne.id)!));
    return (
      <>
        <div className="ozellik-baslik"><Clapperboard size={20} /><div><div className="tur-adi">{sahne.ad}</div><div className="soluk">Sahne</div></div></div>
        <Kart baslik="Sahne" ikon={<Clapperboard size={14} />}>
          <label>Ad</label><input className="giris" value={sahne.ad} onChange={e => sd(s => { s.ad = e.target.value; })} />
          <label>Boyut</label>
          <div className="ikili"><SayiGiris etiket="G" deger={sahne.genislik} min={64} degisti={v => sd(s => { s.genislik = v; })} />
            <SayiGiris etiket="Y" deger={sahne.yukseklik} min={64} degisti={v => sd(s => { s.yukseklik = v; })} /></div>
          <label>Arka plan</label><RenkGiris deger={sahne.arkaplan} degisti={v => sd(s => { s.arkaplan = v; })} />
        </Kart>
        <div className="bos-durum">Sahnede bir nesneye tıkla ya da soldaki listeden bir nesne türü seç.</div>
      </>
    );
  }

  const td = (fn: (t: NesneTuru) => void) => tur && degistir(p => fn(p.nesneTurleri.find(x => x.id === tur!.id)!));
  const od = (fn: (o: Ornek) => void) => ornek && degistir(p => p.sahneler.forEach(s => s.ornekler.forEach(o => { if (o.id === ornek!.id) fn(o); })));
  const b = tur?.bilesenler || {};
  const kaldir = (anahtar: keyof Bilesenler) => (
    <button className="ikon-dugme" style={{ width: 22, height: 22 }} title="Bileşeni kaldır" onClick={() => td(t => { delete t.bilesenler[anahtar]; })}><Trash2 size={13} /></button>
  );
  const eksikler = (Object.keys(BILESEN_BILGI) as string[]).filter(k => !(k in b));
  const ornekSayisi = tur ? proje.sahneler.reduce((n, s) => n + s.ornekler.filter(o => o.turId === tur!.id).length, 0) : 0;

  return (
    <div data-testid="ozellikler">
      <div className="ozellik-baslik">
        {tur && <OnIzleme tur={tur} boyut={38} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tur && <input className="giris tur-adi" style={{ fontWeight: 600, fontSize: 15, padding: "3px 6px" }} value={tur.ad} onChange={e => td(t => { t.ad = e.target.value; })} />}
          <div className="soluk" style={{ marginTop: 3, paddingLeft: 6 }}>{ornek ? "Sahnedeki örnek" : `Nesne türü · sahnede ${ornekSayisi} örnek`}</div>
        </div>
        <button className="ikon-dugme" title="Çoğalt (Ctrl+D)" onClick={() => useDurum.getState().secileniCogalt()}><Copy size={15} /></button>
        <button className="ikon-dugme" title="Sil (Delete)" onClick={() => useDurum.getState().secileniSil()}><Trash2 size={15} /></button>
      </div>

      {ornek && <HizalamaKarti />}

      {ornek && (
        <Kart baslik="Dönüşüm" ikon={<Box size={14} />}>
          <label>Konum</label>
          <div className="ikili"><SayiGiris etiket="X" deger={ornek.x} degisti={v => od(o => { o.x = v; })} /><SayiGiris etiket="Y" deger={ornek.y} degisti={v => od(o => { o.y = v; })} /></div>
          <label>Açı</label><SayiGiris etiket="°" deger={ornek.aci} degisti={v => od(o => { o.aci = v; })} />
          <label>Ölçek</label>
          <div className="ikili"><SayiGiris etiket="X" adim={0.01} deger={ornek.olcekX} degisti={v => od(o => { o.olcekX = v; })} /><SayiGiris etiket="Y" adim={0.01} deger={ornek.olcekY} degisti={v => od(o => { o.olcekY = v; })} /></div>
          <label>Katman</label>
          <select className="giris" value={ornek.katman} onChange={e => od(o => { o.katman = e.target.value; })}>
            {aktifSahne(useDurum.getState())?.katmanlar.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
          </select>
        </Kart>
      )}

      {tur && <>
        {ornek && <div className="cok-soluk" style={{ padding: "8px 12px", fontSize: 12, borderBottom: "1px solid var(--cizgi)" }}>
          Aşağıdaki ayarlar <b>{tur.ad}</b> türündeki bütün örnekleri etkiler.</div>}
        <Kart baslik="Etiketler" ikon={<Flag size={14} />} acikBaslar={!ornek}>
          <label>Etiketler</label>
          <input className="giris" placeholder="ör. engel, oyuncu" value={tur.etiketler.join(", ")}
            onChange={e => td(t => { t.etiketler = e.target.value.split(",").map(x => x.trim()).filter(Boolean); })} />
        </Kart>

        {b.gorunum && (
          <Kart baslik="Görünüm" ikon={BILESEN_BILGI.gorunum.ikon} sag={kaldir("gorunum")}>
            <label>Şekil</label>
            <select className="giris" value={b.gorunum.sekil} onChange={e => td(t => { t.bilesenler.gorunum!.sekil = e.target.value as Sekil; })}>
              {Object.entries(SEKIL_ADLARI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <label>Renk</label><RenkGiris deger={b.gorunum.renk} degisti={v => td(t => { t.bilesenler.gorunum!.renk = v; })} />
            <label>Boyut</label>
            <div className="ikili"><SayiGiris etiket="G" min={1} deger={b.gorunum.genislik} degisti={v => td(t => { t.bilesenler.gorunum!.genislik = v; })} />
              <SayiGiris etiket="Y" min={1} deger={b.gorunum.yukseklik} degisti={v => td(t => { t.bilesenler.gorunum!.yukseklik = v; })} /></div>
            <label>Saydamlık</label><Kaydirici min={0} max={1} adim={0.05} deger={b.gorunum.saydamlik} degisti={v => td(t => { t.bilesenler.gorunum!.saydamlik = v; })} />
            <label>Çizim</label><button className="dugme" disabled title="Aşama 5">Kendi çizimini yap <span className="rozet yakinda">Aşama 5</span></button>
          </Kart>
        )}
        {b.fizik && (
          <Kart baslik="Fizik" ikon={BILESEN_BILGI.fizik.ikon} sag={kaldir("fizik")}>
            <label>Yerçekimi</label><SayiGiris etiket="↓" adim={10} deger={b.fizik.yercekimi} degisti={v => td(t => { t.bilesenler.fizik!.yercekimi = v; })} />
            <label>Başlangıç hızı</label>
            <div className="ikili"><SayiGiris etiket="X" adim={5} deger={b.fizik.hizX} degisti={v => td(t => { t.bilesenler.fizik!.hizX = v; })} />
              <SayiGiris etiket="Y" adim={5} deger={b.fizik.hizY} degisti={v => td(t => { t.bilesenler.fizik!.hizY = v; })} /></div>
            <label>En yüksek hız</label><SayiGiris adim={10} min={0} deger={b.fizik.enYuksekHiz} degisti={v => td(t => { t.bilesenler.fizik!.enYuksekHiz = v; })} />
            <label>Sürtünme</label><Kaydirici min={0} max={1} adim={0.05} deger={b.fizik.surtunme} degisti={v => td(t => { t.bilesenler.fizik!.surtunme = v; })} />
          </Kart>
        )}
        {b.carpisma && (
          <Kart baslik="Çarpışma alanı" ikon={BILESEN_BILGI.carpisma.ikon} sag={kaldir("carpisma")}>
            <label>Biçim</label>
            <select className="giris" value={b.carpisma.bicim} onChange={e => td(t => { t.bilesenler.carpisma!.bicim = e.target.value as "daire" | "kutu"; })}>
              <option value="daire">Daire</option><option value="kutu">Kutu</option>
            </select>
            <label>Ölçek</label><Kaydirici min={0.2} max={1.5} adim={0.05} deger={b.carpisma.olcek} degisti={v => td(t => { t.bilesenler.carpisma!.olcek = v; })} />
            <label>Katı</label><label style={{ display: "flex", gap: 6 }}><input type="checkbox" checked={b.carpisma.kati} onChange={e => td(t => { t.bilesenler.carpisma!.kati = e.target.checked; })} /> İçinden geçilemez</label>
          </Kart>
        )}
        {b.isik && (
          <Kart baslik="Işık kaynağı" ikon={BILESEN_BILGI.isik.ikon} sag={kaldir("isik")}>
            <label>Yarıçap</label><SayiGiris adim={5} min={0} deger={b.isik.yaricap} degisti={v => td(t => { t.bilesenler.isik!.yaricap = v; })} />
            <label>Güç</label><Kaydirici min={0} max={1} adim={0.05} deger={b.isik.guc} degisti={v => td(t => { t.bilesenler.isik!.guc = v; })} />
            <label>Renk</label><RenkGiris deger={b.isik.renk} degisti={v => td(t => { t.bilesenler.isik!.renk = v; })} />
          </Kart>
        )}
        {b.davranislar && (
          <Kart baslik="Davranışlar" ikon={BILESEN_BILGI.davranislar.ikon} sag={kaldir("davranislar")}>
            {b.davranislar.map((dv, i) => {
              const tanim = davranisBul(dv.tur);
              const ayarlar = tanim ? ayarlariTamamla(tanim, dv.ayarlar) : dv.ayarlar;
              return (
                <div key={i} data-testid={"davranis-" + dv.tur} style={{ gridColumn: "1 / -1", background: "var(--z2)", borderRadius: 6, padding: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: tanim?.ayarlar.length ? 8 : 0 }} title={tanim?.aciklama}>
                    <Footprints size={13} /><b style={{ flex: 1 }}>{tanim?.ad || dv.tur}</b>
                    {!tanim && <span className="rozet yakinda">tanınmıyor</span>}
                    <button className="ikon-dugme" style={{ width: 22, height: 22 }} title="Davranışı kaldır" onClick={() => td(t => { t.bilesenler.davranislar!.splice(i, 1); })}><Trash2 size={13} /></button>
                  </div>
                  {tanim && tanim.ayarlar.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 6, alignItems: "center" }}>
                      {tanim.ayarlar.map(at => (
                        <DavranisAyari key={at.ad} tanim={at} deger={ayarlar[at.ad]}
                          degisti={nv => td(t => { t.bilesenler.davranislar![i].ayarlar = { ...ayarlar, [at.ad]: nv }; })} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <select className="giris" style={{ gridColumn: "1 / -1" }} value="" data-testid="davranis-ekle"
              onChange={e => { const t0 = davranisBul(e.target.value); if (t0) td(t => { t.bilesenler.davranislar!.push({ tur: t0.tur, ayarlar: varsayilanAyarlar(t0) }); }); }}>
              <option value="">+ Davranış ekle…</option>
              {davranisListesi().map(t => <option key={t.tur} value={t.tur}>{t.ad}</option>)}
              {YAKINDA_DAVRANISLAR.map(t => <option key={t.tur} value="" disabled>{t.ad} ({t.yakinda})</option>)}
            </select>
          </Kart>
        )}

        <div className="bilesen-ekle">
          <select className="giris" value="" data-testid="bilesen-ekle"
            onChange={e => { const k = e.target.value as keyof typeof VARSAYILAN; if (k in VARSAYILAN) td(t => { (t.bilesenler as any)[k] = structuredClone(VARSAYILAN[k]); }); }}>
            <option value="">+ Bileşen ekle…</option>
            {eksikler.map(k => <option key={k} value={k} disabled={!!BILESEN_BILGI[k].yakinda}>{BILESEN_BILGI[k].ad}{BILESEN_BILGI[k].yakinda ? ` (${BILESEN_BILGI[k].yakinda})` : ""}</option>)}
          </select>
        </div>
      </>}
    </div>
  );
}

/** Bir davranış ayarı için tanımına uygun giriş kutusu (sayı, tuş, seçim, onay). */
function DavranisAyari({ tanim, deger, degisti }: { tanim: AyarTanimi; deger: AyarDegeri; degisti: (v: AyarDegeri) => void }) {
  let giris: ReactNode;
  switch (tanim.tur) {
    case "sayi":
      giris = <SayiGiris adim={tanim.adim ?? 1} min={tanim.min} deger={Number(deger)} degisti={degisti} />; break;
    case "tus":
      giris = <select className="giris" data-testid="davranis-tus" value={String(deger)} onChange={e => degisti(e.target.value)}>
        {TUS_ADLARI.map(t => <option key={t}>{t}</option>)}
      </select>; break;
    case "secim":
      giris = <select className="giris" value={String(deger)} onChange={e => degisti(e.target.value)}>
        {tanim.secenekler.map(s => <option key={s.deger} value={s.deger}>{s.ad}</option>)}
      </select>; break;
    case "onay":
      giris = <input type="checkbox" checked={!!deger} onChange={e => degisti(e.target.checked)} />; break;
  }
  return <><label className="soluk">{tanim.etiket}</label>{giris}</>;
}

// ============================================================ Olay kuralları
const KOSUL_IKON: Record<string, ReactNode> = {
  sahne_basladi: <Flag size={14} />, her_x_saniye: <Timer size={14} />, carpisti: <Zap size={14} />,
  gecti: <MousePointerClick size={14} />, karsilastir: <Variable size={14} />,
};
const EYLEM_IKON: Record<string, ReactNode> = {
  degisken_ata: <Variable size={14} />, degisken_ekle: <PlusCircle size={14} />, nesne_olustur: <Box size={14} />,
  ses: <Volume2 size={14} />, sarsinti: <Sparkles size={14} />, oyun_bitti: <Skull size={14} />,
};
export function OlaylarSayfasi() {
  const kurallar = useDurum(d => d.proje?.kurallar || []);
  return (
    <div className="olaylar" data-testid="olaylar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Workflow size={18} /><b style={{ fontSize: 15 }}>Olay kuralları</b>
        <span className="rozet yakinda">önizleme · düzenleme Aşama 2</span>
        <span style={{ flex: 1 }} />
        <button className="dugme" disabled><Plus size={14} /> Kural ekle</button>
        <button className="dugme" disabled>Grup ekle</button>
      </div>
      <div className="soluk" style={{ marginBottom: 6 }}>Her satır bir kuraldır: soldaki <b>koşullar</b> sağlandığında sağdaki <b>eylemler</b> sırayla çalışır.</div>
      {kurallar.map((k, i) => (
        <div key={k.id}>
          {k.aciklama && <div className="kural-aciklama">// {k.aciklama}</div>}
          <div className="kural">
            <div className="no">{i + 1}</div>
            <div className="kosullar">
              {k.kosullar.map((c, j) => <div key={j} className="oge">{KOSUL_IKON[c.tur] || <Flag size={14} />}{c.metin}</div>)}
              <div className="ekle">+ koşul ekle</div>
            </div>
            <div className="eylemler">
              {k.eylemler.map((c, j) => <div key={j} className="oge">{EYLEM_IKON[c.tur] || <Zap size={14} />}{c.metin}</div>)}
              <div className="ekle">+ eylem ekle</div>
            </div>
          </div>
        </div>
      ))}
      {!kurallar.length && <div className="bos-durum">Bu projede henüz kural yok. Kural düzenleyici Aşama 2'de gelecek.</div>}
    </div>
  );
}

export function ArayuzDuzenleyici() {
  return (
    <div className="bos-durum" style={{ paddingTop: 80 }} data-testid="arayuz-duzenleyici">
      <LayoutDashboard size={40} /><h3 style={{ color: "var(--yazi)" }}>Arayüz (HUD) düzenleyici</h3>
      Skor yazıları, enerji çubukları, düğmeler, menü ve "oyun bitti" ekranları burada tasarlanacak.<br />
      <span className="rozet yakinda" style={{ display: "inline-block", marginTop: 12 }}>Aşama 2 ve 4</span>
    </div>
  );
}

// ============================================================ Alt paneller
const VARLIK_IKON = { cizim: <PenTool size={26} />, resim: <Image size={26} />, ses: <Music size={26} />, yazitipi: <Type size={26} /> };
export function VarliklarPaneli() {
  const varliklar = useDurum(d => d.proje?.varliklar || []);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "10px 12px 0" }}>
        <button className="dugme" disabled><Plus size={14} /> İçe aktar <span className="rozet yakinda">Aşama 5</span></button>
        <button className="dugme" disabled><PenTool size={14} /> Yeni çizim <span className="rozet yakinda">Aşama 5</span></button>
        <button className="dugme" disabled><Music size={14} /> Ses üret <span className="rozet yakinda">Aşama 4</span></button>
      </div>
      <div className="izgara-liste">
        {varliklar.map(v => (
          <div key={v.id} className="varlik" title={v.ad}><div className="kutu">{VARLIK_IKON[v.tur]}</div><div className="ad">{v.ad}</div></div>
        ))}
      </div>
      {!varliklar.length && <div className="bos-durum">Çizimler, resimler, sesler ve yazı tipleri burada görünecek.</div>}
    </div>
  );
}

export function DegiskenlerPaneli() {
  const degiskenler = useDurum(d => d.proje?.degiskenler || []);
  const { degistir } = useDurum.getState();
  const dd = (id: string, fn: (v: Degisken) => void) => degistir(p => fn(p.degiskenler.find(x => x.id === id)!));
  return (
    <table className="tablo" data-testid="degiskenler">
      <thead><tr><th>Ad</th><th>Tür</th><th>Başlangıç değeri</th><th>Kalıcı</th><th style={{ width: 40 }}>
        <button className="ikon-dugme" style={{ width: 24, height: 24 }} title="Değişken ekle"
          onClick={() => degistir(p => { p.degiskenler.push({ id: yeniId("d"), ad: "yeniDegisken" + (p.degiskenler.length + 1), tur: "sayi", deger: 0, kalici: false }); })}><Plus size={14} /></button></th></tr></thead>
      <tbody>
        {degiskenler.map(v => (
          <tr key={v.id}>
            <td><input className="giris" value={v.ad} onChange={e => dd(v.id, x => { x.ad = e.target.value; })} /></td>
            <td><select className="giris" value={v.tur} onChange={e => dd(v.id, x => { x.tur = e.target.value as Degisken["tur"]; x.deger = x.tur === "sayi" ? 0 : x.tur === "mantik" ? false : ""; })}>
              <option value="sayi">Sayı</option><option value="metin">Metin</option><option value="mantik">Doğru/Yanlış</option></select></td>
            <td>{v.tur === "mantik"
              ? <input type="checkbox" checked={!!v.deger} onChange={e => dd(v.id, x => { x.deger = e.target.checked; })} />
              : <input className="giris" value={String(v.deger)} onChange={e => dd(v.id, x => { x.deger = x.tur === "sayi" ? Number(e.target.value) || 0 : e.target.value; })} />}</td>
            <td><input type="checkbox" checked={v.kalici} title="Oyun kapanınca da saklansın (rekor gibi)" onChange={e => dd(v.id, x => { x.kalici = e.target.checked; })} /></td>
            <td><button className="ikon-dugme" style={{ width: 24, height: 24 }} onClick={() => degistir(p => { p.degiskenler = p.degiskenler.filter(x => x.id !== v.id); })}><Trash2 size={13} /></button></td>
          </tr>
        ))}
        {!degiskenler.length && <tr><td colSpan={5} className="cok-soluk" style={{ padding: 16 }}>Skor, can, enerji gibi sayıları değişken olarak tanımla. Yukarıdaki + ile ekle.</td></tr>}
      </tbody>
    </table>
  );
}

export function KonsolPaneli() {
  const konsol = useDurum(d => d.konsol);
  return (
    <div className="konsol" data-testid="konsol">
      {konsol.map((s, i) => <div key={i}><span className="z">{s.zaman}</span><span className={s.seviye}>{s.metin}</span></div>)}
    </div>
  );
}

export function SurumlerPaneli() {
  const surumler = useDurum(d => d.surumler);
  const { surumKaydet, surumYukle } = useDurum.getState();
  const [not, setNot] = useState("");
  const [onay, setOnay] = useState<string | null>(null);
  const okunur = (t: string) => t.length >= 15 ? `${t.slice(6, 8)}.${t.slice(4, 6)}.${t.slice(0, 4)} ${t.slice(9, 11)}:${t.slice(11, 13)}` : t;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: 10, borderBottom: "1px solid var(--cizgi)" }}>
        <input id="surum-notu" className="giris" style={{ maxWidth: 420 }} placeholder="Bu sürüm için kısa not (ör. kuş daha ağır)" value={not}
          onChange={e => setNot(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { surumKaydet(not.trim()); setNot(""); } }} />
        <button className="dugme birincil" data-testid="surum-kaydet" onClick={() => { surumKaydet(not.trim()); setNot(""); }}><History size={14} /> Sürüm kaydet</button>
      </div>
      {surumler.map(s => (
        <div key={s.dosya} className="surum-satiri">
          <History size={15} className="soluk" /><span className="soluk" style={{ width: 130 }}>{okunur(s.tarih)}</span>
          <span style={{ flex: 1 }}>{s.not || <span className="cok-soluk">(not yok)</span>}</span>
          <button className="dugme" onClick={() => { if (onay === s.dosya) { surumYukle(s.dosya); setOnay(null); } else setOnay(s.dosya); }}>
            <RotateCcw size={13} /> {onay === s.dosya ? "Emin misin? Tekrar tıkla" : "Geri yükle"}</button>
        </div>
      ))}
      {!surumler.length && <div className="bos-durum">Henüz kayıtlı sürüm yok. Beğendiğin bir hali notuyla saklayabilirsin.</div>}
    </div>
  );
}
