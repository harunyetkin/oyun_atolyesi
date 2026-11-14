# Oyun Atölyesi — Plan

## Amaç
Genel amaçlı, kod gerektirmeyen bir **2D oyun yapım ortamı**. Ölçüt şu:
Yankı'yı hiç görmemiş biri, bu araçla **kod yazmadan, sıfırdan** Yankı'nın birebir aynısını
yapabilmeli. Arayüz güçlü ve modern olmalı (Godot/Figma tarzı koyu tema, paneller).

Yapı taşları: nesneler ve bileşenler (görünüm, fizik, çarpışma, ışık), hazır davranışlar,
**olay kuralları** ("ne zaman → ne olsun", GDevelop/Construct'taki olay sayfası fikri),
değişkenler, dünya üretici (tünel, parça, yol ayrımı), bölümler, efektler (ışık/karanlık,
parçacık, sarsıntı), ses üretici, arayüz (HUD) editörü, sürümler, dışa aktarma.

Sohbet şimdilik claude.ai üzerinden yürür; uygulama içi yapay zekâ sonra eklenebilir.

## Aşamalar ve kabul testleri
Her aşama, sonundaki oyun araçta **sıfırdan ve kodsuz** kurulabildiğinde biter. Kabul testi
olarak kurulan oyun `ornekler/` altına proje olarak kaydedilir ve otomatik testle oynatılır.

1. **Çekirdek** — modern arayüz iskeleti, proje formatı v2, sahne editörü (sürükle-bırak,
   seç, taşı, yakınlaştır), nesne türleri ve örnekleri, özellik paneli, motor çekirdeği
   (döngü, fizik, çarpışma), oynat/durdur, ilk hazır davranışlar, geri al/yinele.
2. **Kurallar** — olay kuralları sayfası (koşullar + eylemler), değişkenler, skor/yazı arayüzü,
   rastgele nesne üretici (spawner), kamera takibi/kaydırma, yeniden başlatma, rekor kaydı.
   *Kabul: Kanat Çırp.*
3. **Dünya ve efektler** — tünel/mağara üretici, karanlık ve ışık kaynakları, parçacık
   sistemi, ekran sarsıntısı, çarpışma etkileri (geçici yavaşlatma vb.).
   *Kabul: Yankı ilk sürüm (sonar, ateş böcekleri).*
4. **Derinlik** — basılı tutma ve zamanlayıcı koşulları, çubuk (bar) arayüz öğesi, bölümler
   ve renk geçişleri, yol ayrımı parçaları, ses üretici.
   *Kabul: Yankı son hal (büyük sonar, ölümcül olmayan tehlikeler, Mor/Buz/Lav, yol ayrımları).*
5. **Paylaşım ve tasarım** — oyunu .exe/HTML dışa aktarma, şablon kütüphanesi, piksel çizim
   editörü, resim yükleme.

## Notlar
- v0.1 (yarasa türüne özel ayar paneli) yeni çekirdek gelince `eski_v01/` altına taşınır.
