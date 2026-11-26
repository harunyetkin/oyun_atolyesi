# Yankı — Yapılacaklar

Her madde yaklaşık bir gecelik çalışmadır. Sıra önemlidir; üstten başla.

## Sırada
- [ ] **Ayarlar ekranı** (menüden ve duraklat ekranından): ses efektleri ve müzik ayrı ses düzeyi, titreşim aç/kapa, dokunma
      hassasiyeti (basılı tutma süresi), sol/sağ el yerleşimi; tercihler saklanır. ("Ayarlar: titreşimi kapatma" maddesi bunun içinde.)
- [ ] **İlk açılış öğreticisi:** ilk oyunda 3 kısa adım (dokun = kanat + yankı, basılı tut = büyük yankı, ateş böceği topla);
      ayarlardan yeniden izlenebilir.
- [ ] Harun'un telefonda deneme geri bildirimine göre his ayarı (kanat gücü, yerçekimi, mağara genişliği, yankının görünme süresi,
      sarkıt/dikit sıklığı). Geri bildirim gelene kadar bu madde bekler; sıradakine geç.
- [ ] Yankıyı yutan yosun bölgeleri (o bölgede duvarlar görünmez).
- [ ] Bölüm sistemi: Mor → Buz → Lav (renk, ses, fizik farkı) — Harun'un onayından sonra.
- [ ] Yol ayrımları — Harun'un onayından sonra.

