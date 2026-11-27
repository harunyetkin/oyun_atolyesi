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
| **Omuz kaydırma** | Kamera karakterin omzunun üstünden bakar: sağa ve yukarı kayma. Eksi sağa = sol omuz. | Sağa, Yukarı (cm) | `oyuncu.kamera.omuz_kaydirma` |
| **Koşarken en fazla geride kalma** | Koşarken kamera karakterin en fazla bu kadar gerisinde kalır (0 = sınırsız). | sayı (cm) | `oyuncu.kamera.takip_en_fazla_geri` |
| **Koşarken görüş genişlemesi** | Koşarken görüş açısı bu kadar genişler; hız hissi verir. | sayı (°) | `oyuncu.kamera.kosu_gorus_artisi` |
| **Aşağıdan bakışta yaklaşma** | Aşağıdan yukarı bakarken kamera bu oranda karaktere yaklaşır (yere gömülmesin). | sayı 0–0.8 | `oyuncu.kamera.asagidan_bakista_yaklasma` |

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
| **Tekmenin değdiği an** | Tekme animasyonunun hangi noktasında ayak hedefe değer (0–1). | sayı 0–1 | `oyuncu.dovus.tekme_vurus_ani` |
| **Güçlü tekmenin değdiği an** | Güçlü tekmede ayağın değdiği an (0–1). | sayı 0–1 | `oyuncu.dovus.guclu_tekme_vurus_ani` |
| **Yerdekine vuruşun değdiği an** | Yerde yatana vuruşta darbenin değdiği an (0–1). | sayı 0–1 | `oyuncu.dovus.yerde_vurus_ani` |
| **Yumruk mesafesi** | Yumruklaşırken iki gövdenin ortası arası ideal uzaklık; oyuncu ve kişiler bu mesafeye gelir. | sayı (cm) | `oyuncu.dovus.vurus_mesafesi` |
| **Tekme mesafesi** | Tekmede ideal uzaklık (bacak koldan uzun). Boşsa yumruk mesafesi. | sayı (cm) | `oyuncu.dovus.tekme_mesafesi` |
| **Güçlü tekme mesafesi** | Güçlü tekmede ideal uzaklık. Boşsa yumruk mesafesi. | sayı (cm) | `oyuncu.dovus.guclu_tekme_mesafesi` |
| **En uzak an: Yumruk 1** | Animasyonda el ya da ayağın en ileri uzandığı saniye. Erken değen vuruş buradan geri döner (uzuv hedefin içine girmez). Animasyon değişince yeniden ölçülmeli. | sayı (sn) | `oyuncu.dovus.tepe_anlari.yumruk_1` |
| **En uzak an: Yumruk 2** | Animasyonda el ya da ayağın en ileri uzandığı saniye. Erken değen vuruş buradan geri döner (uzuv hedefin içine girmez). Animasyon değişince yeniden ölçülmeli. | sayı (sn) | `oyuncu.dovus.tepe_anlari.yumruk_2` |
| **En uzak an: Yumruk 3** | Animasyonda el ya da ayağın en ileri uzandığı saniye. Erken değen vuruş buradan geri döner (uzuv hedefin içine girmez). Animasyon değişince yeniden ölçülmeli. | sayı (sn) | `oyuncu.dovus.tepe_anlari.yumruk_3` |
| **En uzak an: Güçlü yumruk** | Animasyonda el ya da ayağın en ileri uzandığı saniye. Erken değen vuruş buradan geri döner (uzuv hedefin içine girmez). Animasyon değişince yeniden ölçülmeli. | sayı (sn) | `oyuncu.dovus.tepe_anlari.guclu_yumruk` |
| **En uzak an: Tekme** | Animasyonda el ya da ayağın en ileri uzandığı saniye. Erken değen vuruş buradan geri döner (uzuv hedefin içine girmez). Animasyon değişince yeniden ölçülmeli. | sayı (sn) | `oyuncu.dovus.tepe_anlari.tekme` |
| **En uzak an: Güçlü tekme** | Animasyonda el ya da ayağın en ileri uzandığı saniye. Erken değen vuruş buradan geri döner (uzuv hedefin içine girmez). Animasyon değişince yeniden ölçülmeli. | sayı (sn) | `oyuncu.dovus.tepe_anlari.guclu_tekme` |

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
| **Sandık kapağını kaldırma** | Sandık açma animasyonunda kapağın kalkmaya başladığı an. | sayı 0–1 | `oyuncu.etkilesim.sandik_acma_ani` |
| **Yerden eşya alma** | Yerden alma animasyonunda elin eşyayı kavradığı an. | sayı 0–1 | `oyuncu.etkilesim.yerden_alma_ani` |
| **Eşya alırken elin en alçak yeri** | Animasyonda elin inebildiği en alçak yer (ayak tabanından). Eşya daha alçaktaysa karakter belden biraz daha eğilir. | sayı (cm) | `oyuncu.etkilesim.esya_alma_el_alti` |
| **Sandık açarken elin en alçak yeri** | Sandık açma animasyonunda elin en alçak yeri; sandık daha alçaksa karakter eğilir. | sayı (cm) | `oyuncu.etkilesim.sandik_acma_el_alti` |
| **Eşya alma: başlangıç** | Eşya alma animasyonunun yalnız bir bölümü oynasın diye başladığı saniye. Boşsa en baştan. | sayı (sn) | `oyuncu.etkilesim.esya_alma_bas` |
| **Eşya alma: bitiş** | Eşya alma animasyonunun bittiği saniye. Boşsa sonuna kadar. Yukarıdaki "an"lar bu aralığa göredir. | sayı (sn) | `oyuncu.etkilesim.esya_alma_son` |
| **Sandık açma: başlangıç** | Sandık açma animasyonunun yalnız bir bölümü oynasın diye başladığı saniye. Boşsa en baştan. | sayı (sn) | `oyuncu.etkilesim.sandik_acma_bas` |
| **Sandık açma: bitiş** | Sandık açma animasyonunun bittiği saniye. Boşsa sonuna kadar. Yukarıdaki "an"lar bu aralığa göredir. | sayı (sn) | `oyuncu.etkilesim.sandik_acma_son` |
| **Kapı açma: başlangıç** | Kapı açma animasyonunun yalnız bir bölümü oynasın diye başladığı saniye. Boşsa en baştan. | sayı (sn) | `oyuncu.etkilesim.kapi_acma_bas` |
| **Kapı açma: bitiş** | Kapı açma animasyonunun bittiği saniye. Boşsa sonuna kadar. Yukarıdaki "an"lar bu aralığa göredir. | sayı (sn) | `oyuncu.etkilesim.kapi_acma_son` |
| **Kapı kapama: başlangıç** | Kapı kapama animasyonunun yalnız bir bölümü oynasın diye başladığı saniye. Boşsa en baştan. | sayı (sn) | `oyuncu.etkilesim.kapi_kapama_bas` |
| **Kapı kapama: bitiş** | Kapı kapama animasyonunun bittiği saniye. Boşsa sonuna kadar. Yukarıdaki "an"lar bu aralığa göredir. | sayı (sn) | `oyuncu.etkilesim.kapi_kapama_son` |
| **Çantaya koyma: başlangıç** | Çantaya koyma animasyonunun yalnız bir bölümü oynasın diye başladığı saniye. Boşsa en baştan. | sayı (sn) | `oyuncu.etkilesim.cantaya_koyma_bas` |
| **Çantaya koyma: bitiş** | Çantaya koyma animasyonunun bittiği saniye. Boşsa sonuna kadar. Yukarıdaki "an"lar bu aralığa göredir. | sayı (sn) | `oyuncu.etkilesim.cantaya_koyma_son` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.etkilesim` alanları da kartın altında "yeni" rozetiyle görünür._

#### Bankta oturma

Oyuncu (ve kişiler) banka yürür, arkasını döner, otur-kalk animasyonunun oturuş bölümüyle oturur; otururken bekleme hareketleri sırayla değişir. Mesafeler cm, süreler saniye.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Otur-kalk animasyonu** | Oturma ve kalkma bölümlerini içeren tek animasyon. | Unreal yolu | `oyuncu.oturma.gecis_animasyonu` |
| **Oturuş: başlangıç** | Otur-kalk animasyonunda oturmanın başladığı saniye. | sayı (sn) | `oyuncu.oturma.oturus_baslangici` |
| **Oturuş: bitiş** | Oturmanın bittiği saniye. | sayı (sn) | `oyuncu.oturma.oturus_sonu` |
| **Kalkış: başlangıç** | Kalkmanın başladığı saniye. | sayı (sn) | `oyuncu.oturma.kalkis_baslangici` |
| **Kalkış: bitiş** | Kalkmanın bittiği saniye. | sayı (sn) | `oyuncu.oturma.kalkis_sonu` |
| **Banka yürüme hızı** | Banka giderken yürüme hızının katı (0,75 = biraz yavaş). | sayı (×) | `oyuncu.oturma.yaklasma_hizi` |
| **Otururken bekleme hareketleri** | Otururken sırayla (rastgele) oynayan animasyonlar. Boşsa Animasyonlar kartındaki "Bankta oturma". | Unreal yolu listesi | `oyuncu.oturma.beklemeler` |
| **Otururken konuşma** | Oyuncu oturan biriyle konuşunca onun oynadığı animasyon. | Unreal yolu | `oyuncu.oturma.konusma` |
| **Animasyonun oturak yüksekliği** | Oturma animasyonlarının yapıldığı oturak yüksekliği (42). Daha yüksek sandalyede oturan o kadar kaldırılır. | sayı (cm) | `oyuncu.oturma.animasyon_oturak_yuksekligi` |
| **Kalça ayakların gerisinde** | Animasyonda kalçanın ayakların ne kadar gerisinde olduğu (ölçüm yokken kullanılır). | sayı (cm) | `oyuncu.oturma.kalca_geride` |
| **Arkalıktan uzaklık** | Kalça arkalıktan en az bu kadar önde durur. | sayı (cm) | `oyuncu.oturma.arkaliktan` |
| **Kalça yüzeyin üstünde** | Kalça kemiği oturma yüzeyinin bu kadar üstünde durur; karakter oturağa gömülüyorsa artır, havada duruyorsa azalt. | sayı (cm) | `oyuncu.oturma.kalca_yuksekligi` |
| **Dizlerin ön kenardan payı** | Dizler oturağın ön kenarından en az bu kadar önde (baldır kenarın içinden geçmesin). | sayı (cm) | `oyuncu.oturma.diz_payi` |
| **Diz kalçanın önünde** | Ölçüm yokken dizin kalçanın önündeki uzaklığı. | sayı (cm) | `oyuncu.oturma.diz_onde` |
| **Ellerin uzandığı mesafe** | Otururken ellerin kalçanın önüne uzandığı en büyük mesafe; önde masa varsa kalça masa kenarından en az bu kadar geride durur. | sayı (cm) | `oyuncu.oturma.el_onde` |

_Oyuna sonradan eklenen ve burada adı olmayan `oyuncu.oturma` alanları da kartın altında "yeni" rozetiyle görünür._

#### Çanta

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Çantayı göster** | Oyuncunun sırtında çanta görünsün mü? | açık/kapalı | `oyuncu.canta.goster` |
| **Konum** | Kapsül merkezine göre. | İleri, Sağ, Yukarı (cm) | `oyuncu.canta.konum` |
| **Boyut** | Çanta kutusunun eni, boyu, yüksekliği. | X, Y, Z (cm) | `oyuncu.canta.boyut` |
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
| **Tekme (R)** | Bu animasyon R ile tekme atarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.tekme` |
| **Güçlü tekme** | Bu animasyon güçlü tekmede oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.guclu_tekme` |
| **Yerdekine vuruş** | Bu animasyon yerde yatan birine vururken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yerdekine_vurus` |
| **Gardda darbe karşılama** | Bu animasyon gard alınmışken gelen darbeyi karşılarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.gard_darbe` |
| **Kişilerin gard duruşu** | Bu animasyon kişiler kavgada gard aldığında (boşsa oyuncunun gard animasyonu) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kisi_gard` |
| **Sendeleme (itilince)** | Bu animasyon bir kişi önden itilince geriye sendelerken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.sendeleme` |
| **Kişi: önden başa darbe** | Bu animasyon kişi önden başına vurulunca oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kisi_darbe_on_bas` |
| **Kişi: önden gövdeye darbe** | Bu animasyon kişi önden gövdesine vurulunca oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kisi_darbe_on_govde` |
| **Kişi: soldan darbe** | Bu animasyon kişi soldan vurulunca oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kisi_darbe_sol` |
| **Kişi: sağdan darbe** | Bu animasyon kişi sağdan vurulunca oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.kisi_darbe_sag` |
| **Yerden alma (eğilme)** | Bu animasyon yerdeki bir eşyayı almak için eğilirken (ilk parça) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yerden_alma` |
| **Yerden alma (doğrulma)** | Bu animasyon eşyayı alıp doğrulurken (ikinci parça) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.yerden_alma_devam` |
| **Sandık açma** | Bu animasyon sandık açarken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.sandik_acma` |
| **Engelin üstünden atlama** | Bu animasyon alçak bir engelin üstünden atlarken (boşsa zıplama) oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.engel_atlama` |
| **Alçak yere tırmanma** | Bu animasyon bel hizasında bir yere tırmanırken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.tirmanma_alcak` |
| **Yüksek yere tırmanma** | Bu animasyon omuz hizasında bir yere tırmanırken oynar. Boşsa o an animasyonsuz geçer. | Unreal yolu | `oyuncu.animasyonlar.tirmanma` |

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
| **Başlangıç noktası** | Yeni oyunda oyuncunun belirdiği nokta (x sağ, y yukarı, z ileri; metre). Krokide sürüklenebilir. | X, Y, Z (m) | `baslangic.konum` |
| **Başlangıç yönü** | Oyuncunun başlangıçta baktığı yön. | sayı (°) | `baslangic.aci` |
| **Bitiş kemeri (z)** | Bitiş kemerinin yol üstündeki yeri. Oyuncu buradan geçince bölüm biter (seviye zemini kapalıyken). | sayı (m) | `bitis.z` |
| **Bitiş yazısı** | Bitişe varınca ekranda çıkan yazı. | yazı | `bitis.metin` |

