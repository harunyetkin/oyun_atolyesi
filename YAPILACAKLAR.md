# Yapılacaklar

Her madde yaklaşık bir günlük çalışmadır. Sıra önemlidir; üstten başla.

> Not (2026-11-15): Oyun Unreal Engine 5.8'e geçti (`hikaye_oyun/unreal`). İçerik biçimi aynı (`icerik/*.json`, BICIM.md); araç yine bu dosyaları düzenler. Godot'ya özel alanları (ör. `tur: mh` görünüm parçaları) yeni iş olarak ekleme; MetaHuman görünüm alanları BICIM.md'ye eklenince araca taşı.

## Sırada
- [ ] Yankı düzenleyicisi, ikinci adım: bölümde **"buradan oyna"** (seçili bölümü doğrudan açan bağlantı; Yankı'nın `?bolum=` desteği gerekir
      → Yankı gecesine not), düzenleyicide **önizleme** (yarasanın yolunu otomatik pilotla çizmek), birden çok nesneyi seçip taşıma,
      Delete tuşuyla silme.
- [ ] Oyunun yeni alanları, kalanlar: karakterler.json **`secilebilir_govdeler`** (ana menüdeki karakter seçimi: ad, beden, puanlar,
      `unreal_ekipman[]`: `karisim`, `sarkac`, `dusunce_birak`…), yeni dosya **`modeller.json`** (model çarpışma silindirleri; okunur liste + düzenleme).
- [ ] **(Harun'un hedefi 2026-11-25: oynanış testinde her değişikliği Atölye'den yapmak)** Unreal seviyesine elle konmuş binaları ve
      dekoru Atölye'den taşıyabilmek: oyunun bunlar için bir "yer düzeltmesi" listesi okuması gerekir (oyun tarafı işi; oyun sohbetinde
      yapılacak, sonra Atölye'de krokide sürükleme). Ayrıca isteğe bağlı: oyun açıkken kaydedileni beklemeden yansıtma (canlı yenileme).
- [ ] Dekor nesneleri (`nesneler`) düzenleyicisi: liste + krokide sürükleme; nesnede `zemine_oturt`, `"carpisma": "yok"`, `grup`,
      `oturak` (yön, derinlik, `tasinir`), `aktor`. (Köy meydanında şimdilik 0 nesne; dekor Unreal seviyesinde.)
- [ ] Diyalog seçeneğinde `esya_ver` — konuşma ağacı düzenleyicisiyle birlikte (Aşama 4).
- [ ] Oyun içeriği ekranında **kapı seçimleri**: soru, kapılar (etiket, renk, puan, ödül, mesaj); krokide kapı çizgisini sürükleme
(Aşama 2 — 3D görünüm)
- [ ] Merkezde "3D Harita" sekmesi: three.js (npm paketi, lockfile commit), yörünge kamerası
      (sağ tık döndür, orta tık kaydır, tekerlek yakınlaştır), ızgara zemin, eksen göstergesi
