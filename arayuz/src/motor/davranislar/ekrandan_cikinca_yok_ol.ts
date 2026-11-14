// "Ekrandan çıkınca yok ol": nesne sahne alanının tamamen dışına çıkınca silinir.
// Sahnenin dışında doğan nesneler (ör. sağ kenarın ötesinde oluşan borular) hemen silinmez:
// önce bir kez sahneye girmeleri gerekir. Yine de çok uzaklaşırlarsa silinirler.
import { davranisTanimla } from "../davranis";
import { nesneBoyutu } from "../carpisma";

davranisTanimla({
  tur: "ekrandan_cikinca_yok_ol",
  ad: "Ekrandan çıkınca yok ol",
  aciklama: "Nesne sahne alanının tamamen dışına çıkınca oyundan silinir.",
  ayarlar: [
    { ad: "pay", etiket: "Kenar payı", tur: "sayi", varsayilan: 0, adim: 10, min: 0 },
  ],
  kare(n, a, dunya) {
    const { w, h } = nesneBoyutu(n), s = dunya.sahne, p = Number(a.pay) || 0;
    const icinde = n.x + w / 2 > -p && n.x - w / 2 < s.genislik + p && n.y + h / 2 > -p && n.y - h / 2 < s.yukseklik + p;
    if (icinde) { n.durum.gorundu = true; return; }
    const cokUzak = n.x < -s.genislik || n.x > s.genislik * 2 || n.y < -s.yukseklik || n.y > s.yukseklik * 2;
    if (n.durum.gorundu || cokUzak) n.yokOlacak = true;
  },
});
