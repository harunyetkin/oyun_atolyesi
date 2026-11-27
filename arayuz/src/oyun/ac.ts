// Oyun içeriği ekranına geçiş (menü, komut paleti ve başlangıç ekranı buradan çağırır).
import { useDurum } from "../depo/durum";
import { useOyun } from "./durum";
import type { Depo } from "../depo/api";

/** Oyun klasörünü (hatırlanan ya da yeni seçilen) açıp içerik ekranına geçer. `degistir`: her zaman yeniden seç. */
export async function oyunIceriginiAc(degistir = false) {
  const ana = useDurum.getState();
  const depo = ana.depo;
  if (!depo) return;
  try {
    let klasor = degistir ? "" : await depo.oyun_klasoru();
    if (!klasor) klasor = await depo.oyun_klasoru_sec();
    if (!klasor) return;
    if (klasor.startsWith("!")) { ana.bildir(klasor.slice(1), "hata"); return; }
    await useOyun.getState().yukle(depo, klasor, "oyun");
    if (ana.ekran === "editor") ana.set("oynatma", "duruyor");
    ana.set("ekran", "oyun");
    ana.log("Oyun içeriği açıldı: " + klasor);
  } catch (e) {
    ana.bildir("Oyun içeriği açılamadı: " + String((e as Error)?.message || e), "hata");
  }
}

/** Yankı'nın içerik dosyasını (yanki/icerik/yanki.json) aynı düzenleyici altyapısıyla açmak için: tek dosyalı bir "depo". */
export function yankiDeposu(depo: Depo): Depo {
  return {
    ...depo,
    icerik_listesi: async () => ["yanki.json"],
    icerik_oku: async () => depo.yanki_oku(),
    icerik_yaz: async (_yol, veri) => {
      const sonuc = await depo.yanki_yaz(veri);
      if (sonuc !== true) useDurum.getState().bildir(String(sonuc).replace(/^!/, ""), "hata");
      return true;
    },
  };
}

/** Yankı düzenleyicisini açar (ayarlar ve bölümler). `degistir`: klasörü yeniden seç. */
export async function yankiAc(degistir = false) {
  const ana = useDurum.getState();
  const depo = ana.depo;
  if (!depo) return;
  try {
    let klasor = degistir ? "" : await depo.yanki_klasoru();
    if (!klasor) klasor = await depo.yanki_klasoru_sec();
    if (!klasor) return;
    if (klasor.startsWith("!")) { ana.bildir(klasor.slice(1), "hata"); return; }
    await useOyun.getState().yukle(yankiDeposu(depo), klasor, "yanki");
    if (ana.ekran === "editor") ana.set("oynatma", "duruyor");
    ana.set("ekran", "oyun");
    ana.log("Yankı açıldı: " + klasor);
  } catch (e) {
    ana.bildir("Yankı açılamadı: " + String((e as Error)?.message || e), "hata");
  }
}

/** Kaydedilmiş Yankı'yı (Yanki.html) tarayıcıda açar. */
export async function yankiOyna() {
  const ana = useDurum.getState();
  const st = useOyun.getState();
  if (st.degisenler().length) { ana.bildir("Önce kaydet (Ctrl+S): oyun kaydedilen hâliyle açılır.", "hata"); return; }
  const sonuc = await ana.depo?.yanki_oyna();
  if (sonuc && sonuc !== true) ana.bildir(String(sonuc).replace(/^!/, ""), "hata");
  else ana.bildir("Yankı tarayıcıda açıldı. Menüden bölümü seç.");
}