### Genel → Arayüz (`arayuz.json`)

#### Renkler

Menülerin ve oyun içi yazıların renkleri. Boş bırakılan renk oyunun kendi rengini kullanır. Kaydırıcı saydamlığı ayarlar.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Yazı** | Menü ve ekrandaki genel yazı rengi. | renk (saydamlıkla; boş = varsayılan) | `renkler.yazi` |
| **Vurgu** | Seçili menü satırı, başlıklar ve önemli yazılar. | renk (saydamlıkla; boş = varsayılan) | `renkler.vurgu` |
| **Panel** | Menü kutularının ve pencerelerin arka planı (yarı saydam olabilir). | renk (saydamlıkla; boş = varsayılan) | `renkler.panel` |
| **Soluk yazı** | İpuçları ve ikinci derecede yazılar. | renk (saydamlıkla; boş = varsayılan) | `renkler.soluk` |
| **Olumlu** | Başarı ve onay yazıları (ör. görev tamamlandı). | renk (saydamlıkla; boş = varsayılan) | `renkler.olumlu` |
| **Menü şeridi** | Ana menüde seçeneklerin durduğu şeridin rengi. | renk (saydamlıkla; boş = varsayılan) | `renkler.menu_seridi` |
| **Karartma** | Menü açıkken oyunun üstüne çekilen perde (genelde yarı saydam siyah). | renk (saydamlıkla; boş = varsayılan) | `renkler.karartma` |
| **Pasif** | Seçilemeyen (henüz açılmamış) menü satırları. | renk (saydamlıkla; boş = varsayılan) | `renkler.pasif` |

