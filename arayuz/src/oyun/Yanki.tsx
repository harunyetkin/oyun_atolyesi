// Yankı düzenleyicisi: yanki/icerik/yanki.json (Yankı'nın his ayarları ve el yapımı bölümleri).
// "Ayarlar" sekmesi şemadan (sema.ts → YANKI_GRUPLARI) kart olarak çizilir. "Bölümler" sekmesinde bölüm listesi ve
// yandan görünüşlü bölüm düzenleyici var: mağara duvarının noktaları, sarkıt/dikitler, örümcek ağları, su damlaları ve ateş
// böcekleri tek tek konur ve sürüklenir; yarasanın geçemeyeceği dar yerler kırmızı gösterilir.
// Mağara ve geçit hesapları Yankı'nın kendi kodundan gelir (yankiIcerik.ts): burada görünen oyundakiyle aynıdır.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown, ArrowUp, Copy, Hand, Maximize2, Minus, MousePointer2, Plus, Trash2, Triangle, Bug, Droplet, Spline, AlertTriangle, Play, Settings2, Layers,
} from "lucide-react";
import { useOyun } from "./durum";
import { GrupKarti } from "./GrupKarti";
import { KimlikGiris, SayiAlani, Uyarilar, YaziAlani } from "./girisler";
import { YANKI_GRUPLARI, tanimliYollar } from "./sema";
import { kimlikGecerli } from "./icerik";
import { yankiOyna } from "./ac";
import {
  bolumCogalt, bolumDenetimi, bolumEkle, bolumOyunu, H, nesneY, noktaEkle, noktalaraCevir, sivriIcinYer, type HamBolum,
} from "./yankiIcerik";

type Arac = "sec" | "sarkit" | "dikit" | "ag" | "damla" | "bocek" | "nokta";
const ARACLAR: [Arac, string, ReactNode][] = [
  ["sec", "Seç ve sürükle (boş yeri sürükleyince kaydırır)", <MousePointer2 size={14} />],
  ["sarkit", "Sarkıt koy (tavandan)", <Triangle size={14} style={{ transform: "rotate(180deg)" }} />],
  ["dikit", "Dikit koy (tabandan)", <Triangle size={14} />],
  ["ag", "Örümcek ağı koy", <Spline size={14} />],
  ["damla", "Su damlası koy (tavana asılır)", <Droplet size={14} />],
  ["bocek", "Ateş böceği koy", <Bug size={14} />],
  ["nokta", "Duvara nokta ekle (tıkladığın yerde)", <Plus size={14} />],
];

export function YankiSayfasi({ dosya }: { dosya: string }) {
  const [sekme, setSekme] = useState<"bolumler" | "ayarlar">("bolumler");
  const veri = useOyun(o => o.veri[dosya]);
  return (
    <>
      <div className="sekmeler" style={{ position: "sticky", top: 0, zIndex: 2 }}>
        <button className={"sekme" + (sekme === "bolumler" ? " aktif" : "")} onClick={() => setSekme("bolumler")} data-testid="yanki-sekme-bolumler">
          <Layers size={14} />Bölümler<span className="rozet">{Array.isArray(veri?.bolumler) ? veri.bolumler.length : 0}</span></button>
        <button className={"sekme" + (sekme === "ayarlar" ? " aktif" : "")} onClick={() => setSekme("ayarlar")} data-testid="yanki-sekme-ayarlar">
          <Settings2 size={14} />Ayarlar</button>
        <span style={{ marginLeft: "auto" }} />
        <button className="dugme" style={{ margin: "4px 8px" }} onClick={() => void yankiOyna()} data-testid="yanki-oyna"><Play size={14} /> Oyna (Yanki.html)</button>
      </div>
      <div className="icerik-sayfa">
        {veri === undefined ? <div className="uyari-kutusu"><b><AlertTriangle size={14} /> yanki.json okunamadı (JSON bozuk olabilir).</b></div>
          : sekme === "ayarlar" ? <YankiAyarlari dosya={dosya} veri={veri} /> : <BolumlerSayfasi dosya={dosya} veri={veri} />}
      </div>
    </>
  );
}

