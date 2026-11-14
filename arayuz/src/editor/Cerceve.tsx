// Ana çerçeve: menü çubuğu, araç çubuğu, paneller, sahne/olay/arayüz sekmeleri, durum çubuğu.
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  MousePointer2, Move, RotateCw, Scaling, Hand, Play, Pause, Square, Grid3x3, Magnet, Command, PanelLeft, PanelRight,
  PanelBottom, Boxes, ListTree, SlidersHorizontal, Clapperboard, Workflow, LayoutDashboard, Image, Variable, Terminal, History, Save,
} from "lucide-react";
import { aktifSahne, useDurum, type AltSekme, type MerkezSekme, type SolSekme } from "../depo/durum";
import { KOMUTLAR, komut, kullanilabilir, type Komut } from "./komutlar";
import { SahneGorunumu } from "./Sahne";
import {
  NesnelerPaneli, SahneAgaci, Ozellikler, OlaylarSayfasi, ArayuzDuzenleyici, VarliklarPaneli, DegiskenlerPaneli, KonsolPaneli, SurumlerPaneli,
} from "./Paneller";
import { AyarlarPenceresi, BaslangicEkrani, Hakkinda, KisayollarPenceresi, KomutPaleti, ProjeAyarlari, YeniProjePenceresi } from "./Pencereler";

// ============================================================ Menü çubuğu
const MENULER: { ad: string; kategoriler: Komut["kategori"][] }[] = [
  { ad: "Dosya", kategoriler: ["Dosya"] }, { ad: "Düzen", kategoriler: ["Düzen"] }, { ad: "Görünüm", kategoriler: ["Görünüm", "Araç"] },
  { ad: "Oyun", kategoriler: ["Oyun"] }, { ad: "Yardım", kategoriler: ["Yardım"] },
];

