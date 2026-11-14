// Hazır oyun şablonları ve özellik panellerinin tanımı (hangi ayar, hangi kontrol).
(function (global) {
  "use strict";

  let _sayac = 0;
  const yeniId = () => "n" + Date.now().toString(36) + (_sayac++).toString(36);

  // ---- yeni nesne hazır ayarları
  const NESNE_HAZIR = {
    engel: () => ({
      id: yeniId(), ad: "Sarkıt", aktif: true, sekil: "ucgen", renk: "#7a6488", boyut: 22,
      siklik: 1.2, konum: "tavan", hareket: "sabit", genlik: 30, hiz: 120, parlar: false,
      etki: { tip: "olum", guc: 0, sure: 0, tek_kullanim: true }
    }),
    tehlike: () => ({
      id: yeniId(), ad: "Örümcek ağı", aktif: true, sekil: "daire", renk: "#d8d8e4", boyut: 24,
      siklik: 0.6, konum: "orta", hareket: "sabit", genlik: 30, hiz: 120, parlar: false,
      etki: { tip: "yavaslat", guc: 45, sure: 2.2, tek_kullanim: true }
    }),
    toplanabilir: () => ({
      id: yeniId(), ad: "Ateş böceği", aktif: true, sekil: "yildiz", renk: "#d2ff78", boyut: 9,
      siklik: 0.8, konum: "orta", hareket: "dalga", genlik: 14, hiz: 120, parlar: true,
      etki: { tip: "puan", guc: 10, sure: 0, tek_kullanim: true }
    })
  };

  // ---- şablonlar
  const SABLONLAR = {
    "Karanlık Mağara": () => ({
      ad: "Karanlık Mağara", surum: 1,
      dunya: {
        hiz: 215, hiz_artisi: 30, arka_renk: "#241e34", duvar_renk: "#604c6c",
        magara: true, bosluk: 320, kivrim: 0.55, daralma: 8, duvar_olumcul: true,
        karanlik: true, isik_yaricapi: 70, kanat_isigi: true, dalga_yaricapi: 290
      },
      oyuncu: { sekil: "yarasa", renk: "#4a3a62", boyut: 14, yercekimi: 1580, kanat_gucu: 430, max_dusus: 800 },
      nesneler: [
        Object.assign(NESNE_HAZIR.engel(), { ad: "Sarkıt" }),
        Object.assign(NESNE_HAZIR.engel(), { ad: "Dikit", konum: "taban", siklik: 0.9 }),
        NESNE_HAZIR.tehlike(),
        Object.assign(NESNE_HAZIR.tehlike(), {
          ad: "Su damlası", sekil: "elmas", renk: "#8cc8ff", boyut: 8, konum: "tavan", hareket: "dusen",
          siklik: 0.5, etki: { tip: "agirlastir", guc: 30, sure: 4, tek_kullanim: true }
        }),
        NESNE_HAZIR.toplanabilir()
      ]
    }),
    "Kuş Uçuşu": () => ({
      ad: "Kuş Uçuşu", surum: 1,
      dunya: {
        hiz: 200, hiz_artisi: 20, arka_renk: "#78c4d8", duvar_renk: "#5aa83c",
        magara: true, bosluk: 380, kivrim: 0.35, daralma: 4, duvar_olumcul: true,
        karanlik: false, isik_yaricapi: 70, kanat_isigi: false, dalga_yaricapi: 290
      },
      oyuncu: { sekil: "kus", renk: "#f0c030", boyut: 15, yercekimi: 1700, kanat_gucu: 520, max_dusus: 900 },
      nesneler: [
        Object.assign(NESNE_HAZIR.engel(), { ad: "Kaya", sekil: "kare", renk: "#8a8070", konum: "orta", siklik: 1.0, boyut: 26 }),
        Object.assign(NESNE_HAZIR.toplanabilir(), { ad: "Altın", renk: "#ffd23c", parlar: false })
      ]
    }),
    "Boş proje": () => ({
      ad: "Yeni oyun", surum: 1,
      dunya: {
        hiz: 200, hiz_artisi: 0, arka_renk: "#20242c", duvar_renk: "#4a5060",
        magara: false, bosluk: 340, kivrim: 0.3, daralma: 0, duvar_olumcul: true,
        karanlik: false, isik_yaricapi: 70, kanat_isigi: false, dalga_yaricapi: 290
      },
      oyuncu: { sekil: "daire", renk: "#f0a040", boyut: 14, yercekimi: 1500, kanat_gucu: 450, max_dusus: 800 },
      nesneler: []
    })
  };

  // ---- özellik paneli tanımları
  // tur: sayi | renk | secim | onay | metin ; goster: alanın görünme koşulu
  const SEKILLER_NESNE = [["daire", "Daire"], ["kare", "Kare"], ["ucgen", "Üçgen (sivri)"], ["elmas", "Elmas"], ["yildiz", "Yıldız"]];
  const SEKILLER_OYUNCU = [["yarasa", "Yarasa"], ["kus", "Kuş"], ["daire", "Daire"], ["kare", "Kare"], ["elmas", "Elmas"]];

  const ALANLAR = {
    dunya: [
      { baslik: "Hareket" },
      { k: "hiz", e: "Kaydırma hızı", tur: "sayi", min: 60, max: 600, adim: 5 },
      { k: "hiz_artisi", e: "Zamanla hızlanma", tur: "sayi", min: 0, max: 150, adim: 5, a: "Her 100 metrede eklenen hız" },
      { baslik: "Renkler" },
      { k: "arka_renk", e: "Arka plan", tur: "renk" },
      { k: "duvar_renk", e: "Duvarlar", tur: "renk", goster: v => v.magara },
      { baslik: "Mağara" },
      { k: "magara", e: "Tavan ve taban olsun", tur: "onay" },
      { k: "bosluk", e: "Genişlik", tur: "sayi", min: 120, max: 520, adim: 5, goster: v => v.magara },
      { k: "kivrim", e: "Kıvrımlılık", tur: "sayi", min: 0, max: 1, adim: 0.05, goster: v => v.magara },
      { k: "daralma", e: "Zamanla daralma", tur: "sayi", min: 0, max: 40, adim: 1, goster: v => v.magara, a: "Her 1000 pikselde kaç piksel daralır" },
      { k: "duvar_olumcul", e: "Duvara çarpınca ölür", tur: "onay", goster: v => v.magara },
      { baslik: "Karanlık" },
      { k: "karanlik", e: "Ekran karanlık olsun", tur: "onay" },
      { k: "isik_yaricapi", e: "Oyuncunun ışığı", tur: "sayi", min: 20, max: 400, adim: 5, goster: v => v.karanlik },
      { k: "kanat_isigi", e: "Kanat çırpınca ışık dalgası", tur: "onay", goster: v => v.karanlik },
      { k: "dalga_yaricapi", e: "Dalga genişliği", tur: "sayi", min: 80, max: 700, adim: 10, goster: v => v.karanlik && v.kanat_isigi }
    ],
    oyuncu: [
      { baslik: "Görünüm" },
      { k: "sekil", e: "Şekil", tur: "secim", secenekler: SEKILLER_OYUNCU },
      { k: "renk", e: "Renk", tur: "renk" },
      { k: "boyut", e: "Boyut", tur: "sayi", min: 6, max: 40, adim: 1 },
      { baslik: "Fizik" },
      { k: "yercekimi", e: "Yerçekimi", tur: "sayi", min: 300, max: 3500, adim: 10, a: "Büyüdükçe daha hızlı düşer" },
      { k: "kanat_gucu", e: "Kanat gücü", tur: "sayi", min: 150, max: 1000, adim: 10, a: "Her basışta ne kadar yükselir" },
      { k: "max_dusus", e: "En yüksek düşüş hızı", tur: "sayi", min: 200, max: 1600, adim: 10 }
    ],
    nesne: [
      { k: "ad", e: "Ad", tur: "metin" },
      { k: "aktif", e: "Oyunda görünsün", tur: "onay" },
      { baslik: "Görünüm" },
      { k: "sekil", e: "Şekil", tur: "secim", secenekler: SEKILLER_NESNE },
      { k: "renk", e: "Renk", tur: "renk" },
      { k: "boyut", e: "Boyut", tur: "sayi", min: 4, max: 70, adim: 1 },
      { k: "parlar", e: "Karanlıkta parlasın", tur: "onay" },
      { baslik: "Yerleşim ve hareket" },
      { k: "siklik", e: "Sıklık", tur: "sayi", min: 0, max: 8, adim: 0.1, a: "Her 1000 pikselde ortalama kaç tane" },
      { k: "konum", e: "Nerede çıksın", tur: "secim", secenekler: [["tavan", "Tavanda"], ["taban", "Tabanda"], ["orta", "Arada, rastgele"]] },
      { k: "hareket", e: "Hareket", tur: "secim", secenekler: [["sabit", "Sabit"], ["dalga", "Aşağı yukarı süzülür"], ["dusen", "Yaklaşınca düşer"], ["ucan", "Oyuncuya doğru uçar"]] },
      { k: "genlik", e: "Süzülme mesafesi", tur: "sayi", min: 0, max: 150, adim: 1, goster: v => v.hareket === "dalga" },
      { k: "hiz", e: "Uçuş hızı", tur: "sayi", min: 0, max: 500, adim: 5, goster: v => v.hareket === "ucan" },
      { baslik: "Dokununca ne olsun" },
      { k: "etki.tip", e: "Etki", tur: "secim", secenekler: [
        ["olum", "Oyun biter"], ["yavaslat", "Yavaşlatır"], ["agirlastir", "Ağırlaştırır (hızlı düşer)"],
        ["kanat_zayiflat", "Kanadı zayıflatır"], ["sersem", "Sersemletir (savrulur)"], ["puan", "Puan verir"], ["kalkan", "Kalkan verir"]] },
      { k: "etki.guc", e: "Etki gücü (%)", tur: "sayi", min: 0, max: 90, adim: 1,
        goster: v => ["yavaslat", "agirlastir", "kanat_zayiflat", "sersem"].includes(v.etki.tip) },
      { k: "etki.guc", e: "Puan miktarı", tur: "sayi", min: 1, max: 100, adim: 1, goster: v => v.etki.tip === "puan" },
      { k: "etki.sure", e: "Süre (sn)", tur: "sayi", min: 0.5, max: 10, adim: 0.1,
        goster: v => !["olum", "puan"].includes(v.etki.tip) },
      { k: "etki.tek_kullanim", e: "Dokununca kaybolsun", tur: "onay", goster: v => v.etki.tip !== "olum" }
    ]
  };

  global.Sablonlar = { SABLONLAR, NESNE_HAZIR, ALANLAR, yeniId };
})(typeof window !== "undefined" ? window : globalThis);
