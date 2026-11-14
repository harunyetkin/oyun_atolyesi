// "Tuşla zıpla / uç": seçilen tuşa (ya da fareye) basılınca nesneye yukarı doğru hız verir.
// Kanat Çırp'taki kuş ve Yankı'daki yarasa böyle uçar. Fizik bileşeniyle birlikte kullanılır.
import { davranisTanimla } from "../davranis";

davranisTanimla({
  tur: "tusla_zipla",
  ad: "Tuşla zıpla / uç",
  aciklama: "Seçilen tuşa basılınca nesne yukarı sıçrar. Yerçekimi için Fizik bileşeni ekle.",
  ayarlar: [
    { ad: "tus", etiket: "Tuş", tur: "tus", varsayilan: "Boşluk" },
    { ad: "guc", etiket: "Güç", tur: "sayi", varsayilan: 450, adim: 10, min: 0 },
  ],
  tusBasildi(n, a, _dunya, tus) {
    if (tus === a.tus) n.vy = -Number(a.guc);
  },
});
