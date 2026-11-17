// Oyun içeriği formlarının tanımı: hangi alan, hangi başlık altında, hangi birimle, nasıl bir girişle.
// Kaynak: hikaye_oyun/icerik/BICIM.md. Oyuna yeni bir ayar eklenince buraya bir satır eklemek yeter;
// eklenmemiş olsa bile grubun "digerleri" ayarı sayesinde bilinmeyen alanlar yine düzenlenebilir görünür.

export type Alan =
  | { tur: "sayi"; ad: string; birim?: string; adim?: number; min?: number; max?: number; aciklama?: string; varsayilan?: number }
  | { tur: "anahtar"; ad: string; aciklama?: string; acik?: string; kapali?: string; mantik?: boolean }   // 1 / 0 (mantik: true/false)
  | { tur: "yazi"; ad: string; aciklama?: string; ipucu?: string; cokSatir?: boolean }
  | { tur: "unreal"; ad: string; aciklama?: string; ipucu?: string }                      // /Game/... yolu
  | { tur: "renk"; ad: string; aciklama?: string }
  | { tur: "vektor"; ad: string; birim?: string; eksenler?: [string, string, string]; aciklama?: string };

export interface Grup {
  baslik: string;
  aciklama?: string;
  /** [kök nesneye göre noktalı yol, alan tanımı] — ekrandaki sıra budur. */
  alanlar: [string, Alan][];
  /** Bu yoldaki sözlüğün tanımda olmayan alanlarını da göster (oyuna sonradan eklenenler için). */
  digerleri?: { yol: string; tur: "sayi" | "unreal" | "yazi" };
  acikBaslar?: boolean;
}

const sayi = (ad: string, birim?: string, ek: Partial<Extract<Alan, { tur: "sayi" }>> = {}): Alan => ({ tur: "sayi", ad, birim, ...ek });
const oran = (ad: string, aciklama?: string): Alan => ({ tur: "sayi", ad, min: 0, max: 1, adim: 0.01, aciklama });

