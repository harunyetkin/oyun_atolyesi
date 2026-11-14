// Oyun Atölyesi motoru
// Bir "oyun tanımını" (JSON) okuyup tek tuşlu, yana kayan bir oyun olarak oynatır.
// Tanım her karede yeniden okunduğu için editörde yapılan değişiklikler anında yansır.
(function (global) {
  "use strict";

  const W = 960, H = 540;
  const OYUNCU_X = 200;
  const GUVENLI_BASLANGIC = 600;   // ilk bu kadar piksel nesnesiz

  const rnd = (a, b) => a + Math.random() * (b - a);
  const sinirla = (v, a, b) => Math.max(a, Math.min(b, v));

  // ------------------------------------------------------------ şekil çizimi
  function sekilCiz(c, sekil, x, y, r, renk, yon) {
    c.save();
    c.translate(x, y);
    c.fillStyle = renk;
    c.strokeStyle = "rgba(0,0,0,0.35)";
    c.lineWidth = 2;
    c.beginPath();
    switch (sekil) {
      case "kare":
        c.rect(-r, -r, r * 2, r * 2);
        break;
      case "ucgen": {
        // yon: 1 = aşağı bakar (tavandan sarkar), -1 = yukarı bakar (tabandan çıkar)
        const d = yon || 1;
        c.moveTo(-r, -r * d); c.lineTo(r, -r * d); c.lineTo(0, r * 1.6 * d);
        c.closePath();
        break;
      }
      case "elmas":
        c.moveTo(0, -r); c.lineTo(r * 0.8, 0); c.lineTo(0, r); c.lineTo(-r * 0.8, 0);
        c.closePath();
        break;
      case "yildiz":
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5;
          const rr = i % 2 === 0 ? r : r * 0.45;
          c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        c.closePath();
        break;
      default:
        c.arc(0, 0, r, 0, Math.PI * 2);
    }
    c.fill();
    c.stroke();
    c.restore();
  }

  function oyuncuCiz(c, o, x, y, r, kanat, egim) {
    if (o.sekil === "yarasa" || o.sekil === "kus") {
      c.save();
      c.translate(x, y);
      c.rotate(egim);
      c.fillStyle = o.renk;
      c.strokeStyle = "rgba(0,0,0,0.4)";
      c.lineWidth = 2;
      for (const yan of [-1, 1]) {
        c.beginPath();
        c.moveTo(yan * r * 0.3, 0);
        c.lineTo(yan * r * 2.2, -r * 1.4 * kanat - r * 0.2);
        c.lineTo(yan * r * 2.6, -r * 0.6 * kanat + r * 0.3);
        c.lineTo(yan * r * 1.2, r * 0.5);
        c.closePath();
        c.fill(); c.stroke();
      }
      c.beginPath();
      c.ellipse(0, 0, r, r * 0.85, 0, 0, Math.PI * 2);
      c.fill(); c.stroke();
      if (o.sekil === "yarasa") {
        c.beginPath();
        c.moveTo(-r * 0.6, -r * 0.5); c.lineTo(-r * 0.35, -r * 1.3); c.lineTo(-r * 0.1, -r * 0.6);
        c.moveTo(r * 0.1, -r * 0.6); c.lineTo(r * 0.35, -r * 1.3); c.lineTo(r * 0.6, -r * 0.5);
        c.fill();
      } else {
        c.fillStyle = "#f08030";
        c.beginPath();
        c.moveTo(r * 0.8, -r * 0.1); c.lineTo(r * 1.6, r * 0.15); c.lineTo(r * 0.8, r * 0.4);
        c.fill();
      }
      c.fillStyle = "#ffffff";
      c.beginPath(); c.arc(r * 0.35, -r * 0.2, r * 0.28, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#111";
      c.beginPath(); c.arc(r * 0.45, -r * 0.2, r * 0.13, 0, Math.PI * 2); c.fill();
      c.restore();
    } else {
      sekilCiz(c, o.sekil, x, y, r, o.renk, 1);
    }
  }

  // ------------------------------------------------------------ motor
  class Motor {
    constructor(canvas, oyun, secenek) {
      secenek = secenek || {};
      this.cv = canvas;
      this.c = canvas.getContext("2d");
      canvas.width = W;
      canvas.height = H;
      this.oyun = oyun;
      this.olumsuz = !!secenek.olumsuz;     // test modu: ölünce oyun bitmez
      this.karanlik = document.createElement("canvas");
      this.karanlik.width = W;
      this.karanlik.height = H;
      this.calisiyor = false;
      this.duraklatildi = false;
      this._son = 0;
      this.sifirla();
    }

    ayarla(oyun) { this.oyun = oyun; }

    sifirla() {
      this.durum = "menu";
      this.kam = 0;
      this.y = H / 2;
      this.vy = 0;
      this.t = 0;
      this.kanatT = 1;
      this.ornekler = [];         // ekrandaki nesneler
      this.sonraki = {};          // her nesne türü için bir sonraki doğma noktası
      this.etkiler = {};          // aktif etkiler: tip -> {sure, guc, ad}
      this.bonus = 0;
      this.dalgalar = [];         // kanat ışığı dalgaları
      this.yazilar = [];          // uçan yazılar
      this.bitisT = 0;
      this.sarsinti = 0;
      this.sonOlumAni = -10;
    }

    get skor() { return Math.floor(this.kam / 40) + this.bonus; }

    // ---- mağara sınırları
    sinir(x) {
      const d = this.oyun.dunya;
      if (!d.magara) return [-1e4, H];
      const bosluk = Math.max(90, d.bosluk - (d.daralma || 0) * Math.max(0, x - GUVENLI_BASLANGIC) / 1000);
      const A = (d.kivrim || 0) * Math.max(0, H / 2 - d.bosluk / 2 - 20);
      const m = H / 2 + A * (0.6 * Math.sin(x * 0.0031 + 0.7) + 0.4 * Math.sin(x * 0.0087 + 2.1));
      return [m - bosluk / 2, m + bosluk / 2];
    }

    // ---- girdi
    bas() {
      if (this.duraklatildi) return;
      if (this.durum === "menu") {
        this.durum = "oyun";
        this._cirp();
      } else if (this.durum === "oyun") {
        this._cirp();
      } else if (this.durum === "bitti" && this.bitisT > 0.6) {
        this.sifirla();
        this.durum = "oyun";
        this._cirp();
      }
    }

    _cirp() {
      const o = this.oyun.oyuncu;
      let guc = o.kanat_gucu;
      const kz = this.etkiler.kanat_zayiflat;
      if (kz) guc *= 1 - kz.guc / 100;
      this.vy = -guc;
      this.kanatT = 0;
      if (this.oyun.dunya.karanlik && this.oyun.dunya.kanat_isigi) {
        this.dalgalar.push({ x: this.kam + OYUNCU_X, y: this.y, yas: 0 });
      }
    }

    // ---- güncelleme
    adim(dt) {
      if (this.duraklatildi) return;
      const d = this.oyun.dunya, o = this.oyun.oyuncu;
      this.t += dt;
      this.kanatT += dt;
      for (const g of this.dalgalar) g.yas += dt;
      this.dalgalar = this.dalgalar.filter(g => g.yas < 1.4);
      for (const y of this.yazilar) { y.y -= 40 * dt; y.omur -= dt; }
      this.yazilar = this.yazilar.filter(y => y.omur > 0);
      this.sarsinti = Math.max(0, this.sarsinti - dt);

      if (this.durum === "menu") {
        this.kam += d.hiz * 0.3 * dt;
        this.y = H / 2 + Math.sin(this.t * 2.5) * 12;
        if (this.kanatT > 0.6) this.kanatT = 0;
        return;
      }
      if (this.durum === "bitti") {
        this.bitisT += dt;
        this.vy = Math.min(this.vy + o.yercekimi * dt, o.max_dusus);
        this.y = Math.min(this.y + this.vy * dt, H + 60);
        return;
      }

      // etkilerin süresi
      for (const k of Object.keys(this.etkiler)) {
        this.etkiler[k].sure -= dt;
        if (this.etkiler[k].sure <= 0) delete this.etkiler[k];
      }

      // hız
      let hiz = d.hiz + (d.hiz_artisi || 0) * (this.kam / 4000);
      if (this.etkiler.yavaslat) hiz *= 1 - this.etkiler.yavaslat.guc / 100;
      this.kam += hiz * dt;

      // yarasa / oyuncu fiziği
      let g = o.yercekimi;
      if (this.etkiler.agirlastir) g *= 1 + this.etkiler.agirlastir.guc / 100;
      if (this.etkiler.sersem) this.vy += rnd(-1, 1) * this.etkiler.sersem.guc * 15 * dt;
      this.vy = Math.min(this.vy + g * dt, o.max_dusus);
      this.y += this.vy * dt;

      this._dogur();
      this._nesneleriGuncelle(dt);
      this._carpismalar();
    }

    _dogur() {
      for (const tur of this.oyun.nesneler) {
        if (!tur.aktif || tur.siklik <= 0) continue;
        if (this.sonraki[tur.id] === undefined) {
          this.sonraki[tur.id] = Math.max(this.kam + W, GUVENLI_BASLANGIC) + rnd(0, 1000 / tur.siklik);
        }
        while (this.sonraki[tur.id] < this.kam + W + 80) {
          const x = this.sonraki[tur.id];
          const [ust, alt] = this.sinir(x);
          const tavan = Math.max(0, ust), taban = Math.min(H, alt);
          let y;
          if (tur.konum === "tavan") y = tavan + tur.boyut * 0.9;
          else if (tur.konum === "taban") y = taban - tur.boyut * 0.9;
          else y = rnd(tavan + tur.boyut + 25, Math.max(tavan + tur.boyut + 26, taban - tur.boyut - 25));
          this.ornekler.push({ tur: tur.id, x, y0: y, y, vy: 0, faz: rnd(0, 6.28) });
          this.sonraki[tur.id] += (1000 / tur.siklik) * rnd(0.5, 1.5);
        }
      }
      this.ornekler = this.ornekler.filter(n => n.x > this.kam - 80 && n.y < H + 80);
    }

    _tur(id) { return this.oyun.nesneler.find(t => t.id === id); }

    _nesneleriGuncelle(dt) {
      const ox = this.kam + OYUNCU_X;
      for (const n of this.ornekler) {
        const tur = this._tur(n.tur);
        if (!tur) { n.sil = true; continue; }
        n.faz += dt;
        switch (tur.hareket) {
          case "dalga":
            n.y = n.y0 + Math.sin(n.faz * 2.5) * (tur.genlik || 0);
            break;
          case "dusen":
            if (n.x - ox < 280) { n.vy += 900 * dt; n.y += n.vy * dt; }
            break;
          case "ucan":
            n.x -= (tur.hiz || 0) * dt;
            n.y = n.y0 + Math.sin(n.faz * 4) * 10;
            break;
        }
      }
      this.ornekler = this.ornekler.filter(n => !n.sil);
    }

    _carpismalar() {
      const d = this.oyun.dunya, o = this.oyun.oyuncu;
      const ox = this.kam + OYUNCU_X, r = o.boyut * 0.8;
      // dünya sınırları
      const [ust, alt] = this.sinir(ox);
      if (d.magara && d.duvar_olumcul !== false) {
        if (this.y - r < ust || this.y + r > alt) return this._ol("Duvara çarptın");
      } else {
        if (this.y - r < Math.max(0, ust)) { this.y = Math.max(0, ust) + r; this.vy = 0; }
        if (this.y + r > Math.min(H, alt)) return this._ol("Düştün");
      }
      // nesneler
      for (const n of this.ornekler) {
        const tur = this._tur(n.tur);
        if (!tur || n.alindi) continue;
        if (Math.hypot(n.x - ox, n.y - this.y) > tur.boyut * 0.85 + r) continue;
        const e = tur.etki || { tip: "olum" };
        if (e.tip === "olum") {
          if (this.etkiler.kalkan) { n.alindi = true; this._yazi("Kalkan!", "#9fe0ff"); continue; }
          return this._ol(tur.ad);
        }
        if (e.tip === "puan") {
          this.bonus += Math.round(e.guc);
          this._yazi("+" + Math.round(e.guc), tur.renk);
        } else {
          const yeni = !this.etkiler[e.tip];
          this.etkiler[e.tip] = { sure: e.sure, guc: e.guc, ad: tur.ad };
          if (yeni) this._yazi(tur.ad + "!", tur.renk);
        }
        if (e.tek_kullanim !== false) n.alindi = true;
      }
      this.ornekler = this.ornekler.filter(n => !n.alindi);
    }

    _yazi(metin, renk) {
      this.yazilar.push({ metin, renk, x: OYUNCU_X + 30, y: this.y - 30, omur: 1.1 });
    }

    _ol(neden) {
      if (this.olumsuz) {
        if (this.t - this.sonOlumAni > 0.8) { this._yazi("(test) " + neden, "#ff8080"); this.sonOlumAni = this.t; }
        // test modunda yarasayı güvenli bölgeye geri it
        const [ust, alt] = this.sinir(this.kam + OYUNCU_X);
        this.y = sinirla(this.y, Math.max(0, ust) + 30, Math.min(H, alt) - 30);
        this.vy = 0;
        return;
      }
      this.durum = "bitti";
      this.olumNedeni = neden;
      this.bitisT = 0;
      this.sarsinti = 0.3;
    }

    // ------------------------------------------------------------ çizim
    ciz() {
      const c = this.c, d = this.oyun.dunya, o = this.oyun.oyuncu;
      c.save();
      if (this.sarsinti > 0) c.translate(rnd(-5, 5), rnd(-5, 5));
      c.fillStyle = d.arka_renk;
      c.fillRect(-10, -10, W + 20, H + 20);

      // mağara duvarları
      if (d.magara) {
        c.fillStyle = d.duvar_renk;
        for (const alt of [false, true]) {
          c.beginPath();
          c.moveTo(-10, alt ? H + 10 : -10);
          for (let sx = -10; sx <= W + 10; sx += 10) {
            const [u, a] = this.sinir(this.kam + sx);
            c.lineTo(sx, alt ? a : u);
          }
          c.lineTo(W + 10, alt ? H + 10 : -10);
          c.closePath();
          c.fill();
        }
      }

      // nesneler
      for (const n of this.ornekler) {
        const tur = this._tur(n.tur);
        if (!tur) continue;
        const yon = tur.konum === "taban" ? -1 : 1;
        sekilCiz(c, tur.sekil, n.x - this.kam, n.y, tur.boyut, tur.renk, yon);
      }

      // oyuncu
      const kanat = this.kanatT < 0.25 ? Math.cos(this.kanatT / 0.25 * Math.PI) : 0.3 * Math.sin(this.t * 8);
      const egim = sinirla(this.vy / 1500, -0.5, 0.6);
      oyuncuCiz(c, o, OYUNCU_X, this.y, o.boyut, kanat, egim);

      // karanlık
      if (d.karanlik) {
        const k = this.karanlik.getContext("2d");
        k.globalCompositeOperation = "source-over";
        k.clearRect(0, 0, W, H);
        k.fillStyle = "rgba(0,0,0,0.985)";
        k.fillRect(0, 0, W, H);
        k.globalCompositeOperation = "destination-out";
        const isik = (x, y, r, guc) => {
          if (r < 2 || guc <= 0) return;
          const gr = k.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, "rgba(0,0,0," + guc + ")");
          gr.addColorStop(0.6, "rgba(0,0,0," + guc * 0.85 + ")");
          gr.addColorStop(1, "rgba(0,0,0,0)");
          k.fillStyle = gr;
          k.beginPath(); k.arc(x, y, r, 0, Math.PI * 2); k.fill();
        };
        isik(OYUNCU_X, this.y, d.isik_yaricapi, 0.9);
        for (const g of this.dalgalar) {
          const buyu = Math.min(1, g.yas / 0.25);
          const sol = g.yas < 0.35 ? 1 : Math.max(0, 1 - (g.yas - 0.35) / 1.05);
          isik(g.x - this.kam, g.y, d.dalga_yaricapi * (0.35 + 0.65 * buyu), sol);
        }
        for (const n of this.ornekler) {
          const tur = this._tur(n.tur);
          if (tur && tur.parlar) isik(n.x - this.kam, n.y, tur.boyut * 3.5, 0.7);
        }
        k.globalCompositeOperation = "source-over";
        c.drawImage(this.karanlik, 0, 0);
        // parlayanlar karanlığın üstünde de görünür
        for (const n of this.ornekler) {
          const tur = this._tur(n.tur);
          if (tur && tur.parlar) sekilCiz(c, tur.sekil, n.x - this.kam, n.y, tur.boyut, tur.renk, 1);
        }
        // ses dalgası halkası
        for (const g of this.dalgalar) {
          if (g.yas < 0.7) {
            c.strokeStyle = "rgba(110,220,255," + (1 - g.yas / 0.7) + ")";
            c.lineWidth = 2;
            c.beginPath(); c.arc(g.x - this.kam, g.y, g.yas * 620, 0, Math.PI * 2); c.stroke();
          }
        }
      }
      c.restore();

      this._arayuz();
    }

    _metin(m, x, y, boyut, renk, hiza) {
      const c = this.c;
      c.font = "600 " + boyut + "px 'Segoe UI', system-ui, sans-serif";
      c.textAlign = hiza || "center";
      c.textBaseline = "middle";
      c.fillStyle = "rgba(0,0,0,0.6)";
      c.fillText(m, x + 2, y + 2);
      c.fillStyle = renk || "#fff";
      c.fillText(m, x, y);
    }

    _arayuz() {
      for (const y of this.yazilar) this._metin(y.metin, y.x, y.y, 18, y.renk, "left");
      if (this.durum === "menu") {
        this._metin(this.oyun.ad || "Oyun", W / 2, H / 2 - 90, 48, "#fff");
        this._metin("Başlamak için BOŞLUK ya da tıkla", W / 2, H / 2 + 80, 22, "#ffe08a");
        return;
      }
      this._metin(this.skor + " m", W / 2, 32, 28, "#fff");
      let i = 0;
      for (const [k, e] of Object.entries(this.etkiler)) {
        this._metin(e.ad + "  " + e.sure.toFixed(1) + " sn", W / 2, 66 + i * 22, 15, "#ddd");
        i++;
      }
      if (this.durum === "bitti") {
        this.c.fillStyle = "rgba(10,8,20,0.75)";
        this.c.fillRect(W / 2 - 190, H / 2 - 100, 380, 200);
        this._metin(this.olumNedeni || "Oyun bitti", W / 2, H / 2 - 55, 30, "#ff8a70");
        this._metin("Skor: " + this.skor, W / 2, H / 2, 28, "#fff");
        if (this.bitisT > 0.6) this._metin("Tekrar için BOŞLUK", W / 2, H / 2 + 55, 18, "#ffe08a");
      }
      if (this.duraklatildi) this._metin("DURAKLATILDI", W / 2, H / 2, 32, "#fff");
    }

    // ------------------------------------------------------------ döngü
    baslat() {
      if (this.calisiyor) return;
      this.calisiyor = true;
      this._son = performance.now();
      const dongu = (zaman) => {
        if (!this.calisiyor) return;
        const dt = Math.min(1 / 30, (zaman - this._son) / 1000);
        this._son = zaman;
        this.adim(dt);
        this.ciz();
        requestAnimationFrame(dongu);
      };
      requestAnimationFrame(dongu);
    }

    durdur() { this.calisiyor = false; }
  }

  Motor.GENISLIK = W;
  Motor.YUKSEKLIK = H;
  Motor.sekilCiz = sekilCiz;
  Motor.oyuncuCiz = oyuncuCiz;
  global.Motor = Motor;
})(typeof window !== "undefined" ? window : globalThis);
