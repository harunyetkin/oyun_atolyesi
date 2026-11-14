# Yapılacaklar

Her madde yaklaşık bir günlük çalışmadır. Sıra önemlidir; üstten başla.

## Sırada (Aşama 1 — Çekirdek)
- [ ] **Altyapı:** `arayuz/` altında React + TypeScript + Vite kurulumu; derleme çıktısı `app/`
      klasörüne. v0.1 kodunu `eski_v01/` altına taşı. `atolye.py` yeni `app/`'i açsın.
      Modern boş düzen: üst menü çubuğu, sol (nesneler), sağ (özellikler), alt (sekmeli panel),
      ortada sahne alanı; paneller boyutlandırılabilir. Test betiklerini güncelle.
- [ ] **Proje formatı v2:** sahneler, nesne türleri, sahnedeki örnekler, değişkenler, kurallar,
      varlıklar için şema ve TypeScript tipleri; `surum` alanı ve göç fonksiyonu. Yeni proje /
      aç / kaydet / sürümler (atolye.py API'si ile).
- [ ] **Sahne görünümü:** ızgara, yakınlaştırma/kaydırma, sahne sınırları (oyun ekranı çerçevesi).
- [ ] **Nesne türleri ve yerleştirme:** soldaki listeden sahneye sürükle-bırak, seç, taşı,
      boyutlandır, sil, çoğalt. Görünüm bileşeni: şekil (daire, kare, üçgen, elmas, yıldız,
      çokgen) + renk + boyut.
- [ ] **Özellik paneli:** genel bileşen sistemi; seçili nesnenin bileşenleri kartlar halinde,
      bileşen ekle/kaldır.
- [ ] **Motor çekirdeği:** oyun döngüsü; ▶ Oynat / ■ Durdur (durdurunca düzenleme haline geri
      dön); Fizik bileşeni (hız, yerçekimi, en yüksek hız); Çarpışma bileşeni (daire/kutu) ve
      çarpışma algılama.
- [ ] **İlk hazır davranışlar:** "Tuşla zıpla/uç", "Sabit hızla kay", "Ekrandan çıkınca yok ol".
- [ ] **Geri al / yinele** (Ctrl+Z / Ctrl+Y) ve klavye kısayolları.
- [ ] Aşama 1 değerlendirmesi: GUNLUK'ta Harun için "neler yapılabiliyor" özeti ve ekran videosu
      yerine ekran görüntüsü serisi.

## Sonra (Aşama 2 — Kurallar)
- [ ] Olay kuralları sayfası (koşul/eylem listesi, sürükle-bırak sıralama)
- [ ] Koşullar: tuşa basıldı, çarpıştı, değişken karşılaştır, her X saniyede, oyun başladı
- [ ] Eylemler: değişkeni değiştir, nesne oluştur/yok et, oyunu bitir/yeniden başlat, yazı göster
- [ ] Değişkenler paneli (genel ve nesneye özel)
- [ ] Arayüz (HUD) editörü: yazı öğesi, değişkene bağlama
- [ ] Rastgele nesne üretici (spawner) ve kamera kaydırma
- [ ] Rekor kaydı (kalıcı değişken)
- [ ] Kabul testi: Kanat Çırp'ı araçta sıfırdan kur, `ornekler/kanat_cirp.json` olarak kaydet

## Tamamlandı
- [x] 2026-11-14 — v0.1: yarasa türüne özel ayar panelli ilk deneme (sonra `eski_v01/`'e taşınacak)
