# Özellik Envanteri

Bir 2D oyun yapım aracında bulunması gereken özellikler. GDevelop, Construct, GameMaker ve
Godot gibi araçların ortak yapı taşları ile "Yankı'yı kodsuz, sıfırdan yapabilmek" ölçütü
birleştirilerek hazırlandı.

Durum: ✅ var · 🧩 arayüzü var, işlevi sonra · 🔜 planlı (aşama numarası)

## 1. Proje yönetimi
| Özellik | Durum |
|---|---|
| Başlangıç ekranı: son projeler, yeni proje, şablondan başla | 🧩 |
| Proje ayarları: ad, ekran boyutu, ölçekleme, arka plan, başlangıç sahnesi | 🧩 |
| Otomatik kayıt ve kaydetme durumu | ✅ |
| Sürüm geçmişi: notlu sürüm kaydet, karşılaştır, geri yükle | 🧩 (karşılaştırma 🔜5) |
| Eski (v0.1) projeleri açma (göç) | ✅ |
| Dışa aktarma: tek dosya HTML, Windows .exe | 🔜5 |
| Şablon kütüphanesi | 🔜5 |

## 2. Editör arayüzü
| Özellik | Durum |
|---|---|
| Menü çubuğu (Dosya, Düzen, Görünüm, Oyun, Yardım) | ✅ |
| Araç çubuğu: seç, taşı, döndür, ölçekle, kaydır; ızgara, mıknatıs; oynat/duraklat/durdur | ✅ |
| Boyutlandırılabilir ve gizlenebilir paneller, düzen hatırlama | ✅ |
| Sekmeli düzenleyiciler: Sahne, Olaylar, Arayüz | ✅ |
| Komut paleti (Ctrl+K) ve klavye kısayolları | ✅ |
| Bildirimler, durum çubuğu (yakınlaştırma, imleç konumu, kayıt, FPS) | ✅ |
| Ayarlar penceresi (ızgara, otomatik kayıt, arayüz ölçeği) | ✅ |
| Geri al / yinele (sürükleme tek adım, 200 adım geçmiş) | ✅ |
| Açık/koyu tema | 🔜 |

## 3. Sahne düzenleyici
| Özellik | Durum |
|---|---|
| Izgara, yakınlaştırma, kaydırma, oyun ekranı çerçevesi | ✅ |
| Nesneyi seçme, sürükleyerek taşıma | ✅ |
| Sürükle-bırak ile sahneye nesne ekleme | ✅ |
| Köşe tutamaçlarıyla boyutlandırma (Shift: oranı koru), üst tutamaçla döndürme | ✅ |
| Çoklu seçim (Shift+tık, kutu seçimi, Ctrl+A), toplu taşı/sil/çoğalt | ✅ |
| Ok tuşlarıyla 1 px / Shift ile 10 px kaydırma | ✅ |
| Hizalama (sol/orta/sağ/üst/orta/alt) ve eşit dağıtma | ✅ |
| Katmanlar (arka plan, oyun, arayüz), görünürlük ve kilit | 🧩 |
| Birden fazla sahne (menü, oyun, bitiş) | 🧩 |
| Kamera ayarları: takip, sınırlar, kaydırma | 🔜2 |

## 4. Nesneler ve bileşenler
| Özellik | Durum |
|---|---|
| Nesne türleri ve sahnedeki örnekleri (tür değişince hepsi değişir) | ✅ |
| Görünüm: şekil, renk, boyut, çizim/resim, animasyon | 🧩 (çizim 🔜5) |
| Fizik: hız, yerçekimi, sürtünme, en yüksek hız | ✅ |
| Çarpışma alanı: daire, kutu, çokgen | ✅ (çokgen 🔜) |
| Işık kaynağı: yarıçap, güç, renk | 🔜3 |
| Parçacık yayıcı | 🔜3 |
| Ses kaynağı | 🔜4 |
| Nesneye özel değişkenler | 🔜2 |
| Etiketler/gruplar ("tehlikeler" gibi) | 🔜2 |

## 5. Hazır davranışlar
| Davranış | Durum |
|---|---|
| Tuşla zıpla / uç (tuş seçilebilir) | ✅ |
| Platform karakteri (sağ-sol + zıpla) | 🔜5 |
| Yukarıdan bakış hareketi (4/8 yön) | 🔜5 |
| Sabit hızla kay (4 yön) / ekranla kay | ✅ (ekranla kay 🔜2) |
| Süzül (dalga), yaklaşınca düş, hedefe doğru uç | 🔜3 |
| Ekrandan çıkınca yok ol | ✅ |
| Rastgele üretici (spawner) | 🔜2 |
| Yanıp sönme, solma, büyüyüp küçülme | 🔜3 |

