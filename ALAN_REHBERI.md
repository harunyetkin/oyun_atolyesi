# Oyun Atölyesi — Alan Rehberi

Bu rehber, Oyun Atölyesi'nin **Oyun içeriği** bölümündeki (Dosya → Oyun içeriğini aç) her kutunun ne işe yaradığını anlatır.
Ekranların genel kullanımı `KULLANIM_KILAVUZU.md`'de (bölüm 16); burada yalnız alanlar var.

**Nasıl okunur?**
- **Alan**: ekranda gördüğün ad. **Ne işe yarar**: oyunda neyi değiştirdiği. **Tür / birim**: kutuya ne yazılır.
  **Dosyadaki adı**: oyun dosyasındaki karşılığı (Claude'la konuşurken işe yarar; senin bilmen gerekmez).
- Bir sayı kutusunu **boş bırakırsan** oyun kendi varsayılanını kullanır. Kutuların içindeki soluk sayı o varsayılandır.
- Birimler: **cm** ve **m** uzunluk, **sn** saniye, **°** derece, **×** çarpan (1 = olduğu gibi), **0–1** oran (0,5 = yarısı).
- Konumlar metredir: **X** sağ-sol (0 = yolun ortası), **Y** yukarı, **Z** yol boyunca (ileri gidildikçe eksi).
- Unreal yolu `/Game/...` ile başlar; Unreal'in İçerik Tarayıcısı'nda bir varlığa sağ tıklayıp **Copy Reference** ile alınır.

Bu rehber Atölye'ye her yeni alan eklendiğinde güncellenir. Tablolu bölüm doğrudan aracın kendi alan listesinden üretilir,
yani araçtaki açıklamayla (kutunun altındaki küçük yazı) birebir aynıdır.

---

## 1. Karakterler ve Harita ayarları (formlar)

<!-- OTOMATIK BASLA (sema.ts'den üretilir; elle düzenleme) -->
### Karakterler → Oyuncu (`karakterler.json` → `oyuncu`)

#### Beden ve animasyon

Oyuncunun bedeni olan MetaHuman ve hareket animasyonları. Yollar Unreal içerik yollarıdır (/Game/...).

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Beden (MetaHuman)** | Boşsa ya da bulunamazsa yerine geçici silindir görünür. | Unreal yolu | `oyuncu.unreal_govde` |
| **Animasyon Blueprint'i** | Boşsa basit kip: yalnız aşağıdaki hareket karışımı. | Unreal yolu | `oyuncu.unreal_anim_sinifi` |
| **Hareket karışımı** | Duran-yürüyen-koşan Blend Space; yatay ekseni hız. | Unreal yolu | `oyuncu.unreal_hareket` |
| **Hız çarpanı** | Hız bu sayıyla çarpılıp karışıma verilir. | sayı (×) | `oyuncu.unreal_hiz_carpani` |

#### Kontrol biçimi

W/A/S/D'nin nasıl çalıştığı. Kameraya göre: karakter, kameranın baktığı yöne göre yürür ve gittiği yöne döner.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Kameraya göre yürü** | Açık: W kameranın baktığı yöne yürütür, karakter gittiği yöne döner. Kapalı: eski kip, A/D karakteri döndürür. | açık: Kameraya göre (yeni) / kapalı: A/D döndürür (eski) | `oyuncu.hareket.kamera_gore_kontrol` |
| **Dönüş hızı** | Kameraya göre yürürken karakterin en hızlı dönüşü. | sayı (°/sn) | `oyuncu.hareket.serbest_donus_hizi` |
| **Dönüş çevikliği** | Açı farkı × bu = dönüş hızı (büyük = daha çabuk döner). | sayı (×) | `oyuncu.hareket.serbest_donus_cevikligi` |
| **Dönüş ivmesi** | Dönüşe ne kadar çabuk girip çıktığı. Küçük = dönüş yumuşak başlar ve biter. | sayı (°/sn²) | `oyuncu.hareket.serbest_donus_ivmesi` |

#### Hareket

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Yürüme hızı** | Normal yürüyüş hızı (100 cm/sn ≈ yavaş adım, 150 ≈ olağan yürüyüş). | sayı (cm/sn) | `oyuncu.hareket.yurume_hizi` |
| **Koşma hızı** | Shift basılıyken koşu hızı. Dayanıklılık harcar. | sayı (cm/sn) | `oyuncu.hareket.kosma_hizi` |
| **Yavaş yürüme** | Yavaş/sessiz yürüyüş hızı. | sayı (cm/sn) | `oyuncu.hareket.yavas_yurume_hizi` |
| **Geri yürüme oranı** | Geri giderken hız bu oranla çarpılır. | sayı 0–1 | `oyuncu.hareket.geri_orani` |
| **Hızlanma** | Durgunken istenen hıza ne kadar çabuk ulaştığı. Büyük = ani kalkış. | sayı (cm/sn²) | `oyuncu.hareket.hizlanma` |
| **Yavaşlama** | Tuş bırakılınca ne kadar çabuk durduğu. Büyük = kayma olmadan durur. | sayı (cm/sn²) | `oyuncu.hareket.yavaslama` |
| **A/D dönüş hızı** | Eski kontrol biçiminde A/D ile en hızlı dönüş. | sayı (°/sn) | `oyuncu.hareket.donus_hizi` |
| **A/D dönüş ivmesi** | Eski kipte A/D dönüşünün hızlanıp yavaşlaması. | sayı (°/sn²) | `oyuncu.hareket.donus_ivmesi` |
| **Çömelme hızı** | Çömelmişken yürüme hızı. | sayı (cm/sn) | `oyuncu.hareket.comelme_hizi` |
| **Gardda hız** | Gard (savunma) alınmışken yürüme hızı. | sayı (cm/sn) | `oyuncu.hareket.gard_hizi` |
| **Saldırırken hız** | Vuruş yaparken karakterin yerinden kayma hızı (0 = vururken durur). | sayı (cm/sn) | `oyuncu.hareket.saldiri_hizi` |
| **Zıplama hızı** | Zıplarken yukarı doğru ilk hız; büyük = daha yüksek zıplar. | sayı (cm/sn) | `oyuncu.hareket.ziplama_hizi` |
| **Havada kontrol** | 0 = havada yön değiştirilemez, 1 = yerdeki gibi. | sayı 0–1 | `oyuncu.hareket.havada_kontrol` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.hareket` alanları da kartın altında "yeni" rozetiyle görünür._

#### Can ve dayanıklılık

Koşma, kaçınma, vuruş ve zıplama dayanıklılık harcar; darbe can azaltır. Can biterse ölüm yok: oyuncu bayılır ve kalkar.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Can** | Oyuncunun en yüksek canı. Darbeler bundan düşer; biterse oyuncu bayılır. | sayı, en az 1 | `oyuncu.nitelikler.can` |
| **Dayanıklılık** | En yüksek dayanıklılık (koşu, kaçınma, vuruş, zıplama bundan harcar). | sayı, en az 1 | `oyuncu.nitelikler.dayaniklilik` |
| **Can yenilenmesi** | Saniyede geri dolan can. | sayı (/sn) | `oyuncu.nitelikler.can_yenilenme` |
| **…darbeden sonra başlama** | Son darbeden kaç saniye sonra can dolmaya başlar. | sayı (sn) | `oyuncu.nitelikler.can_yenilenme_gecikmesi` |
| **Dayanıklılık yenilenmesi** | Saniyede geri dolan dayanıklılık. | sayı (/sn) | `oyuncu.nitelikler.dayaniklilik_yenilenme` |
| **…harcamadan sonra başlama** | Son harcamadan kaç saniye sonra dayanıklılık dolmaya başlar. | sayı (sn) | `oyuncu.nitelikler.dayaniklilik_gecikmesi` |
| **Tükenme eşiği** | Dayanıklılık bitince bu orana dolmadan koşulamaz. | sayı 0–1 | `oyuncu.nitelikler.tukenme_esigi` |
| **Koşu tüketimi** | Koşarken saniyede harcanan dayanıklılık. | sayı (/sn) | `oyuncu.nitelikler.kosu_tuketimi` |
| **Kaçınma bedeli** | Bir kaçınma (sıçrama) hareketinin bedeli. Dayanıklılık yetmezse yapılmaz. | sayı | `oyuncu.nitelikler.kacinma_bedeli` |
| **Yumruk bedeli** | Bir yumruğun dayanıklılık bedeli. | sayı | `oyuncu.nitelikler.yumruk_bedeli` |
| **Güçlü vuruş bedeli** | Güçlü yumruğun dayanıklılık bedeli. | sayı | `oyuncu.nitelikler.guclu_vurus_bedeli` |
| **Tekme bedeli** | Bir tekmenin dayanıklılık bedeli. | sayı | `oyuncu.nitelikler.tekme_bedeli` |
| **Zıplama bedeli** | Bir zıplamanın dayanıklılık bedeli. | sayı | `oyuncu.nitelikler.ziplama_bedeli` |
| **Engel aşma bedeli** | Bir engelin üstünden aşmanın dayanıklılık bedeli. | sayı | `oyuncu.nitelikler.engel_bedeli` |
| **Hafif darbede can kaybı** | Hafif bir vuruş alınca kaybedilen can. | sayı | `oyuncu.nitelikler.hafif_darbe` |
| **Güçlü darbede can kaybı** | Güçlü bir vuruş alınca kaybedilen can. | sayı | `oyuncu.nitelikler.guclu_darbe` |
| **Gardda can kaybı oranı** | Gard alınmışken darbenin canın ne kadarını götürdüğü (0 = hiç, 1 = gardsız gibi). | sayı 0–1 | `oyuncu.nitelikler.blok_hasar_carpani` |
| **Gardda karşılanan darbe bedeli** | Güçlü darbede iki katı; yetmezse gard kırılır. | sayı | `oyuncu.nitelikler.blok_dayaniklilik` |
| **Bayılma süresi** | Can bitince yerde kalma süresi. | sayı (sn) | `oyuncu.nitelikler.bayilma_suresi` |
| **Kalkınca can oranı** | Bayılıp kalkınca canın ne kadarı dolu olur (0,5 = yarısı). | sayı 0–1 | `oyuncu.nitelikler.kalkis_can_orani` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.nitelikler` alanları da kartın altında "yeni" rozetiyle görünür._

#### Kaçınma (yana/geri sıçrama)

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **İleri mesafe** | İleri kaçınmada alınan yol. | sayı (cm) | `oyuncu.hareket.kacinma_mesafesi_ileri` |
| **Geri mesafe** | Geri kaçınmada (geri sıçrama) alınan yol. | sayı (cm) | `oyuncu.hareket.kacinma_mesafesi_geri` |
| **Yana mesafe** | Sağa/sola kaçınmada alınan yol. | sayı (cm) | `oyuncu.hareket.kacinma_mesafesi_yan` |
| **İleri süre** | İleri kaçınmanın sürmesi; kısa = daha ani. | sayı (sn) | `oyuncu.hareket.kacinma_suresi_ileri` |
| **Geri süre** | Geri kaçınmanın sürmesi. | sayı (sn) | `oyuncu.hareket.kacinma_suresi_geri` |
| **Yana süre** | Yana kaçınmanın sürmesi. | sayı (sn) | `oyuncu.hareket.kacinma_suresi_yan` |

#### Kamera

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Fare hassasiyeti** | Fare bir birim kayınca kameranın döndüğü açı. Büyük = hızlı bakış. | sayı (° / birim) | `oyuncu.kamera.fare_hassasiyeti` |
| **Yukarı/aşağı bakış sınırı** | Yukarı ve aşağı en fazla ne kadar bakılabildiği. | sayı (°) 0–90 | `oyuncu.kamera.bakis_siniri` |
| **Görüş açısı** | Ekranın yatay görüş genişliği. Büyük = geniş açı (balık gözüne yaklaşır), küçük = yakınlaştırılmış. | sayı (°) 30–120 | `oyuncu.kamera.gorus_acisi` |
| **Baş sallantısı** | Birinci kişide yürürken kameranın sallanması. | sayı (×) | `oyuncu.kamera.bas_sallantisi` |
| **Üçüncü kişi uzaklığı** | Üçüncü kişi görünümde kameranın karaktere başlangıç uzaklığı. | sayı (cm) | `oyuncu.kamera.ucuncu_kisi_mesafe` |
| **En yakın** | Fare tekerleğiyle yaklaşılabilecek en kısa uzaklık. | sayı (cm) | `oyuncu.kamera.en_yakin` |
| **En uzak** | Fare tekerleğiyle uzaklaşılabilecek en uzun mesafe. | sayı (cm) | `oyuncu.kamera.en_uzak` |
| **Yükseklik** | Kameranın karakterin ortasına göre yüksekliği (omuz üstü bakış). | sayı (cm) | `oyuncu.kamera.yukseklik` |
| **Takip sıkılığı** | Büyük = kamera karaktere sıkı yapışır. | sayı (×) | `oyuncu.kamera.takip_yumusakligi` |
| **Dönüş yumuşaklığı** | Üçüncü kişide kameranın dönüşü ne kadar yumuşak izlediği. Büyük = daha sıkı. | sayı (×) | `oyuncu.kamera.donus_yumusakligi` |
| **Q/E ile dönüş** | Q/E tuşlarıyla kamerayı döndürme hızı. | sayı (°/sn) | `oyuncu.kamera.tus_ile_donus_hizi` |
| **Otomatik arkaya geçme** | Fare durunca kamera yavaşça karakterin arkasına döner. | açık/kapalı | `oyuncu.kamera.otomatik_takip` |
| **…başlama gecikmesi** | Fare durduktan kaç saniye sonra kamera arkaya dönmeye başlar. | sayı (sn) | `oyuncu.kamera.otomatik_takip_gecikmesi` |
| **…hızı** | Arkaya dönüşün hızı. | sayı (×) | `oyuncu.kamera.otomatik_takip_hizi` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.kamera` alanları da kartın altında "yeni" rozetiyle görünür._

#### Animasyon geçişi

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Geçiş hızı** | Hareketler arası geçiş (büyük = hızlı). | sayı (×) | `oyuncu.animasyon.gecis_hizi` |
| **Yerinde dönerken adım** | Karakter yerinde dönerken ayakların ne kadar adım attığı (0 = kaymadan döner). | sayı | `oyuncu.animasyon.donerken_adim` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.animasyon` alanları da kartın altında "yeni" rozetiyle görünür._

#### Dövüş

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Güçlü yumruk için basılı tutma** | Sol tık bu kadar basılı tutulursa güçlü yumruk atılır; daha kısa basış normal yumruktur. | sayı (sn) | `oyuncu.dovus.guclu_yumruk_basili_sure` |
| **Kombo açılışı** | Vuruşun hangi noktasından sonra sıradaki başlayabilir (0–1). | sayı 0–1 | `oyuncu.dovus.kombo_acilisi` |
| **Yumruğun değdiği an** | Animasyonun hangi noktasında yumruk hedefe değer (0–1). | sayı 0–1 | `oyuncu.dovus.vurus_ani` |
| **Güçlü yumruğun değdiği an** | Güçlü yumruk animasyonunun hangi noktasında (0–1) hedefe değer. | sayı 0–1 | `oyuncu.dovus.guclu_vurus_ani` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.dovus` alanları da kartın altında "yeni" rozetiyle görünür._

#### Doğallık (beden dili)

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Baş öncülüğü** | Dönerken baş önden bakar. | sayı (sn) | `oyuncu.dogallik.bas_onculugu` |
| **En fazla burulma** | Dönerken gövdenin bacaklara göre en fazla burulma açısı. | sayı (°) | `oyuncu.dogallik.en_fazla_burulma` |
| **Bel payı** | Bel + göğüs + baş payları toplamı 1 olmalı. | sayı 0–1 | `oyuncu.dogallik.bel_payi` |
| **Göğüs payı** | Burulmanın göğse düşen payı. | sayı 0–1 | `oyuncu.dogallik.gogus_payi` |
| **Baş payı** | Burulmanın başa düşen payı. | sayı 0–1 | `oyuncu.dogallik.bas_payi` |
| **Dönüşte yana yatma** | Koşarken dönüşte gövdenin içe doğru yatması (bisikletçi gibi). 0 = hiç. | sayı (×) | `oyuncu.dogallik.yana_yatma` |
| **En fazla yatma** | Yana yatmanın üst sınırı. | sayı (°) | `oyuncu.dogallik.en_fazla_yatma` |
| **Kaçınırken yatma** | Yana kaçınırken gövdenin o yöne yatma açısı. | sayı (°) | `oyuncu.dogallik.kacinma_yatma` |
| **Hızlanırken eğilme** | Hızlanırken öne, yavaşlarken geriye eğilme miktarı. | sayı (×) | `oyuncu.dogallik.ivme_egilmesi` |
| **Uzanırken belden eğilme** | Aşağıdaki bir eşyaya uzanırken her cm alçaklık için belden eğilme açısı. | sayı (° / cm) | `oyuncu.dogallik.uzanma_egilmesi` |
| **Eğilme yönü** | Eğilme ters yöne oluyorsa -1 yap. | sayı (1 / -1) -1–1 | `oyuncu.dogallik.uzanma_egilme_isareti` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.dogallik` alanları da kartın altında "yeni" rozetiyle görünür._

#### Etkileşim anları

Animasyonun hangi noktasında (0 = başı, 1 = sonu) elin eşyayı tuttuğu, bıraktığı ya da kapının hareket ettiği.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Eşyayı tutma** | Eşya alma animasyonunda elin eşyayı kavradığı an; eşya bu anda ele geçer. | sayı 0–1 | `oyuncu.etkilesim.tutma_ani` |
| **Çantaya bırakma** | Çantaya koyma animasyonunda eşyanın elden kaybolduğu an. | sayı 0–1 | `oyuncu.etkilesim.cantaya_birakma_ani` |
| **Kapıyı itme** | Kapı açma animasyonunda kapının dönmeye başladığı an. | sayı 0–1 | `oyuncu.etkilesim.kapi_itme_ani` |
| **Kapıyı kapama** | Kapı kapama animasyonunda kapının kapanmaya başladığı an. | sayı 0–1 | `oyuncu.etkilesim.kapi_kapama_ani` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.etkilesim` alanları da kartın altında "yeni" rozetiyle görünür._

#### Çanta

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Çantayı göster** | Oyuncunun sırtında çanta görünsün mü? | açık/kapalı | `oyuncu.canta.goster` |
| **Konum** | Kapsül merkezine göre. | 3 sayı (cm) | `oyuncu.canta.konum` |
| **Boyut** | Çanta kutusunun eni, boyu, yüksekliği. | 3 sayı (cm) | `oyuncu.canta.boyut` |
| **Renk** | Çantanın rengi. | renk | `oyuncu.canta.renk` |

#### Animasyonlar

Her hareketin Unreal animasyon yolu. Boş bırakılan atlanır.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Zıplama** | Bu animasyon zıplamaya kalkarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.ziplama` |
| **Havada** | Bu animasyon havadayken (döngü) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.havada` |
| **İniş** | Bu animasyon yere inerken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.inis` |
| **Yumruk 1** | Bu animasyon kombonun ilk yumruğunda oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yumruk_1` |
| **Yumruk 2** | Bu animasyon kombonun ikinci yumruğunda oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yumruk_2` |
| **Yumruk 3** | Bu animasyon kombonun üçüncü yumruğunda oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yumruk_3` |
| **Güçlü yumruk** | Bu animasyon güçlü yumrukta oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.guclu_yumruk` |
| **Gard** | Bu animasyon gard (savunma) alınmışken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.gard` |
| **Kaçınma: ileri** | Bu animasyon ileri kaçınmada oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kacinma_ileri` |
| **Kaçınma: geri** | Bu animasyon geri kaçınmada oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kacinma_geri` |
| **Kaçınma: sol** | Bu animasyon sola kaçınmada oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kacinma_sol` |
| **Kaçınma: sağ** | Bu animasyon sağa kaçınmada oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kacinma_sag` |
| **Yerinde dönüş: sol** | Bu animasyon yerinde sola dönerken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.donus_sol` |
| **Yerinde dönüş: sağ** | Bu animasyon yerinde sağa dönerken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.donus_sag` |
| **Eşya alma** | Bu animasyon yerden eşya alırken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.esya_alma` |
| **Çantaya koyma** | Bu animasyon eşyayı çantaya koyarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.cantaya_koyma` |
| **Kapı açma** | Bu animasyon kapı açarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kapi_acma` |
| **Kapı kapama** | Bu animasyon kapı kapatırken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kapi_kapama` |
| **Konuşma (kişiler)** | Bu animasyon kişiler konuşurken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.konusma` |
| **Cevap verirken jest** | Bu animasyon oyuncu cevap verirken (el-kol hareketi) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.konusma_jest` |
| **Bankta oturma (döngü)** | Bu animasyon bankta otururken (döngü) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.oturma` |
| **İtme (G)** | Bu animasyon G ile birini iterken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.itme` |
| **Darbe alma (vurulunca)** | Bu animasyon vurulunca oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.darbe_alma` |
| **Yere düşme** | Bu animasyon can bitip yere düşerken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yere_dusme` |
| **Yerden kalkma** | Bu animasyon bayıldıktan sonra kalkarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yerden_kalkma` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.animasyonlar` alanları da kartın altında "yeni" rozetiyle görünür._

#### Animasyon yuvaları

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Tam gövde** | Bütün bedeni oynatan animasyonların gittiği Animasyon Blueprint yuvasının adı. Blueprint'teki adla aynı olmalı. | yazı | `oyuncu.animasyon_yuvalari.tam_govde` |
| **Üst gövde** | Yalnız belden yukarıyı oynatan (yürürken yumruk gibi) yuvanın adı. | yazı | `oyuncu.animasyon_yuvalari.ust_govde` |

### Karakterler → Kişiler: ortak can (`karakterler.json` → `kisi_nitelikler`)

#### Kişilerin canı (ortak)

Bütün kişiler için ortak değerler. Hafif darbe can azaltır (başa 1.25 kat); can biterse kişi yere düşer ve kalkınca belli oranda dolar. Güçlü darbe her zaman düşürür. Haritada bir kişiye özel değer yazılırsa onunki geçerlidir.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Can** | Her kişinin en yüksek canı. | sayı, en az 1 | `kisi_nitelikler.can` |
| **Hafif darbede kayıp** | Hafif vuruş alınca kaybedilen can (başa gelirse 1,25 katı). | sayı | `kisi_nitelikler.hafif_darbe` |
| **Güçlü darbede kayıp** | Güçlü vuruşta kaybedilen can; güçlü vuruş kişiyi her zaman yere düşürür. | sayı | `kisi_nitelikler.guclu_darbe` |
| **Gardda kayıp oranı** | Kişi gard almışken darbenin canın ne kadarını götürdüğü (0 = hiç, 1 = gardsız gibi). | sayı 0–1 | `kisi_nitelikler.blok_hasar_carpani` |
| **Can yenilenmesi** | Saniyede geri dolan can. | sayı (/sn) | `kisi_nitelikler.can_yenilenme` |
| **…darbeden sonra başlama** | Son darbeden kaç saniye sonra can dolmaya başlar. | sayı (sn) | `kisi_nitelikler.can_yenilenme_gecikmesi` |
| **Kalkınca can oranı** | Yere düşüp kalkınca canın ne kadarı dolu olur. | sayı 0–1 | `kisi_nitelikler.kalkis_can_orani` |

_Oyuna sonradan eklenen ve burada adı olmayan `kisi_nitelikler.` alanları da kartın altında "yeni" rozetiyle görünür._

### Harita → Ayarlar (`haritalar/<ad>.json`)

#### Genel

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Görünen ad** | Haritanın oyunda ve kayıt ekranında görünen adı. | yazı | `ad` |
| **Tema** | Haritanın havası için kısa not (ör. "akşamüstü köy"). Oyun şimdilik yalnız gösterir. | yazı | `tema` |
| **Not** | Oyun okumaz; açıklama içindir. | yazı | `not` |

#### Unreal: dekor, zemin ve yol yüzeyi

Unreal'de bütün dekor modellerine eklenen dönüş düzeltmesi ve zemin/yol malzemelerinin klasörleri. Klasörde malzeme yoksa düz renk kalır.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Model açı düzeltmesi** | Modeller yanlış yöne bakıyorsa (ör. 90 ya da -90). | sayı (°) | `unreal_model_aci` |
| **Zemin klasörü** | Zemin malzemelerinin aranacağı Unreal klasörü. | Unreal yolu | `ortam.unreal_zemin_klasoru` |
| **Zemin karo boyu** | Malzemenin bir kez tekrarladığı boy (varsayılan 4). | sayı (m) | `ortam.unreal_zemin_karo` |
| **Yol klasörü** | Yol yüzeyi malzemelerinin aranacağı Unreal klasörü. | Unreal yolu | `yol.unreal_klasor` |
| **Yol karo boyu** | Varsayılan: yol genişliğinin yarısı. | sayı (m) | `yol.unreal_karo` |

#### Unreal seviyesi

Haritanın zemini, yolları ve sınırları Unreal'de elle kurulmuş bir seviyedeyse: oyun kendi düz zeminini, yol şeridini, yan duvarları ve bitiş kemerini koymaz; oyuncu ve kişiler araziye yukarıdan indirilir.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Zemin Unreal seviyesinde** | Açık: zemin, yollar ve sınırlar Unreal seviyesinden gelir. Kapalı: oyun kendi düz zeminini ve yolunu kurar. | açık: Evet (seviyenin kendi zemini) / kapalı: Hayır (oyun düz zemin kurar) | `seviye_zemini` |
| **Unreal seviyesi** | Bilgi: oyun şimdilik varsayılan haritayı açar. | Unreal yolu | `unreal_seviye` |

#### Gün ve gece

Gün-gece döngüsü (Unreal). Saat kayıtla saklanır ve ekranda pusulanın sağında görünür.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Başlangıç saati** | Yeni oyunda saatin kaçta başladığı (ör. 17,5 = 17.30). | sayı (saat) 0–24 | `ortam.zaman.baslangic_saati` |
| **Bir günün süresi** | Kaç gerçek dakikada bir oyun günü (24 saat) geçer. | sayı (gerçek dk), en az 1 | `ortam.zaman.gun_suresi_dakika` |
| **Öğlen güneş yüksekliği** | Öğlen güneşin ufuktan yüksekliği. 90 = tam tepede. | sayı (°) 0–90 | `ortam.zaman.en_yuksek_gunes` |
| **Öğlen güneşin yönü** | Öğlen güneşin geldiği pusula yönü; gölgelerin yönünü belirler. | sayı (°) | `ortam.zaman.ogle_yonu` |
| **Ay ışığı** | Gece ışığı, güneşin bu oranı kadar. | sayı 0–1 | `ortam.zaman.gece_gucu` |
| **Gece pozlaması** | Eksi = gece daha karanlık. | sayı | `ortam.zaman.gece_pozlama` |
| **Gece gök ışığı** | Gece de etrafın görünmesi için gökten gelen ışık. | sayı 0–1 | `ortam.zaman.gece_gok_isigi` |

_Oyuna sonradan eklenen ve burada adı olmayan `ortam.zaman` alanları da kartın altında "yeni" rozetiyle görünür._

#### Pozlama ve ışık gölgeleri

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Gölge kontrastı** | Düşük = gölgeler daha aydınlık (varsayılan 0.6). | sayı 0.1–1 | `ortam.pozlama.golge_kontrasti` |
| **Parlak kontrastı** | Düşük = parlak gökyüzü daha az patlar (varsayılan 0.7). | sayı 0.1–1 | `ortam.pozlama.parlak_kontrasti` |
| **Lamba ışıklarının gölgesi** | Lamba direkleri ve iç mekân ışıkları gölge yapsın mı? Çok sayıda gölgeli ışık ekran kartını zorlayabilir (varsayılan kapalı). | açık/kapalı | `ortam.yerel_isik_golgesi` |

_Oyuna sonradan eklenen ve burada adı olmayan `ortam.pozlama` alanları da kartın altında "yeni" rozetiyle görünür._

#### Yol

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Uzunluk** | Oyunun kurduğu düz yolun boyu (seviye zemini kapalıyken). | sayı (m), en az 10 | `yol.uzunluk` |
| **Genişlik** | Yolun eni. | sayı (m), en az 1 | `yol.genislik` |
| **Renk** | Yol malzemesi yoksa yolun düz rengi. | renk | `yol.renk` |
| **Kenar rengi** | Yol kenar şeritlerinin rengi. | renk | `yol.kenar_rengi` |
| **Orta şerit** | Yolun ortasında kesik çizgi olsun mu? | açık/kapalı | `yol.serit` |

#### Işık ve gökyüzü

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Gökyüzü (üst)** | Gökyüzü fotoğrafı yokken gökyüzünün tepe rengi. | renk | `ortam.gokyuzu_ust` |
| **Ufuk** | Ufuk çizgisindeki gökyüzü rengi. | renk | `ortam.ufuk` |
| **Zemin rengi** | Zemin malzemesi yoksa zeminin düz rengi. | renk | `ortam.zemin_rengi` |
| **Güneş gücü** | Güneş ışığının şiddeti (1 = olağan). | sayı (×) | `ortam.gunes_gucu` |
| **Ortam ışığı** | Gölgelerin içine düşen genel ışık. Büyük = gölgeler daha aydınlık. | sayı (×) | `ortam.ortam_isigi` |
| **Sis yoğunluğu** | 0 = sis yok. | sayı | `ortam.sis` |
| **Renk doygunluğu** | Renklerin canlılığı (1 = olağan, 0 = siyah-beyaz). | sayı (×) | `ortam.doygunluk` |
| **Yüksek kalite** | Güçlü ekran kartında gerçekçi dolaylı ışık, yansıma, hacimli sis. | açık/kapalı | `ortam.yuksek_kalite` |
| **Güneşin alçalma hızı** | Oyun sürerken güneş yavaşça alçalır (0 = sabit). | sayı (°/dk) | `ortam.gunes_hareketi` |
| **Güneşin en alçak yeri** | Güneş bu eğimin altına inmez. | sayı (°) | `ortam.gunes_en_alcak` |

#### Sesler

Ortam sesleri: Unreal'de bir ses klasörü (içindeki seslerden biri rastgele çalar) ya da tek bir sesin yolu.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Adım: çimde** | Çim ya da toprakta yürürken adım sesleri. | Unreal yolu | `sesler.adim_cim` |
| **Adım: yolda** | Taş ya da asfalt yolda adım sesleri. | Unreal yolu | `sesler.adim_yol` |
| **Rüzgâr** | Arka planda sürekli çalan rüzgâr sesi. | Unreal yolu | `sesler.ruzgar` |
| **Kuşlar** | Arada bir çalan kuş sesleri. | Unreal yolu | `sesler.kuslar` |
| **Darbe (vuruş)** | Vuruş değdiğinde çalan ses. | Unreal yolu | `sesler.darbe` |
| **Rüzgâr sesi şiddeti** | Rüzgâr sesinin yüksekliği (0 = kapalı, 1 = tam). | sayı 0–1 | `sesler.ruzgar_siddeti` |
| **Kuş sesi şiddeti** | Kuş seslerinin yüksekliği (0 = kapalı, 1 = tam). | sayı 0–1 | `sesler.kus_siddeti` |

_Oyuna sonradan eklenen ve burada adı olmayan `sesler` alanları da kartın altında "yeni" rozetiyle görünür._

#### Başlangıç ve bitiş

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Başlangıç noktası** | Yeni oyunda oyuncunun belirdiği nokta (x sağ, y yukarı, z ileri; metre). Krokide sürüklenebilir. | 3 sayı (m) | `baslangic.konum` |
| **Başlangıç yönü** | Oyuncunun başlangıçta baktığı yön. | sayı (°) | `baslangic.aci` |
| **Bitiş kemeri (z)** | Bitiş kemerinin yol üstündeki yeri. Oyuncu buradan geçince bölüm biter (seviye zemini kapalıyken). | sayı (m) | `bitis.z` |
| **Bitiş yazısı** | Bitişe varınca ekranda çıkan yazı. | yazı | `bitis.metin` |

<!-- OTOMATIK BITTI -->

---

## 2. Harita → Kişiler

Haritada dolaşan her kişi (oyundaki adıyla "npc") bir karttır. Krokide kişinin alanını sürükleyerek yerini, kenarındaki beyaz noktayı
çekerek alanının büyüklüğünü değiştirirsin. Kartın üstündeki düğmeler: **Çoğalt** (yanına bir kopya koyar), **Sil**.

| Alan | Ne işe yarar |
|---|---|
| **Kimlik** | Kişinin değişmeyen adı (küçük harf, rakam, `_`). Görevler ve Karakterler → Kişiler bu adla bağlanır; değiştirirsen bağlar da güncellenir. |
| **Ad** | Konuşurken ekranda görünen ad. |
| **Davranış** | Gün boyu ne yaptığı: **Dolaşır** (alanının içinde rastgele), **Yerinde bekler** (alanın ortasında durur, yanına gelene döner), **Oturur** (en yakın boş banka oturur), **Yolda yürür** (bir yaya şeridinde ileri geri). Günlük programı varsa programdaki iş geçerlidir. |
| **Grup** | Kişinin ait olduğu topluluk (ör. köy). Yalnız bilgi içindir. |
| **Alanın ortası** (X, Z) | Kişinin dolaştığı/beklediği alanın merkezi. |
| **Alanın yarıçapı** | Dolaşırken bu yarıçaptan (m) dışarı çıkmaz. |
| **Yürüme hızı** | m/sn. Olağan ≈ 1,2 · ağır aksak ≈ 0,8 · aceleci ≈ 1,6. Oyun 0–3 arasına kırpar. |
| **Durma mesafesi** | Oyuncu bu kadar (m) yaklaşınca kişi durup ona döner. |
| **Yaya şeridi** | Yalnız "Yolda yürür"de: kişinin yürüdüğü çizginin iki ucu. Boşsa alanın ortasından geçen hazır şerit kullanılır. |
| **Bakış yönü** | Beklerken baktığı yön (°). |
| **Günlük program → Duraklar** | Saat (0–24; 7,5 = 07.30), iş (Dolaşır / Bekler / Oturur), yer (X, Z; boşsa alanın ortası) ve işe göre dolaşma yarıçapı ya da bakış yönü. Saati gelen durağa yürür ve oradaki işi yapar. **Durak ekle** son durağın 2 saat sonrasına yeni durak koyar. |
| **Konuşma** | Oyuncu F'ye basınca açılan diyalog. Boşsa kişi konuşmaz, yalnız dolaşır. |
| **Selamlaşma** | Karşılaşınca tokalaşır, el sallar ya da selamlaşmaz. |
| **Yanından geçerken** | Oyuncu yanından geçerken kişinin söylediği kısa sözler; her seferinde biri rastgele seçilir. |
| **Saldırıya uğrayınca** | Vurulunca tavrı: **Kaçar**, **Savunur** (gard alır, geri çekilir), **Karşılık verir** (yumrukla), **Karışık** (kişiye göre biri seçilir ama hep aynı kalır). Tavra göre "… der ki" sözleri de yazılabilir. |
| **Bu kişinin canı** | Can, darbe kayıpları, yenilenme… Boş kutular Karakterler → Kişiler'deki ortak değeri kullanır (anlamları 1. bölümdeki "Kişilerin canı" tablosunda). |
| **Beden (MetaHuman)** | Bu kişinin bedeni Karakterler → Kişiler'de seçilir; buradan oraya gidilir. |
| **Eski görünüm** | Godot sürümündeki renk/boy bilgisi. Unreal okumaz; değiştirilmez. |

**Kalabalık** kartı (isteğe bağlı): Unreal'de otomatik üretilmiş MetaHuman'lar yolda dolaşır.

| Alan | Ne işe yarar |
|---|---|
| **Kişi sayısı** | En fazla bu kadar kalabalık kişisi eklenir. |
| **Görünen ad** | Konuşurken görünen ortak ad (ör. "Köylü"). |
| **MetaHuman klasörü** | Kalabalık bedenlerinin arandığı Unreal klasörü. |
| **Ad öneki** | Klasörde adı bununla başlayan bedenler kullanılır (ör. `BP_Uretilen`). |
| **Dolaşma yarıçapı** | Her birinin dolaştığı alanın yarıçapı (m). |
| **Konuşma** / **Yanından geçerken** | Kişilerdeki gibi. |

## 3. Harita → Eşyalar

Yerde duran, alınabilir eşyalar. Oyuncu yaklaşınca "[F] Al: ad" yazar.

| Alan | Ne işe yarar |
|---|---|
| **Kimlik** | Eşyanın değişmeyen adı; görevler bununla bağlanır. |
| **Ad** | "[F] Al: …" yazısında ve çantada görünen ad. |
| **Konum** (X, Y, Z) / **Açı** | Yerdeki yeri ve dönüklüğü. Krokide sürüklenebilir. |
| **Renk** | Modeli olmayan eşyanın geçici kutusunun rengi. |
| **Mesaj** | Alınca ekranda çıkan yazı. |
| **Açıklama** | Çantada (I) eşyanın altında görünen yazı. |
| **Puanlar** | Bu eşyayı almak, senin ölçeklerinde (Ayarlar → ölçekler) hangi puanı ne kadar değiştirir. Karar olarak kaydedilir. |
| **Elde duruşu** | Eşya eldeyken sağ eldeki kayması (cm) ve dönüşü (°). İsteğe bağlı; eşya elde yanlış duruyorsa kullanılır. |

## 4. Harita → Sandıklar

Açılabilir sandıklar. Açınca içindeki eşya çantaya girer.

| Alan | Ne işe yarar |
|---|---|
| **Kimlik**, **Ad** | Değişmeyen ad; "[F] Aç: …" yazısında görünen ad. |
| **Konum**, **Açı** | Yeri ve dönüklüğü. |
| **Eşyanın adı**, **Açıklama** | Sandıktan çıkan eşyanın adı ve çantadaki açıklaması. |
| **Mesaj** | Açınca ekranda çıkan yazı (isteğe bağlı). |
| **Puanlar** | Sandığı açmanın ölçek puanlarına etkisi. |
| **Gövde modeli**, **Kapak modeli** | Sandığın Unreal modelleri. Boşsa hazır sandık kullanılır. |
| **Ön yön düzeltmesi** | Model yanlış yöne bakıyorsa eklenen açı (°). |
| **Kapak menteşesi** | Kapağın döndüğü nokta, sandığın ortasına göre (cm). |
| **Kapak ekseni**, **Kapak açılma açısı** | Kapağın hangi eksen etrafında ve kaç derece açıldığı. |

## 5. Harita → Görevler

| Alan | Ne işe yarar |
|---|---|
| **Kimlik**, **Ad**, **Açıklama** | Değişmeyen ad; görev listesinde görünen ad ve kısa açıklama. |
| **Adımlar** | Sırayla yapılacak işler. Her adımın **türü** (Biriyle konuş, Eşya al, Sandık aç, Kapı seç, Yolun sonuna var), **hedefi** (hangi kişi/eşya/sandık/kapı; boşsa o türden herhangi biri) ve oyuncunun gördüğü **yazısı** vardır. Oklarla sırası değişir. Oyuncu işi yapınca adım tamamlanır, sıradaki görünür. |

## 6. Harita → Mekânlar

| Bölüm / alan | Ne işe yarar |
|---|---|
| **Kapılar ve geçişler** | Oyuncu kapıya yaklaşınca "[F] yazı" çıkar; basınca ekran kararır ve oyuncu gidilen yere geçer. **Kimlik**; **yazı** (ör. "Gir: Han"); **kapı** X Y Z (kapının yeri); **→** X Y Z (varılan yer); **°** (varınca bakılan yön). Her girişin varılan yerde bir **dönüş kapısı** olmalı; ⇄ düğmesi ona gider. **Kapı çifti ekle** ikisini birlikte kurar. |
| **İç mekânlar** | Hazır bir Unreal seviyesi (ör. bir dükkân sahnesi) bu konuma kopya olarak yüklenir. **Kimlik**, **Ad**, **Seviye** (Unreal yolu), konum X Y Z, **°** dönüş. **Silme kutusu** (x1, z1, x2, z2; seviyenin kendi metresiyle): verilirse kutunun dışındaki her şey silinir (seviyenin fazlalıklarını atmak için). |
| **Meşaleler** | Akşam yanan, gündüz sönen meşaleler. Üstte bütün meşaleler için **ışık gücü** (kandela) ve **erim** (m). Her meşalede **tür** (Direk: yere dikili; Duvar: duvara asılı), X, Z, **Y** (zeminden yükseklik), **°** (duvar meşalesinin baktığı yön). |
| **Zeminler** | Kaldırım, meydan gibi üstünde yürünen düz alanlar: merkez X, Z; **En** ve **Boy** (m); **Y** yükseklik; renk; malzeme (Unreal yolu) ve **karo** boyu (malzemenin bir kez tekrarladığı boy). |
| **Görünmez duvarlar** | Oyuncunun geçemeyeceği 10 m yüksekliğinde görünmez kutular (merkez, en, boy). |
| **Ot serpilmeyen alanlar** | Bu dikdörtgenlere ot ve eğrelti konmaz (ör. bir meydanın ortası). |

## 7. Karakterler → Kişiler (beden)

| Alan | Ne işe yarar |
|---|---|
| **Kimlik** | Haritadaki kişinin kimliğiyle aynı olmalı; öyle eşleşir. |
| **Beden (MetaHuman)** | O kişinin Unreal bedeni. Boşsa oyuncunun bedenini kullanır. |
| **Animasyon Blueprint'i** | Kişiye özel animasyon düzeni. Boşsa oyuncununki. |

## 8. Kroki (haritanın kuşbakışı çizimi)

Kişiler, Eşyalar, Sandıklar ve Mekânlar sekmelerinin üstünde durur. Fare tekerleği yakınlaştırır, boş yeri sürüklemek kaydırır,
**Sığdır** her şeyi gösterir, **Yakın görünüm** kalabalık bölgeye odaklanır. Yalnız açık sekmenin nesneleri tutulup sürüklenebilir;
diğerleri soluk görünür. Büyük oyunlarda haritanın uzak bitişi okla belirtilir.
