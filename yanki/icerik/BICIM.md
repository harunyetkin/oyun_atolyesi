# Yankı içerik dosyası — `yanki/icerik/yanki.json`

Oyunun his ayarları ve el yapımı bölümleri bu tek dosyadadır. Oyun Atölyesi'nin **Yankı düzenleyicisi** bu biçimi okur ve yazar.
Biçim değişince `surum` artırılır ve aşağıdaki "Değişiklikler"e not düşülür (Atölye eski dosyayı göçle açar).

**Oyun dosyayı nereden okur?** Sırayla: tek dosyalık `Yanki.html`'e gömülü içerik (`window.YANKI_ICERIK`) → yayındaki
`oyun/icerik.json` (derleme `yanki.json`'u oraya kopyalar) → koddaki varsayılanlar. Eksik ya da hatalı her alan varsayılana döner;
hatalı bir bölüm atlanır, oyun yine açılır. Uyarılar tarayıcı konsoluna yazılır.

**Değişiklikten sonra:** `npm run build` (oyun/icerik.json) ve `python3 yanki/araclar/tek_dosya.py` (Yanki.html). Atölye kaydederken
ikincisini kendi yapar.

## Kök

| Alan | Tür | Açıklama |
|---|---|---|
| `surum` | sayı | Biçim sürümü. Şimdi **1**. |
| `_aciklama` | yazı | Not; oyun okumaz. `_` ile başlayan her alan nottur. |
| `ayarlar` | nesne | His ayarları (aşağıda). |
| `bolumler` | liste | El yapımı bölümler (aşağıda). Menüde bu sırayla görünür. |

## `ayarlar`

Dünya birimi: ekran yüksekliği her zaman **1000**. Yarasa soldan sağa uçar; x yol boyunca, y aşağı doğru artar.
Aralıklar `[en az, en çok]` iki sayıdır.

| Alan | Örnek | Açıklama |
|---|---|---|
| `yercekimi` | 2400 | Yarasayı aşağı çeken güç (birim/sn²). Büyük = daha çabuk düşer. |
| `kanatGucu` | 720 | Kanat çırpınca yukarı hız. |
| `enFazlaDusus` | 1100 | En yüksek düşme hızı. |
| `yarasaYaricap` | 16 | Yarasanın çarpışma yarıçapı. |
| `yarasaKonumu` | 0.3 | Yarasanın ekrandaki yatay yeri (genişliğin oranı). |
| `hiz` | 280 | Başlangıç ilerleme hızı (birim/sn). |
| `hizArtisi` | 22 | Her 1000 birimde hız artışı. |
| `enFazlaHiz` | 520 | Hızın üst sınırı. |
| `bosluk` | 600 | Sonsuz mağarada başlangıç geçit yüksekliği. |
| `enDarBosluk` | 270 | Sonsuz mağaranın en dar hâli. |
| `daralma` | 7 | Her 1000 birimde daralma. |
| `guvenliBaslangic` | 900 | Sonsuz mağaranın ilk düz ve geniş bölümü. |
| `kucukSonar` | `{hiz, menzil, guc}` | Dokununca çıkan yankı: dalga hızı, ulaştığı mesafe, parlaklığı (0–1). |
| `buyukSonar` | `{hiz, menzil, guc}` | Basılı tutunca çıkan büyük yankı. |
| `buyukSonarEsigi` | 0.3 | Büyük yankı için basılı tutma süresi (sn). |
| `enerjiDolumu` | 0.2 | Büyük yankı enerjisinin saniyede dolan payı (1 = dolu; 0,2 → 5 sn). |
| `dalgaKalinligi` | 34 | Yankı halkasının duvara değme kalınlığı. |
| `sonmeSuresi` | 1.3 | Yankı değen duvarın sönme hızı (sn). Büyük = daha uzun görünür. |
| `belirmeSuresi` | 0.09 | Duvarın parlamaya geçiş süresi (sn). |
| `ornekAraligi` | 10 | Duvar ışığının hesaplandığı aralık (küçük = daha akıcı, daha ağır). |
| `bocekAraligi` | [380, 760] | Sonsuz mağarada iki ateş böceği arası. |
| `bocekPuani` | 5 | Bir ateş böceğinin puanı. |
| `bocekYaricap` | 34 | Ateş böceğini toplama yakınlığı. |
| `yenidenBaslamaBeklemesi` | 0.7 | Çarpınca ya da bölüm bitince dokunuşun kabul edilmesine kadar bekleme (sn). |
| `isinma` | 6000 | Sonsuz mağarada zorluğun yumuşak arttığı ilk yol. |
| `sivriBaslangic` | 2500 | Sonsuz mağarada sarkıt/dikitlerin başladığı yer. |
| `sivriAraligi` | [650, 1300] | İki sivri arası (sonsuz mağara; ilerledikçe sıklaşır). |
| `sivriBoyu` | [60, 150] | Sivri boyu (sonsuz mağara). |
| `sivriTaban` | [46, 74] | Sivri taban genişliği (sonsuz mağara). |
| `sivriGecit` | 230 | Sivrinin yanında her zaman kalan geçit (sonsuz mağara). |
| `tehlikeBaslangic` | 3600 | Sonsuz mağarada ağ/damlanın başladığı yer. |
| `tehlikeAraligi` | [950, 1800] | İki tehlike arası (sonsuz mağara). |
| `agYaricap` | 30 | Örümcek ağının büyüklüğü. |
| `agSuresi` | 2.2 | Ağa takılınca etkinin süresi (sn). |
| `agKanatCarpani` | 0.72 | Ağdayken kanat gücü bu oranla çarpılır. |
| `agHizCarpani` | 0.8 | Ağdayken ilerleme hızı bu oranla çarpılır. |
| `damlaYaricap` | 9 | Su damlasının büyüklüğü. |
| `damlaDusmeMesafesi` | 330 | Yarasa bu kadar yaklaşınca damla tavandan kopar. |
| `damlaSuresi` | 4 | Islanınca ağırlaşmanın süresi (sn). |
| `damlaYercekimiCarpani` | 1.3 | Islakken yerçekimi bu oranla çarpılır. |

Sonsuz mağaraya özgü ayarlar (`bosluk`, `sivri*`, `tehlikeAraligi`…) el yapımı bölümleri etkilemez; fizik, yankı, hız ve tehlike etkileri
her ikisinde de geçerlidir.

## `bolumler[]`

```json
{ "id": "ilk_ucus", "ad": "İlk uçuş", "aciklama": "…", "uzunluk": 5000,
  "duvar": { "noktalar": [ { "x": 0, "ust": 200, "alt": 800 }, { "x": 1200, "ust": 220, "alt": 780 } ] },
  "sivriler": [ { "x": 2400, "ust": true, "boy": 110, "taban": 60 } ],
  "tehlikeler": [ { "tur": "ag", "x": 3650 }, { "tur": "damla", "x": 4300 } ],
  "bocekler": [ { "x": 800 }, { "x": 2650, "y": 520 } ] }
```

| Alan | Tür | Açıklama |
|---|---|---|
| `id` | yazı | Değişmeyen kimlik: küçük harf, rakam, `_`. En iyi süre bu kimlikle saklanır. Tekrar eden kimlikli bölüm atlanır. |
| `ad` | yazı | Menüde ve ekranda görünen ad. |
| `aciklama` | yazı | İsteğe bağlı kısa açıklama (menüde düğmenin ipucu). |
| `uzunluk` | sayı | Bölümün sonu (en az 500). Yarasa bu x'e varınca "Bölüm bitti". |
| `duvar.noktalar` | liste | `{x, ust, alt}`: o x'te tavanın ve tabanın yüksekliği (0 = ekranın üstü, 1000 = altı). Noktalar arası yumuşak eğriyle birleşir; ilkinden önce ve sonuncudan sonra duvar düz sürer. En az 2 nokta; `alt` en az `ust + 60`. |
| `duvar.tohum` | sayı | `noktalar` yerine: duvar sonsuz mağaranın bu tohumla üretilen hâlidir (her seferinde aynı). |
| `sivriler[]` | liste | `x`, `ust` (true = tavandan sarkıt, false = tabandan dikit), `boy` (duvardan uca), `taban` (genişlik). |
| `tehlikeler[]` | liste | `tur`: `"ag"` (örümcek ağı) ya da `"damla"` (su damlası), `x`, isteğe bağlı `y` (boşsa ağ geçidin ortasında, damla tavanda). |
| `bocekler[]` | liste | Ateş böcekleri: `x`, isteğe bağlı `y` (boşsa geçidin ortası). |

Bölümde sivri, tehlike ve böcek yalnız listedekilerdir; rastgele hiçbir şey eklenmez. Çarpınca aynı bölüm baştan başlar.
Rekor (en yüksek puan) yalnız sonsuz mağaranındır; bölümlerde **en kısa süre** saklanır.

**Geçit denetimi:** her 10 birimde, sivriler dahil serbest geçit ölçülür; 150 birimden dar yer yarasanın geçemeyeceği kadar dar sayılır
(`gecitDenetimi`, `kaynak/src/oyun/icerik.ts`; testler örnek bölümlerde dar yer olmadığını denetler). Atölye bu yerleri kırmızı gösterecek.

## Değişiklikler
- 2026-11-27 — Sürüm 1: ilk biçim (ayarlar + bölümler). Örnek bölümler: İlk uçuş, Dar geçit, Uzun mağara (ÖRNEK; Harun'un değiştirmesi için).
