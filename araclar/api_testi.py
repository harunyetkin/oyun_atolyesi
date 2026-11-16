"""atolye.py'deki dosya işlemlerini geçici bir klasörde dener."""
import os, sys, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import atolye

with tempfile.TemporaryDirectory() as tmp:
    atolye.KOK = tmp
    atolye.PROJELER = os.path.join(tmp, "projeler")
    atolye.DISARI = os.path.join(tmp, "disari")
    atolye.klasor_ac = lambda yol: None
    a = atolye.Api()
    assert a.proje_listesi() == []
    oyun = {"ad": "Karanlık Mağara", "dunya": {"hiz": 200}, "oyuncu": {}, "nesneler": []}
    a.proje_kaydet("Karanlık Mağara", oyun)
    a.proje_kaydet('kötü/ad:"?', oyun)
    print("projeler:", a.proje_listesi())
    assert a.proje_yukle("Karanlık Mağara")["dunya"]["hiz"] == 200
    d1 = a.surum_kaydet("Karanlık Mağara", "ilk hal", oyun)
    oyun["dunya"]["hiz"] = 300
    a.surum_kaydet("Karanlık Mağara", "", oyun)
    liste = a.surum_listesi("Karanlık Mağara")
    print("surumler:", [(s["dosya"][:15], s["not"]) for s in liste])
    assert a.surum_yukle("Karanlık Mağara", d1)["dunya"]["hiz"] == 200
    assert a.surum_yukle("Karanlık Mağara", "../../oyun.json".replace("oyun", d1[:-5]))["dunya"]["hiz"] == 200  # yol kaçışı engelli
    yol = a.disa_aktar("Karanlık Mağara", "<html>ok</html>")
    assert open(yol, encoding="utf-8").read() == "<html>ok</html>"
    print("disa aktarma:", os.path.relpath(yol, tmp))

# Oyun içeriği: klasör hatırlama, listeleme, okuma/yazma, yedek, yol güvenliği, biçimin korunması
with tempfile.TemporaryDirectory() as tmp:
    atolye.KOK = tmp
    atolye.AYARLAR = os.path.join(tmp, "ayarlar.json")
    atolye.YEDEKLER = os.path.join(tmp, "yedek")
    oyun = os.path.join(tmp, "hikaye_oyun")
    os.makedirs(os.path.join(oyun, "icerik", "haritalar"))
    with open(os.path.join(oyun, "icerik", "karakterler.json"), "w", encoding="utf-8") as f:
        f.write('{\n  "surum": 1,\n  "oyuncu": {"hareket": {"yurume_hizi": 150}}\n}\n')
    with open(os.path.join(oyun, "icerik", "haritalar", "yol.json"), "w", encoding="utf-8") as f:
        f.write('{\n "surum": 1,\n "ad": "Yol"\n}')
    with open(os.path.join(tmp, "gizli.json"), "w", encoding="utf-8") as f:
        f.write("{}")
    a = atolye.Api()
    assert a.oyun_klasoru() == ""
    atolye.ayar_yaz("oyun_klasoru", oyun)
    assert a.oyun_klasoru() == oyun
    assert a.icerik_listesi() == ["haritalar/yol.json", "karakterler.json"], a.icerik_listesi()
    k = a.icerik_oku("karakterler.json")
    k["oyuncu"]["hareket"]["kamera_gore_kontrol"] = 1
    k["not"] = "Türkçe ğüşıöç"
    a.icerik_yaz("karakterler.json", k)
    metin = open(os.path.join(oyun, "icerik", "karakterler.json"), encoding="utf-8").read()
    assert metin.startswith('{\n  "surum"') and metin.endswith("}\n") and "ğüşıöç" in metin, metin
    h = a.icerik_oku("haritalar/yol.json"); h["unreal_model_aci"] = 90
    a.icerik_yaz("haritalar/yol.json", h)
    metin = open(os.path.join(oyun, "icerik", "haritalar", "yol.json"), encoding="utf-8").read()
    assert metin.startswith('{\n "surum"') and not metin.endswith("\n"), "girinti 1 ve son satırsız kalmalı"
    yedekler = [os.path.relpath(os.path.join(d, f), atolye.YEDEKLER) for d, _, fs in os.walk(atolye.YEDEKLER) for f in fs]
    assert len(yedekler) == 2 and any(y.endswith("yol.json") for y in yedekler), yedekler
    for kotu in ["../gizli.json", "../../gizli.json", "/etc/passwd", "C:/x.json", "haritalar/../../gizli.json", "notlar.txt", "..\\gizli.json"]:
        try:
            a.icerik_oku(kotu)
            raise AssertionError("yol kaçışı engellenmedi: " + kotu)
        except (ValueError, OSError):
            pass
    try:
        a.icerik_yaz("../gizli.json", {"x": 1}); raise AssertionError("yazma kaçışı engellenmedi")
    except ValueError:
        pass
    print("oyun içeriği:", a.icerik_listesi(), "yedek:", len(yedekler))
print("API TESTI TAMAM")
