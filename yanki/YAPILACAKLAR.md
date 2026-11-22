# Yankı — Yapılacaklar

Her madde yaklaşık bir gecelik çalışmadır. Sıra önemlidir; üstten başla.

## Sırada
- [ ] Harun'un telefonda deneme geri bildirimine göre his ayarı (kanat gücü, yerçekimi, mağara genişliği, yankının görünme süresi,
      sarkıt/dikit sıklığı). Geri bildirim gelene kadar bu madde bekler; sıradakine geç.
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