#### Yazı tipleri, logo ve müzik

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Büyük yazı tipi** | Başlıklar ve menü seçenekleri. Boşsa motorun yazı tipi. | Unreal yolu | `yazi_tipleri.buyuk` |
| **Orta yazı tipi** | Açıklamalar ve ekrandaki küçük yazılar. Boşsa motorun yazı tipi. | Unreal yolu | `yazi_tipleri.orta` |
| **Logo** | Ana menüde oyunun adının yerine görünen resim (doku). Boşsa ad yazıyla çıkar. | Unreal yolu | `logo` |
| **Menü müziği** | Ana menüde dönen müzik. Boşsa menü sessiz. | Unreal yolu | `menu_muzigi` |

#### Ana menü sahnesi

Ana menüde arkada duran karakterin ışığı.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Işığa göre duruş açısı** | Karakter güneşe (gece aya) dönük durur; yüzü ile ışık arasındaki açı. 0 = ışık tam karşıdan, düz; büyüdükçe yüzde gölge artar. | sayı (°) | `menu_sahnesi.gunese_aci` |
| **Dolgu ışığı** | Kameranın yanındaki gölgesiz yumuşak ışık; yüzdeki koyu gölgeleri açar. 0 = kapalı. | sayı (kandela) | `menu_sahnesi.dolgu_isigi` |

