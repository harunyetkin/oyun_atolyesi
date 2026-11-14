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
print("API TESTI TAMAM")
