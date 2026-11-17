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

    # 4c) geri al / yinele: sürükleme tek adım sayılır
    def kus():
        return durum(s, f"d.proje.sahneler[0].ornekler.find(o => o.id === '{kus_id}')")
    def ekran(x, y):
        return kutu["x"] + kutu["width"] / 2 + (x - 480) * z, kutu["y"] + kutu["height"] / 2 + (y - 270) * z
    s.locator("[data-testid=sahne]").focus()
    s.keyboard.press("Control+z")
    k = kus()
    kontrol("Ctrl+Z sürüklemeyi tek adımda geri aldı", k["x"] == ilk["x"] and k["y"] == ilk["y"], f"{k['x']},{k['y']}")
    s.keyboard.press("Control+y")
    k = kus()
    kontrol("Ctrl+Y yeniden yaptı", k["x"] == son["x"] and k["y"] == son["y"])

    # 4d) ok tuşlarıyla 1 px / Shift ile 10 px kaydırma; art arda basışlar tek adım
    s.keyboard.press("ArrowRight"); s.keyboard.press("ArrowRight"); s.keyboard.press("Shift+ArrowDown")
    k = kus()
    kontrol("ok tuşlarıyla kaydırıldı", k["x"] == son["x"] + 2 and k["y"] == son["y"] + 10, f"{k['x']},{k['y']}")
    s.keyboard.press("Control+z")
    k = kus()
    kontrol("ok tuşu kaydırması tek adımda geri alındı", k["x"] == son["x"] and k["y"] == son["y"])

    # 4e) köşe tutamacından boyutlandırma (karşı köşe sabit) ve üst tutamaçtan döndürme
    kx, ky = ekran(son["x"] + 17, son["y"] + 17)
    s.mouse.move(kx, ky); s.mouse.down(); s.mouse.move(kx + 34 * z, ky + 34 * z, steps=6); s.mouse.up()
    k = kus()
    kontrol("köşeden boyutlandırıldı", abs(k["olcekX"] - 2) < 0.1 and abs(k["olcekY"] - 2) < 0.1, f"{k['olcekX']}x{k['olcekY']}")
    kontrol("karşı köşe yerinde kaldı", abs((k["x"] - 17 * k["olcekX"]) - (son["x"] - 17)) <= 1.5)
    s.screenshot(path=f"{CIKTI}/3b_boyutlandirma.png")
    tx, ty = ekran(k["x"], k["y"])
    ty -= 17 * k["olcekY"] * z + 26
    s.mouse.move(tx, ty); s.mouse.down()
    cx, cy = ekran(k["x"], k["y"])
    s.keyboard.down("Shift"); s.mouse.move(cx + 120, cy + 4, steps=8); s.mouse.up(); s.keyboard.up("Shift")
    k = kus()
    kontrol("üst tutamaçtan döndürüldü (Shift ile 15°)", k["aci"] == 90, f"aci={k['aci']}")
    s.keyboard.press("Control+z"); s.keyboard.press("Control+z")
    k = kus()
    kontrol("döndürme ve boyutlandırma geri alındı", k["aci"] == 0 and k["olcekX"] == 1 and k["x"] == son["x"])

    # 4f) kutu seçimi, Shift ile ekleme, hizalama, toplu silme ve geri alma
    s.click("[data-testid=sekme-agac]")
    x0, y0 = ekran(-40, -40); x1, y1 = ekran(1000, 580)
    s.mouse.move(x0, y0); s.mouse.down(); s.mouse.move(x1, y1, steps=6)
    s.screenshot(path=f"{CIKTI}/3c_kutu_secimi.png")
    s.mouse.up()
    toplam = durum(s, "d.proje.sahneler[0].ornekler.length")
    kontrol("kutu seçimi hepsini seçti", durum(s, "1 + (d.secim.digerleri || []).length") == toplam)
    s.keyboard.press("Escape")
    kontrol("Esc seçimi kaldırdı", durum(s, "d.secim") is None)
    borular = durum(s, "d.proje.sahneler[0].ornekler.filter(o => o.turId === 'tur_boru').map(o => o.id)")
    bx, by = ekran(560, 110); s.mouse.click(bx, by)
    bx, by = ekran(840, 150); s.keyboard.down("Shift"); s.mouse.click(bx, by); s.keyboard.up("Shift")
    kontrol("Shift+tık seçime ekledi", durum(s, "1 + (d.secim.digerleri || []).length") == 2)
    s.click("[data-testid=hizala-ust]")
    ustler = durum(s, "d.proje.sahneler[0].ornekler.filter(o => o.turId === 'tur_boru').slice(0, 3).map(o => Math.round(o.y - 110 * o.olcekY))")
    kontrol("üste hizalandı", ustler[0] == ustler[2], str(ustler))
    s.screenshot(path=f"{CIKTI}/3d_hizalama.png")
    s.keyboard.press("Control+z")
    s.locator("[data-testid=sahne]").focus()
    s.keyboard.press("Control+a")
    s.keyboard.press("Delete")
    kontrol("toplu silindi", durum(s, "d.proje.sahneler[0].ornekler.length") == 0)
    s.keyboard.press("Control+z")
    kontrol("toplu silme geri alındı", durum(s, "d.proje.sahneler[0].ornekler.length") == toplam)
    k = kus()
    kontrol("kuş son konumunda", k["x"] == son["x"] and k["y"] == son["y"])
    s.evaluate("window.__atolye.getState().sec(null)")
    time.sleep(0.8)

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

    # 14) oyun içeriği (3D oyunun icerik/*.json dosyaları): karakterler, kişiler, harita ayarları, eşyalar
    def oyun(ifade):
        return s.evaluate(f"(() => {{ const o = window.__oyun.getState(); return {ifade}; }})()")
    s.evaluate("window.__atolye.getState().baslangicaDon()")
    s.click("[data-testid=oyun-icerigi-ac]")
    s.wait_for_selector("[data-testid=oyun-icerigi]")
    time.sleep(0.3)
    kontrol("oyun içeriği açıldı", durum(s, "d.ekran") == "oyun")
    kontrol("dosya listesi: karakterler + harita + 3 diyalog", s.locator("[data-testid=oyun-dosyalari] .satir").count() == 6)
    kontrol("karakterler sayfası açık", s.locator(".kart-baslik:has-text('Kontrol biçimi')").count() == 1)
    # kontrol biçimi anahtarı 1 → 0 (sayı olarak kalmalı)
    s.click("[data-testid='alan-oyuncu.hareket.kamera_gore_kontrol']")
    kontrol("kameraya göre kontrol kapatıldı (0, sayı)", oyun("o.veri['karakterler.json'].oyuncu.hareket.kamera_gore_kontrol") == 0)
    s.fill("[data-testid='alan-oyuncu.hareket.serbest_donus_hizi']", "500,5")
    s.keyboard.press("Enter")
    kontrol("serbest dönüş hızı (virgülle) yazıldı", oyun("o.veri['karakterler.json'].oyuncu.hareket.serbest_donus_hizi") == 500.5)
    s.screenshot(path=f"{CIKTI}/8_oyun_karakterler.png")
    # kapalı bir grubu aç: Kamera, bilinmeyen alan da görünmeli
    s.evaluate("window.__oyun.getState().degistir('karakterler.json', d => { d.oyuncu.kamera.yeni_deneme_alani = 3; })")
    s.click(".kart-baslik:has-text('Kamera')")
    kontrol("şemada olmayan alan da düzenlenebilir görünüyor", s.locator("[data-testid='alan-oyuncu.kamera.yeni_deneme_alani']").count() == 1)
    s.evaluate("window.__oyun.getState().geriAl()")
    # kişiler
    s.click("[data-testid=oyun-sekme-kisiler]")
    kontrol("4 kişi listelendi", s.locator("[data-testid^=kisi-govde-]").count() == 4)
    s.fill("[data-testid=kisi-govde-yolcu]", "MetaHumans/Yanlis")
    s.keyboard.press("Enter")
    kontrol("yanlış Unreal yolu uyarısı", s.locator("[data-testid=kisi-yolcu] .alan-uyari").count() == 1)
    s.screenshot(path=f"{CIKTI}/8b_oyun_kisiler.png")
    s.fill("[data-testid=kisi-govde-yolcu]", "/Game/MetaHumans/Kisi_Genc/BP_Kisi_Genc")
    s.keyboard.press("Enter")
    s.fill("[data-testid=kisi-kimlik-gezgin_2]", "Gezgin 2")
    s.keyboard.press("Enter")
    kontrol("kural dışı kimlik reddedildi", oyun("'gezgin_2' in o.veri['karakterler.json'].kisiler") and s.locator("[data-testid=kisi-gezgin_2] .alan-uyari").count() == 1)
    s.click("[data-testid=kisi-sil-gezgin_2]")
    kontrol("kişi silindi, 'ekle' önerisi çıktı", s.locator("[data-testid=kisi-ekle-gezgin_2]").count() == 1)
    s.click("[data-testid=kisi-ekle-gezgin_2]")
    kontrol("haritadaki kişi geri eklendi", oyun("Object.keys(o.veri['karakterler.json'].kisiler).length") == 4)
    # harita: kişiler (npcler) — varsayılan sekme
    s.click("[data-testid='dosya-haritalar/deneme_yolu.json']")
    s.wait_for_selector("[data-testid=kroki]")
    h = "o.veri['haritalar/deneme_yolu.json']"
    def npc(id_, ifade):
        return oyun(f"(({h}.npcler || []).find(n => n.id === '{id_}') || {{}}){ifade}")
    kontrol("harita kişiler sekmesiyle açıldı: 4 kişi kartı + krokide 4 alan",
            s.locator("[data-testid^=npc-kimlik-]").count() == 4 and s.locator("[data-testid^=kroki-alan-]").count() == 4)
    kontrol("kalabalık kartı dolu", s.locator("[data-testid=kalabalik-sayi]").count() == 1)
    s.click("[data-testid=npc-ekle]")
    kontrol("kişi eklendi ve seçildi", oyun(f"{h}.npcler.length") == 5 and oyun("o.secili") == "kisi")
    s.fill("[data-testid=npc-ad-kisi]", "Satıcı")
    s.keyboard.press("Enter")
    s.select_option("[data-testid=npc-davranis-kisi]", "yol")
    s.select_option("[data-testid=npc-tavir-kisi]", "kac")
    s.select_option("[data-testid=npc-selamlasma-kisi]", "el_salla")
    s.select_option("[data-testid=npc-diyalog-kisi]", "diyaloglar/bekleyen.json")
    s.fill("[data-testid=npc-hiz-kisi]", "5")
    s.keyboard.press("Enter")
    kontrol("ad, davranış, tavır, selamlaşma, konuşma yazıldı; hız 3'e kırpıldı",
            npc("kisi", ".ad") == "Satıcı" and npc("kisi", ".davranis") == "yol" and npc("kisi", ".savas_tavri") == "kac"
            and npc("kisi", ".selamlasma") == "el_salla" and npc("kisi", ".diyalog") == "diyaloglar/bekleyen.json" and npc("kisi", ".hiz") == 3)
    s.click("[data-testid=npc-selamlar-kisi-ekle]")
    s.fill("[data-testid=npc-selamlar-kisi-0]", "Taze simit!")
    s.keyboard.press("Enter")
    s.click("[data-testid=npc-tepki-vurulma-kisi-ekle]")
    s.fill("[data-testid=npc-tepki-vurulma-kisi-0]", "İmdat!")
    s.keyboard.press("Enter")
    kontrol("söz ve tepki listeleri yazıldı", npc("kisi", ".selamlar") == ["Taze simit!"] and npc("kisi", ".tepkiler") == {"vurulma": ["İmdat!"]})
    kontrol("yolda yürür seçilince yaya şeridi alanları ve krokide uç tutamaçları çıktı",
            s.locator("[data-testid=npc-serit-y-kisi]").count() == 1 and s.locator("[data-testid=kroki-serit-son-kisi]").count() == 1)
    # krokide alanı taşı, yarıçapı büyüt, şeridin ucunu çek
    s.locator("[data-testid=kroki]").scroll_into_view_if_needed()
    time.sleep(0.5)
    merkez0, r0 = npc("kisi", ".alan.merkez"), npc("kisi", ".alan.yaricap")
    gecmis = oyun("o.geri.length")
    b = s.locator("[data-testid=kroki-alan-kisi]").bounding_box()
    s.mouse.move(b["x"] + b["width"] / 2 + 3, b["y"] + b["height"] / 2 + 3); s.mouse.down()
    s.mouse.move(b["x"] + b["width"] / 2 + 83, b["y"] + b["height"] / 2 + 3, steps=8); s.mouse.up()
    merkez1 = npc("kisi", ".alan.merkez")
    kontrol("alan sürüklenince yol boyunca ilerledi (z azaldı, yan aynı)", merkez1[1] < merkez0[1] - 1 and merkez1[0] == merkez0[0], f"{merkez0} -> {merkez1}")
    kontrol("alan taşıma tek geri al adımı", oyun("o.geri.length") == gecmis + 1)
    t = s.locator("[data-testid=kroki-yaricap-kisi]").bounding_box()
    s.mouse.move(t["x"] + t["width"] / 2, t["y"] + t["height"] / 2); s.mouse.down()
    s.mouse.move(t["x"] + t["width"] / 2 + 40, t["y"] + t["height"] / 2, steps=6); s.mouse.up()
    kontrol("kenardaki tutamaçla yarıçap büyüdü", npc("kisi", ".alan.yaricap") > r0, f"{r0} -> {npc('kisi', '.alan.yaricap')}")
    t = s.locator("[data-testid=kroki-serit-son-kisi]").bounding_box()
    s.mouse.move(t["x"] + t["width"] / 2, t["y"] + t["height"] / 2); s.mouse.down()
    s.mouse.move(t["x"] + t["width"] / 2 + 60, t["y"] + t["height"] / 2, steps=6); s.mouse.up()
    kontrol("şeridin ucu çekilince Unreal alanları (cm) yazıldı",
            isinstance(npc("kisi", ".serit_x_max"), int) and npc("kisi", ".serit_x_max") > npc("kisi", ".serit_x_min") and isinstance(npc("kisi", ".serit_y"), int))
    # kalabalık ve uyarı
    s.fill("[data-testid=kalabalik-sayi]", "8")
    s.keyboard.press("Enter")
    kontrol("kalabalık kişi sayısı yazıldı", oyun(f"{h}.kalabalik.sayi") == 8)
    s.fill("[data-testid=npc-govde-kisi]", "MetaHumans/Yanlis")
    s.keyboard.press("Enter")
    kontrol("yanlış beden yolu uyarısı", s.locator("[data-testid=uyarilar]").count() == 1)
    s.fill("[data-testid=npc-govde-kisi]", "")
    s.keyboard.press("Enter")
    kontrol("beden boşaltınca alan silindi, uyarı kalktı", npc("kisi", ".unreal_govde") is None and s.locator("[data-testid=uyarilar]").count() == 0)
    # kimlik değişince görev adımı ve karakterler.json'daki beden kaydı da güncellenir
    s.fill("[data-testid=npc-kimlik-yolcu]", "yolcu_a")
    s.keyboard.press("Enter")
    kontrol("kimlik değişti; görev adımı ve beden kaydı izledi",
            npc("yolcu_a", ".ad") == "Yolcu" and oyun(f"{h}.gorevler[0].adimlar[0].hedef") == "yolcu_a"
            and oyun("'yolcu_a' in o.veri['karakterler.json'].kisiler && !('yolcu' in o.veri['karakterler.json'].kisiler)"))
    s.fill("[data-testid=npc-kimlik-yolcu_a]", "yolcu")
    s.keyboard.press("Enter")
    kontrol("kimlik geri alındı", oyun("'yolcu' in o.veri['karakterler.json'].kisiler") and oyun(f"{h}.gorevler[0].adimlar[0].hedef") == "yolcu")
    s.click("[data-testid=npc-cogalt-gezgin_1]")
    kontrol("kişi çoğaltıldı", npc("gezgin_3", ".ad") == "Gezgin" and oyun("o.secili") == "gezgin_3")
    s.click("[data-testid=npc-sil-gezgin_3]")
    kontrol("kişi silindi", oyun(f"{h}.npcler.length") == 5)
    s.locator("[data-testid=npc-kisi]").click(position={"x": 30, "y": 12})
    s.locator("[data-testid=kroki]").scroll_into_view_if_needed()
    time.sleep(0.4)
    s.screenshot(path=f"{CIKTI}/9a_oyun_harita_kisiler.png")
    s.locator("[data-testid=npc-kisi]").scroll_into_view_if_needed()
    time.sleep(0.4)
    s.screenshot(path=f"{CIKTI}/9b_oyun_kisi_karti.png")
    # harita: eşyalar
    s.click("[data-testid=oyun-sekme-esyalar]")
    kontrol("haritada 2 eşya ve krokisi", s.locator(".kroki-esya").count() == 2 and s.locator("[data-testid=esya-defter]").count() == 1)
    s.click("[data-testid=esya-ekle]")
    kontrol("eşya eklendi ve seçildi", oyun("o.veri['haritalar/deneme_yolu.json'].esyalar.length") == 3 and oyun("o.secili") == "esya")
    s.fill("[data-testid=esya-ad-esya]", "Pusula")
    s.keyboard.press("Enter")
    s.fill("[data-testid=esya-kimlik-esya]", "pusula")
    s.keyboard.press("Enter")
    kontrol("eşyanın adı ve kimliği değişti", oyun("o.veri['haritalar/deneme_yolu.json'].esyalar[2].id") == "pusula"
            and oyun("o.veri['haritalar/deneme_yolu.json'].esyalar[2].ad") == "Pusula")
    s.fill("[data-testid=esya-aciklama-pusula]", "Hep kuzeyi gösterir.")
    s.locator("[data-testid=esya-ad-pusula]").click()
    kontrol("eşya açıklaması yazıldı", oyun("o.veri['haritalar/deneme_yolu.json'].esyalar[2].aciklama") == "Hep kuzeyi gösterir.")
    s.click("[data-testid=esya-puan-pusula-ekle]")
    kontrol("puan eklendi", oyun("o.veri['haritalar/deneme_yolu.json'].esyalar[2].puanlar") == {"ornek_a": 1})
    once = oyun("o.veri['haritalar/deneme_yolu.json'].esyalar[2].konum")
    s.locator("[data-testid=kroki]").scroll_into_view_if_needed()
    time.sleep(0.5)  # kartın kayma animasyonu bitsin
    k = s.locator("[data-testid=kroki-pusula] circle").bounding_box()
    gecmis = oyun("o.geri.length")
    s.mouse.move(k["x"] + k["width"] / 2, k["y"] + k["height"] / 2); s.mouse.down()
    s.mouse.move(k["x"] + 120, k["y"] + 30, steps=10); s.mouse.up()
    sonra = oyun("o.veri['haritalar/deneme_yolu.json'].esyalar[2].konum")
    kontrol("krokide sürükleyince konum değişti (yol boyunca ileri = z azalır)", sonra[2] < once[2] - 2 and sonra[0] > once[0], f"{once} -> {sonra}")
    kontrol("sürükleme tek geri al adımı", oyun("o.geri.length") == gecmis + 1)
    s.screenshot(path=f"{CIKTI}/9_oyun_esyalar.png")
    # harita ayarları
    s.click("[data-testid=oyun-sekme-ayarlar]")
    s.fill("[data-testid=alan-unreal_model_aci]", "-90")
    s.keyboard.press("Enter")
    s.fill("[data-testid='alan-ortam.unreal_zemin_klasoru']", "/Game/Dekor/Cimen")
    s.keyboard.press("Enter")
    s.fill("[data-testid='alan-yol.unreal_karo']", "3")
    s.keyboard.press("Enter")
    kontrol("Unreal harita ayarları yazıldı", oyun(f"[{h}.unreal_model_aci, {h}.ortam.unreal_zemin_klasoru, {h}.yol.unreal_karo]") == [-90, "/Game/Dekor/Cimen", 3])
    s.click(".kart-baslik:has-text('Sesler')")
    s.fill("[data-testid='alan-sesler.darbe']", "/Game/Sesler/Darbe")
    s.keyboard.press("Enter")
    s.click(".kart-baslik:has-text('Işık ve gökyüzü')")
    s.fill("[data-testid='alan-ortam.gunes_hareketi']", "0,5")
    s.keyboard.press("Enter")
    kontrol("ses ve güneş hareketi yazıldı", oyun(f"[{h}.sesler.darbe, {h}.ortam.gunes_hareketi]") == ["/Game/Sesler/Darbe", 0.5])
    s.screenshot(path=f"{CIKTI}/10_oyun_harita_ayarlari.png")
    # geri al / yinele (kısayolla)
    s.locator("body").click(position={"x": 5, "y": 300})
    s.keyboard.press("Control+z")
    kontrol("Ctrl+Z oyun içeriğinde çalıştı", oyun(f"{h}.ortam.gunes_hareketi") is None)
    s.keyboard.press("Control+y")
    kontrol("Ctrl+Y yineledi", oyun(f"{h}.ortam.gunes_hareketi") == 0.5)
    # kaydet
    kontrol("kaydedilmemiş 2 dosya", oyun("o.degisenler().length") == 2)
    s.keyboard.press("Control+s")
    time.sleep(0.4)
    kontrol("Ctrl+S kaydetti", oyun("o.degisenler().length") == 0)
    yazilan = s.evaluate("window.__oyun.getState().depo.icerik_oku('haritalar/deneme_yolu.json')")
    kontrol("dosyaya yazıldı, dokunulmayan alanlar duruyor",
            yazilan["esyalar"][2]["id"] == "pusula" and yazilan["unreal_model_aci"] == -90 and len(yazilan["nesneler"]) == 6 and "kapilar" in yazilan)
    kontrol("yeni kişi dosyaya yazıldı", [n for n in yazilan["npcler"] if n["id"] == "kisi"][0]["savas_tavri"] == "kac"
            and yazilan["kalabalik"]["sayi"] == 8 and yazilan["npcler"][0]["tepkiler"]["carpma"])
    yazilan = s.evaluate("window.__oyun.getState().depo.icerik_oku('karakterler.json')")
    kontrol("karakterler.json yazıldı", yazilan["oyuncu"]["hareket"]["kamera_gore_kontrol"] == 0
            and yazilan["kisiler"]["yolcu"]["unreal_govde"].endswith("BP_Kisi_Genc") and yazilan["oyuncu"]["animasyonlar"]["ziplama"])
    # diyalog dosyası salt okunur
    s.click("[data-testid='dosya-diyaloglar/yolcu.json']")
    kontrol("diyalog salt okunur gösteriliyor", s.locator("[data-testid=ham-json]").count() == 1)
    # kaydedilmemiş değişiklikle çıkışta onay
    s.click("[data-testid='dosya-karakterler.json']")
    s.click("[data-testid=oyun-sekme-oyuncu]")
    s.click("[data-testid='alan-oyuncu.hareket.kamera_gore_kontrol']")
    s.click("[data-testid=oyun-cik]")
    kontrol("kaydetmeden çıkarken onay istedi", durum(s, "d.ekran") == "oyun" and "Kaydetmeden" in s.inner_text("[data-testid=oyun-cik]"))
    s.click("[data-testid=oyun-at]")
    s.click("[data-testid=oyun-cik]")
    kontrol("değişiklik atılıp başlangıca dönüldü", durum(s, "d.ekran") == "baslangic")
    s.screenshot(path=f"{CIKTI}/11_baslangic.png")
    tarayici.close()

sunucu.shutdown()
basarisiz = [a for a, k in sonuclar if not k]
print(f"\n{len(sonuclar) - len(basarisiz)}/{len(sonuclar)} kontrol geçti")
print("HATALAR:", hatalar or "yok")
sys.exit(1 if hatalar or basarisiz else 0)
