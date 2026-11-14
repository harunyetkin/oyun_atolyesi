// Oyun Atölyesi editörü: listeyi, özellik panelini, önizlemeyi ve sürümleri yönetir.
(function () {
  "use strict";
  const { SABLONLAR, NESNE_HAZIR, ALANLAR, yeniId } = window.Sablonlar;
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------ depolama
  // Masaüstü uygulamasında Python tarafı (pywebview) kullanılır.
  // Tarayıcıda açılırsa (test için) bellekte çalışan yedek kullanılır.
  function bellekDepo() {
    const projeler = {}, surumler = {};
    return {
      proje_listesi: async () => Object.keys(projeler).sort(),
      proje_yukle: async (ad) => JSON.parse(projeler[ad]),
      proje_kaydet: async (ad, oyun) => { projeler[ad] = JSON.stringify(oyun); return true; },
      surum_kaydet: async (ad, not, oyun) => {
        const t = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15).replace("T", "_");
        (surumler[ad] = surumler[ad] || []).unshift({ dosya: t + ".json", tarih: t, not, veri: JSON.stringify(oyun) });
        return t;
      },
      surum_listesi: async (ad) => (surumler[ad] || []).map(({ dosya, tarih, not }) => ({ dosya, tarih, not })),
      surum_yukle: async (ad, dosya) => JSON.parse((surumler[ad] || []).find(s => s.dosya === dosya).veri),
      disa_aktar: async (ad, html) => { window.__sonDisaAktarim = html; return "(tarayıcı testi) " + ad + ".html"; },
      klasoru_ac: async () => true
    };
  }
  let depo = null;

  // ------------------------------------------------------------ durum
  const durum = { projeAdi: null, oyun: null, secili: "dunya", motor: null, kayitZamanlayici: null };

  function nesne(id) { return durum.oyun.nesneler.find(n => n.id === id); }
  function al(obj, yol) { return yol.split(".").reduce((o, k) => (o == null ? o : o[k]), obj); }
  function koy(obj, yol, deger) {
    const p = yol.split("."); const son = p.pop();
    const hedef = p.reduce((o, k) => (o[k] = o[k] || {}), obj);
    hedef[son] = deger;
  }

  const ETKI_ETIKET = { olum: "ölümcül", yavaslat: "yavaşlatır", agirlastir: "ağırlaştırır", kanat_zayiflat: "kanat zayıf",
    sersem: "sersemletir", puan: "puan", kalkan: "kalkan" };

  // ------------------------------------------------------------ kayıt
  function kaydetPlanla() {
    $("kayitDurumu").textContent = "Kaydediliyor…";
    clearTimeout(durum.kayitZamanlayici);
    durum.kayitZamanlayici = setTimeout(async () => {
      try {
        await depo.proje_kaydet(durum.projeAdi, durum.oyun);
        $("kayitDurumu").textContent = "Kaydedildi";
      } catch (e) {
        $("kayitDurumu").textContent = "Kaydedilemedi: " + e;
      }
    }, 600);
  }

  function degisti(listeYenile) {
    if (listeYenile) listeyiCiz();
    kaydetPlanla();
  }

  // ------------------------------------------------------------ sol liste
  function listeyiCiz() {
    const ul = $("ogeListesi");
    ul.innerHTML = "";
    const ekle = (anahtar, ad, renk, rozet, pasif) => {
      const li = document.createElement("li");
      li.dataset.anahtar = anahtar;
      if (durum.secili === anahtar) li.classList.add("secili");
      if (pasif) li.classList.add("pasif");
      li.innerHTML = `<span class="renk-nokta"></span><span class="ad"></span>` + (rozet ? `<span class="rozet"></span>` : "");
      li.querySelector(".renk-nokta").style.background = renk;
      li.querySelector(".ad").textContent = ad;
      if (rozet) li.querySelector(".rozet").textContent = rozet;
      li.onclick = () => sec(anahtar);
      ul.appendChild(li);
    };
    ekle("dunya", "Dünya", durum.oyun.dunya.arka_renk);
    ekle("oyuncu", "Oyuncu", durum.oyun.oyuncu.renk);
    const ayrac = document.createElement("li");
    ayrac.className = "ayrac";
    ayrac.textContent = durum.oyun.nesneler.length ? "Nesneler" : "Henüz nesne yok, aşağıdan ekle";
    ul.appendChild(ayrac);
    for (const n of durum.oyun.nesneler) ekle(n.id, n.ad, n.renk, ETKI_ETIKET[n.etki.tip], !n.aktif);
  }

  function sec(anahtar) {
    durum.secili = anahtar;
    listeyiCiz();
    ozellikleriCiz();
  }

  // ------------------------------------------------------------ özellik paneli
  function ozellikleriCiz() {
    const kutu = $("ozellikler");
    kutu.innerHTML = "";
    let hedef, alanlar, baslik;
    if (durum.secili === "dunya") { hedef = durum.oyun.dunya; alanlar = ALANLAR.dunya; baslik = "Dünya"; }
    else if (durum.secili === "oyuncu") { hedef = durum.oyun.oyuncu; alanlar = ALANLAR.oyuncu; baslik = "Oyuncu"; }
    else { hedef = nesne(durum.secili); alanlar = ALANLAR.nesne; baslik = hedef ? hedef.ad : ""; }
    if (!hedef) { sec("dunya"); return; }
    $("ozellikBaslik").textContent = baslik;
    $("ogeIslemleri").classList.toggle("gizli", durum.secili === "dunya" || durum.secili === "oyuncu");

    if (durum.secili === "dunya") {
      // oyunun adı (menüde görünür)
      kutu.appendChild(alanOlustur({ k: "ad", e: "Oyunun adı", tur: "metin" }, durum.oyun, () => {}));
    }
    const satirlar = [];
    const gorunurlukGuncelle = () => {
      for (const { el, alan } of satirlar) el.classList.toggle("gizli", !!alan.goster && !alan.goster(hedef));
    };
    for (const alan of alanlar) {
      if (alan.baslik) {
        const b = document.createElement("div");
        b.className = "alan-baslik";
        b.textContent = alan.baslik;
        kutu.appendChild(b);
        continue;
      }
      const el = alanOlustur(alan, hedef, () => {
        gorunurlukGuncelle();
        if (alan.k === "ad" && durum.secili !== "dunya") $("ozellikBaslik").textContent = hedef.ad;
      });
      satirlar.push({ el, alan });
      kutu.appendChild(el);
    }
    gorunurlukGuncelle();
  }

  function alanOlustur(alan, hedef, sonra) {
    const el = document.createElement("div");
    el.className = "alan" + (alan.tur === "onay" ? " onay-alan" : "");
    const deger = al(hedef, alan.k);
    const listeEtkiler = ["ad", "renk", "aktif", "etki.tip", "arka_renk"].includes(alan.k);
    const yaz = (v) => { koy(hedef, alan.k, v); sonra(); degisti(listeEtkiler); };

    if (alan.tur === "sayi") {
      const ondalik = alan.adim < 1 ? (String(alan.adim).split(".")[1] || "").length : 0;
      el.innerHTML = `<label><span></span><span class="deger"></span></label><input type="range">`;
      el.querySelector("label span").textContent = alan.e;
      const giris = el.querySelector("input");
      const goster = el.querySelector(".deger");
      Object.assign(giris, { min: alan.min, max: alan.max, step: alan.adim, value: deger });
      goster.textContent = Number(deger).toFixed(ondalik);
      giris.oninput = () => {
        const v = Number(giris.value);
        goster.textContent = v.toFixed(ondalik);
        yaz(v);
      };
    } else if (alan.tur === "renk") {
      el.innerHTML = `<label><span></span></label><input type="color">`;
      el.querySelector("label span").textContent = alan.e;
      const giris = el.querySelector("input");
      giris.value = deger;
      giris.oninput = () => yaz(giris.value);
    } else if (alan.tur === "secim") {
      el.innerHTML = `<label><span></span></label><select></select>`;
      el.querySelector("label span").textContent = alan.e;
      const s = el.querySelector("select");
      for (const [v, etiket] of alan.secenekler) {
        const o = document.createElement("option");
        o.value = v; o.textContent = etiket;
        s.appendChild(o);
      }
      s.value = deger;
      s.onchange = () => yaz(s.value);
    } else if (alan.tur === "onay") {
      el.innerHTML = `<label><input type="checkbox"><span></span></label>`;
      el.querySelector("label span").textContent = alan.e;
      const c = el.querySelector("input");
      c.checked = !!deger;
      c.onchange = () => yaz(c.checked);
    } else {
      el.innerHTML = `<label><span></span></label><input type="text">`;
      el.querySelector("label span").textContent = alan.e;
      const t = el.querySelector("input");
      t.value = deger || "";
      t.maxLength = 40;
      t.oninput = () => yaz(t.value);
    }
    if (alan.a) {
      const a = document.createElement("div");
      a.className = "aciklama";
      a.textContent = alan.a;
      el.appendChild(a);
    }
    return el;
  }

  // ------------------------------------------------------------ nesne ekle / sil / çoğalt
  function nesneEkle(tur) {
    const n = NESNE_HAZIR[tur]();
    durum.oyun.nesneler.push(n);
    durum.secili = n.id;
    listeyiCiz(); ozellikleriCiz(); kaydetPlanla();
  }
  $("silBtn").onclick = () => {
    durum.oyun.nesneler = durum.oyun.nesneler.filter(n => n.id !== durum.secili);
    sec("dunya"); kaydetPlanla();
  };
  $("cogaltBtn").onclick = () => {
    const kaynak = nesne(durum.secili);
    if (!kaynak) return;
    const kopya = JSON.parse(JSON.stringify(kaynak));
    kopya.id = yeniId();
    kopya.ad = kaynak.ad + " (kopya)";
    durum.oyun.nesneler.push(kopya);
    sec(kopya.id); kaydetPlanla();
  };
  document.querySelectorAll("[data-ekle]").forEach(b => b.onclick = () => nesneEkle(b.dataset.ekle));

  // ------------------------------------------------------------ önizleme
  function motoruKur() {
    if (durum.motor) durum.motor.durdur();
    durum.motor = new Motor($("sahne"), durum.oyun, { olumsuz: $("testModu").checked });
    durum.motor.baslat();
  }
  $("oynaBtn").onclick = () => { $("sahne").focus(); durum.motor.bas(); };
  $("bastanBtn").onclick = () => { durum.motor.sifirla(); durum.motor.duraklatildi = false; $("sahne").focus(); };
  $("duraklatBtn").onclick = () => { durum.motor.duraklatildi = !durum.motor.duraklatildi; };
  $("testModu").onchange = () => { durum.motor.olumsuz = $("testModu").checked; };
  $("sahne").addEventListener("mousedown", () => durum.motor.bas());
  $("sahne").addEventListener("keydown", (e) => {
    if ([" ", "ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); durum.motor.bas(); }
    else if (e.key === "p" || e.key === "P") durum.motor.duraklatildi = !durum.motor.duraklatildi;
  });

  // ------------------------------------------------------------ sürümler
  async function surumleriCiz() {
    const ul = $("surumListesi");
    const liste = await depo.surum_listesi(durum.projeAdi);
    ul.innerHTML = "";
    if (!liste.length) {
      ul.innerHTML = `<li class="soluk">Henüz kayıtlı sürüm yok. Beğendiğin bir hali "Sürüm kaydet" ile saklayabilirsin.</li>`;
      return;
    }
    for (const s of liste.slice(0, 30)) {
      const li = document.createElement("li");
      const t = s.tarih;
      const okunur = t.length >= 13 ? `${t.slice(6, 8)}.${t.slice(4, 6)} ${t.slice(9, 11)}:${t.slice(11, 13)}` : t;
      li.innerHTML = `<span class="tarih"></span><span class="not"></span><button>Geri yükle</button>`;
      li.querySelector(".tarih").textContent = okunur;
      li.querySelector(".not").textContent = s.not || "(not yok)";
      li.querySelector("button").onclick = async (ev) => {
        const b = ev.currentTarget;
        if (b.dataset.onay !== "1") { b.dataset.onay = "1"; b.textContent = "Emin misin?"; return; }
        await depo.surum_kaydet(durum.projeAdi, "geri yüklemeden önceki hal", durum.oyun);
        const veri = await depo.surum_yukle(durum.projeAdi, s.dosya);
        projeyiAc(durum.projeAdi, veri);
        kaydetPlanla();
      };
      ul.appendChild(li);
    }
  }
  $("surumKaydetBtn").onclick = async () => {
    await depo.surum_kaydet(durum.projeAdi, $("surumNotu").value.trim(), durum.oyun);
    $("surumNotu").value = "";
    $("kayitDurumu").textContent = "Sürüm kaydedildi";
    surumleriCiz();
  };

  // ------------------------------------------------------------ projeler
  function projeyiAc(ad, oyun) {
    durum.projeAdi = ad;
    durum.oyun = oyun;
    durum.secili = "dunya";
    listeyiCiz(); ozellikleriCiz(); motoruKur(); surumleriCiz();
    $("projeListesi").value = ad;
    $("kayitDurumu").textContent = "";
  }

  async function projeListesiniCiz(secilecek) {
    const liste = await depo.proje_listesi();
    const s = $("projeListesi");
    s.innerHTML = "";
    for (const ad of liste) {
      const o = document.createElement("option");
      o.value = ad; o.textContent = ad;
      s.appendChild(o);
    }
    if (secilecek) s.value = secilecek;
    return liste;
  }

  $("projeListesi").onchange = async () => {
    const ad = $("projeListesi").value;
    projeyiAc(ad, await depo.proje_yukle(ad));
  };

  for (const ad of Object.keys(SABLONLAR)) {
    const o = document.createElement("option");
    o.value = ad; o.textContent = "Şablon: " + ad;
    $("yeniProjeSablon").appendChild(o);
  }
  $("yeniProjeBtn").onclick = () => { $("yeniProjeForm").classList.remove("gizli"); $("yeniProjeAdi").focus(); };
  $("yeniProjeIptal").onclick = () => { $("yeniProjeForm").classList.add("gizli"); $("yeniProjeHata").textContent = ""; };
  $("yeniProjeAdi").oninput = () => { $("yeniProjeHata").textContent = ""; };
  $("yeniProjeOlustur").onclick = async () => {
    const ad = $("yeniProjeAdi").value.trim().replace(/[<>:"/\\|?*]/g, "");
    if (!ad) { $("yeniProjeHata").textContent = "Önce bir ad yaz."; return; }
    const mevcut = await depo.proje_listesi();
    if (mevcut.includes(ad)) { $("yeniProjeHata").textContent = "Bu adda bir proje zaten var."; return; }
    const oyun = SABLONLAR[$("yeniProjeSablon").value]();
    oyun.ad = ad;
    await depo.proje_kaydet(ad, oyun);
    await projeListesiniCiz(ad);
    projeyiAc(ad, oyun);
    $("yeniProjeAdi").value = "";
    $("yeniProjeForm").classList.add("gizli");
  };

  // ------------------------------------------------------------ dışa aktarma
  async function oyunHtml() {
    const motorKodu = await (await fetch("motor.js")).text();
    const veri = JSON.stringify(durum.oyun).replace(/</g, "\\u003c");
    const baslik = (durum.oyun.ad || "Oyun").replace(/[<>&]/g, "");
    return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>${baslik}</title>
<style>html,body{margin:0;height:100%;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden}
canvas{max-width:100vw;max-height:100vh;aspect-ratio:16/9}</style></head>
<body><canvas id="c"></canvas>
<script>${motorKodu}<\/script>
<script>
const OYUN = ${veri};
const m = new Motor(document.getElementById("c"), OYUN);
m.baslat();
addEventListener("keydown", e => {
  if ([" ", "ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); m.bas(); }
  else if (e.key === "p" || e.key === "P") m.duraklatildi = !m.duraklatildi;
});
addEventListener("mousedown", () => m.bas());
<\/script></body></html>`;
  }
  $("disaAktarBtn").onclick = async () => {
    try {
      const yol = await depo.disa_aktar(durum.projeAdi, await oyunHtml());
      $("kayitDurumu").textContent = "Dışa aktarıldı: " + yol;
    } catch (e) {
      $("kayitDurumu").textContent = "Dışa aktarılamadı: " + e;
    }
  };
  $("klasorBtn").onclick = () => depo.klasoru_ac();

  // ------------------------------------------------------------ açılış
  async function basla() {
    depo = (window.pywebview && window.pywebview.api) ? window.pywebview.api : bellekDepo();
    let liste = await projeListesiniCiz();
    if (!liste.length) {
      // ilk açılış: örnek projeleri oluştur
      for (const ad of ["Karanlık Mağara", "Kuş Uçuşu"]) await depo.proje_kaydet(ad, SABLONLAR[ad]());
      liste = await projeListesiniCiz();
    }
    const ad = liste[0];
    projeyiAc(ad, await depo.proje_yukle(ad));
  }

  let basladi = false;
  const tekBasla = () => { if (!basladi) { basladi = true; basla(); } };
  window.addEventListener("pywebviewready", tekBasla);
  if (window.pywebview && window.pywebview.api) tekBasla();
  if (new URLSearchParams(location.search).has("test")) {
    // tarayıcıda otomatik test: hemen bellek deposuyla başla
    tekBasla();
  } else {
    // masaüstü uygulaması beklenir; çok gecikirse kullanıcıyı uyar
    setTimeout(() => {
      if (!basladi) $("kayitDurumu").textContent = "Uygulama bağlantısı bekleniyor…";
    }, 4000);
  }
  window.__atolye = durum;   // otomatik testler için
})();
