// Oyun içeriği ekranına geçiş (menü, komut paleti ve başlangıç ekranı buradan çağırır).
import { useDurum } from "../depo/durum";
import { useOyun } from "./durum";

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
    await useOyun.getState().yukle(depo, klasor);
    if (ana.ekran === "editor") ana.set("oynatma", "duruyor");
    ana.set("ekran", "oyun");
    ana.log("Oyun içeriği açıldı: " + klasor);
  } catch (e) {
    ana.bildir("Oyun içeriği açılamadı: " + String((e as Error)?.message || e), "hata");
  }
}