// ------------------------------------------------------------------ karakterler.json → oyuncu
export const OYUNCU_GRUPLARI: Grup[] = [
  { baslik: "Beden ve animasyon", acikBaslar: true,
    aciklama: "Oyuncunun bedeni olan MetaHuman ve hareket animasyonları. Yollar Unreal içerik yollarıdır (/Game/...).",
    alanlar: [
      ["unreal_govde", { tur: "unreal", ad: "Beden (MetaHuman)", ipucu: "/Game/MetaHumans/Ad/BP_Ad", aciklama: "Boşsa ya da bulunamazsa yerine geçici silindir görünür." }],
      ["unreal_anim_sinifi", { tur: "unreal", ad: "Animasyon Blueprint'i", ipucu: "/Game/Animasyonlar/ABP_Oyuncu", aciklama: "Boşsa basit kip: yalnız aşağıdaki hareket karışımı." }],
      ["unreal_hareket", { tur: "unreal", ad: "Hareket karışımı", ipucu: "/Game/Animasyonlar/BS_Yuruyus", aciklama: "Duran-yürüyen-koşan Blend Space; yatay ekseni hız." }],
      ["unreal_hiz_carpani", sayi("Hız çarpanı", "×", { adim: 0.05, min: 0, aciklama: "Hız bu sayıyla çarpılıp karışıma verilir." })],
    ] },
  { baslik: "Kontrol biçimi", acikBaslar: true,
    aciklama: "W/A/S/D'nin nasıl çalıştığı. Kameraya göre: karakter, kameranın baktığı yöne göre yürür ve gittiği yöne döner.",
    alanlar: [
      ["hareket.kamera_gore_kontrol", { tur: "anahtar", ad: "Kameraya göre yürü", acik: "Kameraya göre (yeni)", kapali: "A/D döndürür (eski)" }],
      ["hareket.serbest_donus_hizi", sayi("Dönüş hızı", "°/sn", { min: 0, aciklama: "Kameraya göre yürürken karakterin en hızlı dönüşü." })],
      ["hareket.serbest_donus_cevikligi", sayi("Dönüş çevikliği", "×", { min: 0, adim: 0.5, aciklama: "Açı farkı × bu = dönüş hızı (büyük = daha çabuk döner)." })],
      ["hareket.serbest_donus_ivmesi", sayi("Dönüş ivmesi", "°/sn²", { min: 0, adim: 50 })],
    ] },
  { baslik: "Hareket",
    alanlar: [
      ["hareket.yurume_hizi", sayi("Yürüme hızı", "cm/sn", { min: 0 })],
      ["hareket.kosma_hizi", sayi("Koşma hızı", "cm/sn", { min: 0 })],
      ["hareket.yavas_yurume_hizi", sayi("Yavaş yürüme", "cm/sn", { min: 0 })],
      ["hareket.geri_orani", oran("Geri yürüme oranı", "Geri giderken hız bu oranla çarpılır.")],
      ["hareket.hizlanma", sayi("Hızlanma", "cm/sn²", { min: 0, adim: 10 })],
      ["hareket.yavaslama", sayi("Yavaşlama", "cm/sn²", { min: 0, adim: 10 })],
      ["hareket.donus_hizi", sayi("A/D dönüş hızı", "°/sn", { min: 0, aciklama: "Eski kontrol biçiminde A/D ile en hızlı dönüş." })],
      ["hareket.donus_ivmesi", sayi("A/D dönüş ivmesi", "°/sn²", { min: 0, adim: 10 })],
      ["hareket.comelme_hizi", sayi("Çömelme hızı", "cm/sn", { min: 0 })],
      ["hareket.gard_hizi", sayi("Gardda hız", "cm/sn", { min: 0 })],
      ["hareket.saldiri_hizi", sayi("Saldırırken hız", "cm/sn", { min: 0 })],
      ["hareket.ziplama_hizi", sayi("Zıplama hızı", "cm/sn", { min: 0 })],
      ["hareket.havada_kontrol", oran("Havada kontrol", "0 = havada yön değiştirilemez, 1 = yerdeki gibi.")],
    ],
    digerleri: { yol: "hareket", tur: "sayi" } },
  { baslik: "Kaçınma (yana/geri sıçrama)",
    alanlar: [
      ["hareket.kacinma_mesafesi_ileri", sayi("İleri mesafe", "cm", { min: 0 })],
      ["hareket.kacinma_mesafesi_geri", sayi("Geri mesafe", "cm", { min: 0 })],
      ["hareket.kacinma_mesafesi_yan", sayi("Yana mesafe", "cm", { min: 0 })],
      ["hareket.kacinma_suresi_ileri", sayi("İleri süre", "sn", { min: 0, adim: 0.05 })],
      ["hareket.kacinma_suresi_geri", sayi("Geri süre", "sn", { min: 0, adim: 0.05 })],
      ["hareket.kacinma_suresi_yan", sayi("Yana süre", "sn", { min: 0, adim: 0.05 })],
    ] },
  { baslik: "Kamera",
    alanlar: [
      ["kamera.fare_hassasiyeti", sayi("Fare hassasiyeti", "° / birim", { min: 0, adim: 0.01 })],
      ["kamera.bakis_siniri", sayi("Yukarı/aşağı bakış sınırı", "°", { min: 0, max: 90 })],
      ["kamera.gorus_acisi", sayi("Görüş açısı", "°", { min: 30, max: 120 })],
      ["kamera.bas_sallantisi", sayi("Baş sallantısı", "×", { min: 0, adim: 0.1, aciklama: "Birinci kişide yürürken kameranın sallanması." })],
      ["kamera.ucuncu_kisi_mesafe", sayi("Üçüncü kişi uzaklığı", "cm", { min: 0, adim: 10 })],
      ["kamera.en_yakin", sayi("En yakın", "cm", { min: 0, adim: 10 })],
      ["kamera.en_uzak", sayi("En uzak", "cm", { min: 0, adim: 10 })],
      ["kamera.yukseklik", sayi("Yükseklik", "cm")],
      ["kamera.takip_yumusakligi", sayi("Takip sıkılığı", "×", { min: 0, aciklama: "Büyük = kamera karaktere sıkı yapışır." })],
      ["kamera.donus_yumusakligi", sayi("Dönüş yumuşaklığı", "×", { min: 0 })],
      ["kamera.tus_ile_donus_hizi", sayi("Q/E ile dönüş", "°/sn", { min: 0 })],
      ["kamera.otomatik_takip", { tur: "anahtar", ad: "Otomatik arkaya geçme", aciklama: "Fare durunca kamera yavaşça karakterin arkasına döner." }],
      ["kamera.otomatik_takip_gecikmesi", sayi("…başlama gecikmesi", "sn", { min: 0, adim: 0.1 })],
      ["kamera.otomatik_takip_hizi", sayi("…hızı", "×", { min: 0, adim: 0.1 })],
    ],
    digerleri: { yol: "kamera", tur: "sayi" } },
  { baslik: "Animasyon geçişi",
    alanlar: [
      ["animasyon.gecis_hizi", sayi("Geçiş hızı", "×", { min: 0, aciklama: "Hareketler arası geçiş (büyük = hızlı)." })],
      ["animasyon.donerken_adim", sayi("Yerinde dönerken adım", "", { min: 0, adim: 0.05 })],
    ],
    digerleri: { yol: "animasyon", tur: "sayi" } },
  { baslik: "Dövüş",
    alanlar: [
      ["dovus.guclu_yumruk_basili_sure", sayi("Güçlü yumruk için basılı tutma", "sn", { min: 0, adim: 0.05 })],
      ["dovus.kombo_acilisi", oran("Kombo açılışı", "Vuruşun hangi noktasından sonra sıradaki başlayabilir (0–1).")],
      ["dovus.vurus_ani", oran("Yumruğun değdiği an", "Animasyonun hangi noktasında yumruk hedefe değer (0–1).")],
      ["dovus.guclu_vurus_ani", oran("Güçlü yumruğun değdiği an")],
    ],
    digerleri: { yol: "dovus", tur: "sayi" } },
  { baslik: "Doğallık (beden dili)",
    alanlar: [
      ["dogallik.bas_onculugu", sayi("Baş öncülüğü", "sn", { min: 0, adim: 0.05, aciklama: "Dönerken baş önden bakar." })],
      ["dogallik.en_fazla_burulma", sayi("En fazla burulma", "°", { min: 0 })],
      ["dogallik.bel_payi", oran("Bel payı", "Bel + göğüs + baş payları toplamı 1 olmalı.")],
      ["dogallik.gogus_payi", oran("Göğüs payı")],
      ["dogallik.bas_payi", oran("Baş payı")],
      ["dogallik.yana_yatma", sayi("Dönüşte yana yatma", "×", { min: 0, adim: 0.01 })],
      ["dogallik.en_fazla_yatma", sayi("En fazla yatma", "°", { min: 0 })],
      ["dogallik.kacinma_yatma", sayi("Kaçınırken yatma", "°", { min: 0 })],
      ["dogallik.ivme_egilmesi", sayi("Hızlanırken eğilme", "×", { min: 0, adim: 0.001 })],
      ["dogallik.uzanma_egilmesi", sayi("Uzanırken belden eğilme", "° / cm", { min: 0, adim: 0.05 })],
      ["dogallik.uzanma_egilme_isareti", sayi("Eğilme yönü", "1 / -1", { min: -1, max: 1, adim: 2, aciklama: "Eğilme ters yöne oluyorsa -1 yap." })],
    ],
    digerleri: { yol: "dogallik", tur: "sayi" } },
  { baslik: "Etkileşim anları",
    aciklama: "Animasyonun hangi noktasında (0 = başı, 1 = sonu) elin eşyayı tuttuğu, bıraktığı ya da kapının hareket ettiği.",
    alanlar: [
      ["etkilesim.tutma_ani", oran("Eşyayı tutma")],
      ["etkilesim.cantaya_birakma_ani", oran("Çantaya bırakma")],
      ["etkilesim.kapi_itme_ani", oran("Kapıyı itme")],
      ["etkilesim.kapi_kapama_ani", oran("Kapıyı kapama")],
    ],
    digerleri: { yol: "etkilesim", tur: "sayi" } },
  { baslik: "Çanta",
    alanlar: [
      ["canta.goster", { tur: "anahtar", ad: "Çantayı göster" }],
      ["canta.konum", { tur: "vektor", ad: "Konum", birim: "cm", eksenler: ["İleri", "Sağ", "Yukarı"], aciklama: "Kapsül merkezine göre." }],
      ["canta.boyut", { tur: "vektor", ad: "Boyut", birim: "cm" }],
      ["canta.renk", { tur: "renk", ad: "Renk" }],
    ] },
  { baslik: "Animasyonlar",
    aciklama: "Her hareketin Unreal animasyon yolu. Boş bırakılan atlanır.",
    alanlar: ([
      ["ziplama", "Zıplama"], ["havada", "Havada"], ["inis", "İniş"],
      ["yumruk_1", "Yumruk 1"], ["yumruk_2", "Yumruk 2"], ["yumruk_3", "Yumruk 3"], ["guclu_yumruk", "Güçlü yumruk"], ["gard", "Gard"],
      ["kacinma_ileri", "Kaçınma: ileri"], ["kacinma_geri", "Kaçınma: geri"], ["kacinma_sol", "Kaçınma: sol"], ["kacinma_sag", "Kaçınma: sağ"],
      ["donus_sol", "Yerinde dönüş: sol"], ["donus_sag", "Yerinde dönüş: sağ"],
      ["esya_alma", "Eşya alma"], ["cantaya_koyma", "Çantaya koyma"], ["kapi_acma", "Kapı açma"], ["kapi_kapama", "Kapı kapama"],
      ["konusma", "Konuşma (kişiler)"], ["konusma_jest", "Cevap verirken jest"],
      ["oturma", "Bankta oturma (döngü)"], ["itme", "İtme (G)"], ["darbe_alma", "Darbe alma (vurulunca)"],
      ["yere_dusme", "Yere düşme"], ["yerden_kalkma", "Yerden kalkma"],
    ] as [string, string][]).map(([k, ad]): [string, Alan] => ["animasyonlar." + k, { tur: "unreal", ad, ipucu: "/Game/Animasyonlar/..." }]),
    digerleri: { yol: "animasyonlar", tur: "unreal" } },
  { baslik: "Animasyon yuvaları",
    alanlar: [
      ["animasyon_yuvalari.tam_govde", { tur: "yazi", ad: "Tam gövde", ipucu: "DefaultSlot" }],
      ["animasyon_yuvalari.ust_govde", { tur: "yazi", ad: "Üst gövde", ipucu: "UstGovde" }],
    ] },
];

