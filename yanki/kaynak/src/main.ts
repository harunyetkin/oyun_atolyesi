// Yankı: ekran, dokunma, döngü, ses, titreşim, rekor kaydı ve çevrimdışı çalışma.
import "./stil.css";
import { H, Oyun } from "./oyun/dunya";
import { ciz } from "./ciz";
import { olayiCal, sesiAc, sessizMi, sessizYap } from "./ses";

const parametre = new URLSearchParams(location.search);
const testKipi = parametre.has("test");
const tohum = parametre.has("tohum") ? Number(parametre.get("tohum")) : undefined;

const tuval = document.getElementById("oyun") as HTMLCanvasElement;
const c = tuval.getContext("2d", { alpha: false })!;
const oyun = new Oyun(tohum);

// ---------------------------------------------------------------- rekor (tarayıcıda saklanır)
const REKOR_ANAHTARI = "yanki.rekor";
try { oyun.rekor = Number(localStorage.getItem(REKOR_ANAHTARI)) || 0; } catch { /* gizli sekme vb. */ }
let eskiRekor = oyun.rekor;
const durum = { yeniRekor: false };

// ---------------------------------------------------------------- ekran boyutu
let olcek = 1, ox = 0, oy = 0;
function boyutla() {
  // pil için çözünürlük en fazla 2× (çok yoğun ekranlarda 3× gereksiz yük)
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth, h = window.innerHeight;
  tuval.width = Math.round(w * dpr);
  tuval.height = Math.round(h * dpr);
  tuval.style.width = w + "px";
  tuval.style.height = h + "px";
  oyun.boyutla(w / h);
  // Oyun alanı (oyun.W × 1000) ekrana sığacak kadar büyütülür ve ortalanır. Oran sınırların içindeyse ekranı
  // tam doldurur; çok dar ekranda üstte/altta, çok genişte yanlarda koyu boşluk kalır.
  olcek = Math.min(tuval.height / H, tuval.width / oyun.W);
  ox = (tuval.width - oyun.W * olcek) / 2;
  oy = (tuval.height - H * olcek) / 2;
}
window.addEventListener("resize", boyutla);
boyutla();

// ---------------------------------------------------------------- girdi
function bas() { sesiAc(); oyun.dokun(); }
function birak() { oyun.birak(); }
tuval.addEventListener("pointerdown", e => { e.preventDefault(); tuval.setPointerCapture?.(e.pointerId); bas(); });
tuval.addEventListener("pointerup", e => { e.preventDefault(); birak(); });
tuval.addEventListener("pointercancel", birak);
window.addEventListener("keydown", e => {
  if (e.repeat) return;
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") { e.preventDefault(); bas(); }
});
window.addEventListener("keyup", e => {
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") birak();
});
// uzun basınca telefonun menü/yakınlaştırma açmasını engelle
tuval.addEventListener("contextmenu", e => e.preventDefault());

const sesDugmesi = document.getElementById("ses") as HTMLButtonElement;
function sesDugmesiniGuncelle() { sesDugmesi.textContent = sessizMi() ? "🔇" : "🔊"; sesDugmesi.setAttribute("aria-label", sessizMi() ? "Sesi aç" : "Sesi kapat"); }
try { if (localStorage.getItem("yanki.sessiz") === "1") sessizYap(true); } catch { /* yok say */ }
sesDugmesiniGuncelle();
sesDugmesi.addEventListener("pointerdown", e => e.stopPropagation());
sesDugmesi.addEventListener("click", () => {
  sessizYap(!sessizMi());
  try { localStorage.setItem("yanki.sessiz", sessizMi() ? "1" : "0"); } catch { /* yok say */ }
  sesDugmesiniGuncelle();
});

// ---------------------------------------------------------------- duraklatma
const duraklatDugmesi = document.getElementById("duraklat") as HTMLButtonElement;
const duraklatPaneli = document.getElementById("duraklat-paneli") as HTMLDivElement;
for (const el of [duraklatDugmesi, duraklatPaneli]) el.addEventListener("pointerdown", e => e.stopPropagation());
duraklatDugmesi.addEventListener("click", () => oyun.duraklat());
(document.getElementById("yeniden") as HTMLButtonElement).addEventListener("click", () => { sesiAc(); oyun.yenidenBasla(); });
window.addEventListener("keydown", e => {
  if (e.code === "Escape" || e.code === "KeyP") { if (oyun.duraklatildi) oyun.devam(); else oyun.duraklat(); }
});
/** Düğmeler yalnız gerektiğinde görünür: duraklat oyun sürerken, "yeniden başla" duraklatılmışken. */
function dugmeleriGuncelle() {
  const oynuyor = oyun.durum === "oyun";
  duraklatDugmesi.hidden = !oynuyor || oyun.duraklatildi;
  duraklatPaneli.hidden = !(oynuyor && oyun.duraklatildi);
}

// ---------------------------------------------------------------- döngü (sabit adım: her cihazda aynı fizik)
const ADIM = 1 / 120;
let birikim = 0, onceki = performance.now(), duraklatildi = false;
function olaylariIsle() {
  for (const olay of oyun.olaylariAl()) {
    olayiCal(olay);
    if (olay === "carpma") {
      try { navigator.vibrate?.(70); } catch { /* yok say */ }
      durum.yeniRekor = oyun.rekor > eskiRekor;
      if (durum.yeniRekor) { try { localStorage.setItem(REKOR_ANAHTARI, String(oyun.rekor)); } catch { /* yok say */ } }
    }
    if (olay === "basla") { eskiRekor = oyun.rekor; durum.yeniRekor = false; }
    if (olay === "bocek") { try { navigator.vibrate?.(12); } catch { /* yok say */ } }
  }
}
function kare(simdi: number) {
  const dt = Math.min(0.1, (simdi - onceki) / 1000);
  onceki = simdi;
  if (!duraklatildi) {
    birikim += dt;
    while (birikim >= ADIM) { oyun.adim(ADIM); birikim -= ADIM; }
    olaylariIsle();
  }
  ciz(c, oyun, olcek, ox, oy, durum);
  dugmeleriGuncelle();
  requestAnimationFrame(kare);
}
requestAnimationFrame(kare);
// başka uygulamaya geçince oyun durur (pil ve adil oyun için)
document.addEventListener("visibilitychange", () => {
  duraklatildi = document.hidden;
  onceki = performance.now();
  if (document.hidden) { oyun.birak(); oyun.duraklat(); }   // dönünce "devam etmek için dokun" ekranı
});

// ---------------------------------------------------------------- testler için
(window as any).__yanki = oyun;
(window as any).__cizim = () => ({ olcek, ox, oy, W: oyun.W, tw: tuval.width, th: tuval.height });

// ---------------------------------------------------------------- çevrimdışı çalışma (yalnız yayında; testte değil)
if (!testKipi && import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js").catch(() => { /* yok say */ }); });
}
