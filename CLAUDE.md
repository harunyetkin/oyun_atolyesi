# Oyun Atölyesi — Claude çalışma talimatı

Bu depo Harun'un masaüstü oyun geliştirme aracıdır: canlı oyun önizlemesi, ayar panelleri,
nesne/engel düzenleme, sürüm geçmişi ve oyunu dışa aktarma bir arada.
**Kodlama, tasarım ve testin tamamını Claude yapar.** Harun kod yazmaz; aracı kullanır,
yön verir ve `GERI_BILDIRIM.md` üzerinden yorum bırakır.
Harun'la her zaman **Türkçe**, teknik olmayan ve anlaşılır bir dille iletişim kur.

## Mimari
- `app/` — arayüz (saf HTML/CSS/JS, derleme adımı yok)
  - `motor.js`: oyun motoru. Bir "oyun tanımını" (JSON) okuyup oynatır; tanım her karede
    okunduğu için editör değişiklikleri anında yansır. Dışa aktarılan oyunlar da bunu kullanır.
  - `sablonlar.js`: hazır şablonlar, yeni nesne ayarları ve **özellik paneli tanımları (ALANLAR)**.
    Yeni bir ayar eklemek = motorda kullan + ALANLAR'a satır ekle.
  - `editor.js`: liste, özellik paneli, önizleme, sürümler, projeler, dışa aktarma.
- `atolye.py` — masaüstü kabuğu (pywebview). Pencereyi açar; dosya işlerini yapar.
  Veriler: `Belgeler/OyunAtolyesi/projeler/<ad>/oyun.json` ve `surumler/`.
- `exe_yap.bat` — Harun'un bilgisayarında çift tıklayınca `OyunAtolyesi.exe` üretir.
- Yapay zekâ sohbeti uygulamanın içinde **yok** (Harun kullandıkça ödemeli API istemedi).
  İleride eklenebilir; tasarımı buna kapalı yapma.

## Oyun tanımı (oyun.json) — kısa şema
`{ ad, surum, dunya:{hiz, hiz_artisi, arka_renk, duvar_renk, magara, bosluk, kivrim, daralma,
duvar_olumcul, karanlik, isik_yaricapi, kanat_isigi, dalga_yaricapi}, oyuncu:{sekil, renk, boyut,
yercekimi, kanat_gucu, max_dusus}, nesneler:[{id, ad, aktif, sekil, renk, boyut, siklik, konum,
hareket, genlik, hiz, parlar, etki:{tip, guc, sure, tek_kullanim}}] }`
Şemayı değiştirirsen **eski projeler bozulmamalı**: eksik alanlara motor ve editörde varsayılan ver.

## Her çalışmanın başında
Sırayla oku: `GERI_BILDIRIM.md` (önce bu!), `PLAN.md`, `YAPILACAKLAR.md`, `GUNLUK.md`'nin son girdisi.
Test için: `pip install playwright --break-system-packages` (yoksa); Chrome `/usr/bin/google-chrome`.

## Günlük iş akışı
1. **Geri bildirim:** `GERI_BILDIRIM.md` "Yeni" altındaki maddeleri değerlendir, uygulanabilirse
   YAPILACAKLAR'ın başına ekle, işleneni tarihle "İşlendi"ye taşı.
2. **İş seçimi:** "Sırada"nın başından, bir oturumda bitip test edilebilecek kadar iş (1–3).
3. **Uygula:** Temiz, Türkçe yorumlu kod. Araç her commit'te açılabilir ve çalışır olmalı.
4. **Test et:**
   - `python3 araclar/api_testi.py` (Python dosya işleri)
   - `python3 araclar/arayuz_testi.py /tmp/atolye_test` (arayüzü Chrome'da otomatik kullanır,
     konsol hatası olmamalı). Yeni özellik eklediysen bu teste de adım ekle.
   - Ekran görüntülerini **Read ile açıp gözünle kontrol et.**
5. **Kaydet:** En iyi 1–3 görüntüyü `gunluk/YYYY-AA-GG/` altına koy.
6. **Günlük:** `GUNLUK.md` en üstüne girdi ekle: ne yapıldı, nasıl denenir, görüntüler,
   "Senin kararın gereken konular", sıradaki adım. Harun'un anlayacağı dille.
7. **Takip:** YAPILACAKLAR güncelle.
8. **Commit ve push:** `main` dalına, Türkçe mesajla: `git -c push.negotiate=true push origin main`

## Kurallar
- Satın alma yok. Dış varlık kullanırsan ücretsiz/uygun lisanslı olsun, `KREDILER.md`'ye yaz.
- Harun'un bilgisayarı Windows, Python 3.14 kurulu. Ona komut satırı işi verme; her şey çift
  tıklama ile olmalı. `exe_yap.bat` derleme gerektiren (C eklentili) paketleri kaynaktan kurmaya
  çalışmamalı (`--prefer-binary`; saf Python paketleri sorun değil). Yeni bir Python
  bağımlılığı eklemeden önce Python 3.14 / win_amd64 için hazır paketi olduğunu doğrula
  (`pip download <paket> --only-binary :all: --python-version 3.14 --platform win_amd64`).
- `atolye.py`'ye yeni bir dosya işlemi eklersen yol güvenliğini koru (`guvenli_ad`, `basename`).
- Büyük yön kararları Harun'undur; küçük belirsizliklerde makul olanı seç ve günlükte belirt.
- Bir şey kırılırsa önce onu onar.
