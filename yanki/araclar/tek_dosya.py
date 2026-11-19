"""Derlenmiş oyunu (yanki/oyun/) tek bir HTML dosyasına paketler: yanki/Yanki.html.

Bu dosya bilgisayarda çift tıklayınca tarayıcıda açılır; internet, kurulum ya da sunucu gerekmez.
(Telefonda "ana ekrana ekle" ve çevrimdışı çalışma için GitHub Pages bağlantısı kullanılır.)

Kullanım: önce `cd yanki/kaynak && npm run build`, sonra `python3 yanki/araclar/tek_dosya.py`
"""
import base64, os, re

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OYUN = os.path.join(KOK, "oyun")
CIKTI = os.path.join(KOK, "Yanki.html")

html = open(os.path.join(OYUN, "index.html"), encoding="utf-8").read()

def oku(yol):
    return open(os.path.join(OYUN, yol.lstrip("./")), encoding="utf-8").read()

# betik ve stil gömülür
def betik(m):
    return "<script type=\"module\">\n" + oku(m.group(1)).replace("</script", "<\\/script") + "\n</script>"
html, n1 = re.subn(r'<script type="module" crossorigin src="([^"]+)"></script>', betik, html)
html, n2 = re.subn(r'<link rel="stylesheet" crossorigin href="([^"]+)">', lambda m: "<style>\n" + oku(m.group(1)) + "\n</style>", html)
assert n1 == 1 and n2 == 1, "derlenmiş index.html beklenen biçimde değil"

# simge gömülür; uygulama bilgisi (manifest) tek dosyada işe yaramaz, çıkarılır
simge = base64.b64encode(open(os.path.join(OYUN, "simge-192.png"), "rb").read()).decode()
html = re.sub(r'\s*<link rel="manifest"[^>]*>', "", html)
html = re.sub(r'\s*<link rel="apple-touch-icon"[^>]*>', "", html)
html = html.replace('href="./simge-192.png"', f'href="data:image/png;base64,{simge}"')

open(CIKTI, "w", encoding="utf-8").write(html)
print(f"{CIKTI}: {os.path.getsize(CIKTI) // 1024} KB")