### Yankı → Ayarlar (`yanki/icerik/yanki.json` → `ayarlar`)

Dünya birimi: ekran yüksekliği 1000. Biçimin tek kaynağı `yanki/icerik/BICIM.md`.

#### Uçuş

Yarasanın hissi: ne kadar çabuk düştüğü, kanat çırpınca ne kadar yükseldiği, ne kadar hızlı ilerlediği.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Yerçekimi** | Yarasayı aşağı çeken güç. Büyük = daha çabuk düşer, daha sık kanat çırpmak gerekir. | sayı (birim/sn²) | `ayarlar.yercekimi` |
| **Kanat gücü** | Kanat çırpınca yukarı fırlama hızı. Büyük = bir çırpışta daha çok yükselir. | sayı (birim/sn) | `ayarlar.kanatGucu` |
| **En hızlı düşüş** | Düşme hızının üst sınırı. | sayı (birim/sn) | `ayarlar.enFazlaDusus` |
| **Yarasanın boyu** | Çarpışma yarıçapı. Büyük = duvarlara daha kolay çarpar. | sayı (birim) | `ayarlar.yarasaYaricap` |
| **Ekrandaki yeri** | Yarasanın ekranda soldan ne kadar içeride durduğu (0,3 = genişliğin üçte biri). Büyük = önünü daha az görür. | sayı 0–0.8 | `ayarlar.yarasaKonumu` |
| **Başlangıç hızı** | İleri uçuş hızı. | sayı (birim/sn) | `ayarlar.hiz` |
| **Hız artışı** | Her 1000 birim yolda hızın ne kadar arttığı. | sayı (/1000 birim) | `ayarlar.hizArtisi` |
| **En yüksek hız** | Hızın üst sınırı. | sayı (birim/sn) | `ayarlar.enFazlaHiz` |
| **Yeniden başlama beklemesi** | Çarpınca ya da bölüm bitince dokunuşun kabul edilmesine kadar geçen süre (yanlışlıkla hemen başlamasın). | sayı (sn) | `ayarlar.yenidenBaslamaBeklemesi` |

