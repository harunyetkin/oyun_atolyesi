# Yankı — Yapılacaklar

Her madde yaklaşık bir gecelik çalışmadır. Sıra önemlidir; üstten başla.

## Sırada
- [ ] Harun'un telefonda ilk deneme geri bildirimine göre his ayarı (kanat gücü, yerçekimi, mağara genişliği, yankının
      görünme süresi, büyük yankı enerjisi). Geri bildirim gelmediyse: zorluğu ilk 30 saniyede daha yumuşak artır.
- [ ] Duraklat düğmesi (sol üst) ve duraklatma ekranı (devam / yeniden başla / ses); arka plandan dönünce "devam için dokun".
- [ ] Sarkıt ve dikitler (PLAN aşama 3): yalnız yankıyla görünen, çarpınca biten engeller; birim testi + oynanış testi.
- [ ] Ölümcül olmayan tehlikeler: örümcek ağı (yavaşlatır), su damlası (ağırlaştırır); ekranda kısa etki yazısı.
- [ ] Yankıyı yutan yosun bölgeleri (o bölgede duvarlar görünmez).
- [ ] Bölüm sistemi: Mor → Buz → Lav (renk, ses, fizik farkı) — Harun'un onayından sonra.
- [ ] Yol ayrımları — Harun'un onayından sonra.

## Küçük iyileştirmeler
- [ ] Çarpınca kısa ekran sarsıntısı ve yarasanın dönerek düşmesi
- [ ] Ateş böceği alınca küçük ışık patlaması ve "+5" yazısı
- [ ] Yatay ekranda menü yazılarının yerleşimi
- [ ] Ayarlar: titreşimi kapatma

## Tamamlandı
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
