"""Arayüzü Chrome'da açıp temel işlemleri dener ve ekran görüntüleri alır.
Kullanım: python3 araclar/arayuz_testi.py [cikti_klasoru]"""
import functools, http.server, os, sys, threading, time
from playwright.sync_api import sync_playwright

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKTI = sys.argv[1] if len(sys.argv) > 1 else "/tmp/atolye_test"
os.makedirs(CIKTI, exist_ok=True)

isleyici = functools.partial(http.server.SimpleHTTPRequestHandler, directory=os.path.join(KOK, "app"))
isleyici.log_message = lambda *a: None
sunucu = http.server.ThreadingHTTPServer(("127.0.0.1", 0), isleyici)
threading.Thread(target=sunucu.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{sunucu.server_port}/index.html?test=1"

hatalar = []
with sync_playwright() as p:
    tarayici = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    s = tarayici.new_page(viewport={"width": 1440, "height": 860})
    s.on("pageerror", lambda e: hatalar.append("sayfa: " + str(e)))
    s.on("console", lambda m: m.type == "error" and hatalar.append("konsol: " + m.text))
    s.goto(URL)
    s.wait_for_selector("#ogeListesi li")
    time.sleep(1.0)
    s.screenshot(path=f"{CIKTI}/1_acilis.png")

    # oyna: otomatik pilotla birkaç saniye
    s.click("#oynaBtn")
    for _ in range(90):
        s.evaluate("""() => { const m = window.__atolye.motor; const [u,a] = m.sinir(m.kam+200);
                      if (m.y > (u+a)/2 + 10 && m.vy > -50) m.bas(); }""")
        time.sleep(1/30)
    s.screenshot(path=f"{CIKTI}/2_oyun.png")
    print("oyun durumu:", s.evaluate("window.__atolye.motor.durum"), "skor:", s.evaluate("window.__atolye.motor.skor"))

    # nesne seç ve ayarını değiştir
    s.click("#ogeListesi li:has-text('Örümcek ağı')")
    s.select_option("#ozellikler select >> nth=1", "kanat_zayiflat") if False else None
    boyut = s.locator("#ozellikler .alan:has-text('Boyut') input[type=range]")
    boyut.evaluate("(el) => { el.value = 45; el.dispatchEvent(new Event('input')); }")
    etki = s.locator("#ozellikler .alan:has-text('Etki') select").first
    etki.select_option("sersem")
    yeni_boyut = s.evaluate("window.__atolye.oyun.nesneler.find(n => n.ad === 'Örümcek ağı').boyut")
    yeni_etki = s.evaluate("window.__atolye.oyun.nesneler.find(n => n.ad === 'Örümcek ağı').etki.tip")
    gorunen = s.locator("#ozellikler .alan:not(.gizli)").all_inner_texts()
    print("ag boyutu:", yeni_boyut, "etki:", yeni_etki, "| guc alani gorunur:", any("Etki gücü" in g for g in gorunen))
    s.screenshot(path=f"{CIKTI}/3_ozellik.png")

    # oyuncu ayarı, nesne ekleme, sürüm
    s.click("#ogeListesi li:has-text('Oyuncu')")
    s.locator("#ozellikler .alan:has-text('Şekil') select").select_option("kus")
    s.click("button[data-ekle=toplanabilir]")
    s.fill("#surumNotu", "ilk deneme")
    s.click("#surumKaydetBtn")
    time.sleep(0.5)
    print("nesne sayisi:", s.evaluate("window.__atolye.oyun.nesneler.length"),
          "| surum listesi:", s.locator("#surumListesi li").all_inner_texts())

    # yeni proje
    s.click("#yeniProjeBtn")
    s.click("#yeniProjeOlustur")
    print("bos ad hatasi:", s.inner_text("#yeniProjeHata"))
    s.fill("#yeniProjeAdi", "Deneme Oyunu")
    s.select_option("#yeniProjeSablon", "Kuş Uçuşu")
    s.click("#yeniProjeOlustur")
    time.sleep(0.8)
    print("acik proje:", s.evaluate("window.__atolye.projeAdi"), "| projeler:", s.locator("#projeListesi option").all_inner_texts())
    s.click("#oynaBtn")
    for _ in range(45):
        s.evaluate("""() => { const m = window.__atolye.motor; const [u,a] = m.sinir(m.kam+200);
                      if (m.y > (u+a)/2 + 10 && m.vy > -50) m.bas(); }""")
        time.sleep(1/30)
    s.screenshot(path=f"{CIKTI}/4_kus.png")

    # dışa aktar ve dışa aktarılan oyunu ayrı sayfada aç
    s.click("#disaAktarBtn")
    time.sleep(0.5)
    html = s.evaluate("window.__sonDisaAktarim")
    print("disa aktarilan html:", len(html or ""), "karakter")
    s2 = tarayici.new_page(viewport={"width": 960, "height": 540})
    s2.on("pageerror", lambda e: hatalar.append("disa aktarilan: " + str(e)))
    s2.set_content(html)
    s2.mouse.click(400, 300)
    time.sleep(1.0)
    s2.screenshot(path=f"{CIKTI}/5_disa_aktarilan.png")
    tarayici.close()

sunucu.shutdown()
print("HATALAR:", hatalar or "yok")
sys.exit(1 if hatalar else 0)
