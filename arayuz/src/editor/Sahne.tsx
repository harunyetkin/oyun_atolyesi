// Sahne düzenleyici: ızgara, yakınlaştırma/kaydırma, seçme (Shift ile çoklu, boş alanda sürükleyerek kutu),
// taşıma, köşe tutamaçlarıyla boyutlandırma, üst tutamaçla döndürme, ölçekleme, listeden sürükle-bırak ile ekleme ve oynatma (oyunu motor/Dunya çalıştırır, burası yalnızca çizer).
import { useEffect, useRef } from "react";
import { Minus, Plus, Maximize, Play } from "lucide-react";
import { aktifSahne, seciliOrnekler, useDurum, type Secim } from "../depo/durum";
import { koseBoyutlandir, kutularKesisir, ornekKutusu } from "../depo/hizalama";
import type { NesneTuru, Ornek } from "../depo/proje";
import { sekilCiz } from "../motor/cizim";
import { Dunya } from "../motor/dunya";
import { carpismaAlani } from "../motor/carpisma";
import { tusAdiBul, type CalisanNesne } from "../motor/tipler";
import { sahneOlay } from "./komutlar";

type Surukleme =
  | { tur: "kaydir"; sx: number; sy: number; kx: number; ky: number }
  | { tur: "tasi"; bx: number; by: number; baslar: Map<string, { x: number; y: number }> }
  | { tur: "boyutlandir"; ilk: Ornek; w: number; h: number; kose: [number, number] }
  | { tur: "kutu"; bx: number; by: number; x: number; y: number; ekle: boolean; onceki: string[] }
  | { tur: "dondur"; id: string; ox: number; oy: number; ilkAci: number; ilkFare: number }
  | { tur: "olcekle"; id: string; ox: number; oy: number; ilkX: number; ilkY: number; ilkMesafe: number };

/** Projedeki davranışların beklediği tuşlar (oynatma şeridinde ipucu olarak gösterilir). */
const kullanilanTuslar = () => {
  const tuslar = new Set<string>();
  useDurum.getState().proje?.nesneTurleri.forEach(t => t.bilesenler.davranislar?.forEach(d => { if (typeof d.ayarlar.tus === "string") tuslar.add(d.ayarlar.tus); }));
  return [...tuslar].join(", ");
};
const KATMAN_SIRASI = ["arka", "oyun", "arayuz"];
const boyutlar = (t: NesneTuru | undefined) => ({ w: t?.bilesenler.gorunum?.genislik ?? 40, h: t?.bilesenler.gorunum?.yukseklik ?? 40 });
const KOSELER: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
/** Kimlik listesinden seçim nesnesi (ilk eleman asıl seçili). */
const secimYap = (idler: string[]): Secim => (idler.length ? { tur: "ornek", id: idler[0], digerleri: idler.slice(1) } : null);