function MenuCubugu() {
  const [acik, setAcik] = useState<string | null>(null);
  const kayit = useDurum(d => d.kayit);
  const projeAdi = useDurum(d => d.projeAdi);
  useDurum(d => d.secim); useDurum(d => d.oynatma); useDurum(d => d.duzen); useDurum(d => d.tercih);  // menü durumları için yeniden çiz
  useEffect(() => {
    if (!acik) return;
    const kapat = (e: PointerEvent) => { if (!(e.target as Element).closest(".menu-oge")) setAcik(null); };
    addEventListener("pointerdown", kapat); return () => removeEventListener("pointerdown", kapat);
  }, [acik]);
  return (
    <div className="menu-cubugu">
      <div className="menu-logo"><span className="isaret" /> Oyun Atölyesi</div>
      {MENULER.map(m => (
        <div key={m.ad} className={"menu-oge" + (acik === m.ad ? " acik" : "")}>
          <button onClick={() => setAcik(acik === m.ad ? null : m.ad)} onMouseEnter={() => acik && setAcik(m.ad)}>{m.ad}</button>
          {acik === m.ad && (
            <div className="acilir">
              {m.kategoriler.map((kat, i) => (
                <div key={kat}>
                  {i > 0 && <hr />}
                  {KOMUTLAR.filter(k => k.kategori === kat).map(k => (
                    <button key={k.id} disabled={!kullanilabilir(k)} onClick={() => { setAcik(null); k.calistir(); }}>
                      {k.ad}{k.yakinda && <span className="rozet yakinda">{k.yakinda}</span>}<span className="kisayol">{k.kisayol}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="menu-sag">
        <span className="soluk">{projeAdi}</span>
        <span className="soluk" style={{ display: "flex", alignItems: "center", gap: 4 }} data-testid="kayit-durumu">
          <Save size={13} />{kayit === "kaydediliyor" ? "Kaydediliyor…" : kayit === "kayitli" ? "Kaydedildi" : kayit === "hata" ? "Kaydedilemedi" : "Kaydedilmedi"}
        </span>
        <button className="dugme hayalet" onClick={() => komut("komut").calistir()} title="Komut paleti"><Command size={14} /> Ctrl+K</button>
      </div>
    </div>
  );
}

// ============================================================ Araç çubuğu
function AracDugmesi({ id, ikon, aktif }: { id: string; ikon: ReactNode; aktif?: boolean }) {
  const k = komut(id);
  return <button className={"ikon-dugme" + (aktif ? " aktif" : "")} title={`${k.ad}${k.kisayol ? " (" + k.kisayol + ")" : ""}`}
    disabled={!kullanilabilir(k)} onClick={k.calistir} data-testid={"arac-" + id}>{ikon}</button>;
}

function AracCubugu() {
  const arac = useDurum(d => d.arac);
  const oynatma = useDurum(d => d.oynatma);
  const tercih = useDurum(d => d.tercih);
  const duzen = useDurum(d => d.duzen);
  return (
    <div className="arac-cubugu" style={{ position: "relative" }}>
      <AracDugmesi id="aracSec" ikon={<MousePointer2 size={16} />} aktif={arac === "sec"} />
      <AracDugmesi id="aracTasi" ikon={<Move size={16} />} aktif={arac === "tasi"} />
      <AracDugmesi id="aracDondur" ikon={<RotateCw size={16} />} aktif={arac === "dondur"} />
      <AracDugmesi id="aracOlcek" ikon={<Scaling size={16} />} aktif={arac === "olcekle"} />
      <AracDugmesi id="aracEl" ikon={<Hand size={16} />} aktif={arac === "el"} />
      <span className="ayirici" />
      <AracDugmesi id="izgara" ikon={<Grid3x3 size={16} />} aktif={tercih.izgaraGoster} />
      <AracDugmesi id="miknatis" ikon={<Magnet size={16} />} aktif={tercih.miknatis} />
      <div className="orta-grup">
        {oynatma === "oynuyor"
          ? <AracDugmesi id="duraklat" ikon={<Pause size={17} />} />
          : <button className="ikon-dugme oynat" title={oynatma === "duraklatildi" ? "Devam (F6)" : "Oynat (F5)"} data-testid="oynat"
              onClick={() => (oynatma === "duraklatildi" ? komut("duraklat") : komut("oynat")).calistir()}><Play size={17} fill="currentColor" /></button>}
        <AracDugmesi id="durdur" ikon={<Square size={15} fill="currentColor" />} />
      </div>
      <span style={{ marginLeft: "auto" }} />
      <AracDugmesi id="solPanel" ikon={<PanelLeft size={16} />} aktif={duzen.sol} />
      <AracDugmesi id="altPanel" ikon={<PanelBottom size={16} />} aktif={duzen.alt} />
      <AracDugmesi id="sagPanel" ikon={<PanelRight size={16} />} aktif={duzen.sag} />
    </div>
  );
}

// ============================================================ Bölücü (panel boyutlandırma)
function Bolucu({ yon, deger, ayarla, ters, min, max }: { yon: "d" | "y"; deger: number; ayarla: (v: number) => void; ters?: boolean; min: number; max: number }) {
  const [aktif, setAktif] = useState(false);
  return (
    <div className={(yon === "d" ? "bolucu-d" : "bolucu-y") + (aktif ? " surukleniyor" : "")}
      onPointerDown={e => {
        e.preventDefault(); setAktif(true);
        const bas = yon === "d" ? e.clientX : e.clientY, ilk = deger;
        const hareket = (ev: PointerEvent) => {
          const fark = (yon === "d" ? ev.clientX : ev.clientY) - bas;
          ayarla(Math.min(max, Math.max(min, ilk + (ters ? -fark : fark))));
        };
        const birak = () => { setAktif(false); removeEventListener("pointermove", hareket); removeEventListener("pointerup", birak); };
        addEventListener("pointermove", hareket); addEventListener("pointerup", birak);
      }} />
  );
}

function Sekmeler<T extends string>({ sekmeler, aktif, sec, sag }: { sekmeler: { id: T; ad: string; ikon: ReactNode }[]; aktif: T; sec: (t: T) => void; sag?: ReactNode }) {
  return (
    <div className="sekmeler">
      {sekmeler.map(s => <button key={s.id} className={"sekme" + (s.id === aktif ? " aktif" : "")} onClick={() => sec(s.id)} data-testid={"sekme-" + s.id}>{s.ikon}{s.ad}</button>)}
      {sag && <div className="sag">{sag}</div>}
    </div>
  );
}

// ============================================================ Durum çubuğu
function DurumCubugu() {
  const imlec = useDurum(d => d.imlec);
  const z = useDurum(d => d.yakinlastirma);
  const oynatma = useDurum(d => d.oynatma);
  const proje = useDurum(d => d.proje);
  const sahne = useDurum(d => aktifSahne(d));
  const [fps, setFps] = useState(0);
  useEffect(() => { const t = setInterval(() => setFps((window as any).__fps || 0), 1000); return () => clearInterval(t); }, []);
  const renk = oynatma === "oynuyor" ? "var(--yesil)" : oynatma === "duraklatildi" ? "var(--sari)" : "var(--yazi3)";
  return (
    <div className="durum-cubugu">
      <span><span className="nokta" style={{ background: renk }} />{oynatma === "oynuyor" ? "Oynuyor" : oynatma === "duraklatildi" ? "Duraklatıldı" : "Düzenleme"}</span>
      <span>{sahne?.ad} · {sahne?.ornekler.length || 0} nesne · {proje?.nesneTurleri.length || 0} tür</span>
      <div className="sag">
        <span>{imlec ? `x ${imlec.x}  y ${imlec.y}` : ""}</span>
        <span>%{Math.round(z * 100)}</span>
        <span>{fps} FPS</span>
      </div>
    </div>
  );
}

function Bildirimler() {
  const b = useDurum(d => d.bildirimler);
  return <div className="bildirimler">{b.map(x => <div key={x.id} className={"bildirim " + x.seviye}>{x.metin}</div>)}</div>;
}

// ============================================================ Editör
function Editor() {
  const duzen = useDurum(d => d.duzen);
  const merkez = useDurum(d => d.merkez);
  const solSekme = useDurum(d => d.solSekme);
  const altSekme = useDurum(d => d.altSekme);
  const { set, duzenAyarla } = useDurum.getState();
  return (
    <div className="uygulama">
      <MenuCubugu />
      <AracCubugu />
      <div className="calisma">
        {duzen.sol && <>
          <div className="dock sol" style={{ width: duzen.solGenislik }} data-testid="sol-panel">
            <Sekmeler<SolSekme> aktif={solSekme} sec={s => set("solSekme", s)} sekmeler={[
              { id: "nesneler", ad: "Nesneler", ikon: <Boxes size={14} /> }, { id: "agac", ad: "Sahne", ikon: <ListTree size={14} /> }]} />
            <div className="dock-icerik">{solSekme === "nesneler" ? <NesnelerPaneli /> : <SahneAgaci />}</div>
          </div>
          <Bolucu yon="d" deger={duzen.solGenislik} min={180} max={480} ayarla={v => duzenAyarla({ solGenislik: v })} />
        </>}
        <div className="dikey">
          <div className="merkez">
            <Sekmeler<MerkezSekme> aktif={merkez} sec={s => set("merkez", s)} sekmeler={[
              { id: "sahne", ad: "Sahne", ikon: <Clapperboard size={14} /> },
              { id: "olaylar", ad: "Olaylar", ikon: <Workflow size={14} /> },
              { id: "arayuz", ad: "Arayüz", ikon: <LayoutDashboard size={14} /> }]} />
            {merkez === "sahne" ? <SahneGorunumu /> : merkez === "olaylar" ? <OlaylarSayfasi /> : <ArayuzDuzenleyici />}
          </div>
          {duzen.alt && <>
            <Bolucu yon="y" deger={duzen.altYukseklik} min={120} max={520} ters ayarla={v => duzenAyarla({ altYukseklik: v })} />
            <div className="dock alt" style={{ height: duzen.altYukseklik }} data-testid="alt-panel">
              <Sekmeler<AltSekme> aktif={altSekme} sec={s => set("altSekme", s)} sekmeler={[
                { id: "varliklar", ad: "Varlıklar", ikon: <Image size={14} /> },
                { id: "degiskenler", ad: "Değişkenler", ikon: <Variable size={14} /> },
                { id: "konsol", ad: "Konsol", ikon: <Terminal size={14} /> },
                { id: "surumler", ad: "Sürümler", ikon: <History size={14} /> }]} />
              <div className="dock-icerik">
                {altSekme === "varliklar" ? <VarliklarPaneli /> : altSekme === "degiskenler" ? <DegiskenlerPaneli />
                  : altSekme === "konsol" ? <KonsolPaneli /> : <SurumlerPaneli />}
              </div>
            </div>
          </>}
        </div>
        {duzen.sag && <>
          <Bolucu yon="d" deger={duzen.sagGenislik} min={260} max={560} ters ayarla={v => duzenAyarla({ sagGenislik: v })} />
          <div className="dock sag" style={{ width: duzen.sagGenislik }} data-testid="sag-panel">
            <Sekmeler sekmeler={[{ id: "ozellikler", ad: "Özellikler", ikon: <SlidersHorizontal size={14} /> }]} aktif="ozellikler" sec={() => {}} />
            <div className="dock-icerik"><Ozellikler /></div>
          </div>
        </>}
      </div>
      <DurumCubugu />
    </div>
  );
}

export function Uygulama() {
  const ekran = useDurum(d => d.ekran);
  const pencere = useDurum(d => d.pencere);
  const olcek = useDurum(d => d.tercih.arayuzOlcek);
  useEffect(() => { (document.documentElement.style as any).zoom = String(olcek); }, [olcek]);
  return (
    <>
      {ekran === "yukleniyor" && <div className="bos-durum" style={{ paddingTop: "30vh" }}>Oyun Atölyesi açılıyor…</div>}
      {ekran === "baslangic" && <BaslangicEkrani />}
      {ekran === "editor" && <Editor />}
      {pencere === "yeniProje" && <YeniProjePenceresi />}
      {pencere === "komut" && <KomutPaleti />}
      {pencere === "ayarlar" && <AyarlarPenceresi />}
      {pencere === "projeAyarlari" && <ProjeAyarlari />}
      {pencere === "kisayollar" && <KisayollarPenceresi />}
      {pencere === "hakkinda" && <Hakkinda />}
      <Bildirimler />
    </>
  );
}