// ------------------------------------------------------------------ haritalar/*.json
export const HARITA_GRUPLARI: Grup[] = [
  { baslik: "Genel", acikBaslar: true,
    alanlar: [
      ["ad", { tur: "yazi", ad: "Görünen ad" }],
      ["tema", { tur: "yazi", ad: "Tema" }],
      ["not", { tur: "yazi", ad: "Not", cokSatir: true, aciklama: "Oyun okumaz; açıklama içindir." }],
    ] },
  { baslik: "Unreal: dekor, zemin ve yol yüzeyi", acikBaslar: true,
    aciklama: "Unreal'de bütün dekor modellerine eklenen dönüş düzeltmesi ve zemin/yol malzemelerinin klasörleri. Klasörde malzeme yoksa düz renk kalır.",
    alanlar: [
      ["unreal_model_aci", sayi("Model açı düzeltmesi", "°", { aciklama: "Modeller yanlış yöne bakıyorsa (ör. 90 ya da -90)." })],
      ["ortam.unreal_zemin_klasoru", { tur: "unreal", ad: "Zemin klasörü", ipucu: "/Game/Dekor/Zemin (varsayılan)" }],
      ["ortam.unreal_zemin_karo", sayi("Zemin karo boyu", "m", { min: 0, adim: 0.5, aciklama: "Malzemenin bir kez tekrarladığı boy (varsayılan 4)." })],
      ["yol.unreal_klasor", { tur: "unreal", ad: "Yol klasörü", ipucu: "/Game/Dekor/Yol (varsayılan)" }],
      ["yol.unreal_karo", sayi("Yol karo boyu", "m", { min: 0, adim: 0.5, aciklama: "Varsayılan: yol genişliğinin yarısı." })],
    ] },
  { baslik: "Yol",
    alanlar: [
      ["yol.uzunluk", sayi("Uzunluk", "m", { min: 10 })],
      ["yol.genislik", sayi("Genişlik", "m", { min: 1, adim: 0.5 })],
      ["yol.renk", { tur: "renk", ad: "Renk" }],
      ["yol.kenar_rengi", { tur: "renk", ad: "Kenar rengi" }],
      ["yol.serit", { tur: "anahtar", ad: "Orta şerit", mantik: true }],
    ] },
  { baslik: "Işık ve gökyüzü",
    alanlar: [
      ["ortam.gokyuzu_ust", { tur: "renk", ad: "Gökyüzü (üst)" }],
      ["ortam.ufuk", { tur: "renk", ad: "Ufuk" }],
      ["ortam.zemin_rengi", { tur: "renk", ad: "Zemin rengi" }],
      ["ortam.gunes_gucu", sayi("Güneş gücü", "×", { min: 0, adim: 0.1 })],
      ["ortam.ortam_isigi", sayi("Ortam ışığı", "×", { min: 0, adim: 0.05 })],
      ["ortam.sis", sayi("Sis yoğunluğu", "", { min: 0, adim: 0.001, aciklama: "0 = sis yok." })],
      ["ortam.doygunluk", sayi("Renk doygunluğu", "×", { min: 0, adim: 0.05 })],
      ["ortam.yuksek_kalite", { tur: "anahtar", ad: "Yüksek kalite", mantik: true, aciklama: "Güçlü ekran kartında gerçekçi dolaylı ışık, yansıma, hacimli sis." }],
      ["ortam.gunes_hareketi", sayi("Güneşin alçalma hızı", "°/dk", { min: 0, adim: 0.1, aciklama: "Oyun sürerken güneş yavaşça alçalır (0 = sabit)." })],
      ["ortam.gunes_en_alcak", sayi("Güneşin en alçak yeri", "°", { aciklama: "Güneş bu eğimin altına inmez." })],
    ] },
  { baslik: "Sesler",
    aciklama: "Ortam sesleri: Unreal'de bir ses klasörü (içindeki seslerden biri rastgele çalar) ya da tek bir sesin yolu.",
    alanlar: [
      ["sesler.adim_cim", { tur: "unreal", ad: "Adım: çimde", ipucu: "/Game/Sesler/Adim_Cim" }],
      ["sesler.adim_yol", { tur: "unreal", ad: "Adım: yolda", ipucu: "/Game/Sesler/Adim_Yol" }],
      ["sesler.ruzgar", { tur: "unreal", ad: "Rüzgâr", ipucu: "/Game/Sesler/Ruzgar" }],
      ["sesler.kuslar", { tur: "unreal", ad: "Kuşlar", ipucu: "/Game/Sesler/Kuslar" }],
      ["sesler.darbe", { tur: "unreal", ad: "Darbe (vuruş)", ipucu: "/Game/Sesler/Darbe" }],
      ["sesler.ruzgar_siddeti", oran("Rüzgâr sesi şiddeti")],
      ["sesler.kus_siddeti", oran("Kuş sesi şiddeti")],
    ],
    digerleri: { yol: "sesler", tur: "unreal" } },
  { baslik: "Başlangıç ve bitiş",
    alanlar: [
      ["baslangic.konum", { tur: "vektor", ad: "Başlangıç noktası", birim: "m" }],
      ["baslangic.aci", sayi("Başlangıç yönü", "°")],
      ["bitis.z", sayi("Bitiş kemeri (z)", "m")],
      ["bitis.metin", { tur: "yazi", ad: "Bitiş yazısı" }],
    ] },
];

/** Bir grup listesinde tanımlı bütün yollar (digerleri hesabı için). */
export const tanimliYollar = (gruplar: Grup[]) => new Set(gruplar.flatMap(g => g.alanlar.map(([y]) => y)));
