# Oyun Atölyesi — Claude çalışma talimatı

Bu depo Harun'un masaüstü oyun geliştirme aracıdır: canlı oyun önizlemesi, ayar panelleri,
nesne/engel düzenleme, sürüm geçmişi ve oyunu dışa aktarma bir arada.
**Kodlama, tasarım ve testin tamamını Claude yapar.** Harun kod yazmaz; aracı kullanır,
yön verir ve `GERI_BILDIRIM.md` üzerinden yorum bırakır.
Harun'la her zaman **Türkçe**, teknik olmayan ve anlaşılır bir dille iletişim kur.

## Hedef
Genel amaçlı, kodsuz 2D oyun yapım ortamı. Ölçüt: Yankı araçta **kod yazmadan, sıfırdan,
birebir** yapılabilmeli. Aşamalar ve kabul testleri `PLAN.md`'de. Arayüz güçlü ve modern olmalı.

## Mimari (hedef)
- `arayuz/` — React + TypeScript + Vite kaynak kodu.
  - `arayuz/src/motor/` — editörden **bağımsız** oyun çalışma zamanı (nesneler, bileşenler,
    davranışlar, olay kuralları). Dışa aktarılan oyunlar da bunu kullanır. DOM'a bağımlı olmayan
    mantığı birim testleriyle (vitest) doğrula.
  - `arayuz/src/editor/` — editör arayüzü (paneller, sahne, özellikler, kurallar).
  - Derleme: `cd arayuz && npm ci && npm run build` → çıktı **`app/`** klasörüne yazılır ve
    **commit edilir** (Harun'un bilgisayarında Node gerekmez; `exe_yap.bat` `app/`'i paketler).
- `atolye.py` — masaüstü kabuğu (pywebview); pencere + dosya işleri. Arayüz yeni dosya işi
  isterse buraya, yol güvenliğine dikkat ederek ekle.
- `exe_yap.bat` — Harun'un bilgisayarında `OyunAtolyesi.exe` üretir.
- `ornekler/` — kabul testlerinde araçla kurulan oyun projeleri.
- `eski_v01/` — ilk deneme (yarasa türüne özel ayar paneli); yalnızca başvuru için.
- Proje dosyası (`proje.json`) bir `surum` alanı taşır; şema değişince **göç fonksiyonu** yaz,
  eski projeler açılabilir kalsın.
- Uygulama içinde yapay zekâ sohbeti **yok** (Harun kullandıkça ödemeli API istemedi). İleride
  eklenebilir; tasarımı buna kapalı yapma.
- Tarayıcıda test için arayüz `?test=1` ile açılınca bellekte çalışan sahte depo kullanır;
  bu davranışı koru.

## Her çalışmanın başında
Sırayla oku: `GERI_BILDIRIM.md` (önce bu!), `PLAN.md`, `YAPILACAKLAR.md`, `GUNLUK.md`'nin son girdisi.
Test için: `pip install playwright --break-system-packages` (yoksa); Chrome `/usr/bin/google-chrome`.

## Günlük iş akışı
1. **Geri bildirim:** `GERI_BILDIRIM.md` "Yeni" altındaki maddeleri değerlendir, uygulanabilirse
   YAPILACAKLAR'ın başına ekle, işleneni tarihle "İşlendi"ye taşı.
2. **İş seçimi:** "Sırada"nın başından, bir oturumda bitip test edilebilecek kadar iş (1–3).
3. **Uygula:** Temiz, Türkçe yorumlu kod. Araç her commit'te açılabilir ve çalışır olmalı.
4. **Test et:**
   - `cd arayuz && npm run build` hatasız olmalı; `npm test` (motor birim testleri)
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
