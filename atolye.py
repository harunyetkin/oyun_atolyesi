"""
Oyun Atölyesi — masaüstü kabuğu.

Arayüz app/ klasöründeki web sayfasıdır; Windows'un kendi tarayıcı motoruyla
(WebView2) bir uygulama penceresinde açılır. Bu dosya pencereyi açar ve
arayüzün dosya işlerini (proje kaydetme, sürümler, dışa aktarma) yapar.

Projeler:  Belgeler/OyunAtolyesi/projeler/<proje adı>/oyun.json
Sürümler:  Belgeler/OyunAtolyesi/projeler/<proje adı>/surumler/*.json
Dışa aktarılan oyunlar: Belgeler/OyunAtolyesi/disari/<proje adı>.html
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


def main():
    import webview  # pywebview
    webview.create_window(
        "Oyun Atölyesi",
        kaynak_yolu(os.path.join("app", "index.html")),
        js_api=Api(),
        width=1440, height=880, min_size=(1100, 700),
        background_color="#16181d",
    )
    webview.start()


if __name__ == "__main__":
    main()
