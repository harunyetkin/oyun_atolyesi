// Yankı'nın çizimi (canvas 2D). Oyun mantığını yalnızca okur, değiştirmez.
import { AYAR, H, type Oyun } from "./oyun/dunya";

const RENK = {
  arka1: "#07060c", arka2: "#120d1d",
  kaya: [122, 98, 150] as const,        // aydınlanan kayanın rengi (mor-gri)
  kenar: [214, 196, 255] as const,      // yankı değen kenar çizgisi
  dalga: "200,185,255",
  buyukDalga: "150,220,255",
  bocek: "#d8ff7a",
  yazi: "#ece8f7", soluk: "#9a92b4",
};

/** Ateş böceği ışığı: bir kez çizilip tekrar kullanılan küçük resim (pil dostu). */
let bocekResmi: HTMLCanvasElement | null = null;
function bocekIsigi(): HTMLCanvasElement {
  if (bocekResmi) return bocekResmi;
  const c = document.createElement("canvas");
  c.width = c.height = 96;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
  gr.addColorStop(0, "rgba(235,255,170,1)");
  gr.addColorStop(0.12, "rgba(216,255,122,0.9)");
  gr.addColorStop(0.35, "rgba(190,255,90,0.25)");
  gr.addColorStop(1, "rgba(190,255,90,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 96, 96);
  bocekResmi = c;
  return c;
}

/** Yarasa silüeti: kanatlar `kanat` (-1..1) ile açılıp kapanır. */
function yarasaCiz(c: CanvasRenderingContext2D, x: number, y: number, r: number, kanat: number, egim: number) {
  c.save();
  c.translate(x, y);
  c.rotate(egim);
  c.fillStyle = "#1a1426";
  c.strokeStyle = "rgba(200,185,255,0.55)";
  c.lineWidth = 1.6;
  for (const yan of [-1, 1]) {
    c.beginPath();
    c.moveTo(yan * r * 0.35, -r * 0.2);
    c.lineTo(yan * r * 1.5, -r * 1.25 * kanat - r * 0.35);
    c.lineTo(yan * r * 2.5, -r * 1.05 * kanat - r * 0.1);
    c.quadraticCurveTo(yan * r * 2.0, -r * 0.35 * kanat + r * 0.25, yan * r * 1.7, -r * 0.2 * kanat + r * 0.5);
    c.quadraticCurveTo(yan * r * 1.25, r * 0.15, yan * r * 1.0, r * 0.55);
    c.quadraticCurveTo(yan * r * 0.7, r * 0.2, yan * r * 0.3, r * 0.45);
    c.closePath();
    c.fill(); c.stroke();
  }
  // gövde ve kulaklar
  c.beginPath();
  c.ellipse(0, 0, r * 0.55, r * 0.75, 0, 0, Math.PI * 2);
  c.fill(); c.stroke();
  c.beginPath();
  c.moveTo(-r * 0.4, -r * 0.5); c.lineTo(-r * 0.3, -r * 1.05); c.lineTo(-r * 0.08, -r * 0.62);
  c.moveTo(r * 0.4, -r * 0.5); c.lineTo(r * 0.3, -r * 1.05); c.lineTo(r * 0.08, -r * 0.62);
  c.fill(); c.stroke();
  // gözler
  c.fillStyle = "#ffe9a8";
  c.beginPath(); c.arc(-r * 0.2, -r * 0.25, r * 0.1, 0, Math.PI * 2); c.arc(r * 0.2, -r * 0.25, r * 0.1, 0, Math.PI * 2); c.fill();
  c.restore();
}

/** Yazıyı ekrana sığacak kadar küçülterek ortalar. */
function sigdir(c: CanvasRenderingContext2D, metin: string, x: number, y: number, boy: number, kalinlik: number, enGenis: number) {
  c.font = `${kalinlik} ${boy}px system-ui, sans-serif`;
  const w = c.measureText(metin).width;
  if (w > enGenis) c.font = `${kalinlik} ${Math.floor(boy * enGenis / w)}px system-ui, sans-serif`;
  c.fillText(metin, x, y);
}

/** Bir kare çizer. Önce bütün tuval temizlenir (eski karelerden iz kalmasın); oyun alanı `olcek` ile
 *  büyütülüp (ox, oy) kadar kaydırılarak ortalanır. Ekran oranı oyun alanından farklıysa kenarlar koyu kalır. */
export function ciz(c: CanvasRenderingContext2D, o: Oyun, olcek: number, ox: number, oy: number, enIyi: { yeniRekor: boolean }) {
  const W = o.W;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = RENK.arka1;
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  c.setTransform(olcek, 0, 0, olcek, ox, oy);
  c.save();
  c.beginPath(); c.rect(0, 0, W, H); c.clip();   // oyun alanının dışına taşan çizim olmasın
  const arka = c.createLinearGradient(0, 0, 0, H);
  arka.addColorStop(0, RENK.arka1); arka.addColorStop(0.5, RENK.arka2); arka.addColorStop(1, RENK.arka1);
  c.fillStyle = arka;
  c.fillRect(0, 0, W, H);

  const kx = o.kam;
  const yx = o.yarasaX - kx;
  // yarasanın kendi soluk ışığı (yakındaki duvarlar hafifçe görünür)
  const isikYaricap = 120;
  const ara = AYAR.ornekAraligi;
  const ilk = Math.floor(kx / ara) - 1, son = Math.ceil((kx + W) / ara) + 1;

  // Duvarlar: her örnek aralığı bir dilim (kenarı izleyen yamuk). Parlaklık komşularla yumuşatılmış gelir
  // (Oyun.parlaklik), 40 basamağa yuvarlanır (göze sürekli görünür) ve aynı basamaktaki dilimler tek seferde
  // çizilir (telefonda az çizim çağrısı). Altı ince kat üst üste biner: kenarda parlak, içeride yumuşakça kararır.
  const BASAMAK = 40;
  const KATLAR: [number, number][] = [[7, 0.42], [15, 0.28], [26, 0.2], [40, 0.14], [57, 0.1], [78, 0.07]];   // [derinlik, saydamlık]
  const yollar: Path2D[][] = KATLAR.map(() => Array.from({ length: BASAMAK + 1 }, () => new Path2D()));
  const kenarlar: Path2D[] = Array.from({ length: BASAMAK + 1 }, () => new Path2D());
  const dolu = new Set<number>();
  let onceki = o.sinir(ilk * ara);
  for (let i = ilk; i < son; i++) {
    const sonraki = o.sinir((i + 1) * ara);
    const x0 = i * ara - kx, x1 = x0 + ara;
    for (const k of [0, 1] as const) {
      const y0 = onceki[k], y1 = sonraki[k];
      const uzak = Math.hypot(x0 + ara / 2 - yx, (y0 + y1) / 2 - o.y) / isikYaricap;
      const yakin = uzak < 1 ? (1 - uzak) * (1 - uzak) * 0.55 : 0;   // yarasanın ışığı da yumuşak kenarlı
      const p = Math.min(1, Math.max((o.parlaklik(i, k) + o.parlaklik(i + 1, k)) / 2, yakin));
      const b = Math.round(p * BASAMAK);
      if (b === 0) continue;
      dolu.add(b);
      const yon = k === 0 ? -1 : 1;
      KATLAR.forEach(([d], j) => {
        const yol = yollar[j][b];
        yol.moveTo(x0, y0); yol.lineTo(x1, y1); yol.lineTo(x1, y1 + yon * d); yol.lineTo(x0, y0 + yon * d); yol.closePath();
      });
      kenarlar[b].moveTo(x0, y0); kenarlar[b].lineTo(x1, y1);
    }
    onceki = sonraki;
  }
  c.lineWidth = 2.5;
  c.lineCap = "butt";
  for (const b of dolu) {
    const p = b / BASAMAK;
    KATLAR.forEach(([, a], j) => { c.fillStyle = `rgba(${RENK.kaya.join(",")},${a * p})`; c.fill(yollar[j][b]); });
    c.strokeStyle = `rgba(${RENK.kenar.join(",")},${p})`;
    c.stroke(kenarlar[b]);
  }

  // sarkıt ve dikitler: duvarın oradaki ışığıyla (yankı değince) ve yarasanın yakın ışığıyla görünür
  for (const sv of o.sivriler) {
    const sx = sv.x - kx;
    if (sx < -sv.taban || sx > W + sv.taban) continue;
    const [u, a] = o.sinir(sv.x);
    const kok = sv.ust ? u : a, uc = sv.ust ? u + sv.boy : a - sv.boy;
    const i = Math.round(sv.x / ara);
    const uzak = Math.hypot(sx - yx, (kok + uc) / 2 - o.y) / (isikYaricap * 1.2);
    const p = Math.min(1, Math.max(o.parlaklik(i, sv.ust ? 0 : 1) * 1.1, uzak < 1 ? (1 - uzak) * (1 - uzak) * 0.6 : 0));
    if (p < 0.02) continue;
    c.beginPath();
    c.moveTo(sx - sv.taban / 2, kok + (sv.ust ? -3 : 3));
    c.quadraticCurveTo(sx - sv.taban * 0.18, (kok + uc) / 2, sx, uc);
    c.quadraticCurveTo(sx + sv.taban * 0.18, (kok + uc) / 2, sx + sv.taban / 2, kok + (sv.ust ? -3 : 3));
    c.closePath();
    c.fillStyle = `rgba(${RENK.kaya.join(",")},${0.5 * p})`;
    c.fill();
    c.strokeStyle = `rgba(${RENK.kenar.join(",")},${p})`;
    c.lineWidth = 2.5;
    c.stroke();
  }

  // ölümcül olmayan tehlikeler: yankı değince ve yarasanın ışığına girince görünür
  for (const t of o.tehlikeler) {
    const tx = t.x - kx;
    if (tx < -60 || tx > W + 60) continue;
    const uzak = Math.hypot(tx - yx, t.y - o.y) / (isikYaricap * 1.2);
    const p = Math.min(1, Math.max(t.isik, uzak < 1 ? (1 - uzak) * (1 - uzak) * 0.7 : 0));
    if (p < 0.03) continue;
    if (t.tur === "ag") {
      // örümcek ağı: 8 kol ve 3 halka, tavana tutunan ince bir iple
      const R = AYAR.agYaricap;
      c.strokeStyle = `rgba(232,228,242,${0.75 * p})`;
      c.lineWidth = 1.4;
      c.beginPath();
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2; c.moveTo(tx, t.y); c.lineTo(tx + Math.cos(a) * R, t.y + Math.sin(a) * R); }
      for (const h of [0.35, 0.65, 0.95]) {
        for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2; const px = tx + Math.cos(a) * R * h, py = t.y + Math.sin(a) * R * h; if (k === 0) c.moveTo(px, py); else c.lineTo(px, py); }
      }
      const [u] = o.sinir(t.x);
      c.moveTo(tx, t.y - R); c.lineTo(tx, u);
      c.stroke();
    } else {
      // su damlası: ucu yukarı bakan damla, üstünde parıltı
      const r = AYAR.damlaYaricap;
      c.fillStyle = `rgba(140,200,255,${0.85 * p})`;
      c.beginPath();
      c.moveTo(tx, t.y - r * 2.2);
      c.quadraticCurveTo(tx + r * 1.1, t.y - r * 0.2, tx, t.y + r);
      c.quadraticCurveTo(tx - r * 1.1, t.y - r * 0.2, tx, t.y - r * 2.2);
      c.fill();
      c.fillStyle = `rgba(255,255,255,${0.8 * p})`;
      c.beginPath(); c.arc(tx - r * 0.3, t.y - r * 0.2, r * 0.25, 0, Math.PI * 2); c.fill();
    }
  }

  // yankı dalgaları: ince halkalar
  for (const d of o.dalgalar) {
    const a = (1 - d.r / d.menzil) * (d.buyuk ? 0.55 : 0.35);
    c.strokeStyle = `rgba(${d.buyuk ? RENK.buyukDalga : RENK.dalga},${a})`;
    c.lineWidth = d.buyuk ? 4 : 2.5;
    c.beginPath();
    c.arc(d.x - kx, d.y, d.r, 0, Math.PI * 2);
    c.stroke();
  }

  // ateş böcekleri
  const resim = bocekIsigi();
  for (const b of o.bocekler) {
    const bx = b.x - kx;
    if (bx < -60 || bx > W + 60) continue;
    const titreme = 0.75 + 0.25 * Math.sin(b.faz * 9);
    const boy = 62 * titreme;
    c.globalAlpha = titreme;
    c.drawImage(resim, bx - boy / 2, b.y - boy / 2, boy, boy);
  }
  c.globalAlpha = 1;

  // yarasa ve çevresindeki hafif ışık
  const hale = c.createRadialGradient(yx, o.y, 0, yx, o.y, isikYaricap);
  hale.addColorStop(0, "rgba(160,140,220,0.18)");
  hale.addColorStop(1, "rgba(160,140,220,0)");
  c.fillStyle = hale;
  c.fillRect(yx - isikYaricap, o.y - isikYaricap, isikYaricap * 2, isikYaricap * 2);
  const kanat = o.kanatT < 0.22 ? Math.cos((o.kanatT / 0.22) * Math.PI) : 0.25 * Math.sin(o.t * 7) - 0.2;
  const egim = Math.max(-0.5, Math.min(0.6, o.vy / 1600));
  yarasaCiz(c, yx, o.y, AYAR.yarasaYaricap * 1.25, kanat, egim);
  if (o.etkiler.ag > 0) {   // kanatlara yapışmış ağ telleri
    c.strokeStyle = `rgba(232,228,242,${Math.min(1, o.etkiler.ag) * 0.8})`;
    c.lineWidth = 1.2;
    c.beginPath();
    for (const [a, b] of [[-28, -6], [-10, 8], [6, -10], [22, 6], [-20, 10]]) { c.moveTo(yx + a, o.y - 12); c.lineTo(yx + b, o.y + 10); }
    c.stroke();
  }
  if (o.etkiler.islak > 0) {   // kanatlardan süzülen damlacıklar
    c.fillStyle = `rgba(140,200,255,${Math.min(1, o.etkiler.islak) * 0.8})`;
    for (let k = 0; k < 3; k++) {
      const dy = ((o.t * 90 + k * 13) % 30);
      c.beginPath(); c.arc(yx - 18 + k * 18, o.y + 14 + dy, 2.2, 0, Math.PI * 2); c.fill();
    }
  }
  for (const yz of o.yazilar) {
    c.globalAlpha = Math.min(1, yz.omur * 2);
    c.fillStyle = yz.renk;
    c.font = "600 30px system-ui, sans-serif";
    c.textAlign = "left";
    // yazı yarasanın yanında başlar, ekranın içinde kalır (dar telefonda sola taşmasın)
    c.fillText(yz.metin, Math.max(12, Math.min(yz.x - kx, W - c.measureText(yz.metin).width - 12)), yz.y);
  }
  c.globalAlpha = 1;
  c.textAlign = "center";

  // ---------------------------------------------------------------- arayüz
  c.textAlign = "center";
  c.textBaseline = "middle";
  if (o.durum === "oyun" && o.duraklatildi) {
    c.fillStyle = "rgba(7,6,12,0.6)";
    c.fillRect(0, 0, W, H);
    c.fillStyle = RENK.yazi;
    sigdir(c, "Duraklatıldı", W / 2, H * 0.3, 64, 700, W - 40);
    c.fillStyle = RENK.soluk;
    sigdir(c, `Skor: ${o.skor}`, W / 2, H * 0.38, 32, 500, W - 40);
    c.fillStyle = `rgba(236,232,247,${0.55 + 0.45 * Math.sin(performance.now() / 333)})`;
    sigdir(c, "Devam etmek için dokun", W / 2, H * 0.48, 36, 600, W - 40);
  } else if (o.durum === "oyun") {
    c.fillStyle = RENK.yazi;
    sigdir(c, String(o.skor), W / 2, 90, 64, 600, W - 40);
    // büyük sonar enerjisi: altta ince çubuk
    const bw = Math.min(260, W * 0.5), bx = (W - bw) / 2, by = H - 60;
    c.fillStyle = "rgba(255,255,255,0.12)";
    c.fillRect(bx, by, bw, 10);
    c.fillStyle = o.enerji >= 1 ? "rgba(150,220,255,0.95)" : "rgba(150,220,255,0.45)";
    c.fillRect(bx, by, bw * o.enerji, 10);
    c.fillStyle = RENK.soluk;
    sigdir(c, o.enerji >= 1 ? "Büyük yankı hazır: basılı tut" : "Büyük yankı doluyor", W / 2, by + 34, 22, 500, W - 40);
    const etki = [o.etkiler.ag > 0 ? `Ağ: kanat zayıf ${o.etkiler.ag.toFixed(1)} sn` : "", o.etkiler.islak > 0 ? `Islak: ağır ${o.etkiler.islak.toFixed(1)} sn` : ""].filter(Boolean).join("  ·  ");
    if (etki) { c.fillStyle = "#c9e4ff"; sigdir(c, etki, W / 2, by - 26, 22, 600, W - 40); }
  } else if (o.durum === "menu") {
    c.fillStyle = "rgba(7,6,12,0.45)";   // yazılar duvarların önünde okunsun
    c.fillRect(0, 0, W, H);
    c.fillStyle = RENK.yazi;
    sigdir(c, "Yankı", W / 2, H * 0.24, 120, 700, W - 40);
    c.fillStyle = RENK.soluk;
    const satirlar = ["Dokun: kanat çırp, yankı gönder", "Basılı tut: büyük yankı", "Ateş böceklerini topla"];
    satirlar.forEach((s, i) => sigdir(c, s, W / 2, H * 0.72 + i * 44, 30, 500, W - 40));
    c.fillStyle = `rgba(236,232,247,${0.55 + 0.45 * Math.sin(o.t * 3)})`;
    sigdir(c, "Başlamak için dokun", W / 2, H * 0.88, 36, 600, W - 40);
    if (o.rekor > 0) { c.fillStyle = RENK.soluk; sigdir(c, `En iyi: ${o.rekor}`, W / 2, H * 0.33, 26, 500, W - 40); }
  } else {
    c.fillStyle = "rgba(7,6,12,0.55)";
    c.fillRect(0, 0, W, H);
    c.fillStyle = RENK.yazi;
    sigdir(c, o.carpmaNedeni, W / 2, H * 0.3, 44, 600, W - 40);
    sigdir(c, String(o.skor), W / 2, H * 0.43, 130, 700, W - 40);
    c.font = "500 30px system-ui, sans-serif";
    c.fillStyle = enIyi.yeniRekor ? "#ffd86b" : RENK.soluk;
    c.fillText(enIyi.yeniRekor ? "Yeni rekor!" : `En iyi: ${o.rekor}`, W / 2, H * 0.52);
    if (o.bitisT >= AYAR.yenidenBaslamaBeklemesi) {
      c.fillStyle = `rgba(236,232,247,${0.55 + 0.45 * Math.sin(o.t * 3)})`;
      sigdir(c, "Yeniden başlamak için dokun", W / 2, H * 0.68, 36, 600, W - 40);
    }
  }
  c.restore();
}
