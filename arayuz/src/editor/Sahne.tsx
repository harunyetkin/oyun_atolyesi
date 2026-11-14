// Sahne düzenleyici: ızgara, yakınlaştırma/kaydırma, seçme, taşıma, döndürme, ölçekleme,
// listeden sürükle-bırak ile ekleme ve basit oynatma önizlemesi.
import { useEffect, useRef } from "react";
import { Minus, Plus, Maximize, Play } from "lucide-react";
import { aktifSahne, useDurum } from "../depo/durum";
import type { NesneTuru, Ornek } from "../depo/proje";
import { sekilCiz } from "../motor/cizim";
import { sahneOlay } from "./komutlar";

interface SimOrnek extends Ornek { vx: number; vy: number }
type Surukleme =
  | { tur: "kaydir"; sx: number; sy: number; kx: number; ky: number }
  | { tur: "tasi"; id: string; bx: number; by: number; ox: number; oy: number }
  | { tur: "dondur"; id: string; ox: number; oy: number; ilkAci: number; ilkFare: number }
  | { tur: "olcekle"; id: string; ox: number; oy: number; ilkX: number; ilkY: number; ilkMesafe: number };

const KATMAN_SIRASI = ["arka", "oyun", "arayuz"];
const boyutlar = (t: NesneTuru | undefined) => ({ w: t?.bilesenler.gorunum?.genislik ?? 40, h: t?.bilesenler.gorunum?.yukseklik ?? 40 });

