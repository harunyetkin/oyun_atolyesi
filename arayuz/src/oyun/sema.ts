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
  { baslik: "Can ve dayanıklılık",
    aciklama: "Koşma, kaçınma, vuruş ve zıplama dayanıklılık harcar; darbe can azaltır. Can biterse ölüm yok: oyuncu bayılır ve kalkar.",
    alanlar: [
      ["nitelikler.can", sayi("Can", "", { min: 1 })],
      ["nitelikler.dayaniklilik", sayi("Dayanıklılık", "", { min: 1 })],
      ["nitelikler.can_yenilenme", sayi("Can yenilenmesi", "/sn", { min: 0, adim: 0.5 })],
      ["nitelikler.can_yenilenme_gecikmesi", sayi("…darbeden sonra başlama", "sn", { min: 0, adim: 0.5 })],
      ["nitelikler.dayaniklilik_yenilenme", sayi("Dayanıklılık yenilenmesi", "/sn", { min: 0 })],
      ["nitelikler.dayaniklilik_gecikmesi", sayi("…harcamadan sonra başlama", "sn", { min: 0, adim: 0.1 })],
      ["nitelikler.tukenme_esigi", oran("Tükenme eşiği", "Dayanıklılık bitince bu orana dolmadan koşulamaz.")],
      ["nitelikler.kosu_tuketimi", sayi("Koşu tüketimi", "/sn", { min: 0 })],
      ["nitelikler.kacinma_bedeli", sayi("Kaçınma bedeli", "", { min: 0 })],
      ["nitelikler.yumruk_bedeli", sayi("Yumruk bedeli", "", { min: 0 })],
      ["nitelikler.guclu_vurus_bedeli", sayi("Güçlü vuruş bedeli", "", { min: 0 })],
      ["nitelikler.tekme_bedeli", sayi("Tekme bedeli", "", { min: 0 })],
      ["nitelikler.ziplama_bedeli", sayi("Zıplama bedeli", "", { min: 0 })],
      ["nitelikler.engel_bedeli", sayi("Engel aşma bedeli", "", { min: 0 })],
      ["nitelikler.hafif_darbe", sayi("Hafif darbede can kaybı", "", { min: 0 })],
      ["nitelikler.guclu_darbe", sayi("Güçlü darbede can kaybı", "", { min: 0 })],
      ["nitelikler.blok_hasar_carpani", oran("Gardda can kaybı oranı")],
      ["nitelikler.blok_dayaniklilik", sayi("Gardda karşılanan darbe bedeli", "", { min: 0, aciklama: "Güçlü darbede iki katı; yetmezse gard kırılır." })],
      ["nitelikler.bayilma_suresi", sayi("Bayılma süresi", "sn", { min: 0, adim: 0.5 })],
      ["nitelikler.kalkis_can_orani", oran("Kalkınca can oranı")],
    ],
    digerleri: { yol: "nitelikler", tur: "sayi" } },
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
  { baslik: "Unreal seviyesi", acikBaslar: true,
    aciklama: "Haritanın zemini, yolları ve sınırları Unreal'de elle kurulmuş bir seviyedeyse: oyun kendi düz zeminini, yol şeridini, yan duvarları ve bitiş kemerini koymaz; oyuncu ve kişiler araziye yukarıdan indirilir.",
    alanlar: [
      ["seviye_zemini", { tur: "anahtar", ad: "Zemin Unreal seviyesinde", acik: "Evet (seviyenin kendi zemini)", kapali: "Hayır (oyun düz zemin kurar)" }],
      ["unreal_seviye", { tur: "unreal", ad: "Unreal seviyesi", ipucu: "/Game/Haritalar/Koy", aciklama: "Bilgi: oyun şimdilik varsayılan haritayı açar." }],
    ] },
  { baslik: "Gün ve gece",
    aciklama: "Gün-gece döngüsü (Unreal). Saat kayıtla saklanır ve ekranda pusulanın sağında görünür.",
    alanlar: [
      ["ortam.zaman.baslangic_saati", sayi("Başlangıç saati", "saat", { min: 0, max: 24, adim: 0.5 })],
      ["ortam.zaman.gun_suresi_dakika", sayi("Bir günün süresi", "gerçek dk", { min: 1, aciklama: "Kaç gerçek dakikada bir oyun günü (24 saat) geçer." })],
      ["ortam.zaman.en_yuksek_gunes", sayi("Öğlen güneş yüksekliği", "°", { min: 0, max: 90 })],
      ["ortam.zaman.ogle_yonu", sayi("Öğlen güneşin yönü", "°")],
      ["ortam.zaman.gece_gucu", oran("Ay ışığı", "Gece ışığı, güneşin bu oranı kadar.")],
      ["ortam.zaman.gece_pozlama", sayi("Gece pozlaması", "", { adim: 0.05, aciklama: "Eksi = gece daha karanlık." })],
      ["ortam.zaman.gece_gok_isigi", oran("Gece gök ışığı", "Gece de etrafın görünmesi için gökten gelen ışık.")],
    ],
    digerleri: { yol: "ortam.zaman", tur: "sayi" } },
  { baslik: "Pozlama ve ışık gölgeleri",
    alanlar: [
      ["ortam.pozlama.golge_kontrasti", sayi("Gölge kontrastı", "", { min: 0.1, max: 1, adim: 0.05, aciklama: "Düşük = gölgeler daha aydınlık (varsayılan 0.6)." })],
      ["ortam.pozlama.parlak_kontrasti", sayi("Parlak kontrastı", "", { min: 0.1, max: 1, adim: 0.05, aciklama: "Düşük = parlak gökyüzü daha az patlar (varsayılan 0.7)." })],
      ["ortam.yerel_isik_golgesi", { tur: "anahtar", ad: "Lamba ışıklarının gölgesi", mantik: true, aciklama: "Lamba direkleri ve iç mekân ışıkları gölge yapsın mı? Çok sayıda gölgeli ışık ekran kartını zorlayabilir (varsayılan kapalı)." }],
    ],
    digerleri: { yol: "ortam.pozlama", tur: "sayi" } },
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

