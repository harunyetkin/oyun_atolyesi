// Motorun ortak tipleri. Editörden bağımsızdır: DOM, React ya da zustand kullanmaz.
import type { NesneTuru } from "../depo/proje";

/** Oyunda çalışan bir nesne (sahnedeki örneğin oynatma sırasındaki kopyası). */
export interface CalisanNesne {
  id: string;
  turId: string;
  tur: NesneTuru;
  katman: string;
  x: number;
  y: number;
  aci: number;
  olcekX: number;
  olcekY: number;
  vx: number;
  vy: number;
  /** Bu karede katı bir nesnenin üstüne bastı mı? */
  yerde: boolean;
  /** true olunca karenin sonunda dünyadan çıkarılır. */
  yokOlacak: boolean;
  /** Davranışların kendi bilgilerini sakladığı alan (davranış türüne göre). */
  durum: Record<string, any>;
}

/** Çarpışma alanı: dünya koordinatlarında daire ya da eksene hizalı kutu. */
export type Alan =
  | { bicim: "daire"; x: number; y: number; r: number }
  | { bicim: "kutu"; x: number; y: number; yw: number; yh: number }; // yw/yh: yarı genişlik/yükseklik

/** Klavye/fare girdisinin motorun anladığı adları. Editördeki tuş seçicisi bu listeyi kullanır. */
export const TUS_ADLARI = [
  "Boşluk", "Yukarı ok", "Aşağı ok", "Sol ok", "Sağ ok", "W", "A", "S", "D", "Enter", "Fare tıklaması",
] as const;
export type TusAdi = (typeof TUS_ADLARI)[number];

/** Tarayıcının KeyboardEvent.key değerini motor tuş adına çevirir (tanınmayan tuşlar için null). */
export function tusAdiBul(key: string): TusAdi | null {
  switch (key) {
    case " ": case "Spacebar": return "Boşluk";
    case "ArrowUp": return "Yukarı ok";
    case "ArrowDown": return "Aşağı ok";
    case "ArrowLeft": return "Sol ok";
    case "ArrowRight": return "Sağ ok";
    case "Enter": return "Enter";
  }
  const k = key.length === 1 ? key.toLocaleUpperCase("tr-TR") : "";
  if (k === "W" || k === "A" || k === "S" || k === "D") return k;
  return null;
}