function YankiAyarlari({ dosya, veri }: { dosya: string; veri: any }) {
  const tanimli = tanimliYollar(YANKI_GRUPLARI);
  return <>
    <p className="sayfa-aciklama">Yankı'nın his ayarları. Dünya birimi: ekran yüksekliği 1000. Bir kutuyu boşaltırsan oyun kendi varsayılanını kullanır.
      Kaydedince <b>Yanki.html</b> de yenilenir; <b>Oyna</b> ile hemen dene.</p>
    <div className="kartlar">
      {YANKI_GRUPLARI.map(g => <GrupKarti key={g.baslik} grup={g} dosya={dosya} onEk="" kok={veri} tanimli={tanimli} />)}
    </div>
  </>;
}

// ================================================================== bölümler
function BolumlerSayfasi({ dosya, veri }: { dosya: string; veri: any }) {
  const { degistir } = useOyun.getState();
  const bolumler: HamBolum[] = Array.isArray(veri.bolumler) ? veri.bolumler : [];
  const [seciliId, setSeciliId] = useState<string>(bolumler[0]?.id ?? "");
  const i = Math.max(0, bolumler.findIndex(b => b.id === seciliId));
  const b = bolumler[i];
  const d = (fn: (v: any) => void, anahtar?: string) => degistir(dosya, fn, anahtar);
  const bd = (fn: (h: HamBolum) => void, anahtar?: string) => d(v => { const h = v.bolumler?.[i]; if (h) fn(h); }, anahtar);
  return <>
    <p className="sayfa-aciklama">El yapımı bölümler: oyunun menüsünde bu sırayla görünür. Bir bölümü seç, aşağıda yandan görünüşünü düzenle:
      araç çubuğundan bir şey seçip mağaraya tıkla, var olanları sürükle. Kırmızı bölgeler yarasanın geçemeyeceği kadar dar.</p>
    <div className="yanki-bolum-listesi" data-testid="yanki-bolumler">
      {bolumler.map((h, k) => (
        <div key={h.id + k} className={"yanki-bolum-satiri" + (k === i ? " secili" : "")} onClick={() => setSeciliId(h.id)} data-testid={"yanki-bolum-" + h.id}>
          <span className="adim-no">{k + 1}</span>
          <b>{h.ad}</b>
          <span className="soluk">{h.uzunluk} birim · {(h.sivriler || []).length} sivri · {(h.tehlikeler || []).length} tehlike · {(h.bocekler || []).length} böcek</span>
          <span style={{ marginLeft: "auto" }} />
          <button className="ikon-dugme" title="Yukarı" disabled={k === 0}
            onClick={e => { e.stopPropagation(); d(v => { const l = v.bolumler; [l[k - 1], l[k]] = [l[k], l[k - 1]]; }); }}><ArrowUp size={13} /></button>
          <button className="ikon-dugme" title="Aşağı" disabled={k === bolumler.length - 1}
            onClick={e => { e.stopPropagation(); d(v => { const l = v.bolumler; [l[k + 1], l[k]] = [l[k], l[k + 1]]; }); }}><ArrowDown size={13} /></button>
          <button className="ikon-dugme" title="Çoğalt" data-testid={"yanki-bolum-cogalt-" + h.id}
            onClick={e => { e.stopPropagation(); let id = ""; d(v => { id = bolumCogalt(v, h.id); }); setSeciliId(id); }}><Copy size={13} /></button>
          <button className="ikon-dugme" title="Sil" data-testid={"yanki-bolum-sil-" + h.id}
            onClick={e => { e.stopPropagation(); d(v => { v.bolumler.splice(k, 1); }); }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid="yanki-bolum-ekle"
        onClick={() => { let id = ""; d(v => { id = bolumEkle(v); }); setSeciliId(id); }}><Plus size={13} /> Bölüm ekle</button>
    </div>
    {b && <BolumDuzenleyici key={b.id} dosya={dosya} ayarlar={veri.ayarlar} b={b} bd={bd} idDegisti={setSeciliId} digerIdler={bolumler.filter(x => x !== b).map(x => x.id)} />}
  </>;
}

type SeciliNesne = { tur: "sivri" | "tehlike" | "bocek"; i: number } | { tur: "nokta"; i: number; kenar: "ust" | "alt" } | { tur: "cikis" } | null;
const anahtarYap = (s: SeciliNesne) => (s ? s.tur + ("i" in s ? ":" + s.i : "") + (s.tur === "nokta" ? ":" + s.kenar : "") : "");

function BolumDuzenleyici({ dosya, ayarlar, b, bd, idDegisti, digerIdler }: {
  dosya: string; ayarlar: any; b: HamBolum; bd: (fn: (h: HamBolum) => void, anahtar?: string) => void;
  idDegisti: (id: string) => void; digerIdler: string[];
}) {
  void dosya;
  const svgRef = useRef<SVGSVGElement>(null);
  const [boyut, setBoyut] = useState({ w: 900, h: 380 });
  const [gorX, setGorX] = useState(-100);
  const [genislik, setGenislik] = useState(0);   // 0 = henüz ayarlanmadı (ilk ölçümde 1:1)
  const [arac, setArac] = useState<Arac>("sec");
  const [secili, setSecili] = useState<SeciliNesne>(null);
  const surukle = useRef<{ tur: "kaydir"; cx: number; x0: number } | { tur: "nesne"; s: SeciliNesne; uc?: boolean } | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoyut({ w: el.clientWidth || 900, h: el.clientHeight || 380 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const gw = genislik || (H * boyut.w) / boyut.h;   // görünen dünya genişliği
  const sx = gw / boyut.w, sy = H / boyut.h;         // ekran pikseli → dünya birimi

  const o = useMemo(() => bolumOyunu(ayarlar, b), [ayarlar, b]);
  const den = useMemo(() => bolumDenetimi(ayarlar, b), [ayarlar, b]);

  // görünen aralıkta duvarı örnekle (taş dolgusu)
  const { ustYol, altYol } = useMemo(() => {
    const adim = Math.max(10, gw / 300);
    const x0 = gorX - adim, x1 = gorX + gw + adim;
    let ust = `M${x0},0`, alt = `M${x0},${H}`;
    for (let x = x0; x <= x1; x += adim) { const [u, a] = o.sinir(x); ust += ` L${x},${u}`; alt += ` L${x},${a}`; }
    return { ustYol: ust + ` L${x1},0 Z`, altYol: alt + ` L${x1},${H} Z` };
  }, [o, gorX, gw]);

  const dunyaNoktasi = (e: { clientX: number; clientY: number }) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: gorX + ((e.clientX - r.left) / r.width) * gw, y: ((e.clientY - r.top) / r.height) * H };
  };
  const yuvarla = (v: number) => Math.round(v);

  const nesneKoy = (x: number, y: number) => {
    x = yuvarla(x); y = yuvarla(y);
    let s: SeciliNesne = null;
    bd(h => {
      if (arac === "sarkit" || arac === "dikit") {
        const yer = sivriIcinYer(o, x);
        (h.sivriler ||= []).push({ x, ust: arac === "sarkit", boy: Math.max(40, Math.min(110, yer - 200)), taban: 60 });
        s = { tur: "sivri", i: h.sivriler.length - 1 };
      } else if (arac === "ag") {
        (h.tehlikeler ||= []).push({ tur: "ag", x, y });
        s = { tur: "tehlike", i: h.tehlikeler.length - 1 };
      } else if (arac === "damla") {
        (h.tehlikeler ||= []).push({ tur: "damla", x });
        s = { tur: "tehlike", i: h.tehlikeler.length - 1 };
      } else if (arac === "bocek") {
        (h.bocekler ||= []).push({ x, y });
        s = { tur: "bocek", i: h.bocekler.length - 1 };
      } else if (arac === "nokta") {
        if (!h.duvar.noktalar) return;
        const k = noktaEkle(ayarlar, h, x);
        s = { tur: "nokta", i: k, kenar: Math.abs(y - o.sinir(x)[0]) < Math.abs(y - o.sinir(x)[1]) ? "ust" : "alt" };
      }
    });
    setSecili(s);
    setArac("sec");
  };

  const bas = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const p = dunyaNoktasi(e);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    if (arac !== "sec") { nesneKoy(p.x, p.y); return; }
    setSecili(null);
    surukle.current = { tur: "kaydir", cx: e.clientX, x0: gorX };
  };
  const nesneBas = (s: SeciliNesne, uc = false) => (e: React.PointerEvent) => {
    if (arac !== "sec" || e.button !== 0) return;
    e.stopPropagation();
    svgRef.current?.setPointerCapture?.(e.pointerId);
    setSecili(s);
    surukle.current = { tur: "nesne", s, uc };
  };
  const hareket = (e: React.PointerEvent) => {
    const sr = surukle.current;
    if (!sr) return;
    if (sr.tur === "kaydir") { setGorX(sr.x0 - (e.clientX - sr.cx) * sx); return; }
    const p = dunyaNoktasi(e), s = sr.s;
    if (!s) return;
    const x = yuvarla(p.x), y = yuvarla(Math.max(0, Math.min(H, p.y)));
    const anahtar = "surukle:" + anahtarYap(s);
    bd(h => {
      if (s.tur === "sivri") {
        const sv = h.sivriler?.[s.i]; if (!sv) return;
        if (sr.uc) { const [u, a] = o.sinir(sv.x); sv.boy = yuvarla(Math.max(10, sv.ust ? y - u : a - y)); }
        else sv.x = x;
      } else if (s.tur === "tehlike") {
        const t = h.tehlikeler?.[s.i]; if (!t) return;
        t.x = x; if (t.tur === "ag") t.y = y;
      } else if (s.tur === "bocek") {
        const bc = h.bocekler?.[s.i]; if (!bc) return;
        bc.x = x; bc.y = y;
      } else if (s.tur === "nokta") {
        const l = h.duvar.noktalar; const n = l?.[s.i]; if (!l || !n) return;
        const sol = l[s.i - 1], sag = l[s.i + 1];
        n.x = Math.max(sol ? sol.x + 20 : -1e9, Math.min(sag ? sag.x - 20 : 1e9, x));
        if (s.kenar === "ust") n.ust = Math.min(y, n.alt - 60); else n.alt = Math.max(y, n.ust + 60);
      } else if (s.tur === "cikis") {
        h.uzunluk = Math.max(500, x);
      }
    }, anahtar);
  };
  const birak = () => { surukle.current = null; };
  const tekerlek = (e: React.WheelEvent) => {
    const p = dunyaNoktasi(e);
    const yeni = Math.max(200, Math.min(Math.max(b.uzunluk * 1.4, 3000), gw * (e.deltaY > 0 ? 1.15 : 1 / 1.15)));
    setGorX(p.x - ((p.x - gorX) * yeni) / gw);
    setGenislik(yeni);
  };
  const yakinlastir = (k: number) => { const m = gorX + gw / 2, yeni = Math.max(200, gw * k); setGenislik(yeni); setGorX(m - yeni / 2); };
  const tumu = () => { const yeni = b.uzunluk + 400; setGenislik(yeni); setGorX(-200); };

  const sil = () => {
    const s = secili; if (!s) return;
    bd(h => {
      if (s.tur === "sivri") h.sivriler?.splice(s.i, 1);
      else if (s.tur === "tehlike") h.tehlikeler?.splice(s.i, 1);
      else if (s.tur === "bocek") h.bocekler?.splice(s.i, 1);
      else if (s.tur === "nokta" && (h.duvar.noktalar?.length ?? 0) > 2) h.duvar.noktalar!.splice(s.i, 1);
    });
    setSecili(null);
  };

  // ekran pikseline göre sabit boyutlu işaretler (görünüm yatayda sıkışsa da)
  const isaret = (x: number, y: number, r: number) => ({ cx: x, cy: y, rx: r * sx, ry: r * sy });
  const sk = anahtarYap(secili);
  const nokta = b.duvar.noktalar && b.duvar.noktalar.length >= 2 ? [...b.duvar.noktalar] : null;
  const cizgi = { vectorEffect: "non-scaling-stroke" as const };

  return (
    <div className="yanki-duzenleyici" data-testid="yanki-duzenleyici">
      <div className="yanki-arac-cubugu">
        {ARACLAR.map(([id, ad, ikon]) => (
          <button key={id} className={"ikon-dugme" + (arac === id ? " aktif" : "")} title={ad} data-testid={"yanki-arac-" + id}
            disabled={id === "nokta" && !nokta} onClick={() => setArac(id)}>{ikon}</button>
        ))}
        <span className="ayirici" />
        <button className="ikon-dugme" title="Uzaklaş" onClick={() => yakinlastir(1.4)}><Minus size={14} /></button>
        <button className="ikon-dugme" title="Yakınlaş" onClick={() => yakinlastir(1 / 1.4)}><Plus size={14} /></button>
        <button className="ikon-dugme" title="Bütün bölümü göster" data-testid="yanki-tumu" onClick={tumu}><Maximize2 size={14} /></button>
        <button className="ikon-dugme" title="Gerçek oran (ekrandaki gibi)" onClick={() => setGenislik(0)}><Hand size={14} /></button>
        <span className="soluk" style={{ fontSize: 12, marginLeft: 6 }}>
          {arac === "sec" ? "Sürükle: taşı · boş yer: kaydır · tekerlek: yakınlaş" : "Mağaraya tıkla: koy"}</span>
        <span style={{ marginLeft: "auto" }} />
        {den.darAraliklar.length > 0
          ? <span className="alan-uyari" data-testid="yanki-dar-uyari"><AlertTriangle size={12} /> {den.darAraliklar.length} dar yer (en dar {Math.round(den.enDar)})</span>
          : <span className="soluk" style={{ fontSize: 12 }} data-testid="yanki-gecit-tamam">Her yerden geçilebilir (en dar {Math.round(den.enDar)})</span>}
      </div>
      <svg ref={svgRef} className={"yanki-tuval" + (arac !== "sec" ? " koyma" : "")} data-testid="yanki-tuval"
        viewBox={`${gorX} 0 ${gw} ${H}`} preserveAspectRatio="none"
        onPointerDown={bas} onPointerMove={hareket} onPointerUp={birak} onPointerCancel={birak} onWheel={tekerlek}>
        <rect x={gorX} y={0} width={gw} height={H} fill="#120f1c" />
        <path d={ustYol} fill="#3a3152" />
        <path d={altYol} fill="#3a3152" />
        {/* dar yerler */}
        {den.darAraliklar.map(([a, z], k) => (
          <rect key={k} x={a - 8} y={0} width={Math.max(z - a + 16, 14 * sx)} height={H} fill="rgba(240,70,70,.28)" stroke="#f04646"
            strokeDasharray="4 4" {...cizgi} pointerEvents="none" data-testid="yanki-dar" />
        ))}
        {/* başlangıç ve çıkış */}
        <line x1={0} y1={0} x2={0} y2={H} stroke="#8aa0c8" strokeDasharray="6 6" {...cizgi} pointerEvents="none" />
        <g onPointerDown={nesneBas({ tur: "cikis" })} style={{ cursor: "ew-resize" }} data-testid="yanki-cikis">
          <rect x={b.uzunluk - 14 * sx} y={0} width={28 * sx} height={H} fill="transparent" />
          <line x1={b.uzunluk} y1={0} x2={b.uzunluk} y2={H} stroke={sk === "cikis" ? "#fff" : "#8ce6be"} strokeWidth={2} strokeDasharray="10 8" {...cizgi} />
        </g>
        {/* sivriler */}
        {(b.sivriler || []).map((sv, k) => {
          const [u, a] = o.sinir(sv.x);
          const kok = sv.ust ? u - 6 : a + 6, uc = sv.ust ? u + sv.boy : a - sv.boy;
          const sec = sk === "sivri:" + k;
          return <g key={"s" + k} data-testid={"yanki-sivri-" + k}>
            <polygon points={`${sv.x - sv.taban / 2},${kok} ${sv.x + sv.taban / 2},${kok} ${sv.x},${uc}`} fill={sec ? "#a896e0" : "#6c5d96"}
              stroke={sec ? "#fff" : "#b8a8ec"} {...cizgi} onPointerDown={nesneBas({ tur: "sivri", i: k })} style={{ cursor: "move" }} />
            {sec && <ellipse {...isaret(sv.x, uc, 6)} fill="#fff" stroke="#000" {...cizgi} onPointerDown={nesneBas({ tur: "sivri", i: k }, true)}
              style={{ cursor: "ns-resize" }} data-testid={"yanki-sivri-uc-" + k} />}
          </g>;
        })}
        {/* tehlikeler */}
        {(b.tehlikeler || []).map((t, k) => {
          const y = nesneY(o, t.tur, t.x, t.y);
          const sec = sk === "tehlike:" + k;
          return t.tur === "ag"
            ? <g key={"t" + k} onPointerDown={nesneBas({ tur: "tehlike", i: k })} style={{ cursor: "move" }} data-testid={"yanki-ag-" + k}>
              <ellipse {...isaret(t.x, y, 13)} fill="rgba(230,226,242,.15)" stroke={sec ? "#fff" : "#d8d2ea"} strokeWidth={sec ? 2 : 1} {...cizgi} />
              <path d={`M${t.x - 13 * sx},${y} L${t.x + 13 * sx},${y} M${t.x},${y - 13 * sy} L${t.x},${y + 13 * sy}`} stroke="#d8d2ea" {...cizgi} />
            </g>
            : <g key={"t" + k} onPointerDown={nesneBas({ tur: "tehlike", i: k })} style={{ cursor: "ew-resize" }} data-testid={"yanki-damla-" + k}>
              <ellipse {...isaret(t.x, y + 6 * sy, 6)} fill="#8cc8ff" stroke={sec ? "#fff" : "#4c88c8"} strokeWidth={sec ? 2 : 1} {...cizgi} />
            </g>;
        })}
        {/* ateş böcekleri */}
        {(b.bocekler || []).map((bc, k) => {
          const y = nesneY(o, "bocek", bc.x, bc.y);
          const sec = sk === "bocek:" + k;
          return <ellipse key={"b" + k} {...isaret(bc.x, y, 6)} fill="#ffe27a" stroke={sec ? "#fff" : "#c9a43a"} strokeWidth={sec ? 2 : 1} {...cizgi}
            onPointerDown={nesneBas({ tur: "bocek", i: k })} style={{ cursor: "move" }} data-testid={"yanki-bocek-" + k} />;
        })}
        {/* duvar noktaları */}
        {nokta && b.duvar.noktalar!.map((n, k) => (["ust", "alt"] as const).map(kenar => {
          const sec = sk === `nokta:${k}:${kenar}`;
          return <rect key={k + kenar} x={n.x - 5 * sx} y={n[kenar] - 5 * sy} width={10 * sx} height={10 * sy}
            fill={sec ? "#fff" : "#c9bef0"} stroke="#2a2340" {...cizgi} onPointerDown={nesneBas({ tur: "nokta", i: k, kenar })}
            style={{ cursor: "move" }} data-testid={`yanki-nokta-${k}-${kenar}`} />;
        }))}
      </svg>
      <input type="range" className="yanki-kaydirici" min={-400} max={Math.max(0, b.uzunluk + 400 - gw)} value={Math.min(gorX, Math.max(0, b.uzunluk + 400 - gw))}
        onChange={e => setGorX(Number(e.target.value))} title="Bölüm boyunca kaydır" />
      <div className="kartlar" style={{ marginTop: 10 }}>
        <BolumBilgileri ayarlar={ayarlar} b={b} bd={bd} idDegisti={idDegisti} digerIdler={digerIdler} uyarilar={den.uyarilar} />
        <SeciliKarti s={secili} b={b} bd={bd} sil={sil} />
      </div>
    </div>
  );
}

function BolumBilgileri({ ayarlar, b, bd, idDegisti, digerIdler, uyarilar }: {
  ayarlar: any; b: HamBolum; bd: (fn: (h: HamBolum) => void, anahtar?: string) => void; idDegisti: (id: string) => void; digerIdler: string[]; uyarilar: string[];
}) {
  const tohumlu = !(b.duvar.noktalar && b.duvar.noktalar.length >= 2);
  return (
    <div className="kart"><div className="kart-baslik">Bölüm</div><div className="kart-icerik">
      {uyarilar.length > 0 && <div style={{ gridColumn: "1 / -1" }}><Uyarilar liste={uyarilar.map(m => ({ yer: "Oyun", metin: m }))} /></div>}
      <label>Ad</label>
      <YaziAlani deger={b.ad} ipucu="Menüde görünen ad" testId="yanki-bolum-ad" degisti={v => bd(h => { h.ad = v; })} />
      <label title="Değişmeyen kimlik; en iyi süre bununla saklanır">Kimlik</label>
      <KimlikGiris deger={b.id} testId="yanki-bolum-kimlik" dene={yeni => {
        if (!kimlikGecerli(yeni)) return "Yalnız küçük harf, rakam ve _";
        if (digerIdler.includes(yeni)) return "Bu kimlik zaten var";
        bd(h => { h.id = yeni; }); idDegisti(yeni);
        return "";
      }} />
      <label>Açıklama</label>
      <YaziAlani deger={b.aciklama} cokSatir ipucu="İsteğe bağlı" degisti={v => bd(h => { h.aciklama = v; })} />
      <label title="Yarasa bu noktaya varınca bölüm biter. Düzenleyicide yeşil kesik çizgiyi sürükleyerek de değişir.">Uzunluk</label>
      <SayiAlani alan={{ tur: "sayi", ad: "", birim: "birim", min: 500, adim: 100 }} deger={b.uzunluk} testId="yanki-bolum-uzunluk"
        degisti={v => bd(h => { h.uzunluk = v ?? 4000; })} />
      <label>Duvar</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tohumlu ? <>
          <div className="alan-satir"><span className="soluk">Tohumlu (oyunun rastgele mağarasının sabit hâli)</span></div>
          <SayiAlani alan={{ tur: "sayi", ad: "", birim: "tohum", adim: 1 }} deger={b.duvar.tohum} testId="yanki-bolum-tohum"
            degisti={v => bd(h => { h.duvar = { tohum: Math.floor(v ?? 1) }; })} />
          <button className="dugme" style={{ alignSelf: "flex-start" }} data-testid="yanki-noktalara-cevir"
            onClick={() => bd(h => noktalaraCevir(ayarlar, h))}>Noktalara çevir (elle düzenle)</button>
        </> : <>
          <div className="alan-satir"><span className="soluk">{b.duvar.noktalar!.length} nokta: kareleri sürükle; <Plus size={11} /> aracıyla nokta ekle</span></div>
          <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} title="Noktalar silinir; duvar bir tohumdan çizilir"
            onClick={() => bd(h => { h.duvar = { tohum: 1 }; })}>Tohumlu duvara çevir</button>
        </>}
      </div>
    </div></div>
  );
}

function SeciliKarti({ s, b, bd, sil }: { s: SeciliNesne; b: HamBolum; bd: (fn: (h: HamBolum) => void, anahtar?: string) => void; sil: () => void }) {
  const sayi = (deger: unknown, degisti: (v: number) => void, birim = "birim", testId?: string, ek: { min?: number; max?: number } = {}) =>
    <SayiAlani alan={{ tur: "sayi", ad: "", birim, adim: 5, ...ek }} deger={deger} testId={testId} degisti={v => v !== undefined && degisti(v)} />;
  let baslik = "Seçili: yok", icerik: ReactNode = <div className="soluk" style={{ gridColumn: "1 / -1" }}>
    Düzenleyicide bir sivriye, ağa, damlaya, ateş böceğine ya da duvar noktasına tıkla.</div>;
  if (s?.tur === "sivri" && b.sivriler?.[s.i]) {
    const sv = b.sivriler[s.i];
    baslik = sv.ust ? "Sarkıt" : "Dikit";
    icerik = <>
      <label>Yer (x)</label>{sayi(sv.x, v => bd(h => { h.sivriler![s.i].x = v; }), "birim", "yanki-secili-x")}
      <label title="Duvardan uca uzunluk">Boy</label>{sayi(sv.boy, v => bd(h => { h.sivriler![s.i].boy = v; }), "birim", "yanki-secili-boy", { min: 10 })}
      <label>Taban</label>{sayi(sv.taban, v => bd(h => { h.sivriler![s.i].taban = v; }), "birim", undefined, { min: 10 })}
      <label>Yönü</label>
      <button className="dugme" style={{ justifySelf: "start" }} onClick={() => bd(h => { h.sivriler![s.i].ust = !h.sivriler![s.i].ust; })}>
        {sv.ust ? "Tavandan (sarkıt) → dikite çevir" : "Tabandan (dikit) → sarkıta çevir"}</button>
    </>;
  } else if (s?.tur === "tehlike" && b.tehlikeler?.[s.i]) {
    const t = b.tehlikeler[s.i];
    baslik = t.tur === "ag" ? "Örümcek ağı" : "Su damlası";
    icerik = <>
      <label>Yer (x)</label>{sayi(t.x, v => bd(h => { h.tehlikeler![s.i].x = v; }), "birim", "yanki-secili-x")}
      {t.tur === "ag" && <><label title="Boşsa geçidin ortası">Yükseklik (y)</label>
        <SayiAlani alan={{ tur: "sayi", ad: "", birim: "birim", min: 0, max: H, adim: 5 }} deger={t.y} ipucu="geçidin ortası"
          degisti={v => bd(h => { if (v === undefined) delete h.tehlikeler![s.i].y; else h.tehlikeler![s.i].y = v; })} /></>}
      {t.tur === "damla" && <div className="soluk" style={{ gridColumn: "1 / -1" }}>Damla tavana asılır; yarasa yaklaşınca kopar.</div>}
    </>;
  } else if (s?.tur === "bocek" && b.bocekler?.[s.i]) {
    const bc = b.bocekler[s.i];
    baslik = "Ateş böceği";
    icerik = <>
      <label>Yer (x)</label>{sayi(bc.x, v => bd(h => { h.bocekler![s.i].x = v; }), "birim", "yanki-secili-x")}
      <label title="Boşsa geçidin ortası">Yükseklik (y)</label>
      <SayiAlani alan={{ tur: "sayi", ad: "", birim: "birim", min: 0, max: H, adim: 5 }} deger={bc.y} ipucu="geçidin ortası"
        degisti={v => bd(h => { if (v === undefined) delete h.bocekler![s.i].y; else h.bocekler![s.i].y = v; })} />
    </>;
  } else if (s?.tur === "nokta" && b.duvar.noktalar?.[s.i]) {
    const n = b.duvar.noktalar[s.i];
    baslik = `Duvar noktası ${s.i + 1}`;
    icerik = <>
      <label>Yer (x)</label>{sayi(n.x, v => bd(h => { h.duvar.noktalar![s.i].x = v; h.duvar.noktalar!.sort((p, q) => p.x - q.x); }), "birim", "yanki-secili-x")}
      <label title="0 = ekranın üstü">Tavan</label>{sayi(n.ust, v => bd(h => { h.duvar.noktalar![s.i].ust = v; }), "birim", "yanki-secili-ust", { min: 0, max: H })}
      <label title="1000 = ekranın altı">Taban</label>{sayi(n.alt, v => bd(h => { h.duvar.noktalar![s.i].alt = v; }), "birim", "yanki-secili-alt", { min: 0, max: H })}
      <div className="soluk" style={{ gridColumn: "1 / -1" }}>Geçit: {n.alt - n.ust} birim (yarasa ~32; 150'den darı kırmızı).</div>
    </>;
  } else if (s?.tur === "cikis") {
    baslik = "Çıkış";
    icerik = <div className="soluk" style={{ gridColumn: "1 / -1" }}>Yeşil çizgiyi sürükleyerek bölümün uzunluğunu değiştir ({b.uzunluk}).</div>;
  }
  const silinir = s && s.tur !== "cikis" && !(s.tur === "nokta" && (b.duvar.noktalar?.length ?? 0) <= 2);
  return (
    <div className="kart" data-testid="yanki-secili"><div className="kart-baslik">{baslik}
      {silinir && <span className="sag"><button className="ikon-dugme" title="Sil" onClick={sil} data-testid="yanki-secili-sil"><Trash2 size={13} /></button></span>}
    </div><div className="kart-icerik">{icerik}</div></div>
  );
}