// ------------------------------------------------------------------ karakterler.json → kisi_nitelikler (bütün kişilerin ortak canı)
export const KISI_NITELIK_GRUBU: Grup = { baslik: "Kişilerin canı (ortak)", acikBaslar: true,
  aciklama: "Bütün kişiler için ortak değerler. Hafif darbe can azaltır (başa 1.25 kat); can biterse kişi yere düşer ve kalkınca belli oranda dolar. Güçlü darbe her zaman düşürür. Haritada bir kişiye özel değer yazılırsa onunki geçerlidir.",
  alanlar: [
    ["can", sayi("Can", "", { min: 1 })],
    ["hafif_darbe", sayi("Hafif darbede kayıp", "", { min: 0 })],
    ["guclu_darbe", sayi("Güçlü darbede kayıp", "", { min: 0 })],
    ["blok_hasar_carpani", oran("Gardda kayıp oranı")],
    ["can_yenilenme", sayi("Can yenilenmesi", "/sn", { min: 0, adim: 0.5 })],
    ["can_yenilenme_gecikmesi", sayi("…darbeden sonra başlama", "sn", { min: 0, adim: 0.5 })],
    ["kalkis_can_orani", oran("Kalkınca can oranı")],
  ],
  digerleri: { yol: "", tur: "sayi" } };

/** Bir grup listesinde tanımlı bütün yollar (digerleri hesabı için). */
export const tanimliYollar = (gruplar: Grup[]) => new Set(gruplar.flatMap(g => g.alanlar.map(([y]) => y)));

