"""Derlenmiş arayüzü (app/) Chrome'da açıp temel işlemleri dener ve ekran görüntüleri alır.
Kullanım: python3 araclar/arayuz_testi.py [cikti_klasoru]
Önce: cd arayuz && npm run build"""
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

hatalar, sonuclar = [], []


def kontrol(ad, kosul, ayrinti=""):
    sonuclar.append((ad, bool(kosul)))
    print(("  OK  " if kosul else "  !!  ") + ad + (f"  ({ayrinti})" if ayrinti else ""))


def durum(s, ifade):
    return s.evaluate(f"(() => {{ const d = window.__atolye.getState(); return {ifade}; }})()")


with sync_playwright() as p:
    tarayici = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    s = tarayici.new_page(viewport={"width": 1600, "height": 900})
    s.on("pageerror", lambda e: hatalar.append("sayfa: " + str(e)))
    s.on("console", lambda m: m.type == "error" and hatalar.append("konsol: " + m.text))
    s.goto(URL)

    # 1) başlangıç ekranı
    s.wait_for_selector("[data-testid=baslangic]")
    s.screenshot(path=f"{CIKTI}/1_baslangic.png")
    kontrol("başlangıç ekranında örnek proje var", s.locator("[data-testid=proje-karti]").count() >= 1)

    # 2) örnek projeyi aç
    s.locator("[data-testid=proje-karti]").first.click()
    s.wait_for_selector("[data-testid=sahne]")
    time.sleep(0.6)
    kontrol("editör açıldı", durum(s, "d.ekran") == "editor")
    s.screenshot(path=f"{CIKTI}/2_editor.png")

    # 3) sahne ağacından Kuş'u seç, özellikler paneli
    s.click("[data-testid=sekme-agac]")
    s.locator(".satir:has-text('Kuş')").last.click()
    time.sleep(0.3)
    kontrol("özelliklerde Dönüşüm kartı", s.locator("[data-testid=ozellikler] >> text=Dönüşüm").count() == 1)
    kontrol("özelliklerde Davranışlar kartı", s.locator("[data-testid=ozellikler] >> text=Tuşla zıpla / uç").count() >= 1)
    s.screenshot(path=f"{CIKTI}/3_secim.png")

    # 4) sahnede tıklayarak seçim ve sürükleyerek taşıma
    kus_id = durum(s, "d.secim.id")
    ilk = durum(s, f"d.proje.sahneler[0].ornekler.find(o => o.id === '{kus_id}')")
    s.keyboard.press("Escape")
    s.evaluate("window.__atolye.getState().sec(null)")
    kutu = s.locator("[data-testid=sahne]").bounding_box()
    z = durum(s, "d.yakinlastirma")
    # kamera sahneyi ortaladı: dünya (x,y) -> ekran
    sx = kutu["x"] + kutu["width"] / 2 + (ilk["x"] - 480) * z
    sy = kutu["y"] + kutu["height"] / 2 + (ilk["y"] - 270) * z
    s.mouse.move(sx, sy); s.mouse.down(); s.mouse.move(sx + 80, sy + 40, steps=8); s.mouse.up()
    son = durum(s, f"d.proje.sahneler[0].ornekler.find(o => o.id === '{kus_id}')")
    kontrol("tıklayınca seçildi", durum(s, "d.secim && d.secim.id") == kus_id)
    kontrol("sürükleyince taşındı", abs(son["x"] - ilk["x"] - 80 / z) < 3 and abs(son["y"] - ilk["y"] - 40 / z) < 3,
            f"{ilk['x']},{ilk['y']} -> {son['x']},{son['y']}")

    # 5) yeni nesne türü + bileşen ekle + listeden sahneye sürükle-bırak
    s.click("[data-testid=sekme-nesneler]")
    s.click("[data-testid=yeni-tur]")
    s.select_option("[data-testid=bilesen-ekle]", "fizik")
    kontrol("bileşen eklendi", s.locator("[data-testid=ozellikler] >> text=Yerçekimi").count() == 1)
    once = durum(s, "d.proje.sahneler[0].ornekler.length")
    s.locator(".satir:has-text('Yeni nesne')").drag_to(s.locator("[data-testid=sahne]"), target_position={"x": 300, "y": 200})
    kontrol("sürükle-bırak ile sahneye eklendi", durum(s, "d.proje.sahneler[0].ornekler.length") == once + 1)

    # 6) oynat: motor çalışmalı — kuş düşmeli, boşluk ile zıplamalı, borular kaymalı
    kus_dunya = f"window.__dunya && window.__dunya.nesneler.find(n => n.id === '{kus_id}')"
    s.click("[data-testid=oynat]")
    time.sleep(0.15)
    kontrol("oyun dünyası kuruldu", s.evaluate("!!window.__dunya"))
    boru_x0 = s.evaluate("window.__dunya.nesneler.find(n => n.turId === 'tur_boru').x")
    kus_y0 = s.evaluate(f"{kus_dunya}.y")
    kontrol("kuş yerçekimiyle düşüyor", kus_y0 > son["y"] + 3, f"{son['y']} -> {kus_y0:.0f}")
    s.keyboard.press("Space"); time.sleep(0.03)
    kontrol("Boşluk ile kuş zıpladı", s.evaluate(f"{kus_dunya}.vy") < 0)
    for _ in range(3):
        time.sleep(0.2); s.keyboard.press("Space")
    kontrol("borular sola kaydı", s.evaluate("window.__dunya.nesneler.find(n => n.turId === 'tur_boru').x") < boru_x0 - 50)
    kontrol("oynatma şeridinde tuş ipucu", "Boşluk" in s.inner_text("[data-testid=oynatma-bilgi]"))
    s.screenshot(path=f"{CIKTI}/4_oynatma.png")
    kontrol("oynatma modunda", durum(s, "d.oynatma") == "oynuyor")
    # oynarken W tuşu aracı değiştirmemeli (oyun tuşu olabilir)
    arac0 = durum(s, "d.arac"); s.keyboard.press("w")
    kontrol("oynarken W aracı değiştirmedi", durum(s, "d.arac") == arac0)
    # kuş zemine düşünce zeminin içinden geçmemeli
    time.sleep(2.2)
    kus_y = s.evaluate(f"{kus_dunya}.y")
    kontrol("kuş katı zeminin içinden geçmedi", kus_y < 450, f"y={kus_y:.0f}")
    s.keyboard.press("Shift+F5")
    kontrol("durdurunca düzenlemeye döndü", durum(s, "d.oynatma") == "duruyor")
    kontrol("oynatma projeyi değiştirmedi", durum(s, f"d.proje.sahneler[0].ornekler.find(o => o.id === '{kus_id}').x") == son["x"])

    # 6b) tuş seçimi: Kuş'un tuşunu "Yukarı ok" yap, artık Boşluk zıplatmamalı
    s.evaluate(f"window.__atolye.getState().sec({{ tur: 'ornek', id: '{kus_id}' }})")
    time.sleep(0.2)
    s.select_option("[data-testid=davranis-tusla_zipla] [data-testid=davranis-tus]", "Yukarı ok")
    kontrol("tuş ayarı kaydedildi", durum(s, "d.proje.nesneTurleri.find(t => t.id === 'tur_kus').bilesenler.davranislar[0].ayarlar.tus") == "Yukarı ok")
    s.keyboard.press("F5"); time.sleep(0.3)
    s.keyboard.press("Space"); time.sleep(0.03)
    kontrol("Boşluk artık zıplatmıyor", s.evaluate(f"{kus_dunya}.vy") > 0)
    s.keyboard.press("ArrowUp"); time.sleep(0.03)
    kontrol("Yukarı ok zıplatıyor", s.evaluate(f"{kus_dunya}.vy") < 0)
    s.keyboard.press("Shift+F5")
    s.select_option("[data-testid=davranis-tusla_zipla] [data-testid=davranis-tus]", "Boşluk")

    # 6c) çarpışma alanlarını göster (Görünüm komutu), oynarken ekran görüntüsü
    s.locator("[data-testid=sahne]").focus()
    s.keyboard.press("Control+Shift+C")
    kontrol("çarpışma alanları açıldı", durum(s, "d.tercih.carpismaGoster") is True)
    s.keyboard.press("F5"); time.sleep(0.5)
    s.keyboard.press("Space"); time.sleep(0.25)
    s.screenshot(path=f"{CIKTI}/4b_carpisma_alanlari.png")
    s.keyboard.press("Shift+F5")
    s.keyboard.press("Control+Shift+C")
    kontrol("çarpışma alanları kapandı", durum(s, "d.tercih.carpismaGoster") is False)

    # 7) olaylar sekmesi
    s.click("[data-testid=sekme-olaylar]")
    kontrol("olay sayfası kuralları gösteriyor", s.locator(".kural").count() == 5)
    s.screenshot(path=f"{CIKTI}/5_olaylar.png")
    s.click("[data-testid=sekme-sahne]")

    # 8) değişken ekle, sürüm kaydet
    s.click("[data-testid=sekme-degiskenler]")
    s.locator("[data-testid=degiskenler] thead button").click()
    kontrol("değişken eklendi", durum(s, "d.proje.degiskenler.length") == 3)
    s.click("[data-testid=sekme-surumler]")
    s.fill("#surum-notu", "test sürümü")
    s.click("[data-testid=surum-kaydet]")
    time.sleep(0.3)
    kontrol("sürüm listede", s.locator(".surum-satiri:has-text('test sürümü')").count() == 1)

    # 9) komut paleti ile ızgarayı kapat
    izgara = durum(s, "d.tercih.izgaraGoster")
    s.locator("[data-testid=sahne]").focus()
    s.keyboard.press("Control+k")
    s.wait_for_selector("[data-testid=komut-paleti]")
    s.keyboard.type("ızgara")
    s.screenshot(path=f"{CIKTI}/6_komut_paleti.png")
    s.keyboard.press("Enter")
    kontrol("komut paleti çalıştı", durum(s, "d.tercih.izgaraGoster") != izgara)
    s.keyboard.press("Control+k"); s.keyboard.type("ızgara"); s.keyboard.press("Enter")

    # 10) kısayollar penceresi
    s.keyboard.press("F1")
    kontrol("kısayollar penceresi", s.locator("[role=dialog][aria-label='Klavye kısayolları']").count() == 1)
    s.keyboard.press("Escape")

    # 11) yeni proje penceresi: boş ad hatası, sonra oluştur
    s.keyboard.press("Control+n")
    s.click("[data-testid=olustur]")
    kontrol("boş ad uyarısı", "ad yaz" in s.inner_text("[data-testid=hata]"))
    s.fill("[data-testid=proje-adi]", "Uzay Kaçışı")
    s.click("[data-testid=olustur]")
    time.sleep(0.5)
    kontrol("yeni proje açıldı", durum(s, "d.projeAdi") == "Uzay Kaçışı")

    # 12) v0.1 projesini açma (göç)
    s.evaluate("""async () => { const d = window.__atolye.getState();
      await d.depo.proje_kaydet('Eski Mağara', { ad: 'Eski Mağara', surum: 1, dunya: { arka_renk: '#241e34' },
        oyuncu: { sekil: 'yarasa', renk: '#4a3a62', boyut: 14, yercekimi: 1580, kanat_gucu: 430, max_dusus: 800 },
        nesneler: [{ id: 'a', ad: 'Sarkıt', sekil: 'ucgen', renk: '#777', boyut: 22, konum: 'tavan', etki: { tip: 'olum' } }] });
      await d.projeyiAc('Eski Mağara'); }""")
    time.sleep(0.4)
    kontrol("eski proje dönüştürülerek açıldı", durum(s, "d.proje.nesneTurleri.length") == 2)

    # 13) paneller gizlenip açılabiliyor
    s.locator("[data-testid=sahne]").focus()
    s.keyboard.press("Control+b")
    kontrol("sol panel gizlendi", s.locator("[data-testid=sol-panel]").count() == 0)
    s.keyboard.press("Control+b")
    s.screenshot(path=f"{CIKTI}/7_eski_proje.png")
    tarayici.close()

sunucu.shutdown()
basarisiz = [a for a, k in sonuclar if not k]
print(f"\n{len(sonuclar) - len(basarisiz)}/{len(sonuclar)} kontrol geçti")
print("HATALAR:", hatalar or "yok")
sys.exit(1 if hatalar or basarisiz else 0)
