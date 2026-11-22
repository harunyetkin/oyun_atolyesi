# Yankı — Plan

## Oyun nedir
Karanlık bir mağarada uçan bir yarasa. Mağara görünmez; yarasa **yankı** (sonar) gönderdikçe dalga duvarlara değer ve
duvarlar bir süre parlayıp söner. Oyuncu bu kısa görüntüyü aklında tutarak duvarlara çarpmadan ilerler.
Telefonda tek parmakla oynanır. (Kaynak: Oyun Atölyesi'nin PLAN.md'sindeki Yankı tarifi, `eski_v01/` yarasa
denemesi ve araçtaki "Karanlık Mağara" örneği; Harun'un kararıyla 2026-11-18'de sıfırdan, mobil web oyunu olarak başladı.)

## Temel kararlar
- **Biçim (Harun'un kararı):** telefonda tarayıcıda açılan web oyunu; ana ekrana eklenince uygulama gibi tam ekran açılır,
  internetsiz çalışır. Android ve iPhone'da aynı oyun. Mağaza ve ücret yok.
- **Ekran:** dikey telefon öncelikli; yatay ekranda ve bilgisayarda da oynanır (daha geniş görüş).
- **Kontrol:** dokun = kanat çırp + küçük yankı; basılı tut = büyük yankı (enerji ister, dolması ~5 sn).

## Aşamalar
1. **İlk oynanabilir sürüm** ✅ (2026-11-19): yarasa, karanlık mağara (her oyunda yeni, ilerledikçe daralan ve kıvrılan),
   dokununca kanat çırpma ve yankı, duvarların yankıyla görünmesi, büyük yankı, ateş böcekleri (+5), skor, rekor,
   çarpınca yeniden başlama, sesler, titreşim, ses düğmesi, çevrimdışı çalışma, uygulama simgesi.
2. **Telefonda yayın ve his ayarı:** GitHub Pages bağlantısı, Harun'un telefonda denemesi; zorluk eğrisi, yankının süresi,
   kanat gücü gibi ayarların Harun'un geri bildirimine göre ince ayarı; titreşim/ses ayarları; "duraklat" düğmesi ✅ (2026-11-23).
3. **Mağaranın içi (ÖNERİ):** sarkıt ve dikitler (çarpınca biter) ✅ (2026-11-23), **ölümcül olmayan tehlikeler**: örümcek ağı (yavaşlatır),
   su damlası (ağırlaştırır), yankıyı yutan yosun (o bölgede duvarlar görünmez). Ateş böceği sürüleri.
4. **Bölümler (ÖNERİ):** Mor mağara → **Buz** (kaygan rüzgâr, parlak yankı) → **Lav** (sıcak hava akımı yukarı iter, kızıl ışık);
   bölüm geçişinde renk ve ses değişimi; **yol ayrımları** (iki tünelden birini seç: biri kısa ve dar, biri uzun ve böcekli).
5. **İlerleme (ÖNERİ):** toplanan ateş böcekleriyle açılan yarasa renkleri/kanat izleri, günlük mağara (herkes aynı tohum),
   başarımlar.
6. **Oyun Atölyesi bağlantısı (ÖNERİ):** `AYAR` ve bölüm tanımları JSON'a taşınır; araçta düzenlenip telefonda denenir.

## Kabul ölçütleri
- Her sürüm telefonda (Pixel 7 / iPhone 14 öykünmesi) otomatik testten geçer, 60 kare/sn hedefinde çalışır.
- Yeni oyuncu hiçbir açıklama okumadan ilk 10 saniyede nasıl oynanacağını anlar (menüdeki üç satır yeter).