export function SahneGorunumu() {
  const kapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const kam = useRef({ x: 480, y: 270 });
  const dunya = useRef<Dunya | null>(null);
  const surukle = useRef<Surukleme | null>(null);
  const bosluk = useRef(false);
  const yakinlastirma = useDurum(d => d.yakinlastirma);
  const oynatma = useDurum(d => d.oynatma);
  const carpismaGoster = useDurum(d => d.tercih.carpismaGoster);
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

  /** Tek nesne seçiliyken tutamaç isabeti: döndürme yuvarlağı ya da köşe kareleri. */
  const tutamacBul = (wx: number, wy: number): null | { tur: "dondur" } | { tur: "kose"; kose: [number, number] } => {
    const st = useDurum.getState(), s = aktifSahne(st), sec = st.secim;
    if (!s || sec?.tur !== "ornek" || sec.digerleri?.length) return null;
    const o = s.ornekler.find(x => x.id === sec.id); if (!o) return null;
    const k = s.katmanlar.find(x => x.id === o.katman); if (k && (k.kilitli || !k.gorunur)) return null;
    const z = st.yakinlastirma, { w, h } = boyutlar(st.proje!.nesneTurleri.find(t => t.id === o.turId));
    const bw = w * Math.abs(o.olcekX), bh = h * Math.abs(o.olcekY);
    const a = (-o.aci * Math.PI) / 180, dx = wx - o.x, dy = wy - o.y;
    const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    const tol = 8 / z;
    if (Math.hypot(lx, ly - (-bh / 2 - 26 / z)) <= tol) return { tur: "dondur" };
    for (const kose of KOSELER) if (Math.abs(lx - (kose[0] * bw) / 2) <= tol && Math.abs(ly - (kose[1] * bh) / 2) <= tol) return { tur: "kose", kose };
    return null;
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
    if (st.oynatma !== "duruyor") { if (e.button === 0 && st.oynatma === "oynuyor") dunya.current?.tusBas("Fare tıklaması"); return; }
    if (e.button !== 0) return;
    const sahne = aktifSahne(st)!;

    // 1) tutamaçlar (araç seçmeden döndürme ve köşeden boyutlandırma)
    const tm = tutamacBul(w.x, w.y);
    if (tm && st.secim?.tur === "ornek") {
      const o = sahne.ornekler.find(x => x.id === st.secim!.id)!;
      st.islemBaslat();
      if (tm.tur === "dondur") surukle.current = { tur: "dondur", id: o.id, ox: o.x, oy: o.y, ilkAci: o.aci, ilkFare: Math.atan2(w.y - o.y, w.x - o.x) };
      else { const { w: bw, h: bh } = boyutlar(st.proje!.nesneTurleri.find(t => t.id === o.turId)); surukle.current = { tur: "boyutlandir", ilk: { ...o }, w: bw, h: bh, kose: tm.kose }; }
      return;
    }

    const o = isabet(w.x, w.y);
    const secili = seciliOrnekler(st.secim);
    // 2) boş alan: kutu seçimi (Shift ile mevcut seçime ekler)
    if (!o) {
      if (st.arac === "sec" || st.arac === "tasi") {
        surukle.current = { tur: "kutu", bx: w.x, by: w.y, x: w.x, y: w.y, ekle: e.shiftKey, onceki: e.shiftKey ? secili : [] };
        if (!e.shiftKey) st.sec(null);
      } else st.sec(null);
      return;
    }
    // 3) Shift+tık: seçime ekle / seçimden çıkar
    if (e.shiftKey) {
      st.sec(secimYap(secili.includes(o.id) ? secili.filter(id => id !== o.id) : [...secili, o.id]));
      return;
    }
    // 4) zaten seçili gruptaysa grubu koru (hepsi birlikte taşınır), değilse yalnız onu seç
    let grup = secili;
    if (!secili.includes(o.id)) { grup = [o.id]; st.sec({ tur: "ornek", id: o.id }); }
    st.islemBaslat();
    if (st.arac === "dondur") {
      st.sec({ tur: "ornek", id: o.id });
      surukle.current = { tur: "dondur", id: o.id, ox: o.x, oy: o.y, ilkAci: o.aci, ilkFare: Math.atan2(w.y - o.y, w.x - o.x) };
    } else if (st.arac === "olcekle") {
      st.sec({ tur: "ornek", id: o.id });
      surukle.current = { tur: "olcekle", id: o.id, ox: o.x, oy: o.y, ilkX: o.olcekX, ilkY: o.olcekY, ilkMesafe: Math.max(4, Math.hypot(w.x - o.x, w.y - o.y)) };
    } else {
      const baslar = new Map<string, { x: number; y: number }>();
      for (const x of sahne.ornekler) if (grup.includes(x.id)) baslar.set(x.id, { x: x.x, y: x.y });
      surukle.current = { tur: "tasi", bx: w.x, by: w.y, baslar };
    }
  };
  const hareket = (e: React.PointerEvent) => {
    const st = useDurum.getState(), w = dunyaya(e.clientX, e.clientY);
    st.set("imlec", { x: Math.round(w.x), y: Math.round(w.y) });
    const s = surukle.current;
    if (!s) {
      // tutamaç üzerindeyken imleci değiştir
      if (st.oynatma === "duruyor" && kapRef.current && st.arac !== "el") {
        const tm = tutamacBul(w.x, w.y);
        kapRef.current.style.cursor = !tm ? "default" : tm.tur === "dondur" ? "grab" : (tm.kose[0] * tm.kose[1] > 0 ? "nwse-resize" : "nesw-resize");
      }
      return;
    }
    const z = st.yakinlastirma;
    if (s.tur === "kaydir") kam.current = { x: s.kx - (e.clientX - s.sx) / z, y: s.ky - (e.clientY - s.sy) / z };
    else if (s.tur === "tasi") {
      // asıl tutulan nesne ızgaraya yapışır, diğerleri aynı kadar kayar
      const ilk = s.baslar.values().next().value!;
      const dx = yapis(ilk.x + w.x - s.bx) - ilk.x, dy = yapis(ilk.y + w.y - s.by) - ilk.y;
      st.degistir(p => p.sahneler.forEach(sh => sh.ornekler.forEach(o => {
        const b = s.baslar.get(o.id); if (b) { o.x = b.x + dx; o.y = b.y + dy; }
      })));
    }
    else if (s.tur === "dondur") {
      let a = s.ilkAci + ((Math.atan2(w.y - s.oy, w.x - s.ox) - s.ilkFare) * 180) / Math.PI;
      if (e.shiftKey) a = Math.round(a / 15) * 15;
      ornegiDegistir(s.id, o => { o.aci = Math.round(((a % 360) + 360) % 360); });
    } else if (s.tur === "olcekle") {
      const k = Math.hypot(w.x - s.ox, w.y - s.oy) / s.ilkMesafe;
      ornegiDegistir(s.id, o => { o.olcekX = Math.round(s.ilkX * k * 100) / 100; o.olcekY = Math.round(s.ilkY * k * 100) / 100; });
    } else if (s.tur === "boyutlandir") {
      const r = koseBoyutlandir(s.ilk, s.w, s.h, s.kose, w, e.shiftKey);
      ornegiDegistir(s.ilk.id, o => { o.x = r.x; o.y = r.y; o.olcekX = r.olcekX; o.olcekY = r.olcekY; });
    } else if (s.tur === "kutu") {
      s.x = w.x; s.y = w.y;
      const sahne = aktifSahne(st); if (!sahne) return;
      const kutu = { x0: Math.min(s.bx, s.x), y0: Math.min(s.by, s.y), x1: Math.max(s.bx, s.x), y1: Math.max(s.by, s.y) };
      const turler = new Map(st.proje!.nesneTurleri.map(t => [t.id, t]));
      const kapali = new Set(sahne.katmanlar.filter(k => k.kilitli || !k.gorunur).map(k => k.id));
      const icindekiler = sahne.ornekler.filter(o => !kapali.has(o.katman) && kutularKesisir(kutu, ornekKutusu(o, turler.get(o.turId)))).map(o => o.id);
      st.sec(secimYap([...s.onceki, ...icindekiler.filter(id => !s.onceki.includes(id))]));
    }
  };
  const birakildi = () => {
    const s = surukle.current;
    surukle.current = null;
    if (s && s.tur !== "kaydir" && s.tur !== "kutu") useDurum.getState().islemBitir();
    dunya.current?.tusBirak("Fare tıklaması");
  };
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

  // ---- oynatma: Oynat'a basınca projenin kopyasından bir Dunya kurulur, Durdur'da atılır
  useEffect(() => {
    const st = useDurum.getState();
    if (oynatma === "duruyor") {
      if (dunya.current) st.log("Oyun durduruldu.");
      dunya.current = null; (window as any).__dunya = null;
      return;
    }
    if (!dunya.current && st.proje && st.aktifSahneId) {
      dunya.current = new Dunya(st.proje, st.aktifSahneId);
      (window as any).__dunya = dunya.current;   // otomatik testler için
      st.log("Oyun başladı (fizik, çarpışma, davranışlar). Olay kuralları Aşama 2'de.");
      kapRef.current?.focus();
    }
  }, [oynatma]);

  // oynarken klavye: tuşlar motora gider (yazı kutularında değilken)
  useEffect(() => {
    if (oynatma === "duruyor") return;
    const yaziyor = (e: KeyboardEvent) => ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName);
    const bas = (e: KeyboardEvent) => {
      const t = tusAdiBul(e.key);
      if (!t || yaziyor(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (useDurum.getState().oynatma !== "oynuyor") return;   // duraklatılmışken girdi biriktirme
      e.preventDefault();
      dunya.current?.tusBas(t);
    };
    const birak = (e: KeyboardEvent) => { const t = tusAdiBul(e.key); if (t) dunya.current?.tusBirak(t); };
    addEventListener("keydown", bas); addEventListener("keyup", birak);
    return () => { removeEventListener("keydown", bas); removeEventListener("keyup", birak); };
  }, [oynatma]);

  // düzenlerken Boşluk basılıyken sürükleme sahneyi kaydırır
  const tus = (e: React.KeyboardEvent, basildiMi: boolean) => {
    if (e.key !== " " || useDurum.getState().oynatma !== "duruyor") return;
    e.preventDefault();
    bosluk.current = basildiMi;
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
      const surukleme = surukle.current;
      const o = window.devicePixelRatio || 1, W = kap.clientWidth, H = kap.clientHeight;
      if (cv.width !== Math.round(W * o) || cv.height !== Math.round(H * o)) { cv.width = Math.round(W * o); cv.height = Math.round(H * o); }
      const c = cv.getContext("2d")!, z = st.yakinlastirma;
      const turler = new Map(st.proje.nesneTurleri.map(t => [t.id, t]));

      // oyun dünyasını ilerlet
      if (dunya.current && st.oynatma === "oynuyor") dunya.current.ilerle(dt);

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
      const liste: (Ornek | CalisanNesne)[] = (dunya.current?.nesneler || sahne.ornekler).slice().sort((a, b) => KATMAN_SIRASI.indexOf(a.katman) - KATMAN_SIRASI.indexOf(b.katman));
      for (const ornek of liste) {
        if (katmanlar.get(ornek.katman)?.gorunur === false) continue;
        const t = turler.get(ornek.turId), g = t?.bilesenler.gorunum;
        c.save();
        c.translate(ornek.x, ornek.y); c.rotate((ornek.aci * Math.PI) / 180); c.scale(ornek.olcekX, ornek.olcekY);
        if (g) { c.globalAlpha = g.saydamlik; sekilCiz(c, g.sekil, g.genislik, g.yukseklik, g.renk); }
        else { c.setLineDash([4 / z, 4 / z]); c.strokeStyle = "#888"; c.lineWidth = 1 / z; c.strokeRect(-20, -20, 40, 40); }
        c.restore();
      }

      // çarpışma alanları (Görünüm > Çarpışma alanlarını göster)
      if (st.tercih.carpismaGoster) {
        c.lineWidth = 1.5 / z;
        for (const ornek of liste) {
          const t = turler.get(ornek.turId);
          if (!t?.bilesenler.carpisma || katmanlar.get(ornek.katman)?.gorunur === false) continue;
          const n = "tur" in ornek ? ornek : { ...ornek, tur: t } as CalisanNesne;
          const al = carpismaAlani(n); if (!al) continue;
          const kati = t.bilesenler.carpisma.kati;
          c.strokeStyle = kati ? "rgba(255,90,90,0.95)" : "rgba(90,230,140,0.95)";
          c.fillStyle = kati ? "rgba(255,90,90,0.18)" : "rgba(90,230,140,0.18)";
          c.beginPath();
          if (al.bicim === "daire") c.arc(al.x, al.y, al.r, 0, Math.PI * 2);
          else c.rect(al.x - al.yw, al.y - al.yh, al.yw * 2, al.yh * 2);
          c.fill(); c.stroke();
        }
      }

      // sahne çerçevesi
      c.setLineDash([6 / z, 4 / z]);
      c.strokeStyle = st.oynatma === "duruyor" ? "rgba(79,156,247,0.8)" : "rgba(76,195,138,0.9)";
      c.lineWidth = 1.5 / z;
      c.strokeRect(0, 0, sahne.genislik, sahne.yukseklik);
      c.setLineDash([]);

      // seçim kutuları; tek nesne seçiliyse köşe tutamaçları ve döndürme tutamacı
      const seciliIdler = st.oynatma === "duruyor" ? seciliOrnekler(st.secim) : [];
      const tekSecim = seciliIdler.length === 1;
      for (const id of seciliIdler) {
        const so = sahne.ornekler.find(x => x.id === id);
        if (!so) continue;
        const { w, h } = boyutlar(turler.get(so.turId));
        const bw = w * Math.abs(so.olcekX), bh = h * Math.abs(so.olcekY);
        c.save(); c.translate(so.x, so.y); c.rotate((so.aci * Math.PI) / 180);
        c.strokeStyle = id === st.secim?.id ? "#4f9cf7" : "rgba(79,156,247,0.75)"; c.lineWidth = 1.5 / z;
        c.strokeRect(-bw / 2, -bh / 2, bw, bh);
        if (tekSecim) {
          const t = 8 / z;
          c.fillStyle = "#fff";
          for (const [hx, hy] of KOSELER) {
            c.fillRect((hx * bw) / 2 - t / 2, (hy * bh) / 2 - t / 2, t, t);
            c.strokeRect((hx * bw) / 2 - t / 2, (hy * bh) / 2 - t / 2, t, t);
          }
          c.beginPath(); c.moveTo(0, -bh / 2); c.lineTo(0, -bh / 2 - 22 / z); c.stroke();
          c.beginPath(); c.arc(0, -bh / 2 - 26 / z, 4 / z, 0, Math.PI * 2); c.fill(); c.stroke();
        }
        c.restore();
      }
      // birden fazla seçiliyse hepsini saran kesikli kutu
      if (seciliIdler.length > 1) {
        const kutular = sahne.ornekler.filter(o => seciliIdler.includes(o.id)).map(o => ornekKutusu(o, turler.get(o.turId)));
        if (kutular.length) {
          const x0 = Math.min(...kutular.map(k => k.x0)), y0 = Math.min(...kutular.map(k => k.y0));
          const x1 = Math.max(...kutular.map(k => k.x1)), y1 = Math.max(...kutular.map(k => k.y1));
          c.setLineDash([4 / z, 3 / z]); c.strokeStyle = "rgba(79,156,247,0.9)"; c.lineWidth = 1 / z;
          c.strokeRect(x0 - 4 / z, y0 - 4 / z, x1 - x0 + 8 / z, y1 - y0 + 8 / z); c.setLineDash([]);
        }
      }
      // kutu seçimi dikdörtgeni
      if (surukleme?.tur === "kutu") {
        const x0 = Math.min(surukleme.bx, surukleme.x), y0 = Math.min(surukleme.by, surukleme.y);
        c.fillStyle = "rgba(79,156,247,0.12)"; c.strokeStyle = "rgba(79,156,247,0.9)"; c.lineWidth = 1 / z;
        c.fillRect(x0, y0, Math.abs(surukleme.x - surukleme.bx), Math.abs(surukleme.y - surukleme.by));
        c.strokeRect(x0, y0, Math.abs(surukleme.x - surukleme.bx), Math.abs(surukleme.y - surukleme.by));
      }
      c.restore();

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
            <span data-testid="oynatma-bilgi">{oynatma === "oynuyor" ? "Oynuyor" + (kullanilanTuslar() ? " · " + kullanilanTuslar() : "") : "Duraklatıldı"}</span>
            {carpismaGoster && <span className="rozet">çarpışma alanları açık</span>}
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
