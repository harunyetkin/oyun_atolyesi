"""Yankı otomatik oynanış testi: derlenmiş oyunu (yanki/oyun) telefon öykünmesiyle Chrome'da açar,
dokunur, basılı tutar, çarpar, yeniden başlar; çevrimdışı açılışı dener; ekran görüntüleri alır.

Kullanım: python3 yanki/araclar/oyun_testi.py [cikti_klasoru]
"""
import functools, http.server, os, sys, threading, time
from playwright.sync_api import sync_playwright

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "oyun")
CIKTI = sys.argv[1] if len(sys.argv) > 1 else "/tmp/yanki_test"
os.makedirs(CIKTI, exist_ok=True)

sonuclar, hatalar = [], []
def kontrol(ad, kosul, ayrinti=""):
    sonuclar.append((ad, bool(kosul)))
    print(("  ✓ " if kosul else "  !! ") + ad + (f"  ({ayrinti})" if ayrinti and not kosul else ""))

class Sessiz(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
sunucu = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Sessiz, directory=KOK))
threading.Thread(target=sunucu.serve_forever, daemon=True).start()
ADRES = f"http://127.0.0.1:{sunucu.server_port}/"

PILOT = """() => { const o = window.__yanki; clearInterval(window.__pilot);
  window.__pilot = setInterval(() => {
    if (o.durum !== 'oyun') return;
    let u = -1e9, a = 1e9;
    for (let dx = 0; dx <= 160; dx += 20) { const [uu, aa] = o.serbestAralik(o.yarasaX + dx); u = Math.max(u, uu); a = Math.min(a, aa); }
    if (o.y > (u + a) / 2 + 10 && o.vy > -100) { o.dokun(); o.birak(); }
  }, 16); }"""

def oyun(s, ifade):
    return s.evaluate(f"(() => {{ const o = window.__yanki; return {ifade}; }})()")