// ------------------------------------------------------------------ alan açıklamaları
// Her alanın "ne işe yarar" açıklaması. Formda alanın altında görünür ve ALAN_REHBERI.md bunlardan üretilir.
// Tanımda zaten açıklaması olan alana dokunulmaz. Yeni alan eklerken açıklamasını buraya (ya da tanımın içine) yaz.
const OYUNCU_ACIKLAMA: Record<string, string> = {
  "hareket.kamera_gore_kontrol": "Açık: W kameranın baktığı yöne yürütür, karakter gittiği yöne döner. Kapalı: eski kip, A/D karakteri döndürür.",
  "hareket.serbest_donus_ivmesi": "Dönüşe ne kadar çabuk girip çıktığı. Küçük = dönüş yumuşak başlar ve biter.",
  "hareket.yurume_hizi": "Normal yürüyüş hızı (100 cm/sn ≈ yavaş adım, 150 ≈ olağan yürüyüş).",
  "hareket.kosma_hizi": "Shift basılıyken koşu hızı. Dayanıklılık harcar.",
  "hareket.yavas_yurume_hizi": "Yavaş/sessiz yürüyüş hızı.",
  "hareket.hizlanma": "Durgunken istenen hıza ne kadar çabuk ulaştığı. Büyük = ani kalkış.",
  "hareket.yavaslama": "Tuş bırakılınca ne kadar çabuk durduğu. Büyük = kayma olmadan durur.",
  "hareket.donus_ivmesi": "Eski kipte A/D dönüşünün hızlanıp yavaşlaması.",
  "hareket.comelme_hizi": "Çömelmişken yürüme hızı.",
  "hareket.gard_hizi": "Gard (savunma) alınmışken yürüme hızı.",
  "hareket.saldiri_hizi": "Vuruş yaparken karakterin yerinden kayma hızı (0 = vururken durur).",
  "hareket.ziplama_hizi": "Zıplarken yukarı doğru ilk hız; büyük = daha yüksek zıplar.",
  "nitelikler.can": "Oyuncunun en yüksek canı. Darbeler bundan düşer; biterse oyuncu bayılır.",
  "nitelikler.dayaniklilik": "En yüksek dayanıklılık (koşu, kaçınma, vuruş, zıplama bundan harcar).",
  "nitelikler.can_yenilenme": "Saniyede geri dolan can.",
  "nitelikler.can_yenilenme_gecikmesi": "Son darbeden kaç saniye sonra can dolmaya başlar.",
  "nitelikler.dayaniklilik_yenilenme": "Saniyede geri dolan dayanıklılık.",
  "nitelikler.dayaniklilik_gecikmesi": "Son harcamadan kaç saniye sonra dayanıklılık dolmaya başlar.",
  "nitelikler.kosu_tuketimi": "Koşarken saniyede harcanan dayanıklılık.",
  "nitelikler.kacinma_bedeli": "Bir kaçınma (sıçrama) hareketinin bedeli. Dayanıklılık yetmezse yapılmaz.",
  "nitelikler.yumruk_bedeli": "Bir yumruğun dayanıklılık bedeli.",
  "nitelikler.guclu_vurus_bedeli": "Güçlü yumruğun dayanıklılık bedeli.",
  "nitelikler.tekme_bedeli": "Bir tekmenin dayanıklılık bedeli.",
  "nitelikler.ziplama_bedeli": "Bir zıplamanın dayanıklılık bedeli.",
  "nitelikler.engel_bedeli": "Bir engelin üstünden aşmanın dayanıklılık bedeli.",
  "nitelikler.hafif_darbe": "Hafif bir vuruş alınca kaybedilen can.",
  "nitelikler.guclu_darbe": "Güçlü bir vuruş alınca kaybedilen can.",
  "nitelikler.blok_hasar_carpani": "Gard alınmışken darbenin canın ne kadarını götürdüğü (0 = hiç, 1 = gardsız gibi).",
  "nitelikler.bayilma_suresi": "Can bitince yerde kalma süresi.",
  "nitelikler.kalkis_can_orani": "Bayılıp kalkınca canın ne kadarı dolu olur (0,5 = yarısı).",
  "hareket.kacinma_mesafesi_ileri": "İleri kaçınmada alınan yol.",
  "hareket.kacinma_mesafesi_geri": "Geri kaçınmada (geri sıçrama) alınan yol.",
  "hareket.kacinma_mesafesi_yan": "Sağa/sola kaçınmada alınan yol.",
  "hareket.kacinma_suresi_ileri": "İleri kaçınmanın sürmesi; kısa = daha ani.",
  "hareket.kacinma_suresi_geri": "Geri kaçınmanın sürmesi.",
  "hareket.kacinma_suresi_yan": "Yana kaçınmanın sürmesi.",
  "kamera.fare_hassasiyeti": "Fare bir birim kayınca kameranın döndüğü açı. Büyük = hızlı bakış.",
  "kamera.bakis_siniri": "Yukarı ve aşağı en fazla ne kadar bakılabildiği.",
  "kamera.gorus_acisi": "Ekranın yatay görüş genişliği. Büyük = geniş açı (balık gözüne yaklaşır), küçük = yakınlaştırılmış.",
  "kamera.ucuncu_kisi_mesafe": "Üçüncü kişi görünümde kameranın karaktere başlangıç uzaklığı.",
  "kamera.en_yakin": "Fare tekerleğiyle yaklaşılabilecek en kısa uzaklık.",
  "kamera.en_uzak": "Fare tekerleğiyle uzaklaşılabilecek en uzun mesafe.",
  "kamera.yukseklik": "Kameranın karakterin ortasına göre yüksekliği (omuz üstü bakış).",
  "kamera.donus_yumusakligi": "Üçüncü kişide kameranın dönüşü ne kadar yumuşak izlediği. Büyük = daha sıkı.",
  "kamera.tus_ile_donus_hizi": "Q/E tuşlarıyla kamerayı döndürme hızı.",
  "kamera.otomatik_takip_gecikmesi": "Fare durduktan kaç saniye sonra kamera arkaya dönmeye başlar.",
  "kamera.otomatik_takip_hizi": "Arkaya dönüşün hızı.",
  "animasyon.donerken_adim": "Karakter yerinde dönerken ayakların ne kadar adım attığı (0 = kaymadan döner).",
  "dovus.guclu_yumruk_basili_sure": "Sol tık bu kadar basılı tutulursa güçlü yumruk atılır; daha kısa basış normal yumruktur.",
  "dovus.guclu_vurus_ani": "Güçlü yumruk animasyonunun hangi noktasında (0–1) hedefe değer.",
  "dogallik.en_fazla_burulma": "Dönerken gövdenin bacaklara göre en fazla burulma açısı.",
  "dogallik.gogus_payi": "Burulmanın göğse düşen payı.",
  "dogallik.bas_payi": "Burulmanın başa düşen payı.",
  "dogallik.yana_yatma": "Koşarken dönüşte gövdenin içe doğru yatması (bisikletçi gibi). 0 = hiç.",
  "dogallik.en_fazla_yatma": "Yana yatmanın üst sınırı.",
  "dogallik.kacinma_yatma": "Yana kaçınırken gövdenin o yöne yatma açısı.",
  "dogallik.ivme_egilmesi": "Hızlanırken öne, yavaşlarken geriye eğilme miktarı.",
  "dogallik.uzanma_egilmesi": "Aşağıdaki bir eşyaya uzanırken her cm alçaklık için belden eğilme açısı.",
  "etkilesim.tutma_ani": "Eşya alma animasyonunda elin eşyayı kavradığı an; eşya bu anda ele geçer.",
  "etkilesim.cantaya_birakma_ani": "Çantaya koyma animasyonunda eşyanın elden kaybolduğu an.",
  "etkilesim.kapi_itme_ani": "Kapı açma animasyonunda kapının dönmeye başladığı an.",
  "etkilesim.kapi_kapama_ani": "Kapı kapama animasyonunda kapının kapanmaya başladığı an.",
  "canta.goster": "Oyuncunun sırtında çanta görünsün mü?",
  "canta.boyut": "Çanta kutusunun eni, boyu, yüksekliği.",
  "canta.renk": "Çantanın rengi.",
  "animasyon_yuvalari.tam_govde": "Bütün bedeni oynatan animasyonların gittiği Animasyon Blueprint yuvasının adı. Blueprint'teki adla aynı olmalı.",
  "animasyon_yuvalari.ust_govde": "Yalnız belden yukarıyı oynatan (yürürken yumruk gibi) yuvanın adı.",
};
const ANIM_ACIKLAMA: Record<string, string> = {
  ziplama: "zıplamaya kalkarken", havada: "havadayken (döngü)", inis: "yere inerken",
  yumruk_1: "kombonun ilk yumruğunda", yumruk_2: "kombonun ikinci yumruğunda", yumruk_3: "kombonun üçüncü yumruğunda",
  guclu_yumruk: "güçlü yumrukta", gard: "gard (savunma) alınmışken",
  kacinma_ileri: "ileri kaçınmada", kacinma_geri: "geri kaçınmada", kacinma_sol: "sola kaçınmada", kacinma_sag: "sağa kaçınmada",
  donus_sol: "yerinde sola dönerken", donus_sag: "yerinde sağa dönerken",
  esya_alma: "yerden eşya alırken", cantaya_koyma: "eşyayı çantaya koyarken", kapi_acma: "kapı açarken", kapi_kapama: "kapı kapatırken",
  konusma: "kişiler konuşurken", konusma_jest: "oyuncu cevap verirken (el-kol hareketi)",
  oturma: "bankta otururken (döngü)", itme: "G ile birini iterken", darbe_alma: "vurulunca",
  yere_dusme: "can bitip yere düşerken", yerden_kalkma: "bayıldıktan sonra kalkarken",
};
for (const [k, ne] of Object.entries(ANIM_ACIKLAMA)) OYUNCU_ACIKLAMA["animasyonlar." + k] = `Bu animasyon ${ne} oynar. Boşsa o an animasyonsuz geçer.`;