#### Yankı (sonar)

Dokununca küçük, basılı tutunca büyük yankı çıkar; yankı değen duvar bir süre parlar ve söner. Önü kör: yankı değmeyen hiçbir şey görünmez.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Küçük yankı: hız** | Dalganın yayılma hızı. | sayı (birim/sn) | `ayarlar.kucukSonar.hiz` |
| **Küçük yankı: menzil** | Dalganın ulaştığı en uzak mesafe. | sayı (birim) | `ayarlar.kucukSonar.menzil` |
| **Küçük yankı: parlaklık** | Değdiği yeri ne kadar parlattığı (0–1). | sayı 0–1 | `ayarlar.kucukSonar.guc` |
| **Büyük yankı: hız** | Büyük dalganın yayılma hızı. | sayı (birim/sn) | `ayarlar.buyukSonar.hiz` |
| **Büyük yankı: menzil** | Büyük dalganın ulaştığı en uzak mesafe. | sayı (birim) | `ayarlar.buyukSonar.menzil` |
| **Büyük yankı: parlaklık** | Büyük dalganın parlaklığı (0–1). | sayı 0–1 | `ayarlar.buyukSonar.guc` |
| **Basılı tutma süresi** | Bu kadar basılı tutunca büyük yankı çıkar. | sayı (sn) | `ayarlar.buyukSonarEsigi` |
| **Büyük yankı dolum hızı** | Enerjinin saniyede dolan payı (1 = dolu). 0,2 → 5 saniyede bir büyük yankı. | sayı (/sn) | `ayarlar.enerjiDolumu` |
| **Görünme süresi** | Yankı değen duvarın ne kadar sürede söndüğü. Büyük = daha uzun görünür, oyun kolaylaşır. | sayı (sn) | `ayarlar.sonmeSuresi` |
| **Belirme süresi** | Duvarın parlamaya geçişi (küçük = anında, büyük = yumuşak). | sayı (sn) | `ayarlar.belirmeSuresi` |
| **Dalga kalınlığı** | Yankı halkasının duvara değme kalınlığı. | sayı (birim) | `ayarlar.dalgaKalinligi` |
| **Duvar ışığı aralığı** | Duvar ışığının hesaplandığı aralık. Küçük = daha akıcı ama telefonu daha çok yorar (10 önerilir). | sayı (birim), en az 4 | `ayarlar.ornekAraligi` |

