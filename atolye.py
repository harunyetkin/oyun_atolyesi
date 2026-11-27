"""
Oyun Atölyesi — masaüstü kabuğu.

Arayüz app/ klasöründeki web sayfasıdır; Windows'un kendi tarayıcı motoruyla
(WebView2) bir uygulama penceresinde açılır. Bu dosya pencereyi açar ve
arayüzün dosya işlerini (proje kaydetme, sürümler, dışa aktarma) yapar.

Projeler:  Belgeler/OyunAtolyesi/projeler/<proje adı>/oyun.json
Sürümler:  Belgeler/OyunAtolyesi/projeler/<proje adı>/surumler/*.json
Dışa aktarılan oyunlar: Belgeler/OyunAtolyesi/disari/<proje adı>.html
Yankı: bu deponun yanki/ klasöründeki icerik/yanki.json (ayarlar ve bölümler). Kaydedince eski hâli yedeklenir,
       yanki/oyun/icerik.json ve tek dosyalık yanki/Yanki.html de yenilenir.
Oyun içeriği: Harun'un oyun klasöründeki icerik/*.json dosyaları (klasör bir kez seçilir,
               Belgeler/OyunAtolyesi/ayarlar.json'da hatırlanır). Her kayıttan önce eski hâli
               Belgeler/OyunAtolyesi/icerik_yedekleri/ altına kopyalanır.
"""
import datetime
import json
import os
import re
import subprocess
import sys

KOK = os.path.join(os.path.expanduser("~"), "Documents", "OyunAtolyesi")
PROJELER = os.path.join(KOK, "projeler")
DISARI = os.path.join(KOK, "disari")
AYARLAR = os.path.join(KOK, "ayarlar.json")
YEDEKLER = os.path.join(KOK, "icerik_yedekleri")
PENCERE = None  # pywebview penceresi (klasör seçme penceresi için)


def kaynak_yolu(goreli):
    """PyInstaller ile paketlenince dosyalar geçici bir klasöre açılır."""
    temel = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(temel, goreli)


def guvenli_ad(ad, uzunluk=60):
    ad = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "", str(ad)).strip().strip(".")
    return ad[:uzunluk] or "adsiz"


def json_yaz(yol, veri):
    """Önce geçici dosyaya yazıp sonra yerine koyar: yazarken kapanırsa dosya bozulmaz."""
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    gecici = yol + ".tmp"
    with open(gecici, "w", encoding="utf-8") as f:
        json.dump(veri, f, ensure_ascii=False, indent=2)
    os.replace(gecici, yol)


def klasor_ac(yol):
    os.makedirs(yol, exist_ok=True)
    if sys.platform.startswith("win"):
        os.startfile(yol)  # noqa: S606 — kullanıcının kendi klasörü
    elif sys.platform == "darwin":
        subprocess.Popen(["open", yol])
    else:
        subprocess.Popen(["xdg-open", yol])


def ayar_oku():
    try:
        with open(AYARLAR, encoding="utf-8") as f:
            veri = json.load(f)
        return veri if isinstance(veri, dict) else {}
    except (OSError, ValueError):
        return {}


def ayar_yaz(anahtar, deger):
    veri = ayar_oku()
    veri[anahtar] = deger
    json_yaz(AYARLAR, veri)


def oyun_klasoru_mu(yol):
    """Oyun klasörü: içinde icerik/ klasörü olan klasör."""
    return bool(yol) and os.path.isdir(os.path.join(yol, "icerik"))


def icerik_yolu(oyun, goreli):
    """icerik/ altındaki bir JSON dosyasının tam yolu; dışarı çıkan ya da .json olmayan yol reddedilir."""
    kok = os.path.realpath(os.path.join(oyun, "icerik"))
    goreli = str(goreli).replace("\\", "/")
    if not goreli.endswith(".json") or goreli.startswith("/") or ":" in goreli:
        raise ValueError("geçersiz içerik yolu")
    tam = os.path.realpath(os.path.join(kok, goreli))
    if os.path.commonpath([kok, tam]) != kok or tam == kok:
        raise ValueError("geçersiz içerik yolu")
    return tam


def yanki_klasoru_mu(yol):
    """Yankı klasörü: içinde icerik/yanki.json olan klasör."""
    return bool(yol) and os.path.isfile(os.path.join(yol, "icerik", "yanki.json"))


def uygulama_klasoru():
    """Atölye'nin bulunduğu klasör (.exe olarak paketlenince exe'nin yanı)."""
    if getattr(sys, "frozen", False):
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


def yedekle(yol, goreli):
    """Dosyanın şimdiki hâlini Belgeler/OyunAtolyesi/icerik_yedekleri/<zaman>/<goreli> altına kopyalar."""
    if not os.path.isfile(yol):
        return
    zaman = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    hedef = os.path.join(YEDEKLER, zaman, *str(goreli).replace("\\", "/").split("/"))
    os.makedirs(os.path.dirname(hedef), exist_ok=True)
    with open(yol, "rb") as kaynak, open(hedef, "wb") as yedek:
        yedek.write(kaynak.read())


