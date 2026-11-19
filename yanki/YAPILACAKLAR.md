# Yankı — Yapılacaklar

Her madde yaklaşık bir gecelik çalışmadır. Sıra önemlidir; üstten başla.

## Sırada
- [ ] **(Harun'un geri bildirimi, 19.11 — önce bu)** Geniş bilgisayar ekranında oyun pencereye tam sığmıyor: ekran oranı
      ~2'nin üstünde (ör. 1916×939) dünya genişliği 1900 sınırına takılıyor, sağda boyanmayan bir şerit kalıyor ve orada
      eski karelerin izleri (yeşil ateş böceği lekeleri) birikiyor. Düzelt: her karede bütün tuvali temizle; geniş ekranda
      dünyayı sınırlamak yerine görüşü genişlet (ya da ortala ve kenarları koyu doldur). Teste 1920×1080, 2560×1080 (21:9),
      1024×768 (4:3) ekranlar ekle ve ekranın her yerinin boyandığını, kenarda iz kalmadığını denetle.
- [ ] **(Harun'un geri bildirimi, 19.11)** Mağara yarasa ilerledikçe "pencere pencere", bloklar halinde beliriyor; akıcı bir
      geçiş olmalı. Nedenler: duvar parlaklığı 12 basamağa yuvarlanıyor ve dilimler ayrı ayrı açılıp kapanıyor, katlar
      keskin. Düzelt: parlaklık komşu örnekler arasında yumuşak geçsin (basamak sayısını artır ya da gradyanla çiz,
      komşularla yumuşat), yankı cephesi duvar boyunca akarak açılsın, sönme yumuşak olsun; ekranın sağından giren duvar da
      aniden belirmesin. Teste ölçüt ekle (yan yana dilimlerin parlaklık farkı küçük olmalı) ve ekran görüntüsünde blok
      görünmediğini gözle kontrol et.
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
- [x] 2026-11-19 (gece) — **İlk oynanabilir sürüm (v0.1):** `yanki/` kuruldu (CLAUDE.md, PLAN, günlük). Karanlık mağara,
      yarasa, dokun = kanat + yankı, basılı tut = büyük yankı, duvar ışığı ve sönmesi, ateş böcekleri, skor ve rekor,
      çarpma ve yeniden başlama, sesler, titreşim, ses düğmesi, uygulama simgesi, çevrimdışı çalışma.
      10 birim testi + telefon öykünmeli 31 oynanış kontrolü.