const HARITA_ACIKLAMA: Record<string, string> = {
  "ad": "Haritanın oyunda ve kayıt ekranında görünen adı.",
  "tema": "Haritanın havası için kısa not (ör. \"akşamüstü köy\"). Oyun şimdilik yalnız gösterir.",
  "ortam.unreal_zemin_klasoru": "Zemin malzemelerinin aranacağı Unreal klasörü.",
  "yol.unreal_klasor": "Yol yüzeyi malzemelerinin aranacağı Unreal klasörü.",
  "seviye_zemini": "Açık: zemin, yollar ve sınırlar Unreal seviyesinden gelir. Kapalı: oyun kendi düz zeminini ve yolunu kurar.",
  "ortam.zaman.baslangic_saati": "Yeni oyunda saatin kaçta başladığı (ör. 17,5 = 17.30).",
  "ortam.zaman.en_yuksek_gunes": "Öğlen güneşin ufuktan yüksekliği. 90 = tam tepede.",
  "ortam.zaman.ogle_yonu": "Öğlen güneşin geldiği pusula yönü; gölgelerin yönünü belirler.",
  "yol.uzunluk": "Oyunun kurduğu düz yolun boyu (seviye zemini kapalıyken).",
  "yol.genislik": "Yolun eni.",
  "yol.renk": "Yol malzemesi yoksa yolun düz rengi.",
  "yol.kenar_rengi": "Yol kenar şeritlerinin rengi.",
  "yol.serit": "Yolun ortasında kesik çizgi olsun mu?",
  "ortam.gokyuzu_ust": "Gökyüzü fotoğrafı yokken gökyüzünün tepe rengi.",
  "ortam.ufuk": "Ufuk çizgisindeki gökyüzü rengi.",
  "ortam.zemin_rengi": "Zemin malzemesi yoksa zeminin düz rengi.",
  "ortam.gunes_gucu": "Güneş ışığının şiddeti (1 = olağan).",
  "ortam.ortam_isigi": "Gölgelerin içine düşen genel ışık. Büyük = gölgeler daha aydınlık.",
  "ortam.doygunluk": "Renklerin canlılığı (1 = olağan, 0 = siyah-beyaz).",
  "sesler.adim_cim": "Çim ya da toprakta yürürken adım sesleri.",
  "sesler.adim_yol": "Taş ya da asfalt yolda adım sesleri.",
  "sesler.ruzgar": "Arka planda sürekli çalan rüzgâr sesi.",
  "sesler.kuslar": "Arada bir çalan kuş sesleri.",
  "sesler.darbe": "Vuruş değdiğinde çalan ses.",
  "sesler.ruzgar_siddeti": "Rüzgâr sesinin yüksekliği (0 = kapalı, 1 = tam).",
  "sesler.kus_siddeti": "Kuş seslerinin yüksekliği (0 = kapalı, 1 = tam).",
  "baslangic.konum": "Yeni oyunda oyuncunun belirdiği nokta (x sağ, y yukarı, z ileri; metre). Krokide sürüklenebilir.",
  "baslangic.aci": "Oyuncunun başlangıçta baktığı yön.",
  "bitis.z": "Bitiş kemerinin yol üstündeki yeri. Oyuncu buradan geçince bölüm biter (seviye zemini kapalıyken).",
  "bitis.metin": "Bitişe varınca ekranda çıkan yazı.",
};
const KISI_ACIKLAMA: Record<string, string> = {
  "can": "Her kişinin en yüksek canı.",
  "hafif_darbe": "Hafif vuruş alınca kaybedilen can (başa gelirse 1,25 katı).",
  "guclu_darbe": "Güçlü vuruşta kaybedilen can; güçlü vuruş kişiyi her zaman yere düşürür.",
  "blok_hasar_carpani": "Kişi gard almışken darbenin canın ne kadarını götürdüğü (0 = hiç, 1 = gardsız gibi).",
  "can_yenilenme": "Saniyede geri dolan can.",
  "can_yenilenme_gecikmesi": "Son darbeden kaç saniye sonra can dolmaya başlar.",
  "kalkis_can_orani": "Yere düşüp kalkınca canın ne kadarı dolu olur.",
};

/** Tanımında açıklaması olmayan alanlara yukarıdaki açıklamayı koyar. */
function aciklamaDoldur(gruplar: Grup[], aciklamalar: Record<string, string>) {
  for (const g of gruplar) for (const [yol, alan] of g.alanlar) if (!alan.aciklama && aciklamalar[yol]) alan.aciklama = aciklamalar[yol];
}
aciklamaDoldur(OYUNCU_GRUPLARI, OYUNCU_ACIKLAMA);
aciklamaDoldur(HARITA_GRUPLARI, HARITA_ACIKLAMA);
aciklamaDoldur([KISI_NITELIK_GRUBU], KISI_ACIKLAMA);