def json_bicimli_yaz(yol, veri):
    """JSON'u eski dosyanın girintisi ve son satır sonuyla yazar (gereksiz fark çıkmasın); yarıda kalırsa bozulmaz."""
    girinti, son_satir = bicim_bul(yol)
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    gecici = yol + ".tmp"
    with open(gecici, "w", encoding="utf-8", newline="\n") as f:
        json.dump(veri, f, ensure_ascii=False, indent=girinti)
        if son_satir:
            f.write("\n")
    os.replace(gecici, yol)


def bicim_bul(yol):
    """Var olan dosyanın girinti genişliğini ve sonda satır sonu olup olmadığını bulur (gereksiz fark çıkmasın)."""
    girinti, son_satir = 2, True
    try:
        with open(yol, encoding="utf-8") as f:
            metin = f.read()
        for satir in metin.splitlines()[1:]:
            bosluk = len(satir) - len(satir.lstrip(" "))
            if bosluk:
                girinti = bosluk
                break
        son_satir = metin.endswith("\n")
    except OSError:
        pass
    return girinti, son_satir


class Api:
    """Arayüzün (JavaScript) çağırdığı işlemler."""

    def _proje_klasoru(self, ad):
        return os.path.join(PROJELER, guvenli_ad(ad))

    def proje_listesi(self):
        os.makedirs(PROJELER, exist_ok=True)
        return sorted(d for d in os.listdir(PROJELER)
                      if os.path.isfile(os.path.join(PROJELER, d, "oyun.json")))

    def proje_yukle(self, ad):
        with open(os.path.join(self._proje_klasoru(ad), "oyun.json"), encoding="utf-8") as f:
            return json.load(f)

    def proje_kaydet(self, ad, oyun):
        json_yaz(os.path.join(self._proje_klasoru(ad), "oyun.json"), oyun)
        return True

    def surum_kaydet(self, ad, not_metni, oyun):
        zaman = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        dosya = zaman + ("__" + guvenli_ad(not_metni, 40) if not_metni else "") + ".json"
        json_yaz(os.path.join(self._proje_klasoru(ad), "surumler", dosya),
                 {"not": not_metni or "", "tarih": zaman, "oyun": oyun})
        return dosya

    def surum_listesi(self, ad):
        klasor = os.path.join(self._proje_klasoru(ad), "surumler")
        if not os.path.isdir(klasor):
            return []
        sonuc = []
        for dosya in sorted(os.listdir(klasor), reverse=True):
            if not dosya.endswith(".json"):
                continue
            try:
                with open(os.path.join(klasor, dosya), encoding="utf-8") as f:
                    veri = json.load(f)
                sonuc.append({"dosya": dosya, "tarih": veri.get("tarih", ""), "not": veri.get("not", "")})
            except (OSError, ValueError):
                continue
        return sonuc

    def surum_yukle(self, ad, dosya):
        yol = os.path.join(self._proje_klasoru(ad), "surumler", os.path.basename(dosya))
        with open(yol, encoding="utf-8") as f:
            return json.load(f)["oyun"]

    def disa_aktar(self, ad, html):
        yol = os.path.join(DISARI, guvenli_ad(ad) + ".html")
        os.makedirs(DISARI, exist_ok=True)
        with open(yol, "w", encoding="utf-8") as f:
            f.write(html)
        klasor_ac(DISARI)
        return yol

    def klasoru_ac(self):
        klasor_ac(KOK)
        return True

    # ---------------------------------------------------------------- oyun içeriği
    def oyun_klasoru(self):
        """Hatırlanan oyun klasörü (hâlâ geçerliyse), yoksa boş metin."""
        yol = ayar_oku().get("oyun_klasoru", "")
        return yol if oyun_klasoru_mu(yol) else ""

    def oyun_klasoru_sec(self):
        """Klasör seçme penceresi açar. Seçilen klasör (ya da üstündeki/altındaki) oyun klasörüyse kaydeder.
        Dönüş: yol; vazgeçilirse ""; oyun klasörü değilse "!" ile başlayan açıklama."""
        if PENCERE is None:
            return ""
        import webview
        tur = getattr(getattr(webview, "FileDialog", None), "FOLDER", None)
        if tur is None:
            tur = webview.FOLDER_DIALOG
        secim = PENCERE.create_file_dialog(tur)
        if not secim:
            return ""
        yol = secim[0] if isinstance(secim, (list, tuple)) else secim
        for aday in (yol, os.path.dirname(yol), os.path.join(yol, "hikaye_oyun")):
            if oyun_klasoru_mu(aday):
                ayar_yaz("oyun_klasoru", aday)
                return aday
        return "!Bu klasörde 'icerik' klasörü yok. Oyunun ana klasörünü (hikaye_oyun) seç."

    def _oyun(self):
        yol = self.oyun_klasoru()
        if not yol:
            raise ValueError("oyun klasörü seçilmedi")
        return yol

    def icerik_listesi(self):
        """icerik/ altındaki bütün JSON dosyaları (göreli yol, / ile)."""
        kok = os.path.join(self._oyun(), "icerik")
        sonuc = []
        for klasor, _, dosyalar in os.walk(kok):
            for ad in dosyalar:
                if ad.endswith(".json"):
                    sonuc.append(os.path.relpath(os.path.join(klasor, ad), kok).replace(os.sep, "/"))
        return sorted(sonuc)

    def icerik_oku(self, goreli):
        with open(icerik_yolu(self._oyun(), goreli), encoding="utf-8") as f:
            return json.load(f)

    def icerik_yaz(self, goreli, veri):
        """Dosyayı yazar; önce eski hâlini yedekler. Girinti ve son satır sonu eskisi gibi kalır."""
        yol = icerik_yolu(self._oyun(), goreli)
        yedekle(yol, goreli)
        json_bicimli_yaz(yol, veri)
        return True

    # ---------------------------------------------------------------- Yankı (yanki/icerik/yanki.json)
    def yanki_klasoru(self):
        """Yankı klasörü: hatırlanan, yoksa Atölye'nin yanındaki yanki/. Bulunamazsa boş metin."""
        for aday in (ayar_oku().get("yanki_klasoru", ""), os.path.join(uygulama_klasoru(), "yanki")):
            if yanki_klasoru_mu(aday):
                return aday
        return ""

    def yanki_klasoru_sec(self):
        """Klasör seçme penceresi (Atölye'nin yanında yanki/ yoksa). Dönüş: yol, "" ya da "!açıklama"."""
        if PENCERE is None:
            return ""
        import webview
        tur = getattr(getattr(webview, "FileDialog", None), "FOLDER", None)
        if tur is None:
            tur = webview.FOLDER_DIALOG
        secim = PENCERE.create_file_dialog(tur)
        if not secim:
            return ""
        yol = secim[0] if isinstance(secim, (list, tuple)) else secim
        for aday in (yol, os.path.join(yol, "yanki"), os.path.dirname(yol)):
            if yanki_klasoru_mu(aday):
                ayar_yaz("yanki_klasoru", aday)
                return aday
        return "!Bu klasörde Yankı yok. oyun_atolyesi klasörünü ya da içindeki yanki klasörünü seç."

    def _yanki(self):
        yol = self.yanki_klasoru()
        if not yol:
            raise ValueError("Yankı klasörü bulunamadı")
        return yol

    def yanki_oku(self):
        with open(os.path.join(self._yanki(), "icerik", "yanki.json"), encoding="utf-8") as f:
            return json.load(f)

    def yanki_yaz(self, veri):
        """yanki.json'u yazar (önce yedek), derlenmiş oyunun icerik.json'unu ve tek dosyalık Yanki.html'i yeniler.
        Dönüş: Yanki.html yenilendiyse True; yenilenemediyse "!açıklama" (içerik yine kaydedilmiştir)."""
        kok = self._yanki()
        yol = os.path.join(kok, "icerik", "yanki.json")
        yedekle(yol, "yanki/yanki.json")
        json_bicimli_yaz(yol, veri)
        derlenmis = os.path.join(kok, "oyun")
        if os.path.isdir(derlenmis):
            with open(os.path.join(derlenmis, "icerik.json"), "w", encoding="utf-8", newline="\n") as f:
                json.dump(veri, f, ensure_ascii=False, indent=1)
        betik = os.path.join(kok, "araclar", "tek_dosya.py")
        try:
            import contextlib
            import io
            import runpy
            with contextlib.redirect_stdout(io.StringIO()):
                runpy.run_path(betik, run_name="__main__")
            return True
        except Exception as e:  # noqa: BLE001 — içerik kaydedildi; yalnız paket yenilenemedi
            return "!Yanki.html yenilenemedi: " + str(e)[:200]

    def yanki_oyna(self):
        """Tek dosyalık Yanki.html'i varsayılan tarayıcıda açar."""
        import webbrowser
        html = os.path.join(self._yanki(), "Yanki.html")
        if not os.path.isfile(html):
            return "!Yanki.html bulunamadı"
        webbrowser.open("file:///" + os.path.abspath(html).replace(os.sep, "/").lstrip("/"))
        return True


def main():
    import webview  # pywebview
    global PENCERE
    PENCERE = webview.create_window(
        "Oyun Atölyesi",
        kaynak_yolu(os.path.join("app", "index.html")),
        js_api=Api(),
        width=1440, height=880, min_size=(1100, 700),
        background_color="#16181d",
    )
    webview.start()


if __name__ == "__main__":
    main()