## 6. Olay kuralları (kodsuz mantık)
| Özellik | Durum |
|---|---|
| Kural sayfası: "Koşullar → Eylemler" satırları, alt kurallar, gruplar, açıklama | 🧩 |
| Koşullar: tuşa basıldı / basılı tutuluyor / bırakıldı, tıklandı, çarpıştı, değişken karşılaştır, her X saniyede, zamanlayıcı doldu, sahne başladı, olasılık | 🔜2, 🔜4 |
| Eylemler: değişken değiştir, nesne oluştur/yok et, özellik değiştir, etki uygula (süreli), sahne değiştir, yeniden başlat, ses çal, sarsıntı, yazı göster | 🔜2–4 |
| Hata ayıklama: kural tetiklenince vurgulama | 🔜4 |

## 7. Değişkenler
| Özellik | Durum |
|---|---|
| Genel ve sahne değişkenleri (sayı, metin, doğru/yanlış) | 🧩 |
| Kalıcı değişkenler (rekor gibi) | 🔜2 |
| Oyun sırasında canlı değer izleme | 🔜2 |

## 8. Dünya üretimi
| Özellik | Durum |
|---|---|
| Tünel/mağara üretici: genişlik, kıvrım, daralma | 🔜3 |
| Hazır parça (bölüm parçası) dizileri, yol ayrımı | 🔜4 |
| Bölümler: mesafe/puana göre renk ve kural değişimi, yumuşak geçiş | 🔜4 |

## 9. Görsel efektler
| Özellik | Durum |
|---|---|
| Karanlık katmanı ve ışıklar | 🔜3 |
| Parçacıklar, ekran sarsıntısı, ekran parlaması | 🔜3 |
| Renk geçişleri, paralaks arka plan | 🔜4 |

## 10. Ses
| Özellik | Durum |
|---|---|
| Ses üretici (kaydırıcılarla efekt: zıplama, toplama, çarpma) | 🔜4 |
| Ses dosyası içe aktarma, müzik | 🔜4 |

## 11. Arayüz (HUD) düzenleyici
| Özellik | Durum |
|---|---|
| Yazı, değişkene bağlı sayaç, çubuk (bar), düğme, resim | 🔜2, 🔜4 |
| Menü ve bitiş ekranları | 🔜2 |

## 12. Varlıklar
| Özellik | Durum |
|---|---|
| Varlık tarayıcısı: çizimler, resimler, sesler, yazı tipleri | 🧩 |
| Piksel çizim editörü | 🔜5 |
| Resim / ses içe aktarma | 🔜5 |

## 13. Test ve hata ayıklama
| Özellik | Durum |
|---|---|
| Editörün içinde oynatma, duraklatma, kare kare ilerleme | ✅ (kare kare 🔜) |
| Ölümsüz test modu, yavaş çekim | 🔜2 |
| Konsol / çıktı paneli | ✅ |
| Çarpışma alanlarını gösterme | ✅ |

## 14. 3D oyun içeriği (hikaye_oyun/icerik)
| Özellik | Durum |
|---|---|
| Oyun klasörünü seçme ve hatırlama, içerik dosyalarını listeleme | ✅ |
| Kaydetmeden önce yedek, biçimi (girinti, sıra) koruyan yazma, bilinmeyen alanlara dokunmama | ✅ |
| Karakterler: oyuncunun bütün ayarları (beden, kontrol biçimi, hareket, kamera, dövüş, doğallık, çanta, animasyonlar) | ✅ |
| Kişilerin (npc) MetaHuman bedenleri: ekle/sil/yeniden adlandır, haritadan öneri | ✅ |
| Harita ayarları: Unreal zemin/yol/model açısı, yol, ışık ve gökyüzü, başlangıç/bitiş | ✅ |
| Eşyalar: ekle/çoğalt/sil, konum, renk, mesaj, puanlar, elde duruşu; sürüklenebilir kroki | ✅ |
| Uyarılar (kimlik kuralı, tekrar eden kimlik, bilinmeyen ölçek, yanlış Unreal yolu) | ✅ |
| Kişiler (npc) haritada: krokide sürüklenip boyutlanan dolaşma alanı, yaya şeridi, davranış, hız, durma mesafesi, konuşma, selamlaşma, sözler, tepkiler, saldırıya tavır, beden | ✅ |
| Kalabalık (otomatik üretilmiş MetaHuman'lar): sayı, klasör, önek, ad, yarıçap, konuşma, sözler | ✅ |
| Sandıklar: ekle/çoğalt/sil, krokide sürükleme, içindeki eşya ve puanlar, Unreal model/kapak ayarları | ✅ |
| Görevler: adımlar (yazı, tür, haritadan hedef), sıralama, uyarılar; kimlik değişince hedefler izler | ✅ |
| Sesler, güneş hareketi, eşya açıklaması | ✅ |
| Oturaklar, ana menü beden seçimi, model çarpışmaları, kişi programı, iç mekânlar/geçişler, arayüz.json | 🔜 |
| Kapı seçimleri, dekor yerleştirme (3D görünümde) | 🔜2, 🔜4 |
| Konuşma ağacı, karakter oluşturma, ölçek düzenleyicileri | 🔜4 |
| "Oyunda dene" | 🔜3 |
