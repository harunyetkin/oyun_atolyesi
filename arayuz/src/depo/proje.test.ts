import { describe, expect, it } from "vitest";
import { bosProje, gocEt, ornekProje, PROJE_SURUMU } from "./proje";

describe("proje formatı", () => {
  it("boş proje geçerli", () => {
    const p = bosProje("Deneme");
    expect(p.surum).toBe(PROJE_SURUMU);
    expect(p.sahneler).toHaveLength(1);
    expect(p.sahneler[0].katmanlar.map(k => k.id)).toEqual(["arka", "oyun", "arayuz"]);
  });
  it("örnek projedeki her örneğin türü var", () => {
    const p = ornekProje();
    const turler = new Set(p.nesneTurleri.map(t => t.id));
    for (const o of p.sahneler[0].ornekler) expect(turler.has(o.turId)).toBe(true);
  });
  it("v2 proje olduğu gibi kalır", () => {
    const p = ornekProje();
    expect(gocEt(p, "x")).toBe(p);
  });
  it("v0.1 projesi v2'ye dönüştürülür", () => {
    const eski = {
      ad: "Karanlık Mağara", surum: 1,
      dunya: { arka_renk: "#241e34" },
      oyuncu: { sekil: "yarasa", renk: "#4a3a62", boyut: 14, yercekimi: 1580, kanat_gucu: 430, max_dusus: 800 },
      nesneler: [
        { id: "a", ad: "Sarkıt", sekil: "ucgen", renk: "#777", boyut: 22, konum: "tavan", etki: { tip: "olum" } },
        { id: "b", ad: "Ateş böceği", sekil: "yildiz", renk: "#d2ff78", boyut: 9, konum: "orta", parlar: true, etki: { tip: "puan" } },
      ],
    };
    const p = gocEt(eski, "Karanlık Mağara");
    expect(p.surum).toBe(PROJE_SURUMU);
    expect(p.nesneTurleri.map(t => t.ad)).toEqual(["Oyuncu", "Sarkıt", "Ateş böceği"]);
    expect(p.nesneTurleri[0].bilesenler.davranislar?.[0].tur).toBe("tusla_zipla");
    expect(p.nesneTurleri[1].etiketler).toContain("engel");
    expect(p.nesneTurleri[2].bilesenler.isik).toBeTruthy();
    expect(p.sahneler[0].ornekler).toHaveLength(3);
    expect(p.eski_v01).toBe(eski);
  });
});