export function SahneGorunumu() {
  const kapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const kam = useRef({ x: 480, y: 270 });
  const sim = useRef<SimOrnek[] | null>(null);
  const surukle = useRef<Surukleme | null>(null);
  const bosluk = useRef(false);
  const yakinlastirma = useDurum(d => d.yakinlastirma);
  const oynatma = useDurum(d => d.oynatma);
  const sahneler = useDurum(d => d.proje?.sahneler);
  const aktifId = useDurum(d => d.aktifSahneId);

  // ---- koordinat dönüşümleri
  const boyut = () => ({ w: kapRef.current?.clientWidth || 1, h: kapRef.current?.clientHeight || 1 });
  const dunyaya = (ex: number, ey: number) => {
    const r = kapRef.current!.getBoundingClientRect();
    const z = useDurum.getState().yakinlastirma, { w, h } = boyut();
    return { x: (ex - r.left - w / 2) / z + kam.current.x, y: (ey - r.top - h / 2) / z + kam.current.y };
  };
  const yakinlastir = (z: number, merkez?: { x: number; y: number; ex: number; ey: number }) => {
    z = Math.min(8, Math.max(0.1, z));
    if (merkez) {
      const r = kapRef.current!.getBoundingClientRect(), { w, h } = boyut();
      kam.current = { x: merkez.x - (merkez.ex - r.left - w / 2) / z, y: merkez.y - (merkez.ey - r.top - h / 2) / z };
    }
    useDurum.getState().set("yakinlastirma", z);
  };
  const sigdir = () => {
    const s = aktifSahne(useDurum.getState()); if (!s) return;
    const { w, h } = boyut();
    kam.current = { x: s.genislik / 2, y: s.yukseklik / 2 };
    yakinlastir(Math.min(w / (s.genislik + 80), h / (s.yukseklik + 80)));
  };

  // ---- isabet testi: en üstteki nesne
  const isabet = (wx: number, wy: number): Ornek | null => {
    const st = useDurum.getState(), s = aktifSahne(st); if (!s) return null;
    const turler = new Map(st.proje!.nesneTurleri.map(t => [t.id, t]));
    const katmanlar = new Map(s.katmanlar.map(k => [k.id, k]));
    const sirali = [...s.ornekler].sort((a, b) => KATMAN_SIRASI.indexOf(a.katman) - KATMAN_SIRASI.indexOf(b.katman));
    for (let i = sirali.length - 1; i >= 0; i--) {
      const o = sirali[i], k = katmanlar.get(o.katman);
      if (k && (!k.gorunur || k.kilitli)) continue;
      const { w, h } = boyutlar(turler.get(o.turId));
      const a = (-o.aci * Math.PI) / 180, dx = wx - o.x, dy = wy - o.y;
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      if (Math.abs(lx) <= (w * Math.abs(o.olcekX)) / 2 && Math.abs(ly) <= (h * Math.abs(o.olcekY)) / 2) return o;
    }
    return null;
  };

  const ornegiDegistir = (id: string, fn: (o: Ornek) => void) =>
    useDurum.getState().degistir(p => p.sahneler.forEach(s => s.ornekler.forEach(o => { if (o.id === id) fn(o); })));
  const yapis = (v: number) => {
    const t = useDurum.getState().tercih;
    return t.miknatis ? Math.round(v / (t.izgaraBoyutu / 2)) * (t.izgaraBoyutu / 2) : Math.round(v);
  };

  // ---- fare
  const basildi = (e: React.PointerEvent) => {
    kapRef.current?.focus();
    const st = useDurum.getState(), w = dunyaya(e.clientX, e.clientY);
    (e.target as Element).setPointerCapture(e.pointerId);
    if (e.button === 1 || st.arac === "el" || bosluk.current) {
      surukle.current = { tur: "kaydir", sx: e.clientX, sy: e.clientY, kx: kam.current.x, ky: kam.current.y };
      return;
    }
    if (st.oynatma !== "duruyor") { zipla(); return; }
    const o = isabet(w.x, w.y);
    if (!o) { st.sec(null); return; }
    st.sec({ tur: "ornek", id: o.id });
    if (st.arac === "dondur") {
      surukle.current = { tur: "dondur", id: o.id, ox: o.x, oy: o.y, ilkAci: o.aci, ilkFare: Math.atan2(w.y - o.y, w.x - o.x) };
    } else if (st.arac === "olcekle") {
      surukle.current = { tur: "olcekle", id: o.id, ox: o.x, oy: o.y, ilkX: o.olcekX, ilkY: o.olcekY, ilkMesafe: Math.max(4, Math.hypot(w.x - o.x, w.y - o.y)) };
    } else {
      surukle.current = { tur: "tasi", id: o.id, bx: w.x, by: w.y, ox: o.x, oy: o.y };
    }
  };
  const hareket = (e: React.PointerEvent) => {
    const w = dunyaya(e.clientX, e.clientY);
    useDurum.getState().set("imlec", { x: Math.round(w.x), y: Math.round(w.y) });
    const s = surukle.current; if (!s) return;
    const z = useDurum.getState().yakinlastirma;
    if (s.tur === "kaydir") kam.current = { x: s.kx - (e.clientX - s.sx) / z, y: s.ky - (e.clientY - s.sy) / z };
    else if (s.tur === "tasi") ornegiDegistir(s.id, o => { o.x = yapis(s.ox + w.x - s.bx); o.y = yapis(s.oy + w.y - s.by); });
    else if (s.tur === "dondur") {
      let a = s.ilkAci + ((Math.atan2(w.y - s.oy, w.x - s.ox) - s.ilkFare) * 180) / Math.PI;
      if (e.shiftKey) a = Math.round(a / 15) * 15;
      ornegiDegistir(s.id, o => { o.aci = Math.round(((a % 360) + 360) % 360); });
    } else if (s.tur === "olcekle") {
      const k = Math.hypot(w.x - s.ox, w.y - s.oy) / s.ilkMesafe;
      ornegiDegistir(s.id, o => { o.olcekX = Math.round(s.ilkX * k * 100) / 100; o.olcekY = Math.round(s.ilkY * k * 100) / 100; });
    }
  };
  const birakildi = () => { surukle.current = null; };
  const tekerlek = (e: React.WheelEvent) => {
    const w = dunyaya(e.clientX, e.clientY);
    yakinlastir(useDurum.getState().yakinlastirma * Math.exp(-e.deltaY * 0.0015), { ...w, ex: e.clientX, ey: e.clientY });
  };

  // ---- listeden sürükle-bırak
  const birak = (e: React.DragEvent) => {
    const turId = e.dataTransfer.getData("text/nesne-turu");
    if (!turId) return;
    e.preventDefault();
    const w = dunyaya(e.clientX, e.clientY);
    useDurum.getState().ornekEkle(turId, yapis(w.x), yapis(w.y));
  };

  // ---- oynatma önizlemesi (basit): fizik + tuşla zıpla + sabit kay + ekrandan çıkınca yok ol
  const zipla = () => {
    const st = useDurum.getState();
    if (!sim.current || st.oynatma !== "oynuyor") return;
    const turler = new Map(st.proje!.nesneTurleri.map(t => [t.id, t]));
    for (const o of sim.current) {
      const z = turler.get(o.turId)?.bilesenler.davranislar?.find(d => d.tur === "tusla_zipla");
      if (z) o.vy = -Number(z.ayarlar.guc || 450);
    }
  };
  useEffect(() => {
    const st = useDurum.getState(), s = aktifSahne(st);
    if (oynatma === "duruyor") { if (sim.current) st.log("Önizleme durduruldu."); sim.current = null; return; }
    if (!sim.current && s) {
      const turler = new Map(st.proje!.nesneTurleri.map(t => [t.id, t]));
      sim.current = s.ornekler.map(o => {
        const f = turler.get(o.turId)?.bilesenler.fizik;
        return { ...o, vx: f?.hizX || 0, vy: f?.hizY || 0 };
      });
      st.log("Önizleme başladı (fizik, zıplama, kayma). Çarpışma ve kurallar sonraki aşamalarda.");
      kapRef.current?.focus();
    }
  }, [oynatma]);

  const tus = (e: React.KeyboardEvent, basildiMi: boolean) => {
    if (e.key !== " ") return;
    e.preventDefault();
    if (useDurum.getState().oynatma !== "duruyor") { if (basildiMi && !e.repeat) zipla(); }
    else bosluk.current = basildiMi;
  };

  // ---- çizim döngüsü
  useEffect(() => {
    let kare = 0, son = performance.now(), fpsSay = 0, fpsZaman = son;
    const d0 = () => {
      kare = requestAnimationFrame(d0);
      const simdi = performance.now(), dt = Math.min(1 / 30, (simdi - son) / 1000);
      son = simdi; fpsSay++;
      if (simdi - fpsZaman > 1000) { (window as any).__fps = fpsSay; fpsSay = 0; fpsZaman = simdi; }
      const st = useDurum.getState(), sahne = aktifSahne(st), cv = cvRef.current, kap = kapRef.current;
      if (!cv || !kap || !sahne || !st.proje) return;
      const o = window.devicePixelRatio || 1, W = kap.clientWidth, H = kap.clientHeight;
      if (cv.width !== Math.round(W * o) || cv.height !== Math.round(H * o)) { cv.width = Math.round(W * o); cv.height = Math.round(H * o); }
      const c = cv.getContext("2d")!, z = st.yakinlastirma;
      const turler = new Map(st.proje.nesneTurleri.map(t => [t.id, t]));

      // önizleme fiziği
      if (sim.current && st.oynatma === "oynuyor") {
        for (const s of sim.current) {
          const t = turler.get(s.turId), f = t?.bilesenler.fizik;
          if (f) { s.vy = Math.min(s.vy + f.yercekimi * dt, f.enYuksekHiz); s.x += s.vx * dt; s.y += s.vy * dt; }
          const kay = t?.bilesenler.davranislar?.find(d => d.tur === "sabit_kay");
          if (kay) s.x -= Number(kay.ayarlar.hiz || 0) * dt;
        }
        sim.current = sim.current.filter(s => {
          const t = turler.get(s.turId);
          if (!t?.bilesenler.davranislar?.some(d => d.tur === "ekrandan_cikinca_yok_ol")) return true;
          const { w } = boyutlar(t);
          return s.x > -w && s.y < sahne.yukseklik + 400;
        });
      }

      c.setTransform(o, 0, 0, o, 0, 0);
      c.fillStyle = "#0e1015";
      c.fillRect(0, 0, W, H);
      c.save();
      c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-kam.current.x, -kam.current.y);

      // sahne alanı
      c.fillStyle = sahne.arkaplan;
      c.fillRect(0, 0, sahne.genislik, sahne.yukseklik);

      // ızgara
      if (st.tercih.izgaraGoster && st.oynatma === "duruyor") {
        const adim = st.tercih.izgaraBoyutu;
        const x0 = kam.current.x - W / 2 / z, x1 = kam.current.x + W / 2 / z, y0 = kam.current.y - H / 2 / z, y1 = kam.current.y + H / 2 / z;
        c.lineWidth = 1 / z;
        if (adim * z > 6) {
          c.beginPath();
          for (let x = Math.floor(x0 / adim) * adim; x < x1; x += adim) { c.moveTo(x, y0); c.lineTo(x, y1); }
          for (let y = Math.floor(y0 / adim) * adim; y < y1; y += adim) { c.moveTo(x0, y); c.lineTo(x1, y); }
          c.strokeStyle = "rgba(255,255,255,0.06)";
          c.stroke();
        }
        c.beginPath(); c.moveTo(0, y0); c.lineTo(0, y1); c.moveTo(x0, 0); c.lineTo(x1, 0);
        c.strokeStyle = "rgba(255,255,255,0.18)"; c.stroke();
      }

      // nesneler (katman sırasıyla)
      const katmanlar = new Map(sahne.katmanlar.map(k => [k.id, k]));
      const liste = (sim.current || sahne.ornekler).slice().sort((a, b) => KATMAN_SIRASI.indexOf(a.katman) - KATMAN_SIRASI.indexOf(b.katman));
      for (const ornek of liste) {
        if (katmanlar.get(ornek.katman)?.gorunur === false) continue;
        const t = turler.get(ornek.turId), g = t?.bilesenler.gorunum;
        c.save();
        c.translate(ornek.x, ornek.y); c.rotate((ornek.aci * Math.PI) / 180); c.scale(ornek.olcekX, ornek.olcekY);
        if (g) { c.globalAlpha = g.saydamlik; sekilCiz(c, g.sekil, g.genislik, g.yukseklik, g.renk); }
        else { c.setLineDash([4 / z, 4 / z]); c.strokeStyle = "#888"; c.lineWidth = 1 / z; c.strokeRect(-20, -20, 40, 40); }
        c.restore();
      }

      // sahne çerçevesi
      c.setLineDash([6 / z, 4 / z]);
      c.strokeStyle = st.oynatma === "duruyor" ? "rgba(79,156,247,0.8)" : "rgba(76,195,138,0.9)";
      c.lineWidth = 1.5 / z;
      c.strokeRect(0, 0, sahne.genislik, sahne.yukseklik);
      c.setLineDash([]);

      // seçim kutusu ve tutamaçlar
      const sec = st.secim;
      if (sec?.tur === "ornek" && st.oynatma === "duruyor") {
        const so = sahne.ornekler.find(x => x.id === sec.id);
        if (so) {
          const { w, h } = boyutlar(turler.get(so.turId));
          const bw = w * Math.abs(so.olcekX), bh = h * Math.abs(so.olcekY);
          c.save(); c.translate(so.x, so.y); c.rotate((so.aci * Math.PI) / 180);
          c.strokeStyle = "#4f9cf7"; c.lineWidth = 1.5 / z;
          c.strokeRect(-bw / 2, -bh / 2, bw, bh);
          const t = 8 / z;
          c.fillStyle = "#fff";
          for (const [hx, hy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            c.fillRect((hx * bw) / 2 - t / 2, (hy * bh) / 2 - t / 2, t, t);
            c.strokeRect((hx * bw) / 2 - t / 2, (hy * bh) / 2 - t / 2, t, t);
          }
          c.beginPath(); c.moveTo(0, -bh / 2); c.lineTo(0, -bh / 2 - 22 / z); c.stroke();
          c.beginPath(); c.arc(0, -bh / 2 - 26 / z, 4 / z, 0, Math.PI * 2); c.fill(); c.stroke();
          c.restore();
        }
      }
      c.restore();

      // sahne adı
      // sahne adı (çerçevenin altında, sol üstteki seçicinin altında kalmasın)
      const sx = (0 - kam.current.x) * z + W / 2, sy = (sahne.yukseklik - kam.current.y) * z + H / 2;
      c.font = "12px 'Segoe UI', system-ui"; c.fillStyle = "rgba(228,231,238,0.6)";
      c.fillText(`${sahne.ad}  ·  ${sahne.genislik}×${sahne.yukseklik}`, sx, sy + 18);
    };
    kare = requestAnimationFrame(d0);
    const sig = () => sigdir(), yak = () => yakinlastir(useDurum.getState().yakinlastirma * 1.25), uz = () => yakinlastir(useDurum.getState().yakinlastirma / 1.25);
    addEventListener("sahne-sigdir", sig); addEventListener("sahne-yakinlas", yak); addEventListener("sahne-uzaklas", uz);
    setTimeout(sigdir, 0);
    return () => { cancelAnimationFrame(kare); removeEventListener("sahne-sigdir", sig); removeEventListener("sahne-yakinlas", yak); removeEventListener("sahne-uzaklas", uz); };
  }, []);

  useEffect(() => { setTimeout(sigdir, 0); }, [aktifId]);

  const imlec = oynatma !== "duruyor" ? "pointer" : useDurum.getState().arac === "el" ? "grab" : "default";
  return (
    <div className="sahne-kap" ref={kapRef} tabIndex={0} data-testid="sahne"
      onPointerDown={basildi} onPointerMove={hareket} onPointerUp={birakildi} onWheel={tekerlek}
      onDragOver={e => e.preventDefault()} onDrop={birak}
      onKeyDown={e => tus(e, true)} onKeyUp={e => tus(e, false)}
      onPointerLeave={() => useDurum.getState().set("imlec", null)}
      style={{ cursor: imlec }}>
      <canvas ref={cvRef} />
      {oynatma !== "duruyor" && <div className="oynatma-seridi" />}
      <div className="sahne-ust" onPointerDown={e => e.stopPropagation()}>
        <div className="yuzer">
          <select className="giris" value={aktifId || ""} title="Sahne"
            onChange={e => useDurum.getState().set("aktifSahneId", e.target.value)}>
            {sahneler?.map(s => <option key={s.id} value={s.id}>{s.ad}</option>)}
          </select>
        </div>
        {oynatma !== "duruyor" && (
          <div className="yuzer" style={{ padding: "4px 10px", gap: 8 }}>
            <Play size={14} color="#4cc38a" />
            <span>{oynatma === "oynuyor" ? "Oynuyor: BOŞLUK ya da tıkla" : "Duraklatıldı"}</span>
            <span className="rozet yakinda">basit önizleme</span>
          </div>
        )}
        <span style={{ flex: 1 }} />
        <div className="yuzer">
          <button className="ikon-dugme" title="Uzaklaştır (Ctrl+-)" onClick={() => sahneOlay("uzaklas")}><Minus size={15} /></button>
          <span style={{ width: 48, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{Math.round(yakinlastirma * 100)}%</span>
          <button className="ikon-dugme" title="Yakınlaştır (Ctrl++)" onClick={() => sahneOlay("yakinlas")}><Plus size={15} /></button>
          <button className="ikon-dugme" title="Sığdır (Ctrl+0)" onClick={() => sahneOlay("sigdir")}><Maximize size={14} /></button>
        </div>
      </div>
    </div>
  );
}
