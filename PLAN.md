# Oyun Atölyesi — Plan

## Ana yön (2026-11-15, Harun'un kararı)
Oyun Atölyesi'nin asıl amacı, Harun'un **3D hikâye oyununun** (`harunyetkin/hikaye_oyun`, Godot)
içeriğini, oyun belli bir olgunluğa geldikten sonra **kod yazmadan düzenleyebilmek**: karakter
ekleme, görsel/grafik tasarım, harita tasarımı, hikâye/diyalog, eşyalar ve görevler.
İki proje birbirini kapsar: **oyunda yapılmak istenen her değişiklik araçta da yapılabilir olmalı.**
Bu yüzden araç geniş kapsamlı ve detaylı olmalı.

Nasıl bağlanırlar (mimari karar, Claude):
- Oyun **veri odaklı** yapılır: karakterler, haritalardaki nesne yerleşimleri, diyaloglar, görevler,
  eşyalar, ışık/ortam ayarları oyunun `icerik/` klasöründe okunabilir dosyalarda (JSON) durur;
  3D modeller ve dokular `varliklar/` altında glTF/PNG olarak. Godot oyunu bunları açılışta okur.
- Araç bu `icerik/` klasörünü açar, düzenler ve kaydeder. 3D önizleme için araçta oyunla aynı
  glTF modelleri gösteren bir 3D görünüm olur (three.js). "Oyunda dene" düğmesi oyunu o haritadan başlatır.
- İçerik biçiminin tek kaynağı oyundaki `icerik/BICIM.md` belgesidir; iki taraf da ona uyar.
  Biçim değişince araçta göç fonksiyonu yazılır.
- Mevcut 2D çekirdek (paneller, özellikler, olay kuralları, değişkenler, sürümler) boşa gitmez:
  aynı editör kabuğu 3D harita ve içerik editörlerine de hizmet eder.
- 2D oyun hedefi (Kanat Çırp / Yankı kabul testleri) **ertelendi, silinmedi**: önce 3D oyun içerik
  editörü, sonra fırsat buldukça 2D.

Genel amaçlı, kod gerektirmeyen bir **2D oyun yapım ortamı**. Ölçüt şu:
Yankı'yı hiç görmemiş biri, bu araçla **kod yazmadan, sıfırdan** Yankı'nın birebir aynısını
yapabilmeli. Arayüz güçlü ve modern olmalı (Godot/Figma tarzı koyu tema, paneller).

Yapı taşları: nesneler ve bileşenler (görünüm, fizik, çarpışma, ışık), hazır davranışlar,
**olay kuralları** ("ne zaman → ne olsun", GDevelop/Construct'taki olay sayfası fikri),
değişkenler, dünya üretici (tünel, parça, yol ayrımı), bölümler, efektler (ışık/karanlık,
parçacık, sarsıntı), ses üretici, arayüz (HUD) editörü, sürümler, dışa aktarma.

Sohbet şimdilik claude.ai üzerinden yürür; uygulama içi yapay zekâ sonra eklenebilir.

## Aşamalar (yeni sıra)
1. **Çekirdek** (devam ediyor) — editör kabuğu, motor, sahne düzenleme, geri al/yinele.
2. **3D görünüm** — three.js 3D sahne: yörünge kamerası, ızgara zemin, glTF model yükleme, seçme,
   taşı/döndür/ölçekle tutamaçları (gizmo), ışık ve gökyüzü önizlemesi.
3. **Oyun projesine bağlanma** — Godot oyun klasörünü seçme, `icerik/` okuma/yazma, varlık
   tarayıcısında oyunun modelleri/dokuları, "Oyunda dene".
   *Kabul: oyunun ilk haritasını araçta açıp bir nesne ekle, kaydet, oyunda gör.*
4. **İçerik editörleri** — karakter editörü (model, görünüm, özellikler, davranış), harita editörü
   (yerleştirme, boyama, arazi), diyalog/hikâye ağacı editörü, eşya ve görev editörleri.
   Oyuna eklenen her yeni içerik türü için araçta karşılığı.
5. **Derinlik** — malzeme/renk tasarımı, ışık ve atmosfer ayarı, ara sahneler, ses.
6. **2D hattı** (ertelendi) — aşağıdaki eski aşamalar.

## Eski 2D aşamaları ve kabul testleri (ertelendi)
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
