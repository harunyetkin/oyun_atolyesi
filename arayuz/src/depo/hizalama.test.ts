import { describe, expect, it } from "vitest";
import { hizala, koseBoyutlandir, ornekKutusu } from "./hizalama";
import type { NesneTuru, Ornek } from "./proje";

const tur: NesneTuru = { id: "t", ad: "Kare", etiketler: [], bilesenler: { gorunum: { sekil: "kare", renk: "#fff", genislik: 20, yukseklik: 10, saydamlik: 1 } } };
const turler = new Map([["t", tur]]);
const o = (id: string, x: number, y: number, ek: Partial<Ornek> = {}): Ornek => ({ id, turId: "t", x, y, aci: 0, olcekX: 1, olcekY: 1, katman: "oyun", ...ek });
const cerceve = { x0: 0, y0: 0, x1: 200, y1: 100 };

describe("hizalama", () => {
  it("döndürülmüş nesnenin kutusu", () => {
    const k = ornekKutusu(o("a", 50, 50, { aci: 90 }), tur);
    expect(k.x0).toBeCloseTo(45); expect(k.x1).toBeCloseTo(55);
    expect(k.y0).toBeCloseTo(40); expect(k.y1).toBeCloseTo(60);
  });
  it("birden fazla nesneyi sola ve üste hizalar", () => {
    const r = hizala([o("a", 30, 20), o("b", 80, 60)], turler, "sol", cerceve);
    expect(r.get("a")!.x).toBe(30); expect(r.get("b")!.x).toBe(30);
    const u = hizala([o("a", 30, 20), o("b", 80, 60)], turler, "ust", cerceve);
    expect(u.get("b")!.y).toBe(20);
  });
  it("tek nesneyi sahneye göre ortalar", () => {
    const r = hizala([o("a", 10, 10)], turler, "yatayOrta", cerceve);
    expect(r.get("a")).toEqual({ x: 100, y: 10 });
    const s = hizala([o("a", 10, 10)], turler, "sag", cerceve);
    expect(s.get("a")!.x).toBe(190);
  });
  it("eşit dağıtır, uçtakiler yerinde kalır", () => {
    const r = hizala([o("a", 10, 0), o("b", 30, 0), o("c", 110, 0)], turler, "yatayDagit", cerceve);
    expect(r.get("a")!.x).toBe(10); expect(r.get("c")!.x).toBe(110); expect(r.get("b")!.x).toBe(60);
    expect(hizala([o("a", 0, 0), o("b", 5, 0)], turler, "yatayDagit", cerceve).size).toBe(0);
  });
  it("köşeden boyutlandırmada karşı köşe sabit kalır", () => {
    // 20x10 nesne (50,50) merkezli: sağ alt köşeyi (70, 65)'e çek → sol üst (40,45) yerinde
    const r = koseBoyutlandir(o("a", 50, 50), 20, 10, [1, 1], { x: 70, y: 65 }, false);
    expect(r.olcekX).toBe(1.5); expect(r.olcekY).toBe(2);
    expect(r.x - (20 * r.olcekX) / 2).toBe(40); expect(r.y - (10 * r.olcekY) / 2).toBe(45);
    const k = koseBoyutlandir(o("a", 50, 50), 20, 10, [1, 1], { x: 80, y: 50 }, true);
    expect(k.olcekX).toBe(k.olcekY);
  });
});
