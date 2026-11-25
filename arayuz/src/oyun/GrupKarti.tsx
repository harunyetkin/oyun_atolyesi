// Şemadaki bir grubu (sema.ts) kart olarak çizen ortak bileşen: Karakterler, Harita ayarları ve Arayüz sayfaları kullanır.
import { useOyun } from "./durum";
import { yolOku, yolYaz } from "./icerik";
import { Kart } from "../editor/Ortak";
import { AlanGirisi, AlanSatiri } from "./girisler";
import type { Alan, Grup } from "./sema";

export /** Bir şema grubunu kart olarak çizer. `onEk` dosya içindeki kök yol (ör. "oyuncu"). */
function GrupKarti({ grup, dosya, onEk, kok, tanimli }: { grup: Grup; dosya: string; onEk: string; kok: any; tanimli: Set<string> }) {
  const degistir = useOyun.getState().degistir;
  const tam = (yol: string) => (onEk ? onEk + "." + yol : yol);
  const yaz = (yol: string, v: unknown) => degistir(dosya, d => yolYaz(d, tam(yol), v), "alan:" + dosya + ":" + tam(yol));
  // Şemada olmayan ama dosyada bulunan alanlar (oyuna sonradan eklenenler)
  const digerleri: [string, Alan][] = [];
  const not = grup.digerleri ? yolOku(kok, grup.digerleri.yol ? grup.digerleri.yol + ".not" : "not") : undefined;
  if (grup.digerleri) {
    const sozluk = yolOku(kok, grup.digerleri.yol);
    if (sozluk && typeof sozluk === "object" && !Array.isArray(sozluk)) {
      for (const [k, v] of Object.entries(sozluk)) {
        const yol = grup.digerleri.yol ? grup.digerleri.yol + "." + k : k;
        if (tanimli.has(yol)) continue;
        if (v !== null && typeof v === "object") continue;   // iç içe sözlükler kendi kartlarında
        if (k === "not" || k.startsWith("_")) continue;       // oyunun kendi notları: kartın üstünde gösterilir
        const tur = typeof v === "number" ? "sayi" : typeof v === "string" && k === "not" ? "yazi" : grup.digerleri.tur;
        digerleri.push([yol, tur === "sayi" ? { tur: "sayi", ad: k } : tur === "unreal" ? { tur: "unreal", ad: k } : { tur: "yazi", ad: k }]);
      }
    }
  }
  return (
    <Kart baslik={grup.baslik} acikBaslar={grup.acikBaslar ?? false}>
      {grup.aciklama && <div className="grup-aciklama">{grup.aciklama}</div>}
      {typeof not === "string" && not && <div className="grup-aciklama soluk" style={{ fontStyle: "italic" }} title="Oyun dosyasındaki not">Oyunun notu: {not}</div>}
      {[...grup.alanlar, ...digerleri].map(([yol, alan]) => (
        <AlanSatiri key={yol} alan={alan} yeni={digerleri.some(d => d[0] === yol)}>
          <AlanGirisi alan={alan} deger={yolOku(kok, yol)} degisti={v => yaz(yol, v)} testId={"alan-" + tam(yol)} />
        </AlanSatiri>
      ))}
    </Kart>
  );
}
