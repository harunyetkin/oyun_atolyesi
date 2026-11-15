# Yapılacaklar

Her madde yaklaşık bir günlük çalışmadır. Sıra önemlidir; üstten başla.

## Sırada (Aşama 1 — Çekirdek)
- [ ] **Sahne düzenleyici tamamlama:** seçim kutusunun köşe tutamaçlarından sürükleyerek
      boyutlandırma, üstteki yuvarlak tutamaçtan döndürme (araç seçmeden), Shift ile çoklu seçim
      ve kutu seçimi, ok tuşlarıyla 1 px / Shift ile 10 px kaydırma, hizalama (Düzen menüsü).
- [ ] **Geri al / yinele** (Ctrl+Z / Ctrl+Y): `degistir()` üzerinden geçmiş yığını; sürüklemeler
      tek adım sayılsın. Menüdeki "Aşama 1" rozetlerini kaldır.
- [ ] Aşama 1 değerlendirmesi: GUNLUK'ta Harun için "neler yapılabiliyor" özeti ve ekran
      görüntüsü serisi; OZELLIKLER.md durumlarını güncelle.

## Sonra (Aşama 2 — 3D görünüm)
- [ ] Merkezde "3D Harita" sekmesi: three.js (npm paketi, lockfile commit), yörünge kamerası
      (sağ tık döndür, orta tık kaydır, tekerlek yakınlaştır), ızgara zemin, eksen göstergesi
- [ ] glTF/GLB model yükleme ve varlık tarayıcısında 3D küçük resim
- [ ] 3D seçme ve taşı/döndür/ölçekle tutamaçları; özellik panelinde 3D dönüşüm
- [ ] Ortam: güneş ışığı yönü, gökyüzü rengi/HDR, sis önizlemesi
- [ ] Oyunun `icerik/BICIM.md` biçimine göre 3D harita proje tipi (oyun tarafı biçimi yazınca)

## Oyunun içerik türleri (hikaye_oyun/icerik/BICIM.md sürüm 1) — Aşama 3–4'te karşılıkları
Oyun 2026-11-15'te bu içerik türleriyle oynanabilir oldu; araçta her biri için düzenleyici gerekecek:
- [ ] Ölçekler (`oyun.json` → `olcekler`): ekle/sil/adlandır
- [ ] Karakter oluşturma adımları ve seçenekleri: soru, seçenek adı, görünüm (renkler, aksesuar), puanlar
- [ ] Harita: ortam (gökyüzü, güneş, sis), yol, başlangıç/bitiş, dekor yerleştirme (3D görünümde)
- [ ] Kişiler (NPC): görünüm, dolaşma alanı (haritada daire olarak sürüklenebilir), hız, bağlı konuşma
- [ ] Kapı seçimleri: konum, soru, kapılar (etiket, renk, puan, ödül, mesaj)
- [ ] Konuşma ağacı düzenleyici: düğümler ve seçenekler, puanlar, ödüller (düğüm grafiği görünümü)
- [ ] Puan önizleme: bir haritadaki bütün kararların hangi ölçeklere ne verdiğini tek tabloda gösterme

## Daha sonra (Aşama 3 — Oyun projesine bağlanma)
- [ ] Godot oyun klasörünü seçme (atolye.py, yol güvenliği), `icerik/` okuma/yazma, varlıkları listeleme
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