#### Ateş böcekleri

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Puanı** | Bir ateş böceğinin puanı. | sayı | `ayarlar.bocekPuani` |
| **Toplama yakınlığı** | Yarasa bu kadar yaklaşınca böcek toplanır. | sayı (birim) | `ayarlar.bocekYaricap` |
| **Aralık (sonsuz mağara)** | Sonsuz mağarada iki ateş böceği arasındaki yol. Bölümlerde böcekler elle konur. | En az, En çok (birim) | `ayarlar.bocekAraligi` |

#### Örümcek ağı ve su damlası

Öldürmeyen tehlikeler. Bölümlerde elle konur; sonsuz mağarada aşağıdaki aralıkla üretilir.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Ağın büyüklüğü** | Örümcek ağının yarıçapı. | sayı (birim) | `ayarlar.agYaricap` |
| **Ağ: etki süresi** | Ağa takılınca etkinin sürmesi. | sayı (sn) | `ayarlar.agSuresi` |
| **Ağ: kanat gücü** | Ağdayken kanat gücü bu oranla çarpılır (0,72 = %28 zayıf). | sayı (×) 0–1 | `ayarlar.agKanatCarpani` |
| **Ağ: ilerleme** | Ağdayken ilerleme hızı bu oranla çarpılır. | sayı (×) 0–1 | `ayarlar.agHizCarpani` |
| **Damlanın büyüklüğü** | Su damlasının yarıçapı. | sayı (birim) | `ayarlar.damlaYaricap` |
| **Damla: kopma mesafesi** | Yarasa bu kadar yaklaşınca damla tavandan kopar. | sayı (birim) | `ayarlar.damlaDusmeMesafesi` |
| **Damla: ıslaklık süresi** | Islanınca ağırlaşmanın sürmesi. | sayı (sn) | `ayarlar.damlaSuresi` |
| **Damla: ağırlaşma** | Islakken yerçekimi bu oranla çarpılır (1,3 = %30 ağır). | sayı (×) | `ayarlar.damlaYercekimiCarpani` |
| **Başladığı yer (sonsuz mağara)** | Sonsuz mağarada ağ ve damlaların başladığı yol. | sayı (birim) | `ayarlar.tehlikeBaslangic` |
| **Aralık (sonsuz mağara)** | İki tehlike arasındaki yol. | En az, En çok (birim) | `ayarlar.tehlikeAraligi` |

#### Sonsuz mağara

Yalnız rastgele (sonsuz) mağarayı etkiler: genişlik, daralma ve sarkıt/dikit üretimi. El yapımı bölümlerin duvarı ve sivrileri elle çizilir.