with sync_playwright() as p:
    tarayici = p.chromium.launch()
    for cihaz in ["Pixel 7", "iPhone 14"]:
        print(f"\n== {cihaz} ==")
        ayar = {k: v for k, v in p.devices[cihaz].items() if k != "default_browser_type"}
        ctx = tarayici.new_context(**ayar)
        s = ctx.new_page()
        konsol = []
        s.on("console", lambda m: m.type == "error" and konsol.append(m.text))
        s.on("pageerror", lambda e: konsol.append(str(e)))
        on = cihaz.split()[0].lower()
        s.goto(ADRES + "?test=1&tohum=7")
        s.wait_for_function("!!window.__yanki")
        time.sleep(0.8)
        g = s.viewport_size
        kontrol("oyun açıldı, menüde", oyun(s, "o.durum") == "menu")
        kontrol("dikey ekran: dünya genişliği ekrana göre", abs(oyun(s, "o.W") - max(420, 1000 * g["width"] / g["height"])) < 1, str(oyun(s, "o.W")))
        kontrol("tuval ekranı kaplıyor", s.evaluate("(() => { const c = document.getElementById('oyun'); return c.clientWidth === innerWidth && c.clientHeight === innerHeight; })()"))
        s.screenshot(path=f"{CIKTI}/{on}_1_menu.png")
        # dokun: oyun başlar, yarasa yükselir, yankı çıkar
        y0 = oyun(s, "o.y")
        s.touchscreen.tap(g["width"] / 2, g["height"] / 2)
        time.sleep(0.12)
        kontrol("dokununca oyun başladı", oyun(s, "o.durum") == "oyun")
        kontrol("dokununca yarasa yükseldi", oyun(s, "o.y") < y0 - 30, f"{y0} -> {oyun(s, 'o.y')}")
        time.sleep(0.25)
        kontrol("yankı duvarları aydınlattı", oyun(s, "[...o.isik.values()].filter(v => v[0] > 0.3 || v[1] > 0.3).length") > 10)
        # basılı tut: büyük yankı
        s.mouse.move(g["width"] / 2, g["height"] / 2)
        s.mouse.down(); time.sleep(0.45)
        kontrol("basılı tutunca büyük yankı çıktı", oyun(s, "o.dalgalar.some(d => d.buyuk)") and oyun(s, "o.enerji") < 0.5)
        s.mouse.up()
        # bırakınca düşer ve çarpar
        time.sleep(3)
        kontrol("dokunmayınca yarasa düştü, oyun bitti", oyun(s, "o.durum") == "bitti" and oyun(s, "o.carpmaNedeni") != "")
        kontrol("rekor kaydedildi", s.evaluate("Number(localStorage.getItem('yanki.rekor'))") == oyun(s, "o.rekor") and oyun(s, "o.rekor") >= 0)
        s.screenshot(path=f"{CIKTI}/{on}_3_bitti.png")
        s.touchscreen.tap(g["width"] / 2, g["height"] / 2)
        time.sleep(0.1)
        kontrol("yeniden dokununca yeni oyun başladı", oyun(s, "o.durum") == "oyun" and oyun(s, "o.kam") < 200)
        # otomatik pilotla uzun uçuş: mağara geçilebilir, skor ve böcekler
        s.evaluate(PILOT)
        time.sleep(7)
        kontrol("7 sn uçuş: hâlâ oyunda, skor arttı", oyun(s, "o.durum") == "oyun" and oyun(s, "o.skor") > 15, f"{oyun(s, 'o.durum')} skor {oyun(s, 'o.skor')}")
        kontrol("ateş böcekleri var", oyun(s, "o.bocekler.length") > 0)
        kontrol("sarkıt/dikit üretildi", oyun(s, "o.sivriler.length") > 0, str(oyun(s, "o.kam")))
        # duraklat: düğme görünür, basınca zaman durur, "yeniden başla" çıkar; dokununca devam
        kontrol("duraklat düğmesi oyun sırasında görünüyor", s.is_visible("#duraklat"))
        s.click("#duraklat")
        k1 = oyun(s, "o.kam"); time.sleep(0.4)
        kontrol("duraklatınca oyun durdu", oyun(s, "o.duraklatildi") and oyun(s, "o.kam") == k1 and s.is_visible("#yeniden") and not s.is_visible("#duraklat"))
        s.screenshot(path=f"{CIKTI}/{on}_4_duraklat.png")
        s.touchscreen.tap(g["width"] / 2, g["height"] / 3)
        time.sleep(0.15)
        kontrol("dokununca devam etti", not oyun(s, "o.duraklatildi") and oyun(s, "o.kam") > k1)
        s.click("#duraklat"); s.click("#yeniden"); time.sleep(0.1)
        kontrol("'yeniden başla' yeni oyun başlattı", oyun(s, "o.durum") == "oyun" and oyun(s, "o.kam") < 200 and not oyun(s, "o.duraklatildi"))
        time.sleep(4)
        # bir sivriyi yarasanın önüne koyup büyük yankıyla aydınlat (ekran görüntüsü için)
        oyun(s, "(o.sivriler.push({ x: o.yarasaX + 260, ust: true, boy: 150, taban: 64 }), o.sivriler.push({ x: o.yarasaX + 520, ust: false, boy: 140, taban: 60 }))")
        # ölümcül olmayan tehlikeler: yarasanın üstüne bir ağ koy → etki ve yazı; önüne bir ağ ve bir damla (ekran görüntüsü için)
        oyun(s, "o.tehlikeler.push({ tur: 'ag', x: o.yarasaX + 2, y: o.y, vy: 0, dustu: false, alindi: false, isik: 1 })")
        time.sleep(0.15)
        kontrol("ağa takılınca kanat zayıfladı ve yazı çıktı, oyun sürüyor", oyun(s, "o.etkiler.ag") > 1 and oyun(s, "o.durum") == "oyun"
                and "Ağa takıldın!" in oyun(s, "o.yazilar.map(y => y.metin).join()"))
        oyun(s, "(o.tehlikeler.push({ tur: 'ag', x: o.yarasaX + 170, y: (o.serbestAralik(o.yarasaX + 170)[0] + o.serbestAralik(o.yarasaX + 170)[1]) / 2 - 90, vy: 0, dustu: false, alindi: false, isik: 1 }), "
                   "o.tehlikeler.push({ tur: 'damla', x: o.yarasaX + 380, y: o.sinir(o.yarasaX + 380)[0] + 8, vy: 0, dustu: false, alindi: false, isik: 1 }))")
        oyun(s, "(o.enerji = 1, o.sonar(true))")
        time.sleep(0.55)
        s.screenshot(path=f"{CIKTI}/{on}_2_ucus.png")
        s.evaluate("clearInterval(window.__pilot)")
        fps = s.evaluate("""new Promise(r => { let n = 0; const t0 = performance.now();
            const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); })""")
        print(f"     (çizim hızı bu sanal makinede ~{fps} kare/sn; ekran kartı yok)")
        kontrol("sesi kapat düğmesi çalışıyor", (s.click("#ses"), s.evaluate("localStorage.getItem('yanki.sessiz')"))[1] == "1")
        kontrol("konsol hatası yok", not konsol, "; ".join(konsol[:3]))
        ctx.close()

    # bilgisayar ve farklı ekran oranları: oyun alanı ekrana sığar, her karede bütün tuval temizlenir (iz kalmaz)
    for gen, yuk in [(1916, 939), (2560, 1080), (1024, 768), (360, 900)]:
        print(f"\n== {gen}×{yuk} ==")
        ctx = tarayici.new_context(viewport={"width": gen, "height": yuk})
        s = ctx.new_page()
        konsol = []
        s.on("pageerror", lambda e: konsol.append(str(e)))
        s.goto(ADRES + "?test=1&tohum=7")
        s.wait_for_function("!!window.__yanki")
        time.sleep(0.4)
        z = s.evaluate("window.__cizim()")
        sigar = z["W"] * z["olcek"] <= z["tw"] + 1 and 1000 * z["olcek"] <= z["th"] + 1
        dolar = abs(z["W"] * z["olcek"] - z["tw"]) < 2 or abs(1000 * z["olcek"] - z["th"]) < 2
        kontrol("oyun alanı ekrana sığıyor ve bir yönde tam dolduruyor", sigar and dolar, str(z))
        if (gen, yuk) == (1916, 939):
            kontrol("Harun'un geniş ekranında boşluk kalmıyor", abs(z["W"] * z["olcek"] - z["tw"]) < 2 and abs(1000 * z["olcek"] - z["th"]) < 2, str(z))
        s.keyboard.down("Space"); s.keyboard.up("Space")
        s.evaluate(PILOT)
        time.sleep(2.5)
        # tuvali baştan sona eflatuna boya; bir sonraki karede hiçbir köşede eflatun kalmamalı
        kalan = s.evaluate("""() => new Promise(r => {
            const c = document.getElementById('oyun'), g = c.getContext('2d');
            g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ff00ff'; g.fillRect(0, 0, c.width, c.height);
            requestAnimationFrame(() => requestAnimationFrame(() => {
              const w = c.width, h = c.height, n = [];
              for (const [x, y] of [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w - 2, h >> 1], [w >> 1, 1]]) {
                const d = g.getImageData(x, y, 1, 1).data; if (d[0] > 200 && d[2] > 200 && d[1] < 80) n.push([x, y]);
              }
              r(n);
            }));
          })""")
        kontrol("her karede bütün ekran yeniden çiziliyor (kenarlarda iz yok)", not kalan, str(kalan))
        kontrol("oyun sürüyor, hata yok", oyun(s, "o.durum") == "oyun" and not konsol, "; ".join(konsol[:2]))
        oyun(s, "(o.enerji = 1, o.sonar(true))")
        time.sleep(0.6)
        s.screenshot(path=f"{CIKTI}/ekran_{gen}x{yuk}.png")
        s.evaluate("clearInterval(window.__pilot)")
        ctx.close()

    # çevrimdışı: test kipi olmadan açılınca çevrimdışı çalışma kurulur; internet kesilince de açılır
    print("\n== çevrimdışı ==")
    ctx = tarayici.new_context(**{k: v for k, v in p.devices["Pixel 7"].items() if k != "default_browser_type"})
    s = ctx.new_page()
    s.goto(ADRES)
    hazir = s.evaluate("navigator.serviceWorker.ready.then(() => true)")
    s.wait_for_timeout(1500)
    kontrol("çevrimdışı çalışma kuruldu", hazir)
    ctx.set_offline(True)
    try:
        s.reload(); s.wait_for_function("!!window.__yanki", timeout=5000)
        kontrol("internet yokken de açıldı", s.evaluate("window.__yanki.durum") == "menu")
    except Exception as e:
        kontrol("internet yokken de açıldı", False, str(e)[:120])
    man = s.evaluate("fetch('manifest.webmanifest').then(r => r.json())")
    kontrol("uygulama bilgisi (manifest): ad, simgeler, dikey", man["name"] == "Yankı" and len(man["icons"]) >= 2 and man["orientation"] == "portrait")
    ctx.close()
    tarayici.close()

sunucu.shutdown()
basarisiz = [a for a, k in sonuclar if not k]
print(f"\n{len(sonuclar) - len(basarisiz)}/{len(sonuclar)} kontrol geçti")
sys.exit(1 if basarisiz else 0)