- [ ] glTF/GLB model yükleme ve varlık tarayıcısında 3D küçük resim
- [ ] 3D seçme ve taşı/döndür/ölçekle tutamaçları; özellik panelinde 3D dönüşüm
      (2D'deki geri al/yinele, çoklu seçim ve hizalama altyapısını kullan)
- [ ] Ortam: güneş ışığı yönü, gökyüzü rengi/HDR, sis önizlemesi
- [ ] Oyunun `icerik/BICIM.md` biçimine göre 3D harita proje tipi (oyun tarafı biçimi yazınca)

## Küçük iyileştirmeler (fırsat buldukça)
- [ ] Kopyala / yapıştır (Ctrl+C / Ctrl+V), sahneler arası da çalışsın
- [ ] Geri al geçmişini Düzen menüsünde adım adım listeleme ("Geçmiş" paneli)
- [ ] Mıknatıs açıkken boyutlandırma ve döndürmede de ızgaraya yapışma

## Oyunun içerik türleri (hikaye_oyun/icerik/BICIM.md sürüm 1) — Aşama 3–4'te karşılıkları
Oyun 2026-11-15'te bu içerik türleriyle oynanabilir oldu; araçta her biri için düzenleyici gerekecek:
- [ ] Ölçekler (`oyun.json` → `olcekler`): ekle/sil/adlandır
- [ ] Karakter oluşturma (biçim sürüm 3, oyundaki `icerik/BICIM.md`): `temel_erkek`/`temel_kadin`, kategoriler/sekmeler,
      kaydırıcılar (`gosterim`: yil/cm/kg/yuzde, `sol`/`sag` uç yazıları), seçimler (cinsiyete göre süzme, puanlar,
      `bos_olabilir`), renk listeleri, sorular (adimlar) ve puanları; parça listesi oyundaki
      `varliklar/insanlar_mh/bilgi.json`'dan; görünüm alanları yas_yil, boy_cm, kilo_kg, cilt, sakal, sakal_rengi,
      ust/alt/takim, gozluk; 3D önizlemede MakeHuman karakteri; sürüm 2 dosyaları için göç
- [ ] Harita: ortam (gökyüzü, güneş, sis), yol, başlangıç/bitiş, dekor yerleştirme (3D görünümde)
- [x] Kişiler (NPC): dolaşma alanı (krokide sürüklenir), hız, bağlı konuşma — 2026-11-17 yapıldı (görünüm: MetaHuman bedeni yolu)
- [ ] Kapı seçimleri: konum, soru, kapılar (etiket, renk, puan, ödül, mesaj)
- [ ] Konuşma ağacı düzenleyici: düğümler ve seçenekler, puanlar, ödüller (düğüm grafiği görünümü)
- [ ] Puan önizleme: bir haritadaki bütün kararların hangi ölçeklere ne verdiğini tek tabloda gösterme

## Daha sonra (Aşama 3 — Oyun projesine bağlanma)
- [x] Oyun klasörünü seçme (atolye.py, yol güvenliği), `icerik/` okuma/yazma — 2026-11-16 yapıldı
- [ ] Oyunun varlıklarını (modeller, dokular, Unreal yolları) listeleme ve seçici pencere
- [ ] "Oyunda dene": oyunu seçili haritadan başlatma
- [ ] Kabul: oyunun ilk haritasını araçta aç, nesne ekle, kaydet, oyunda gör

## Ertelenen (2D hattı — Kurallar)
- [ ] Olay kuralları sayfasını düzenlenebilir yap (koşul/eylem seçici pencereleri, sürükle-bırak sıralama, gruplar)
- [ ] Koşullar: tuşa basıldı/basılı/bırakıldı, çarpıştı (etiketle), değişken karşılaştır, her X saniyede, sahne başladı
- [ ] Eylemler: değişkeni değiştir, nesne oluştur/yok et, özellik değiştir, oyunu bitir/yeniden başlat, yazı göster
- [ ] Kuralları motorda çalıştır; oynatırken tetiklenen kuralı vurgula
- [ ] Değişkenleri oynatırken canlı göster; kalıcı değişkenler (rekor)
- [ ] Arayüz (HUD) düzenleyici: yazı öğesi, değişkene bağlama
- [ ] Rastgele üretici (spawner) davranışı ve kamera takibi/kaydırma
- [ ] Kabul testi: Kanat Çırp'ı araçta sıfırdan kur, `ornekler/kanat_cirp.json` olarak kaydet, otomatik testle oynat

## Tamamlandı
- [x] 2026-11-28 (gece) — **Yankı düzenleyicisi (Harun'un kararı 25.11):** başlangıçta "Yankı'yı düzenle"; `atolye.py` yanki_klasoru/oku/yaz/oyna
      (yedek, oyun/icerik.json, Yanki.html yenileme); Ayarlar sekmesi (5 kart, hepsi açıklamalı); Bölümler sekmesi: liste (sırala, çoğalt, sil, ekle)
      ve yandan görünüşlü düzenleyici (duvar noktaları, sarkıt/dikit, ağ, damla, böcek; tıkla-koy, sürükle, uçtan boy; dar yer kırmızı;
      tohumlu duvarı noktalara çevirme); Oyna. Testler: 53 birim + 160 arayüz + API.
- [x] 2026-11-26 (gece) — **arayuz.json düzenleyicisi** (renkler boş/saydam, yazı tipleri, logo, müzik, ana menü ışığı, yapımcılar) ve oyuncunun 59 yeni alanının şeması (bankta oturma, omuz kamerası, tekme, en uzak anlar, etkileşim bölümleri, 16 animasyon). (`tasarim/` klasörü oyunda artık yok; madde düştü.)
- [x] 2026-11-24 (gece) — **Mekânlar (v0.8):** Harita → **Mekânlar** sekmesi (`Mekanlar.tsx`): **kapılar ve geçişler** (yazı, kapının yeri,
      gidilen yer, bakış yönü; dönüş kapısına atlama; "kapı çifti ekle" giriş + dönüş, `gecisCiftiEkle`, `donusGecisi`), **iç mekânlar**
      (kimlik, ad, Unreal seviyesi, konum, açı, silme kutusu), **meşaleler** (direk/duvar, yer, yükseklik, yön; ortak ışık gücü ve erim),
      **zeminler** (merkez, boyut, yükseklik, renk, malzeme, karo), **görünmez duvarlar**, **ot serpilmeyen alanlar**; uyarılar
      (`mekanUyarilari`: dönüşü olmayan geçiş vb.). Kroki `mod="mekan"`: kapı, meşale, alan ve iç mekân sürüklenir; etkin olmayan
      katmanlar tıklamayı engellemez; yakın görünüm uzaktaki iç mekân kapılarını saymaz. 1 birim testi + 10 arayüz kontrolü.
- [x] 2026-11-22 (gece) — **Günlük program, gün-gece ve can (v0.7):** kişi kartında **Günlük program** (`program`: saat, iş, yer,
      yarıçap / bakış yönü; durak ekle/sil, saate göre sırala; krokide seçili kişinin durakları saatleriyle, sürüklenebilir),
      bakış yönü (`aci`), `grup`, **kişiye özel can** (`nitelikler`; boş kutuda ortak değer). Karakterler: oyuncunun **Can ve
      dayanıklılık** kartı (`oyuncu.nitelikler`), Kişiler sekmesinde **ortak can** kartı (`kisi_nitelikler`). Harita ayarları:
      **Unreal seviyesi** (`seviye_zemini`, `unreal_seviye`), **Gün ve gece** (`ortam.zaman.*`), **Pozlama** (`ortam.pozlama.*`,
      `yerel_isik_golgesi`). Kroki: yakınlaştırma (tekerlek, +/−), boş yeri sürükleyerek kaydırma, "yakın görünüm" (kalabalık
      bölge) ve "hepsini sığdır"; büyük haritada işaretler ve yazılar ölçekleniyor; `seviye_zemini` haritasında düz yol çizilmiyor.
      1 birim testi + 14 arayüz kontrolü (40 birim, 119 arayüz).
- [x] 2026-11-20 (gece) — **Sandıklar ve görevler (v0.6):** Harita → **Sandıklar** (`SandiklarGorevler.tsx`): kart (kimlik, ad, konum,
      açı, içindeki eşya: ad/açıklama/mesaj/puanlar; Unreal: `model_govde`, `model_kapak`, `unreal_on_duzeltme`, `kapak_mentesesi`,
      `kapak_ekseni`, `kapak_acisi`), krokide sürükleme (`mod="sandik"`), ekle/çoğalt/sil. Harita → **Görevler**: ad, açıklama, adımlar
      (metin, tür, haritadan hedef listesi `gorevHedefleri`, "herhangi biri"), yukarı/aşağı/sil/ekle; `gorevUyarilari`, `sandikUyarilari`.
      Kişi, eşya ve sandık kimliği değişince görev hedefleri izler (`gorevHedefiniYenile`). Kroki sınırları içerikten hesaplanıyor; uzak
      bitiş okla. Yeni ana harita `koy_meydani.json` ile duman testi. 4 birim testi + 13 arayüz kontrolü.
- [x] 2026-11-17 (gece) — **Haritadaki kişiler (v0.5):** Harita → **Kişiler** sekmesi (`src/oyun/Kisiler.tsx`): krokide dolaşma
      alanını taşıma (tutulan yerden) ve kenar tutamacıyla yarıçap, "yolda yürür" kişilerin yaya şeridi (uçları çekilir; Unreal cm alanları
      `serit_y`, `serit_x_min/max`); kart: kimlik (görev adımı ve karakterler.json `kisiler` kaydı da yeniden adlanır), ad, `davranis`
      (dolas/bekle/otur/yol), alan, `hiz` (0–3), `durma_mesafesi`, `diyalog` (dosya seçimi), `selamlasma`, `selamlar`, `savas_tavri`,
      `tepkiler` (carpma/itilme/vurulma), `unreal_govde`, Godot görünüm özeti; çoğalt/sil/ekle; **Kalabalık** kartı (`kalabalik` +
      `diyalog`); uyarılar (`npcUyarilari`). Ayrıca eşyada `aciklama`, ortamda `gunes_hareketi`/`gunes_en_alcak`, **Sesler** kartı
      (`sesler.*`, `darbe`), oyuncu animasyonlarında oturma/itme/darbe_alma/yere_dusme/yerden_kalkma, dövüşte `vurus_ani`.
      Giriş kutuları `girisler.tsx`'e, kroki `Kroki.tsx`'e ayrıldı. 2 birim testi + 20 arayüz kontrolü.
- [x] 2026-11-16 (gece) — **Oyun içeriği düzenleyicisi (v0.4):** atolye.py'de oyun klasörü seçme/hatırlama, `icerik/`
      okuma/yazma (yol güvenliği, kayıttan önce yedek, girinti ve son satır sonu korunur). Yeni "Oyun içeriği" ekranı
      (`src/oyun/`): karakterler.json (oyuncunun bütün ayarları şemadan, `kamera_gore_kontrol`, `serbest_donus_*`;
      şemada olmayan alanlar da "yeni" rozetiyle düzenlenebilir), `kisiler` (MetaHuman bedenleri, haritadan öneri),
      harita ayarları (`unreal_model_aci`, `ortam.unreal_zemin_klasoru/karo`, `yol.unreal_klasor/karo`, yol, ışık,
      başlangıç/bitiş), `esyalar` (kartlar, puanlar, elde duruşu, sürüklenebilir kroki), uyarılar, ayrı geri al/yinele,
      kaydetmeden çıkış onayı. Diyaloglar ve diğer dosyalar salt okunur. 10 birim testi + 27 arayüz kontrolü eklendi.
- [x] 2026-11-15 (gece) — **Sahne düzenleyici tamamlandı:** köşe tutamaçlarıyla boyutlandırma (karşı köşe
      sabit, Shift oranı korur), üst tutamaçla döndürme (araç seçmeden, Shift 15°), Shift+tık ve kutu
      seçimi, Ctrl+A / Esc, toplu taşı/sil/çoğalt, ok tuşlarıyla 1/10 px, Düzen → Hizala (6 hizalama +
      2 eşit dağıtma, Alt kısayolları, sağ panelde Hizala kartı). `depo/hizalama.ts` + 5 birim testi.
- [x] 2026-11-15 (gece) — **Geri al / yinele:** `degistir()` üzerinden 200 adımlık geçmiş; sürükleme,
      aynı yazı kutusuna yazma ve art arda ok tuşları tek adım; sürüm geri yükleme de geri alınabilir;
      araç çubuğunda düğmeler. "Aşama 1" rozetleri kaldırıldı.
- [x] 2026-11-15 (gece) — **Aşama 1 değerlendirmesi:** GUNLUK'ta haftalık inceleme ve ekran görüntüsü
      serisi, OZELLIKLER.md güncellendi. Arayüz testi 47 kontrol.
- [x] 2026-11-14 (gece) — **Motor çekirdeği:** `src/motor/` altında editörden bağımsız `Dunya` (sabit
      1/120 sn fizik adımı), fizik (yerçekimi, hız, en yüksek hız, sürtünme), daire/kutu çarpışma,
      katı nesnelerden itme ("yerde" bilgisi), çarpışma listesi (Aşama 2 "çarpıştı" koşulu için).
      Sahne.tsx'teki basit önizleme kaldırıldı; oynatma motoru kullanıyor. 20 birim testi.
- [x] 2026-11-14 (gece) — **Hazır davranışlar (kayıt sistemiyle):** tek dosyalık kalıp
      (`motor/davranislar/`), Tuşla zıpla/uç (11 tuş seçeneği + fare), Sabit hızla kay (4 yön),
      Ekrandan çıkınca yok ol (kenar payı). Özellik paneli ayarları tanımdan otomatik çiziyor.
      Görünüm > "Çarpışma alanlarını göster" (Ctrl+Shift+C). Oynarken W/E/R/H/V araç kısayolları kapalı.
- [x] 2026-11-14 — **Arayüz iskeleti (v0.2):** React + TypeScript + Vite (`arayuz/` → `app/`); v0.1
      `eski_v01/`'e taşındı. Menü çubuğu, araç çubuğu, boyutlandırılabilir/gizlenebilir paneller,
      sekmeler (Sahne/Olaylar/Arayüz; Varlıklar/Değişkenler/Konsol/Sürümler), durum çubuğu,
      başlangıç ekranı, komut paleti, ayarlar, proje ayarları, kısayollar, hakkında, bildirimler.
- [x] 2026-11-14 — **Proje formatı v2:** tipler (`src/depo/proje.ts`), v0.1 projelerini dönüştürme,
      yeni/aç/otomatik kaydet/sürümler; birim testleri.
- [x] 2026-11-14 — **Sahne görünümü:** ızgara, yakınlaştırma (tekerlek, düğmeler), kaydırma
      (el aracı, Boşluk+sürükle, orta tuş), sığdır, sahne çerçevesi, katman sırası/görünürlük/kilit.
- [x] 2026-11-14 — **Nesne yerleştirme (temel):** listeden sürükle-bırak / çift tık ile ekleme,
      tıklayarak seçme, taşı/döndür/ölçekle araçları, mıknatıs, sil, çoğalt.
- [x] 2026-11-14 — **Özellik paneli:** sahne, örnek (dönüşüm, katman) ve nesne türü (etiketler,
      Görünüm, Fizik, Çarpışma, Işık, Davranışlar) kartları; bileşen ekle/kaldır.
- [x] 2026-11-14 — v0.1: yarasa türüne özel ayar panelli ilk deneme (`eski_v01/`)