## Mobil oyunda olması gerekenler (Harun'un sürekli görevi, 2026-11-25)
Harun'un isteği: "mobil bir oyunda olması gereken her şeyi zamanla buraya ekleyerek geliştirmeye devam et". Sıradaki işler bittikçe
bu listeden en üste alınır; yeni fikirler buraya eklenir. **Mağazaya yükleme yok:** oyun bütün testlerden geçip Harun onaylamadan
Google Play / App Store'a gönderilmez (hesaplar henüz açılmadı; açmak ve ödemek Harun'un kararı).
- [ ] **Uygulama kabuğu ve otomatik paket (Harun'un onayı 2026-11-25):** Capacitor ile Android ve iOS kabuğu (`yanki/uygulama/`);
      GitHub Actions her sürümde Android `.apk` (telefona doğrudan kurulur) + `.aab` (Play Store) ve iOS derlemesi (macOS makinesi) üretir,
      Release'e koyar. İmza anahtarları Harun'un: GitHub sitesinde "Secrets"e nasıl ekleneceği adım adım yazılır; anahtar yokken imzasız deneme paketi.
- [ ] **Uygulama içine özgü özellikler** (Apple'ın "yalnız web sitesi" reddine karşı): yerel titreşim (Haptics), çentik/güvenli alan
      kenar boşlukları, durum çubuğunu gizleme, ekran yönünü kilitleme, geri tuşu (Android) → duraklat/menü.
- [ ] **Açılış ekranı (splash) ve uygulama simgeleri** bütün boyutlarda; mağaza görselleri (ekran görüntüleri, öne çıkan görsel) — yüklemeden önce.
- [ ] **Gizlilik politikası sayfası** (oyun veri toplamaz; GitHub Pages'te tek sayfa) ve mağaza açıklama metinleri (TR + EN).
- [ ] **İlerleme kaydı:** açılan bölümler, en iyi süre/skor, toplam ateş böceği; uygulama silinmedikçe kalır.
- [ ] **Başarımlar** (ör. "ilk 1000 birim", "hiç büyük yankı kullanmadan 2000") ve istatistik ekranı.
- [ ] **Müzik:** kodla üretilen sakin mağara ambiyansı, bölüme göre değişen; ayrı ses düzeyi.
- [ ] **Dil seçeneği:** Türkçe + İngilizce (yazılar tek dosyada).
- [ ] **Erişilebilirlik:** renk körlüğüne uygun renkler, büyük yazı seçeneği, titreşimle yankı ipucu.
- [ ] **Pil ve hız:** düşük güç kipi (30 kare/sn), eski telefonlarda otomatik düşük kalite; kare süresi ölçümü testte.
- [ ] **Kesintiler:** telefon çağrısı / bildirim / ekran kilidinde otomatik duraklat ve kaldığı yerden devam (bugünkü arka plan duraklatmasının uygulamadaki karşılığı).
- [ ] **Tam test listesi (yüklemeden önce şart):** gerçek Android ve iPhone'da deneme listesi, farklı ekran boyutları, çevrimdışı, ses kapalı/açık,
      uzun oyun (bellek), Harun'un onayı. Play'in kapalı test kuralı (12 test kullanıcısı, 14 gün) planlanır.

## Küçük iyileştirmeler
- [ ] Çarpınca kısa ekran sarsıntısı ve yarasanın dönerek düşmesi
- [ ] Ateş böceği alınca küçük ışık patlaması ve "+5" yazısı
- [ ] Yatay ekranda menü yazılarının yerleşimi

## Tamamlandı
- [x] 2026-11-27 (gece) — **Atölye'den düzenlenebilir içerik ve el yapımı bölümler (Harun'un kararı 25.11):** `icerik/yanki.json` (sürüm 1:
      bütün ayarlar + bölümler) ve `icerik/BICIM.md`; oyun içeriği gömülü → `icerik.json` → varsayılan sırasıyla okur, hatalı alanı atlar.
      Menüde **Sonsuz mağara** ve bölüm listesi (en iyi süre); bölümde noktalı ya da tohumlu duvar, yalnız listedeki sivri/tehlike/böcek,
      yankıyla görünen çıkış, ilerleme çubuğu, "Bölüm bitti" ekranı (süre, böcek, puan, en iyi süre), Tekrar/Menü; duraklatmada Menü.
      3 ÖRNEK bölüm. Geçit denetimi (Atölye için). Testler: 29 birim (pilot her bölümü bitiriyor) + 69 oynanış kontrolü (Yanki.html dahil).
- [x] 2026-11-25 (gece) — **Ölümcül olmayan tehlikeler:** örümcek ağı (kanat gücü ×0,72 ve ilerleme ×0,8, 2,2 sn) ve su damlası
      (yarasa 330 birim yaklaşınca tavandan kopar; değerse yerçekimi ×1,3, 4 sn). 3600'den sonra, sivrilerin dibine konmaz; yalnız yankı
      ya da yarasa ışığıyla görünür (`Tehlike.isik`). Uçan yazı ("Ağa takıldın!", "Islandın!"), yarasanın üstünde ağ telleri/damlacıklar,
      altta kalan süre göstergesi, ses ve kısa titreşim. Testler: 18 birim + 56 oynanış kontrolü.
- [x] 2026-11-23 (gece) — **Yumuşak başlangıç, duraklat, sarkıt ve dikitler:** zorluk (hızlanma ve daralma) ilk ~6000 birimde
      `isinmaEgrisi` ile yavaş artıyor, kıvrım 3000 birimde tamamlanıyor. Duraklat düğmesi (sol üst), "Duraklatıldı / devam için
      dokun" ekranı, "Yeniden başla"; Esc/P; arka plana geçince kendiliğinden duraklıyor. Sarkıt/dikitler (`sivriler`): 2500'den
      sonra, yanında en az 230 birim geçit, yalnız yankı ya da yarasa ışığıyla görünüyor, çarpışma üçgen içinde nokta testiyle;
      ateş böcekleri sivrilerin içine düşmüyor (`serbestAralik`). Testler: 15 birim + 54 oynanış kontrolü.
- [x] 2026-11-21 (gece) — **Geniş ekran ve akıcı mağara (Harun'un geri bildirimi):** oyun alanı her ekran oranında ortalanıp
      ölçekleniyor (dünya genişliği sınırı 1900 → 3200; dışında kalan yerler koyu), her karede bütün tuval temizleniyor
      (sağdaki iz/leke sorunu). Duvar ışığı: yankı değince hedef yükselir, görünen parlaklık 0,09 sn'de yumuşakça yükselir
      (`isik` artık 4 değer), 7 örnekli yumuşatma (`Oyun.parlaklik`), 40 basamak ve 6 ince kat; yarasa ışığının kenarı yumuşak.
      Testler: 11 birim testi (yan yana dilimler arası sıçrama < 0,12) + 44 oynanış kontrolü (1916×939, 2560×1080, 1024×768,
      360×900 ekranlar; tuvalin tamamen yeniden çizildiği denetleniyor).
- [x] 2026-11-19 (gece) — **İlk oynanabilir sürüm (v0.1):** `yanki/` kuruldu (CLAUDE.md, PLAN, günlük). Karanlık mağara,
      yarasa, dokun = kanat + yankı, basılı tut = büyük yankı, duvar ışığı ve sönmesi, ateş böcekleri, skor ve rekor,
      çarpma ve yeniden başlama, sesler, titreşim, ses düğmesi, uygulama simgesi, çevrimdışı çalışma.
      10 birim testi + telefon öykünmeli 31 oynanış kontrolü.
