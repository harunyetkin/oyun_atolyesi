// Nesne şekillerini çizer. Hem editörde hem oyunda kullanılır (DOM'a bağımlı değil).
import type { Sekil } from "../depo/proje";

/** (0,0) merkezli, w x h kutusuna sığan şekli çizer. */
export function sekilCiz(c: CanvasRenderingContext2D, sekil: Sekil, w: number, h: number, renk: string) {
  const rx = w / 2, ry = h / 2;
  c.fillStyle = renk;
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 2;
  c.beginPath();
  switch (sekil) {
    case "kare":
      c.rect(-rx, -ry, w, h);
      break;
    case "ucgen":
      c.moveTo(0, -ry); c.lineTo(rx, ry); c.lineTo(-rx, ry); c.closePath();
      break;
    case "elmas":
      c.moveTo(0, -ry); c.lineTo(rx, 0); c.lineTo(0, ry); c.lineTo(-rx, 0); c.closePath();
      break;
    case "yildiz":
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, k = i % 2 ? 0.45 : 1;
        c.lineTo(Math.cos(a) * rx * k, Math.sin(a) * ry * k);
      }
      c.closePath();
      break;
    case "kus":
    case "yarasa": {
      // gövde + iki kanat + göz
      c.ellipse(0, 0, rx * 0.55, ry * 0.5, 0, 0, Math.PI * 2);
      c.fill(); c.stroke();
      c.beginPath();
      for (const yan of [-1, 1]) {
        c.moveTo(yan * rx * 0.2, -ry * 0.05);
        c.lineTo(yan * rx, -ry * 0.75);
        c.lineTo(yan * rx * 0.85, ry * 0.1);
        c.closePath();
      }
      c.fill(); c.stroke();
      if (sekil === "kus") {
        c.fillStyle = "#f08030";
        c.beginPath(); c.moveTo(rx * 0.45, 0); c.lineTo(rx * 0.85, ry * 0.12); c.lineTo(rx * 0.45, ry * 0.25); c.fill();
      }
      c.fillStyle = "#fff";
      c.beginPath(); c.arc(rx * 0.22, -ry * 0.12, Math.max(2, rx * 0.14), 0, Math.PI * 2); c.fill();
      c.fillStyle = "#111";
      c.beginPath(); c.arc(rx * 0.27, -ry * 0.12, Math.max(1, rx * 0.07), 0, Math.PI * 2); c.fill();
      return;
    }
    default:
      c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  }
  c.fill();
  c.stroke();
}

export const SEKIL_ADLARI: Record<Sekil, string> = {
  daire: "Daire / elips", kare: "Kare / dikdörtgen", ucgen: "Üçgen", elmas: "Elmas", yildiz: "Yıldız", kus: "Kuş", yarasa: "Yarasa",
};
