// "Sabit hızla kay": nesneyi seçilen yöne sabit hızla taşır (borular, engeller, arka plan).
import { davranisTanimla } from "../davranis";

const YONLER: Record<string, [number, number]> = { sol: [-1, 0], sag: [1, 0], yukari: [0, -1], asagi: [0, 1] };

davranisTanimla({
  tur: "sabit_kay",
  ad: "Sabit hızla kay",
  aciklama: "Nesne seçilen yöne, saniyede verilen piksel kadar sürekli kayar.",
  ayarlar: [
    { ad: "hiz", etiket: "Hız", tur: "sayi", varsayilan: 200, adim: 10 },
    { ad: "yon", etiket: "Yön", tur: "secim", varsayilan: "sol", secenekler: [
      { deger: "sol", ad: "← Sola" }, { deger: "sag", ad: "→ Sağa" }, { deger: "yukari", ad: "↑ Yukarı" }, { deger: "asagi", ad: "↓ Aşağı" }] },
  ],
  kare(n, a, _dunya, dt) {
    const [dx, dy] = YONLER[String(a.yon)] ?? YONLER.sol;
    n.x += dx * Number(a.hiz) * dt;
    n.y += dy * Number(a.hiz) * dt;
  },
});
