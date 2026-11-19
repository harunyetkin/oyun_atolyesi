// Haritanın üstten görünüşü (yaklaşık krokisi): yol soldan sağa ilerler (ekranda yatay = -z, dikey = x).
// İki kipi var: "esya" kipinde eşyalar sürüklenir; "kisi" kipinde kişilerin dolaşma alanları taşınır ve
// kenarındaki tutamaçla büyütülür/küçültülür, "yolda yürür" davranışındaki kişilerin yaya şeridi uçlarından çekilir.
import { useRef } from "react";
import { useOyun } from "./durum";
import { npcSeridi, NPC_VARSAYILAN, type Esya, type Npc } from "./icerik";

const ondalik = (v: number) => Math.round(v * 10) / 10;
const yarim = (v: number) => Math.round(v * 2) / 2;

export function Kroki({ dosya, harita, mod = "esya" }: { dosya: string; harita: any; mod?: "esya" | "kisi" | "sandik" }) {
  const svg = useRef<SVGSVGElement>(null);
  const secili = useOyun(o => o.secili);
  const { degistir, sec } = useOyun.getState();
  const yol = harita?.yol || {};
  const uzunluk = yol.uzunluk ?? 130, genislik = yol.genislik ?? 7;
  const esyalar: Esya[] = harita?.esyalar || [];
  const npcler: Npc[] = harita?.npcler || [];
  // Krokinin sınırları içerikten hesaplanır (yol, dekor, kişiler, eşyalar, sandıklar, kapılar, şeritler).
  // Bitiş çok uzaktaysa (ör. köy haritasında z = -500) kroki onu kapsamak için küçülmez; kenarda okla gösterilir.
  const basla = harita?.baslangic?.konum;
  const yolBasi = (basla?.[2] ?? 4) + 2, yolSonu = yolBasi - uzunluk;
  const zler: number[] = [yolBasi, yolSonu];
  let w = genislik / 2 + 6;
  const ekle = (x: number | undefined, z: number | undefined, pay = 2) => {
    if (typeof z === "number") zler.push(z + pay, z - pay);
    if (typeof x === "number") w = Math.max(w, Math.abs(x) + pay);
  };
  for (const n of harita?.nesneler || []) ekle(n.konum?.[0], n.konum?.[2], 1);
  for (const e of esyalar) ekle(e.konum?.[0], e.konum?.[2]);
  for (const s of harita?.sandiklar || []) ekle(s.konum?.[0], s.konum?.[2]);
  for (const k of harita?.kapilar || []) ekle(undefined, k.z);
  for (const n of npcler) {
    if (n.alan?.merkez) ekle(n.alan.merkez[0], n.alan.merkez[1], (n.alan.yaricap ?? NPC_VARSAYILAN.yaricap) + 1);
    if (n.davranis === "yol") { const s = npcSeridi(n); ekle(s.x, s.zBas); ekle(s.x, s.zSon); }
  }
  if (basla) ekle(basla[0], basla[2]);
  let basZ = Math.max(...zler) + 1, sonZ = Math.min(...zler) - 1;
  const bitisZ: number | undefined = harita?.bitis?.z;
  const bitisIcerde = typeof bitisZ === "number" && bitisZ >= sonZ - 40 && bitisZ <= basZ + 40;
  if (bitisIcerde) { basZ = Math.max(basZ, bitisZ + 2); sonZ = Math.min(sonZ, bitisZ - 2); }
  if (basZ - sonZ < 30) { const orta = (basZ + sonZ) / 2; basZ = orta + 15; sonZ = orta - 15; }
  w = Math.min(w, 80);
  const vb = `${-basZ - 2} ${-w} ${basZ - sonZ + 4} ${2 * w}`;

  /** Fare konumunu harita koordinatına (x yana, z yol boyunca; metre) çevirir. */
  /** `uygula`ya farenin harita konumu ve sürüklemenin başından beri kayma (dx, dz) verilir. */
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
    const s = d.sandiklar?.find((q: any) => q.id === id); if (s) s.konum = [ondalik(x), s.konum?.[1] ?? 0, ondalik(z)];
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
    n.alan = { ...n.alan, yaricap: Math.max(1, yarim(Math.hypot(x - mx, z - mz))) };
  });
  /** Şeridin bir ucunu çeker: uç yol boyunca kayar, şerit yana kayar (iki uç aynı yanda kalır). */
  const seritUcu = (id: string, uc: "bas" | "son") => (ev: React.PointerEvent) => surukleBaslat(ev, id, "kroki-serit:" + id, (x, z, d) => {
    const n = npcBul(d, id); if (!n) return;
    const s = npcSeridi(n);
    const zBas = uc === "bas" ? z : s.zBas, zSon = uc === "son" ? z : s.zSon;
    n.serit_y = Math.round(x * 10) * 10;
    n.serit_x_min = Math.round(-Math.max(zBas, zSon) * 10) * 10;
    n.serit_x_max = Math.round(-Math.min(zBas, zSon) * 10) * 10;
  });

  const kisiKipi = mod === "kisi", sandikKipi = mod === "sandik", esyaKipi = mod === "esya";
  return (
    <div className="kroki" data-testid="kroki">
      <svg ref={svg} viewBox={vb} preserveAspectRatio="xMidYMid meet" style={{ aspectRatio: `${basZ - sonZ + 4} / ${2 * w}` }}
        onPointerDown={() => !esyaKipi && sec(null)}>
        <rect x={-yolBasi} y={-genislik / 2} width={yolBasi - yolSonu} height={genislik} fill={yol.renk || "#8d8478"} opacity={0.55} />
        {yol.serit !== false && <line x1={-yolBasi} x2={-yolSonu} y1={0} y2={0} stroke="#e9e3d0" strokeWidth={0.15} strokeDasharray="1.5 1.5" opacity={0.6} />}
        {(harita?.nesneler || []).map((n: any, i: number) => n.konum && <circle key={i} cx={-n.konum[2]} cy={n.konum[0]} r={0.45} fill="#6f7686" opacity={0.7} />)}
        {(harita?.sandiklar || []).map((s: any) => {
          if (!s.konum) return null;
          const sec_ = sandikKipi && secili === s.id, b = sec_ ? 1.3 : sandikKipi ? 1 : 0.6;
          return <g key={s.id} className={sandikKipi ? "kroki-esya" : undefined} onPointerDown={sandikKipi ? sandikSurukle(s.id) : undefined} data-testid={"kroki-sandik-" + s.id}>
            <rect x={-s.konum[2] - b} y={s.konum[0] - b * 0.7} width={2 * b} height={1.4 * b} rx={0.2} fill="#c58a3c" opacity={sandikKipi ? 1 : 0.85}
              stroke={sec_ ? "#4f9cf7" : sandikKipi ? "#fff" : "none"} strokeWidth={sec_ ? 0.4 : 0.2} />
            {sandikKipi && <text x={-s.konum[2]} y={s.konum[0] + (s.konum[0] >= 0 ? 2.6 : -1.8)} className="kroki-yazi">{s.ad || s.id}</text>}
          </g>;
        })}
        {npcler.map(n => {
          if (!n.alan?.merkez) return null;
          const cx = -n.alan.merkez[1], cy = n.alan.merkez[0], r = n.alan.yaricap ?? NPC_VARSAYILAN.yaricap;
          const sec_ = kisiKipi && secili === n.id;
          const s = n.davranis === "yol" ? npcSeridi(n) : null;
          return <g key={n.id} className={kisiKipi ? "kroki-kisi" : undefined} data-testid={"kroki-kisi-" + n.id}>
            {s && <line x1={-s.zBas} x2={-s.zSon} y1={s.x} y2={s.x} stroke="#a78bfa" strokeWidth={sec_ ? 0.5 : 0.3} opacity={0.9} />}
            <circle cx={cx} cy={cy} r={r} fill={sec_ ? "rgba(79,156,247,.16)" : "rgba(167,139,250,.08)"} stroke={sec_ ? "#4f9cf7" : "#a78bfa"}
              strokeWidth={sec_ ? 0.3 : 0.15} strokeDasharray={s ? "0.4 0.8" : "0.8 0.6"} onPointerDown={kisiKipi ? alanTasi(n.id) : undefined} data-testid={"kroki-alan-" + n.id} />
            <circle cx={cx} cy={cy} r={0.55} fill={sec_ ? "#4f9cf7" : "#a78bfa"} pointerEvents="none" />
            <text x={cx} y={cy + 1.6} className="kroki-yazi mor" pointerEvents="none">{n.ad || n.id}</text>
            {sec_ && <circle cx={cx + r} cy={cy} r={0.75} className="kroki-tutamac" onPointerDown={alanBoyutla(n.id)} data-testid={"kroki-yaricap-" + n.id} />}
            {sec_ && s && <>
              <circle cx={-s.zBas} cy={s.x} r={0.7} className="kroki-tutamac" onPointerDown={seritUcu(n.id, "bas")} data-testid={"kroki-serit-bas-" + n.id} />
              <circle cx={-s.zSon} cy={s.x} r={0.7} className="kroki-tutamac" onPointerDown={seritUcu(n.id, "son")} data-testid={"kroki-serit-son-" + n.id} />
            </>}
          </g>;
        })}
        {(harita?.kapilar || []).map((k: any) => <g key={k.id}>
          <line x1={-k.z} x2={-k.z} y1={-genislik / 2 - 1} y2={genislik / 2 + 1} stroke="#e9b949" strokeWidth={0.5} />
          <text x={-k.z} y={-genislik / 2 - 1.8} className="kroki-yazi sari">{k.id}</text>
        </g>)}
        {harita?.baslangic?.konum && <polygon points={`${-harita.baslangic.konum[2] - 1.2},${harita.baslangic.konum[0] - 1.2} ${-harita.baslangic.konum[2] + 1.6},${harita.baslangic.konum[0]} ${-harita.baslangic.konum[2] - 1.2},${harita.baslangic.konum[0] + 1.2}`} fill="#4cc38a" />}
        {bitisIcerde && <line x1={-bitisZ!} x2={-bitisZ!} y1={-genislik / 2 - 1} y2={genislik / 2 + 1} stroke="#4cc38a" strokeWidth={0.5} />}
        {typeof bitisZ === "number" && !bitisIcerde && <text x={-sonZ - 1} y={genislik / 2 + 2.5} className="kroki-yazi yesil" style={{ textAnchor: "end" }}>
          bitiş {Math.round(Math.abs(bitisZ - sonZ))} m ileride →</text>}
        {esyalar.map(e => e.konum && <g key={e.id} className={esyaKipi ? "kroki-esya" : undefined} opacity={esyaKipi ? 1 : 0.45}
          onPointerDown={esyaKipi ? esyaSurukle(e.id) : undefined} data-testid={"kroki-" + e.id}>
          <circle cx={-e.konum[2]} cy={e.konum[0]} r={esyaKipi && secili === e.id ? 1.3 : 1} fill={e.renk || "#a0703c"}
            stroke={esyaKipi && secili === e.id ? "#4f9cf7" : "#fff"} strokeWidth={esyaKipi && secili === e.id ? 0.4 : 0.2} />
          {esyaKipi && <text x={-e.konum[2]} y={e.konum[0] + (e.konum[0] >= 0 ? 2.6 : -1.8)} className="kroki-yazi">{e.ad || e.id}</text>}
        </g>)}
      </svg>
      <div className="kroki-lejant">
        <span><i style={{ background: "#4cc38a" }} /> başlangıç / bitiş</span><span><i style={{ background: "#e9b949" }} /> kapılar</span>
        <span><i style={{ background: "#a78bfa" }} /> kişilerin dolaşma alanı{kisiKipi ? " / yaya şeridi" : ""}</span>
        <span><i style={{ background: "#a0703c" }} /> eşyalar</span><span><i style={{ background: "#c58a3c" }} /> sandıklar</span><span><i style={{ background: "#6f7686" }} /> dekor</span>
        <span className="cok-soluk" style={{ marginLeft: "auto" }}>{kisiKipi ? "alanı sürükle: taşı · kenardaki noktayı çek: büyüt" : sandikKipi ? "sandığı sürükleyerek taşı" : "üstten görünüş, yaklaşık · yol soldan sağa"}</span>
      </div>
    </div>
  );
}
