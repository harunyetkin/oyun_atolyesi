# Yankı — Çalışma Günlüğü

En yeni girdi en üsttedir.

## 2026-11-19 (gece) — Yankı doğdu: telefonda oynanabilen ilk sürüm
**Bu gece yapılanlar**
- Yarasa oyunu **Yankı**'yı sıfırdan, telefonda oynanacak şekilde kurdum. Oyun Atölyesi deposunun içinde ama araçtan
  ayrı, kendi `yanki` klasöründe; kendi planı, yapılacaklar listesi ve günlüğü var.
- **Nasıl oynanıyor:** Mağara zifiri karanlık. Ekrana **dokununca** yarasa kanat çırpıp yükselir ve küçük bir **yankı** gönderir;
  yankı dalgası duvarlara değince duvarlar mor renkte bir an parlar, sonra yavaşça söner. **Basılı tutarsan** çok daha uzağa
  giden **büyük yankı** çıkar (alttaki mavi çubuk dolunca, ~5 saniyede bir). Yeşil **ateş böcekleri** +5 puan.
  Tavana ya da yere çarpınca oyun biter; skor ve **rekor** görünür, dokununca yeni (her seferinde farklı) bir mağara başlar.
- Mağara başta düz ve geniştir, ilerledikçe **kıvrılır, daralır** ve yarasa hızlanır.
- Sesler kodla üretildi (yankı "tık"ı, büyük yankı, böcek, çarpma); sağ üstte **ses düğmesi**. Çarpınca telefon kısa titrer (Android).
- **Uygulama gibi:** Telefonda ana ekrana eklenince kendi simgesiyle, tam ekran açılır; bir kez açtıktan sonra **internetsiz de** çalışır.
- Testler: 10 birim testi (mağara hiç kapanmıyor, otomatik pilot 40 saniye uçabiliyor vb.) + Pixel 7 ve iPhone 14 öykünmesiyle
  31 otomatik oynanış kontrolü (dokunma, büyük yankı, çarpma, yeniden başlama, ses düğmesi, internetsiz açılış); hepsi geçiyor.

**Telefonda nasıl denenir** (bir kerelik kurulum, 1 dakika)
1. Bilgisayardan GitHub'da `oyun_atolyesi` deposunu aç → üstte **Settings** → soldan **Pages**.
2. "Build and deployment" altında **Source: Deploy from a branch**, **Branch: main**, klasör **/ (root)** seç → **Save**.
3. 1–2 dakika sonra oyun şu adreste açılır: **https://harunyetkin.github.io/oyun_atolyesi/yanki/oyun/**
   Bu bağlantıyı telefonuna gönder (kendine e-posta/WhatsApp) ve aç.
4. Ana ekrana ekle: **Android (Chrome):** sağ üstteki ⋮ → "Ana ekrana ekle". **iPhone (Safari):** alttaki paylaş düğmesi → "Ana Ekrana Ekle".
5. Oyna: dokun, basılı tut, ateş böceklerini topla. Rekorunu kır.
Sonraki gecelerde yaptığım değişiklikler aynı bağlantıya kendiliğinden gelir (telefonda oyunu bir kez kapatıp açman yeter).

**Ekran görüntüleri**
![Menü](gunluk/2026-11-19/menu.png)
![Uçuş: yankıyla görünen duvarlar ve ateş böceği](gunluk/2026-11-19/ucus.png)
![Çarpınca](gunluk/2026-11-19/bitti.png)

**Küçük kararlar (ben seçtim, istersen değiştiririz)**
- Yarasa soldan sağa uçuyor (eski Yankı gibi), telefon dik tutuluyor. Dik ekranda ileriyi daha az görürsün; bu yüzden
  hız biraz düşük ve büyük yankı uzağı gösteriyor.
- Kanat çırpmak her seferinde küçük bir yankı da gönderiyor (ayrı bir düğme yok): tek parmakla oynansın diye.
- Duvarlar hem tavanda hem tabanda öldürücü; sarkıt, örümcek ağı gibi şeyler henüz yok (sırada).

**Senin kararın gereken konular**
- **Yön:** Yarasa (A) soldan sağa mı uçsun (şimdiki), yoksa (B) telefonun dikliğine uygun olarak **aşağıdan yukarı**, bacadan
  çıkar gibi mi? (B) dik ekranda ileriyi daha çok gösterir ama eski Yankı'dan farklı olur.
- **Bölümler:** PLAN'daki Mor → Buz → Lav bölümleri ve yol ayrımları önerimi uygun buluyor musun? Onaylarsan sıraya alırım.
- Cevabını gece çalışmasının sohbetine ya da `yanki/GERI_BILDIRIM.md`'ye yazabilirsin.

**Sıradaki adım**
- Telefonda deneyince söylediklerine göre his ayarı; sonra duraklat düğmesi ve sarkıt/dikitler.
