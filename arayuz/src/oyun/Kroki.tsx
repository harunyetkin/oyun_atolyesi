// Haritanın üstten görünüşü (yaklaşık krokisi): ekranda yatay = -z (yol boyunca ileri), dikey = x.
// Kipler: "esya" kipinde eşyalar, "sandik" kipinde sandıklar sürüklenir; "kisi" kipinde kişilerin dolaşma alanları taşınır,
// kenarındaki tutamaçla büyütülür, "yolda yürür" kişilerin yaya şeridi uçlarından çekilir ve seçili kişinin günlük
// programındaki duraklar (saatleriyle) sürüklenir.
// Büyük haritalarda (ör. köy, yüzlerce metre) işaretler ve yazılar `s` katsayısıyla büyür ki okunabilsin.
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, Scan } from "lucide-react";
import { useOyun } from "./durum";
import { npcSeridi, NPC_VARSAYILAN, type Esya, type Npc } from "./icerik";

const ondalik = (v: number) => Math.round(v * 10) / 10;
const yarim = (v: number) => Math.round(v * 2) / 2;
/** Krokinin en/boy oranı (sabit; yakınlaştırınca da değişmez). */
const ORAN = 2.6;
interface Sinir { z0: number; z1: number; x0: number; x1: number }

/** İçeriğin yoğun bölgesi: noktaların %10–%90 dilimi, %40 pay ve en az 30 m; az nokta varsa tamamı. */
function yogunSinir(noktalar: [number, number][], tam: Sinir): Sinir {
  if (noktalar.length < 8) return tam;
  const dilim = (l: number[], q: number) => { const k = [...l].sort((a, b) => a - b); return k[Math.min(k.length - 1, Math.max(0, Math.round(q * (k.length - 1))))]; };
  const zs = noktalar.map(n => n[0]), xs = noktalar.map(n => n[1]);
  let z0 = dilim(zs, 0.1), z1 = dilim(zs, 0.9), x0 = dilim(xs, 0.1), x1 = dilim(xs, 0.9);
  const pz = Math.max(15, (z1 - z0) * 0.4), px = Math.max(8, (x1 - x0) * 0.4);
  z0 = Math.max(tam.z0, z0 - pz); z1 = Math.min(tam.z1, z1 + pz); x0 = Math.max(tam.x0, x0 - px); x1 = Math.min(tam.x1, x1 + px);
  return { z0, z1, x0, x1 };
}

const saatYazisi = (saat: number) => `${Math.floor(saat)}:${String(Math.round((saat % 1) * 60)).padStart(2, "0")}`;

