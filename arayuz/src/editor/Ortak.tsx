// Arayüzün her yerinde kullanılan küçük parçalar.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { sekilCiz } from "../motor/cizim";
import type { NesneTuru } from "../depo/proje";

/** Sayı girişi: kutuya yazılabilir, etiketini sağa-sola sürükleyerek de değiştirilebilir. */
export function SayiGiris({ deger, degisti, etiket, adim = 1, min, max }: {
  deger: number; degisti: (v: number) => void; etiket?: string; adim?: number; min?: number; max?: number;
}) {
  const [metin, setMetin] = useState(String(deger));
  useEffect(() => setMetin(String(Math.round(deger * 100) / 100)), [deger]);
  const sinirla = (v: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v));
  const surukle = (e: React.PointerEvent) => {
    const bas = e.clientX, ilk = deger;
    const hareket = (ev: PointerEvent) => degisti(sinirla(Math.round((ilk + (ev.clientX - bas) * adim) / adim) * adim));
    const birak = () => { removeEventListener("pointermove", hareket); removeEventListener("pointerup", birak); };
    addEventListener("pointermove", hareket); addEventListener("pointerup", birak);
  };
  return (
    <div className="sayi-giris">
      {etiket && <span onPointerDown={surukle} title="Sürükleyerek değiştir">{etiket}</span>}
      <input value={metin} onChange={e => setMetin(e.target.value)}
        onBlur={() => { const v = Number(metin.replace(",", ".")); if (!isNaN(v)) degisti(sinirla(v)); else setMetin(String(deger)); }}
        onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
    </div>
  );
}

export function Kaydirici({ deger, degisti, min, max, adim = 1 }: { deger: number; degisti: (v: number) => void; min: number; max: number; adim?: number }) {
  const ondalik = adim < 1 ? 2 : 0;
  return (
    <div className="kaydirici">
      <input type="range" min={min} max={max} step={adim} value={deger} onChange={e => degisti(Number(e.target.value))} />
      <span className="deger">{deger.toFixed(ondalik)}</span>
    </div>
  );
}

export function RenkGiris({ deger, degisti }: { deger: string; degisti: (v: string) => void }) {
  return (
    <div className="renk-giris">
      <input type="color" value={deger} onChange={e => degisti(e.target.value)} />
      <input className="giris" value={deger} onChange={e => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && degisti(e.target.value)} />
    </div>
  );
}

export function Kart({ baslik, ikon, sag, children, acikBaslar = true }: { baslik: string; ikon?: ReactNode; sag?: ReactNode; children: ReactNode; acikBaslar?: boolean }) {
  const [acik, setAcik] = useState(acikBaslar);
  return (
    <div className="kart">
      <div className="kart-baslik" onClick={() => setAcik(!acik)}>
        {acik ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {ikon}{baslik}
        <span className="sag" onClick={e => e.stopPropagation()}>{sag}</span>
      </div>
      {acik && <div className="kart-icerik">{children}</div>}
    </div>
  );
}

/** Nesne türünün küçük önizlemesi. */
export function OnIzleme({ tur, boyut = 26 }: { tur: NesneTuru; boyut?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const g = tur.bilesenler.gorunum;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const c = cv.getContext("2d")!;
    const o = window.devicePixelRatio || 1;
    cv.width = boyut * o; cv.height = boyut * o;
    c.setTransform(o, 0, 0, o, 0, 0);
    c.clearRect(0, 0, boyut, boyut);
    if (!g) return;
    const k = (boyut - 6) / Math.max(g.genislik, g.yukseklik);
    c.translate(boyut / 2, boyut / 2);
    c.globalAlpha = g.saydamlik;
    sekilCiz(c, g.sekil, g.genislik * k, g.yukseklik * k, g.renk);
  }, [g?.sekil, g?.renk, g?.genislik, g?.yukseklik, g?.saydamlik, boyut]);
  return <canvas ref={ref} style={{ width: boyut, height: boyut }} />;
}
