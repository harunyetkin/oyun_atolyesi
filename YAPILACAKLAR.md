# Yapılacaklar

Her madde yaklaşık bir günlük çalışmadır. Sıra önemlidir; üstten başla.

## Sırada (Aşama 1 — Çekirdek)
- [ ] **Motor çekirdeği:** `arayuz/src/motor/` altında editörden bağımsız oyun çalışma zamanı
      (Dunya/Oyun sınıfı: örnekleri kopyalar, her karede bileşenleri günceller). Fizik bileşeni
      (yerçekimi, hız, en yüksek hız, sürtünme), çarpışma bileşeni (daire/kutu) ve çarpışma
      algılama; katı nesnelerin içinden geçilmemesi. Sahne.tsx'teki "basit önizleme" kodunu bu
      motora devret. Vitest ile fizik/çarpışma birim testleri.
- [ ] **Hazır davranışlar (motor içinde, kayıt sistemiyle):** "Tuşla zıpla/uç" (tuş seçimi
      gerçekten çalışsın: Boşluk, Yukarı ok, W, fare), "Sabit hızla kay", "Ekrandan çıkınca yok ol".
      Yeni davranış eklemenin tek dosyalık bir kalıbı olsun. Oynatırken çarpışma alanlarını
      gösterme seçeneği (Görünüm menüsü).
- [ ] **Sahne düzenleyici tamamlama:** seçim kutusunun köşe tutamaçlarından sürükleyerek
      boyutlandırma, üstteki yuvarlak tutamaçtan döndürme (araç seçmeden), Shift ile çoklu seçim
      ve kutu seçimi, ok tuşlarıyla 1 px / Shift ile 10 px kaydırma, hizalama (Düzen menüsü).
- [ ] **Geri al / yinele** (Ctrl+Z / Ctrl+Y): `degistir()` üzerinden geçmiş yığını; sürüklemeler
      tek adım sayılsın. Menüdeki "Aşama 1" rozetlerini kaldır.
- [ ] Aşama 1 değerlendirmesi: GUNLUK'ta Harun için "neler yapılabiliyor" özeti ve ekran
      görüntüsü serisi; OZELLIKLER.md durumlarını güncelle.

## Sonra (Aşama 2 — Kurallar)
- [ ] Olay kuralları sayfasını düzenlenebilir yap (koşul/eylem seçici pencereleri, sürükle-bırak sıralama, gruplar)
- [ ] Koşullar: tuşa basıldı/basılı/bırakıldı, çarpıştı (etiketle), değişken karşılaştır, her X saniyede, sahne başladı
- [ ] Eylemler: değişkeni değiştir, nesne oluştur/yok et, özellik değiştir, oyunu bitir/yeniden başlat, yazı göster
- [ ] Kuralları motorda çalıştır; oynatırken tetiklenen kuralı vurgula
- [ ] Değişkenleri oynatırken canlı göster; kalıcı değişkenler (rekor)
- [ ] Arayüz (HUD) düzenleyici: yazı öğesi, değişkene bağlama
- [ ] Rastgele üretici (spawner) davranışı ve kamera takibi/kaydırma
- [ ] Kabul testi: Kanat Çırp'ı araçta sıfırdan kur, `ornekler/kanat_cirp.json` olarak kaydet, otomatik testle oynat

## Tamamlandı
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
