# Yankı — Claude çalışma talimatı

Yankı, Harun'un **telefonda oynanan 2D yarasa oyunudur** (web oyunu: tarayıcıda açılır, ana ekrana uygulama gibi
eklenir, internetsiz de çalışır). Oyun Atölyesi deposunun içinde, araçtan **ayrı** bu `yanki/` klasöründe durur.
**Kodlama, tasarım ve testin tamamını Claude yapar.** Harun kod yazmaz; oynar, fikir verir ve `GERI_BILDIRIM.md`
ya da gece çalışmasının sohbeti üzerinden yön verir. Harun'la her zaman **Türkçe**, teknik olmayan, anlaşılır bir dille konuş.

Gece çalışması sırayla bir gece Oyun Atölyesi'ne, bir gece Yankı'ya ayrılır (Harun'un kararı, 2026-11-18).
Yankı gecesinde `yanki/` dışına dokunma (kök `GUNLUK.md`'ye tek satırlık not hariç).

## Yapı
- `kaynak/` — kaynak kod (TypeScript + Vite, HTML5 Canvas).
  - `src/oyun/dunya.ts` — oyunun **bütün mantığı**: mağara, yarasa fiziği, yankı (sonar) ve duvar ışığı, ateş böcekleri,
    çarpışma, skor. Ekrandan (DOM) bağımsızdır; `dunya.test.ts` birim testleri onu doğrudan çalıştırır.
    Ayarlar tek yerde: `AYAR` nesnesi; değerleri `icerik/yanki.json`'dan gelir (`src/oyun/icerik.ts` okur ve doğrular).
  - `src/oyun/icerik.ts` — içerik dosyası: ayarları uygulama, bölüm doğrulama, geçit denetimi.
  - `src/ciz.ts` — çizim (yalnız okur). `src/ses.ts` — kodla üretilen sesler (Web Audio, dosya yok).
  - `src/main.ts` — ekran boyutu, dokunma/klavye, sabit adımlı döngü (1/120 sn), titreşim, rekor kaydı, çevrimdışı kayıt.
  - `public/` — `manifest.webmanifest` (uygulama bilgisi), `sw.js` (çevrimdışı çalışma), simgeler.
- `icerik/yanki.json` — **ayarlar ve el yapımı bölümler** (Oyun Atölyesi düzenler); biçimi `icerik/BICIM.md`. AYAR'a yeni alan
  eklersen yanki.json'a ve BICIM.md'ye de ekle (test, dosyada AYAR'ın bütün alanlarının bulunduğunu ve kabul edildiğini denetler; değerler Harun'undur); biçim değişirse `surum` artır.
- `oyun/` — **derlenmiş oyun; commit edilir** (Harun'un bilgisayarında Node gerekmez, GitHub Pages bu klasörü sunar).
  Elle düzenleme; `cd yanki/kaynak && npm ci && npm run build` ile üretilir.
- `araclar/oyun_testi.py` — telefon öykünmeli otomatik oynanış testi.
- `Yanki.html` — **tek dosyalık paket** (bilgisayarda çift tıklayınca tarayıcıda açılır; Harun'un isteği 2026-11-19).
  Her derlemeden sonra `python3 yanki/araclar/tek_dosya.py` ile yenile ve commit'le.
- `PLAN.md`, `YAPILACAKLAR.md`, `GUNLUK.md` (en yeni üstte), `GERI_BILDIRIM.md`, `KREDILER.md`, `gunluk/YYYY-AA-GG/` (ekran görüntüleri).

## Mobil kurallar
- **Önü kör (Harun'un kararı 2026-11-25):** yankı değmeden hiçbir şey görünmez (duvar, sivri, tehlike, ateş böceği dahil). Yarasanın
  kendi ışığı hiçbir şeyi aydınlatmaz; yeni eklenen her nesne de yalnız yankıyla (`Oyun.yankiIsigi`) görünür olmalı. Testte piksel denetimi var.
- Önce **dikey telefon**. Dünya yüksekliği her zaman 1000 birim; genişlik ekran oranına göre (`Oyun.boyutla`).
  Yazılar `sigdir` ile ekrana sığdırılır; dar ekranda taşan yazı bırakma.
- Kontrol tek parmakla: dokun = kanat çırp + küçük yankı, basılı tut = büyük yankı. Bilgisayarda Boşluk/↑/W.
- Pil ve hız: çözünürlük en fazla 2×, tekrar eden ışıklar önceden çizilmiş küçük resimlerden, duvarlar parlaklık
  basamaklarına göre toplu çizilir. Arka plana geçince oyun durur. Hedef 60 kare/sn.
- Ses ancak ilk dokunuşta açılır (tarayıcı kuralı); ses düğmesi sağ üstte, tercih saklanır.
- `localStorage` her zaman `try/catch` içinde (gizli sekmede hata verebilir).
- `?test=1` → çevrimdışı çalışma kaydedilmez; `?tohum=N` → hep aynı mağara (testler için). `window.__yanki` test kancasıdır.

## Mobil oyun bütünlüğü (Harun'un sürekli görevi, 2026-11-25)
- Bir mobil oyunda olması gereken her şey (ayarlar, öğretici, kayıt, başarımlar, müzik, dil, erişilebilirlik, uygulama kabuğu, paketleme…)
  zamanla eklenir. Listesi YAPILACAKLAR'da "Mobil oyunda olması gerekenler"; yeni bir eksik fark edersen oraya ekle.
- **Mağazaya yükleme yok:** Google Play / App Store'a gönderim ancak bütün testler geçip Harun onaylayınca. Hesap açmak ve ücret Harun'un kararı.

## Her çalışmanın başında
Sırayla oku: `GERI_BILDIRIM.md` (önce bu!), `PLAN.md`, `YAPILACAKLAR.md`, `GUNLUK.md`'nin son girdisi.

## Günlük iş akışı
1. **Geri bildirim:** "Yeni" altındaki maddeleri değerlendir, uygulanabilirse YAPILACAKLAR'ın başına ekle, işleneni tarihle "İşlendi"ye taşı.
2. **İş seçimi:** "Sırada"nın başından bir gecede bitip test edilebilecek kadar (1–3). Yarım iş bırakma.
3. **Uygula:** Temiz, Türkçe yorumlu kod. Oyun her commit'te telefonda açılıp oynanabilir olmalı.
4. **Test et:**
   - `cd yanki/kaynak && npm run build` hatasız, ardından `python3 yanki/araclar/tek_dosya.py`; `npm test` (oyun mantığı birim testleri; yeni oynanışa test ekle)
   - `python3 yanki/araclar/oyun_testi.py /tmp/yanki_test` (Pixel 7 ve iPhone 14 öykünmesi: açılış, dokunma, büyük yankı,
     çarpma, yeniden başlama, 7 sn otomatik uçuş, sarkıt/dikit, duraklat, ses düğmesi, konsol hatası; 4 bilgisayar ekranında tam
     yeniden çizim; çevrimdışı açılış). Yeni özellik ekleyince kontrol ekle.
   - Ekran görüntülerini **Read ile açıp gözünle kontrol et**; en iyi 1–3'ünü küçültüp `gunluk/YYYY-AA-GG/` altına koy.
5. **Günlük:** `GUNLUK.md` en üstüne: ne yapıldı, telefonda nasıl denenir, ekran görüntüleri, "Senin kararın gereken konular", sıradaki adım.
6. **Takip:** `YAPILACAKLAR.md` güncelle.
7. **Commit ve push:** `main` dalına Türkçe mesajla: `git -c push.negotiate=true push origin main`.

## Kurallar
- **Satın alma yok.** Dış varlık yalnız ücretsiz ve uygun lisanslı (CC0 tercih); her birini `KREDILER.md`'ye yaz.
  Şimdilik her şey kodla üretiliyor (çizim ve ses).
- **Hikâye, bölümler ve büyük oyun tasarımı kararları Harun'undur.** PLAN'daki tasarım önerileri "ÖNERİ" diye işaretlidir;
  Harun onaylamadan kesinleşmiş gibi yazma. Küçük belirsizliklerde makul olanı seç ve günlükte belirt.
- Bir şey kırılırsa önce onu onar.
- Harun'a komut satırı işi verme; telefonda bir bağlantıyı açmak ve GitHub sitesinde düğmeye basmak yeterli olmalı.