| Alan | Ne işe yarar | Tür / birim | Dosyadaki adı |
|---|---|---|---|
| **Başlangıç genişliği** | Mağaranın ilk geçit yüksekliği (ekran 1000). | sayı (birim) | `ayarlar.bosluk` |
| **En dar hâli** | Mağara bundan daha fazla daralmaz. | sayı (birim) | `ayarlar.enDarBosluk` |
| **Daralma** | Her 1000 birim yolda ne kadar daraldığı. | sayı (/1000 birim) | `ayarlar.daralma` |
| **Güvenli başlangıç** | İlk bu kadar yol düz ve geniş. | sayı (birim) | `ayarlar.guvenliBaslangic` |
| **Isınma** | Zorluğun yavaş yavaş arttığı ilk yol (yumuşak başlangıç). | sayı (birim) | `ayarlar.isinma` |
| **Sivriler: başladığı yer** | Sarkıt ve dikitlerin başladığı yol. | sayı (birim) | `ayarlar.sivriBaslangic` |
| **Sivriler: aralık** | İki sivri arası (ilerledikçe %40'a kadar sıklaşır). | En az, En çok (birim) | `ayarlar.sivriAraligi` |
| **Sivriler: boy** | Duvardan uca uzunluk. | En az, En çok (birim) | `ayarlar.sivriBoyu` |
| **Sivriler: taban** | Taban genişliği. | En az, En çok (birim) | `ayarlar.sivriTaban` |
| **Sivriler: en dar geçit** | Sivrinin yanında her zaman kalan boşluk. | sayı (birim) | `ayarlar.sivriGecit` |

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

## 8. Genel → Arayüz: Yapımcılar ekranı

Renkler, yazı tipleri, logo, müzik ve ana menü ışığı 1. bölümün sonundaki "Genel → Arayüz" tablolarında.

| Alan | Ne işe yarar |
|---|---|
| **Bölüm başlığı** | Yapımcılar ekranındaki bir başlık (ör. "Animasyonlar"). Oklarla sıralanır, çöp kutusuyla silinir. |
| **Satır: sol sütun** | İş ya da eser (ör. "Unreal Engine 5"). |
| **Satır: sağ sütun** | Kişi ya da kaynak (ör. "Epic Games"). Boşsa satır tek sütun yazılır. Dosyada iki sütun `Sol \| Sağ` olarak saklanır. |

## 9. Yankı → Bölümler (yandan görünüşlü düzenleyici)

Ayarlar 1. bölümün sonundaki "Yankı → Ayarlar" tablolarında. Dünya birimi: ekran yüksekliği 1000 (0 = tavanın en üstü, 1000 = en alt);
x yol boyunca, 0 başlangıç.

| Alan / nesne | Ne işe yarar |
|---|---|
| **Ad** | Oyunun menüsünde ve bölüm sırasında görünen ad. |
| **Kimlik** | Değişmeyen ad (küçük harf, rakam, `_`). Oyuncunun en iyi süresi bu kimlikle saklanır; değiştirirsen eski süre görünmez. |
| **Açıklama** | Menüde düğmenin üstüne gelince görünen kısa yazı (isteğe bağlı). |
| **Uzunluk** | Yarasa bu noktaya varınca "Bölüm bitti". Düzenleyicide yeşil kesik çizgiyi sürükleyerek de değişir. |
| **Duvar: noktalı** | Mağaranın tavanı ve tabanı noktalardan çizilir; noktalar arası yumuşak eğriyle birleşir. Her nokta iki karedir (tavan ve taban); sürükleyince ikisi aynı x'te kalır. **+** aracıyla nokta eklenir, seçili kart çöp kutusuyla silinir (en az 2 nokta). |
| **Duvar: tohumlu** | Duvar oyunun rastgele mağarasının bu sayıyla üretilen (hep aynı) hâlidir. "Noktalara çevir" onu noktalı duvara çevirir: artık elle düzeltilebilir. |
| **Sarkıt / Dikit** | Tavandan / tabandan uzayan sivri kaya; çarpınca oyun biter. **Yer (x)**, **Boy** (duvardan uca; seçiliyken uçtaki beyaz noktayı çekerek de), **Taban** (genişlik), **Yönü**. |
| **Örümcek ağı** | Takılınca kanat zayıflar, biraz yavaşlarsın (süre ve güç Ayarlar'da). **Yer (x)**, **Yükseklik (y)** (boşsa geçidin ortası). |
| **Su damlası** | Tavana asılı; yarasa yaklaşınca kopar, değerse ağırlaşırsın. Yalnız **Yer (x)**. |
| **Ateş böceği** | Toplanınca puan. **Yer (x)**, **Yükseklik (y)** (boşsa geçidin ortası). |
| **Kırmızı bölge** | Sivriler dahil geçidin 150 birimden dar olduğu yer: yarasa buradan geçemez. Üstte "Her yerden geçilebilir" yazmalı. |

Bölüm listesinde oklarla sıralanır (oyunun menüsündeki sıra), çoğaltılır, silinir. **Oyna** kaydedilmiş Yanki.html'i tarayıcıda açar.

## 10. Kroki (haritanın kuşbakışı çizimi)

Kişiler, Eşyalar, Sandıklar ve Mekânlar sekmelerinin üstünde durur. Fare tekerleği yakınlaştırır, boş yeri sürüklemek kaydırır,
**Sığdır** her şeyi gösterir, **Yakın görünüm** kalabalık bölgeye odaklanır. Yalnız açık sekmenin nesneleri tutulup sürüklenebilir;
diğerleri soluk görünür. Büyük oyunlarda haritanın uzak bitişi okla belirtilir.
