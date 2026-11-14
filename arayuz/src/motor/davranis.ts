// Davranış kayıt sistemi.
//
// YENİ DAVRANIŞ NASIL EKLENİR (tek dosya):
//   1. motor/davranislar/ altına bir dosya aç, ör. `suzul.ts`.
//   2. İçinde `davranisTanimla({ tur, ad, aciklama, ayarlar, ... })` çağır. Ayarlar listesi
//      editörün özellik panelinde otomatik olarak doğru giriş kutularıyla görünür.
//   3. motor/davranislar/index.ts'e `import "./suzul";` satırını ekle.
// Davranış, motorun çağırdığı kancaları (baslat, kare, tusBasildi) kullanır.
import type { CalisanNesne, TusAdi } from "./tipler";
import type { Dunya } from "./dunya";

export type AyarDegeri = number | string | boolean;
export type Ayarlar = Record<string, AyarDegeri>;

/** Bir davranış ayarının editörde nasıl gösterileceği. */
export type AyarTanimi =
  | { ad: string; etiket: string; tur: "sayi"; varsayilan: number; adim?: number; min?: number }
  | { ad: string; etiket: string; tur: "tus"; varsayilan: TusAdi }
  | { ad: string; etiket: string; tur: "secim"; varsayilan: string; secenekler: { deger: string; ad: string }[] }
  | { ad: string; etiket: string; tur: "onay"; varsayilan: boolean };

export interface DavranisTanimi {
  tur: string;            // projede saklanan kimlik, ör. "tusla_zipla" (değiştirme!)
  ad: string;             // editörde görünen ad
  aciklama: string;       // kısa açıklama (ipucu olarak gösterilir)
  ayarlar: AyarTanimi[];
  /** Oynatma başında bir kez. */
  baslat?(n: CalisanNesne, a: Ayarlar, dunya: Dunya): void;
  /** Her fizik adımında, fizikten önce. */
  kare?(n: CalisanNesne, a: Ayarlar, dunya: Dunya, dt: number): void;
  /** Bir tuşa (ya da fareye) yeni basıldığında. */
  tusBasildi?(n: CalisanNesne, a: Ayarlar, dunya: Dunya, tus: TusAdi): void;
}

const KAYIT = new Map<string, DavranisTanimi>();

export function davranisTanimla(t: DavranisTanimi) {
  KAYIT.set(t.tur, t);
  return t;
}
export const davranisBul = (tur: string) => KAYIT.get(tur);
export const davranisListesi = () => [...KAYIT.values()];

/** Tanımdaki varsayılanlarla, projede eksik olan ayarları tamamlar (eski projeler için). */
export function ayarlariTamamla(t: DavranisTanimi, a: Ayarlar | undefined): Ayarlar {
  const sonuc: Ayarlar = {};
  for (const at of t.ayarlar) sonuc[at.ad] = a && at.ad in a ? a[at.ad] : at.varsayilan;
  return sonuc;
}
export const varsayilanAyarlar = (t: DavranisTanimi) => ayarlariTamamla(t, undefined);