export function Kroki({ dosya, harita, mod = "esya" }: { dosya: string; harita: any; mod?: "esya" | "kisi" | "sandik" }) {
  const svg = useRef<SVGSVGElement>(null);
  const secili = useOyun(o => o.secili);
  const { degistir, sec } = useOyun.getState();
  const yol = harita?.yol || {};
  const uzunluk = yol.uzunluk ?? 130, genislik = yol.genislik ?? 7;
  // seviye_zemini: zemin ve yollar Unreal seviyesinin kendisinde; oyun düz yol şeridi koymaz, krokide de çizilmez
  const yolVar = harita?.seviye_zemini !== 1 && !!harita?.yol;
  const esyalar: Esya[] = harita?.esyalar || [];
  const npcler: Npc[] = harita?.npcler || [];

  // Sınırlar içerikten hesaplanır (yol, dekor, kişiler ve programları, eşyalar, sandıklar, kapılar, şeritler).
  // Bitiş çok uzaktaysa (ör. köy haritasında z = -500) kroki onu kapsamak için küçülmez; kenarda okla gösterilir.
  const basla = harita?.baslangic?.konum;
  const yolBasi = (basla?.[2] ?? 4) + 2, yolSonu = yolBasi - uzunluk;
  const zler: number[] = yolVar ? [yolBasi, yolSonu] : [];
  let w = yolVar ? genislik / 2 + 6 : 6;
  const noktalar: [number, number][] = [];   // [z, x]: yakın görünüm için
  const ekle = (x: number | undefined, z: number | undefined, pay = 2) => {
    if (typeof z === "number") zler.push(z + pay, z - pay);
    if (typeof x === "number") w = Math.max(w, Math.abs(x) + pay);
    if (typeof z === "number" && typeof x === "number") noktalar.push([z, x]);
  };
  for (const n of harita?.nesneler || []) ekle(n.konum?.[0], n.konum?.[2], 1);
  for (const e of esyalar) ekle(e.konum?.[0], e.konum?.[2]);
  for (const s of harita?.sandiklar || []) ekle(s.konum?.[0], s.konum?.[2]);
  for (const k of harita?.kapilar || []) ekle(undefined, k.z);
  for (const n of npcler) {
    if (n.alan?.merkez) ekle(n.alan.merkez[0], n.alan.merkez[1], (n.alan.yaricap ?? NPC_VARSAYILAN.yaricap) + 1);
    if (n.davranis === "yol") { const s = npcSeridi(n); ekle(s.x, s.zBas); ekle(s.x, s.zSon); }
    for (const p of (n.program as any[]) || []) if (Array.isArray(p?.yer)) ekle(p.yer[0], p.yer[1]);
  }
  if (basla) ekle(basla[0], basla[2]);
  if (!zler.length) zler.push(10, -10);
  let basZ = Math.max(...zler) + 1, sonZ = Math.min(...zler) - 1;
  const bitisZ: number | undefined = harita?.bitis?.z;
  const bitisIcerde = typeof bitisZ === "number" && bitisZ >= sonZ - 40 && bitisZ <= basZ + 40;
  if (bitisIcerde) { basZ = Math.max(basZ, bitisZ + 2); sonZ = Math.min(sonZ, bitisZ - 2); }
  if (basZ - sonZ < 30) { const orta = (basZ + sonZ) / 2; basZ = orta + 15; sonZ = orta - 15; }
  w = Math.min(w, 600);

  // Görüş: varsayılan "yakın görünüm" içeriğin yoğun kısmını gösterir (uzaktaki birkaç kişi her şeyi küçültmesin);
  // tekerlekle yakınlaş/uzaklaş, boş yeri sürükleyerek kaydır, düğmelerle hepsini sığdır.
  const tam: Sinir = { z0: sonZ, z1: basZ, x0: -w, x1: w };
  const yakin = yogunSinir(noktalar, tam);
  const [gorus, setGorus] = useState<Sinir | "tam" | null>(null);
  const hedef = gorus === "tam" ? tam : gorus ?? yakin;
  const vbG = Math.max(hedef.z1 - hedef.z0, (hedef.x1 - hedef.x0) * ORAN), vbY = vbG / ORAN;
  const vbX = -(hedef.z1 + hedef.z0) / 2 - vbG / 2, vbYust = (hedef.x0 + hedef.x1) / 2 - vbY / 2;
  const vb = `${vbX} ${vbYust} ${vbG} ${vbY}`;
  // işaret ve yazı katsayısı: görünen alan 140 m genişliğindeyse 1, daha büyükse orantılı
  const s = Math.max(1, vbG / 140);
  const gorusRef = useRef({ vbX, vbYust, vbG, vbY });
  gorusRef.current = { vbX, vbYust, vbG, vbY };
  /** Ekran görüş kutusunu (ekran koordinatı) harita sınırına çevirip görüş olarak kaydeder. */
  const kutudanGorus = (x: number, y: number, gen: number) =>
    setGorus({ z0: -(x + gen), z1: -x, x0: y, x1: y + gen / ORAN });
  const yakinlastir = (kat: number, merkezX?: number, merkezY?: number) => {
    const g = gorusRef.current;
    const mx = merkezX ?? g.vbX + g.vbG / 2, my = merkezY ?? g.vbYust + g.vbY / 2;
    const yeniG = Math.min(Math.max(8, g.vbG * kat), 4000);
    kutudanGorus(mx - (mx - g.vbX) * (yeniG / g.vbG), my - (my - g.vbYust) * (yeniG / g.vbG), yeniG);
  };
  useEffect(() => {
    const el = svg.current; if (!el) return;
    const teker = (e: WheelEvent) => {
      e.preventDefault();
      const m = el.getScreenCTM(); if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      yakinlastir(e.deltaY > 0 ? 1.2 : 1 / 1.2, p.x, p.y);
    };
    el.addEventListener("wheel", teker, { passive: false });
    return () => el.removeEventListener("wheel", teker);
  });
  /** Boş yerden sürükleme kaydırır; kımıldamadan bırakılırsa seçim kalkar (eşya kipinde seçim korunur). */
  const bosBas = (ev: React.PointerEvent) => {
    const el = svg.current; if (!el) return;
    const m = el.getScreenCTM(); if (!m) return;
    const birim = gorusRef.current.vbG / el.getBoundingClientRect().width;
    const x0 = ev.clientX, y0 = ev.clientY, g0 = { ...gorusRef.current };
    let oynadi = false;
    const hareket = (e: PointerEvent) => {
      if (Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 3) oynadi = true;
      if (oynadi) kutudanGorus(g0.vbX - (e.clientX - x0) * birim, g0.vbYust - (e.clientY - y0) * birim, g0.vbG);
    };
    const birak = () => {
      removeEventListener("pointermove", hareket); removeEventListener("pointerup", birak);
      if (!oynadi && mod !== "esya") sec(null);
    };
    addEventListener("pointermove", hareket); addEventListener("pointerup", birak);
  };
  const kenarY = yolVar ? genislik / 2 : 0;   // kapı ve bitiş çizgilerinin yarı boyu

  /** Sürükleme: `uygula`ya farenin harita konumu (x yana, z yol boyunca; metre) ve baştan beri kayma (dx, dz) verilir. */
  const surukleBaslat = (ev: React.PointerEvent, id: string, anahtar: string, uygula: (x: number, z: number, d: any, dx: number, dz: number) => void) => {
    ev.preventDefault(); ev.stopPropagation(); sec(id);
    const el = svg.current; if (!el) return;
    const m = el.getScreenCTM(); if (!m) return;
    const ters = m.inverse();
    const p0 = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ters);
    const hareket = (e: PointerEvent) => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ters);
      const x = Math.max(-w, Math.min(w, p.y)), z = -p.x;
      degistir(dosya, d => uygula(x, z, d, p.y - p0.y, p0.x - p.x), anahtar);
    };
    const birak = () => { removeEventListener("pointermove", hareket); removeEventListener("pointerup", birak); };
    addEventListener("pointermove", hareket); addEventListener("pointerup", birak);
  };
  const esyaSurukle = (id: string) => (ev: React.PointerEvent) => surukleBaslat(ev, id, "kroki:" + id, (x, z, d) => {
    const es = d.esyalar?.find((q: Esya) => q.id === id); if (es) es.konum = [ondalik(x), es.konum?.[1] ?? 0, ondalik(z)];
  });
  const sandikSurukle = (id: string) => (ev: React.PointerEvent) => surukleBaslat(ev, id, "kroki-sandik:" + id, (x, z, d) => {
    const sd = d.sandiklar?.find((q: any) => q.id === id); if (sd) sd.konum = [ondalik(x), sd.konum?.[1] ?? 0, ondalik(z)];
  });
  const npcBul = (d: any, id: string): Npc | undefined => d.npcler?.find((q: Npc) => q.id === id);
  // Alan, tutulduğu yerden kayar (merkez fareye sıçramaz); yaya şeridi de alanla birlikte taşınır.
  const alanTasi = (id: string) => (ev: React.PointerEvent) => {
    const n0 = npcler.find(q => q.id === id);
    if (!n0?.alan?.merkez) return;
    const [mx0, mz0] = n0.alan.merkez;
    const serit0 = n0.davranis === "yol" && typeof n0.serit_y === "number" ? { y: n0.serit_y, a: n0.serit_x_min, b: n0.serit_x_max } : null;
    surukleBaslat(ev, id, "kroki-alan:" + id, (_x, _z, d, dx, dz) => {
      const n = npcBul(d, id); if (!n?.alan) return;
      const yeni: [number, number] = [yarim(mx0 + dx), yarim(mz0 + dz)];
      n.alan = { ...n.alan, merkez: yeni };
      if (serit0) {
        const kx = (yeni[0] - mx0) * 100, kz = -(yeni[1] - mz0) * 100;
        n.serit_y = Math.round(serit0.y + kx);
        if (typeof serit0.a === "number") n.serit_x_min = Math.round(serit0.a + kz);
        if (typeof serit0.b === "number") n.serit_x_max = Math.round(serit0.b + kz);
      }
    });
  };
  const alanBoyutla = (id: string) => (ev: React.PointerEvent) => surukleBaslat(ev, id, "kroki-yaricap:" + id, (x, z, d) => {
    const n = npcBul(d, id); if (!n?.alan?.merkez) return;
    const [mx, mz] = n.alan.merkez;
    n.alan = { ...n.alan, yaricap: Math.max(0.5, yarim(Math.hypot(x - mx, z - mz))) };
  });
  /** Şeridin bir ucunu çeker: uç yol boyunca kayar, şerit yana kayar (iki uç aynı yanda kalır). */
  const seritUcu = (id: string, uc: "bas" | "son") => (ev: React.PointerEvent) => surukleBaslat(ev, id, "kroki-serit:" + id, (x, z, d) => {
    const n = npcBul(d, id); if (!n) return;
    const sr = npcSeridi(n);
    const zBas = uc === "bas" ? z : sr.zBas, zSon = uc === "son" ? z : sr.zSon;
    n.serit_y = Math.round(x * 10) * 10;
    n.serit_x_min = Math.round(-Math.max(zBas, zSon) * 10) * 10;
    n.serit_x_max = Math.round(-Math.min(zBas, zSon) * 10) * 10;
  });
  /** Günlük programdaki bir durağı (yer [x, z]) taşır; yeri olmayan durak önce alanın ortasından başlar. */
  const durakTasi = (id: string, i: number) => (ev: React.PointerEvent) => surukleBaslat(ev, id, `kroki-durak:${id}:${i}`, (x, z, d) => {
    const n = npcBul(d, id); const p = (n?.program as any[] | undefined)?.[i]; if (!p) return;
    p.yer = [ondalik(x), ondalik(z)];
  });

  const kisiKipi = mod === "kisi", sandikKipi = mod === "sandik", esyaKipi = mod === "esya";
  const seciliKisi = kisiKipi ? npcler.find(n => n.id === secili) : undefined;
  const program: any[] = Array.isArray(seciliKisi?.program) ? (seciliKisi!.program as any[]) : [];
  const durakYeri = (p: any): [number, number] | null =>
    Array.isArray(p?.yer) ? [p.yer[0], p.yer[1]] : seciliKisi?.alan?.merkez ? [seciliKisi.alan.merkez[0], seciliKisi.alan.merkez[1]] : null;
  return (
    <div className="kroki" data-testid="kroki">
      <div className="kroki-dugmeler">
        <button className="ikon-dugme" title="Yakınlaş" data-testid="kroki-yakin" onClick={() => yakinlastir(1 / 1.5)}><Plus size={14} /></button>
        <button className="ikon-dugme" title="Uzaklaş" data-testid="kroki-uzak" onClick={() => yakinlastir(1.5)}><Minus size={14} /></button>
        <button className="ikon-dugme" title="Yakın görünüm (kalabalık bölge)" data-testid="kroki-yakin-gorunum" onClick={() => setGorus(null)}><Scan size={14} /></button>
        <button className="ikon-dugme" title="Hepsini sığdır" data-testid="kroki-sigdir" onClick={() => setGorus("tam")}><Maximize2 size={14} /></button>
      </div>
      <svg ref={svg} className="kroki-harita" data-testid="kroki-harita" viewBox={vb} preserveAspectRatio="xMidYMid meet" style={{ aspectRatio: `${ORAN}`, ["--kroki-olcek" as any]: s }}
        onPointerDown={bosBas} data-olcek={s.toFixed(2)}>
        {yolVar && <rect x={-yolBasi} y={-genislik / 2} width={yolBasi - yolSonu} height={genislik} fill={yol.renk || "#8d8478"} opacity={0.55} />}
        {yolVar && yol.serit !== false && <line x1={-yolBasi} x2={-yolSonu} y1={0} y2={0} stroke="#e9e3d0" strokeWidth={0.15 * s} strokeDasharray={`${1.5 * s} ${1.5 * s}`} opacity={0.6} />}
        {(harita?.nesneler || []).map((n: any, i: number) => n.konum && <circle key={i} cx={-n.konum[2]} cy={n.konum[0]} r={0.45 * s} fill="#6f7686" opacity={0.7} />)}
        {(harita?.sandiklar || []).map((sd: any) => {
          if (!sd.konum) return null;
          const sec_ = sandikKipi && secili === sd.id, b = (sec_ ? 1.3 : sandikKipi ? 1 : 0.6) * s;
          return <g key={sd.id} className={sandikKipi ? "kroki-esya" : undefined} onPointerDown={sandikKipi ? sandikSurukle(sd.id) : undefined} data-testid={"kroki-sandik-" + sd.id}>
            <rect x={-sd.konum[2] - b} y={sd.konum[0] - b * 0.7} width={2 * b} height={1.4 * b} rx={0.2 * s} fill="#c58a3c" opacity={sandikKipi ? 1 : 0.85}
              stroke={sec_ ? "#4f9cf7" : sandikKipi ? "#fff" : "none"} strokeWidth={(sec_ ? 0.4 : 0.2) * s} />
            {sandikKipi && <text x={-sd.konum[2]} y={sd.konum[0] + (sd.konum[0] >= 0 ? 2.6 : -1.8) * s} className="kroki-yazi">{sd.ad || sd.id}</text>}
          </g>;
        })}
        {npcler.map(n => {
          if (!n.alan?.merkez) return null;
          const cx = -n.alan.merkez[1], cy = n.alan.merkez[0], r = n.alan.yaricap ?? NPC_VARSAYILAN.yaricap;
          const sec_ = kisiKipi && secili === n.id;
          const sr = n.davranis === "yol" ? npcSeridi(n) : null;
          return <g key={n.id} className={kisiKipi ? "kroki-kisi" : undefined} data-testid={"kroki-kisi-" + n.id}>
            {sr && <line x1={-sr.zBas} x2={-sr.zSon} y1={sr.x} y2={sr.x} stroke="#a78bfa" strokeWidth={(sec_ ? 0.5 : 0.3) * s} opacity={0.9} />}
            <circle cx={cx} cy={cy} r={Math.max(r, 0.6 * s)} fill={sec_ ? "rgba(79,156,247,.16)" : "rgba(167,139,250,.08)"} stroke={sec_ ? "#4f9cf7" : "#a78bfa"}
              strokeWidth={(sec_ ? 0.3 : 0.15) * s} strokeDasharray={sr ? `${0.4 * s} ${0.8 * s}` : `${0.8 * s} ${0.6 * s}`} onPointerDown={kisiKipi ? alanTasi(n.id) : undefined} data-testid={"kroki-alan-" + n.id} />
            <circle cx={cx} cy={cy} r={0.55 * s} fill={sec_ ? "#4f9cf7" : "#a78bfa"} pointerEvents="none" />
            <text x={cx} y={cy + 1.6 * s} className="kroki-yazi mor" pointerEvents="none">{n.ad || n.id}</text>
            {sec_ && <circle cx={cx + Math.max(r, 0.6 * s)} cy={cy} r={0.75 * s} className="kroki-tutamac" onPointerDown={alanBoyutla(n.id)} data-testid={"kroki-yaricap-" + n.id} />}
            {sec_ && sr && <>
              <circle cx={-sr.zBas} cy={sr.x} r={0.7 * s} className="kroki-tutamac" onPointerDown={seritUcu(n.id, "bas")} data-testid={"kroki-serit-bas-" + n.id} />
              <circle cx={-sr.zSon} cy={sr.x} r={0.7 * s} className="kroki-tutamac" onPointerDown={seritUcu(n.id, "son")} data-testid={"kroki-serit-son-" + n.id} />
            </>}
          </g>;
        })}
        {/* seçili kişinin günlük programı: duraklar saat sırasıyla kesikli çizgiyle bağlı, sürüklenebilir */}
        {program.length > 0 && <g data-testid="kroki-program">
          <polyline fill="none" stroke="#f0a35e" strokeWidth={0.3 * s} strokeDasharray={`${0.9 * s} ${0.6 * s}`} opacity={0.85} pointerEvents="none"
            points={[...program, program[0]].map(durakYeri).filter(Boolean).map(y => `${-y![1]},${y![0]}`).join(" ")} />
          {program.map((p, i) => {
            const y = durakYeri(p); if (!y) return null;
            const b = 0.8 * s;
            return <g key={i} className="kroki-esya" onPointerDown={durakTasi(seciliKisi!.id, i)} data-testid={`kroki-durak-${seciliKisi!.id}-${i}`}>
              <rect x={-y[1] - b} y={y[0] - b} width={2 * b} height={2 * b} rx={0.25 * s} fill="#f0a35e" stroke="#fff" strokeWidth={0.2 * s} />
              <text x={-y[1]} y={y[0] - 1.4 * s} className="kroki-yazi turuncu">{typeof p.saat === "number" ? saatYazisi(p.saat) : "?"}</text>
            </g>;
          })}
        </g>}
        {(harita?.kapilar || []).map((k: any) => <g key={k.id}>
          <line x1={-k.z} x2={-k.z} y1={-kenarY - s} y2={kenarY + s} stroke="#e9b949" strokeWidth={0.5 * s} />
          <text x={-k.z} y={-kenarY - 1.8 * s} className="kroki-yazi sari">{k.id}</text>
        </g>)}
        {basla && <polygon points={`${-basla[2] - 1.2 * s},${basla[0] - 1.2 * s} ${-basla[2] + 1.6 * s},${basla[0]} ${-basla[2] - 1.2 * s},${basla[0] + 1.2 * s}`} fill="#4cc38a" />}
        {bitisIcerde && <line x1={-bitisZ!} x2={-bitisZ!} y1={-kenarY - s} y2={kenarY + s} stroke="#4cc38a" strokeWidth={0.5 * s} />}
        {typeof bitisZ === "number" && !bitisIcerde && <text x={-sonZ - s} y={w - 1.5 * s} className="kroki-yazi yesil" style={{ textAnchor: "end" }}>
          bitiş {Math.round(Math.abs(bitisZ - sonZ))} m ileride →</text>}
        {esyalar.map(e => e.konum && <g key={e.id} className={esyaKipi ? "kroki-esya" : undefined} opacity={esyaKipi ? 1 : 0.45}
          onPointerDown={esyaKipi ? esyaSurukle(e.id) : undefined} data-testid={"kroki-" + e.id}>
          <circle cx={-e.konum[2]} cy={e.konum[0]} r={(esyaKipi && secili === e.id ? 1.3 : 1) * s} fill={e.renk || "#a0703c"}
            stroke={esyaKipi && secili === e.id ? "#4f9cf7" : "#fff"} strokeWidth={(esyaKipi && secili === e.id ? 0.4 : 0.2) * s} />
          {esyaKipi && <text x={-e.konum[2]} y={e.konum[0] + (e.konum[0] >= 0 ? 2.6 : -1.8) * s} className="kroki-yazi">{e.ad || e.id}</text>}
        </g>)}
      </svg>
      <div className="kroki-lejant">
        <span><i style={{ background: "#4cc38a" }} /> başlangıç / bitiş</span><span><i style={{ background: "#e9b949" }} /> kapılar</span>
        <span><i style={{ background: "#a78bfa" }} /> kişilerin dolaşma alanı{kisiKipi ? " / yaya şeridi" : ""}</span>
        {kisiKipi && <span><i style={{ background: "#f0a35e" }} /> seçili kişinin günlük programı</span>}
        <span><i style={{ background: "#a0703c" }} /> eşyalar</span><span><i style={{ background: "#c58a3c" }} /> sandıklar</span><span><i style={{ background: "#6f7686" }} /> dekor</span>
        <span className="cok-soluk" style={{ marginLeft: "auto" }}>{kisiKipi ? "alanı ya da program durağını sürükle: taşı · kenardaki noktayı çek: büyüt" : sandikKipi ? "sandığı sürükleyerek taşı" : "üstten görünüş, yaklaşık · yol soldan sağa"}</span>
      </div>
    </div>
  );
}
