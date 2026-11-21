import { describe, expect, it } from "vitest";
import {
  anahtarDegistir, benzersizKimlik, dosyaTuru, esyaCogalt, esyaEkle, esyaUyarilari, haritaKisileri, kimlikGecerli, kimlikYap,
  gorevEkle, gorevHedefiniYenile, gorevHedefleri, gorevUyarilari, sandikCogalt, sandikEkle, sandikUyarilari,
  kisiUyarilari, programDuragiEkle, npcCogalt, npcEkle, npcSeridi, npcUyarilari, unrealYoluSorunu, yolOku, yolYaz,
} from "./icerik";
import { HARITA_GRUPLARI, OYUNCU_GRUPLARI } from "./sema";
import { ORNEK_ICERIK } from "./ornekIcerik";
import { useOyun } from "./durum";
import type { Depo } from "../depo/api";

describe("oyun içeriği yardımcıları", () => {
  it("noktalı yolla okur/yazar, eksik sözlükleri oluşturur, bilinmeyenlere dokunmaz", () => {
    const v: any = { oyuncu: { hareket: { yurume_hizi: 150 }, bilinmeyen: { a: 1 } } };
    expect(yolOku(v, "oyuncu.hareket.yurume_hizi")).toBe(150);
    expect(yolOku(v, "oyuncu.yok.alan")).toBeUndefined();
    yolYaz(v, "oyuncu.hareket.kamera_gore_kontrol", 1);
    yolYaz(v, "oyuncu.canta.renk", "#112233");
    expect(v.oyuncu.hareket).toEqual({ yurume_hizi: 150, kamera_gore_kontrol: 1 });
    expect(v.oyuncu.canta.renk).toBe("#112233");
    expect(v.oyuncu.bilinmeyen).toEqual({ a: 1 });
    yolYaz(v, "oyuncu.hareket.yurume_hizi", undefined);
    expect("yurume_hizi" in v.oyuncu.hareket).toBe(false);
  });

  it("kimlik kuralları ve benzersiz kimlik", () => {
    expect(kimlikGecerli("gezgin_1")).toBe(true);
    expect(kimlikGecerli("Gezgin")).toBe(false);
    expect(kimlikGecerli("çiçek")).toBe(false);
    expect(kimlikYap("Eski Çiçek Defteri!")).toBe("eski_cicek_defteri");
    expect(benzersizKimlik("esya", ["esya", "esya_2"])).toBe("esya_3");
    expect(benzersizKimlik("defter", ["esya"])).toBe("defter");
  });

  it("anahtar adını sırayı bozmadan değiştirir", () => {
    expect(Object.keys(anahtarDegistir({ a: 1, b: 2, c: 3 }, "b", "x"))).toEqual(["a", "x", "c"]);
  });

  it("Unreal yolunu denetler", () => {
    expect(unrealYoluSorunu("")).toBe("");
    expect(unrealYoluSorunu("/Game/MetaHumans/A/BP_A")).toBe("");
    expect(unrealYoluSorunu("Game/A")).toMatch(/Game/);
    expect(unrealYoluSorunu("/Game/A/B.uasset")).toMatch(/Uzantı/);
  });

  it("kişi (npc) ekler, çoğaltır; yaya şeridini Unreal eksenine çevirir", () => {
    const h: any = structuredClone(ORNEK_ICERIK["haritalar/deneme_yolu.json"]);
    const n = h.npcler.length;
    const id = npcEkle(h);
    expect(id).toBe("kisi");
    expect(h.npcler.length).toBe(n + 1);
    expect(h.npcler[n].alan.merkez[0]).toBeGreaterThan(h.yol.genislik / 2);  // yolun dışında
    expect(npcCogalt(h, "gezgin_1")).toBe("gezgin_3");   // gezgin_2 zaten var
    expect(npcCogalt(h, "yolcu")).toBe("yolcu_2");
    expect(h.npcler[1].id).toBe("yolcu_2");
    expect(h.npcler[1].alan.merkez).toEqual([2, -22]);
    expect(npcCogalt(h, "yok")).toBeNull();
    // şerit: alan yoksa merkezden ±20 m; varsa cm (Unreal X = -z*100, Y = x*100)
    const k: any = { id: "a", alan: { merkez: [3, -40], yaricap: 5 }, davranis: "yol" };
    expect(npcSeridi(k)).toEqual({ x: 3, zBas: -20, zSon: -60 });
    k.serit_y = -450; k.serit_x_min = 1000; k.serit_x_max = 5000;
    expect(npcSeridi(k)).toEqual({ x: -4.5, zBas: -10, zSon: -50 });
  });

  it("kişi uyarıları: kimlik, hız, diyalog dosyası, seçenekler, şerit, kalabalık", () => {
    const h: any = structuredClone(ORNEK_ICERIK["haritalar/deneme_yolu.json"]);
    const diyaloglar = Object.keys(ORNEK_ICERIK).filter(y => y.startsWith("diyaloglar/"));
    expect(npcUyarilari(h, diyaloglar)).toEqual([]);
    h.npcler[0].hiz = 5; h.npcler[1].diyalog = "diyaloglar/yok.json"; h.npcler[2].savas_tavri = "saldir";
    h.npcler[3].id = h.npcler[2].id; h.npcler[3].davranis = "yol"; h.npcler[3].serit_x_min = 10; h.npcler[3].serit_x_max = 5;
    h.kalabalik.klasor = "MetaHumans";
    const u = npcUyarilari(h, diyaloglar).map(x => x.metin).join(" | ");
    expect(u).toMatch(/Hız 0–3/); expect(u).toMatch(/bulunamadı: diyaloglar\/yok.json/); expect(u).toMatch(/saldırı tavrı: saldir/);
    expect(u).toMatch(/iki kez/); expect(u).toMatch(/şeridinin başı/); expect(u).toMatch(/Game/);
  });

  it("günlük program: durak ekler (son duraktan 2 saat sonra), uyarıları bulur", () => {
    const h: any = structuredClone(ORNEK_ICERIK["haritalar/deneme_yolu.json"]);
    const yolcu = h.npcler.find((n: any) => n.id === "yolcu");
    programDuragiEkle(yolcu);
    expect(yolcu.program).toEqual([{ saat: 8, is: "bekle", yer: yolcu.alan.merkez }]);
    programDuragiEkle(yolcu);
    expect(yolcu.program[1].saat).toBe(10);
    expect(npcUyarilari(h, [])).toEqual([]);
    yolcu.program[0].saat = 25; yolcu.program[1].is = "uyu";
    const u = npcUyarilari(h, []).map(x => x.yer + ": " + x.metin).join(" | ");
    expect(u).toMatch(/program 1: Saat 0–24/); expect(u).toMatch(/program 2: Bilinmeyen iş: uyu/);
  });

  it("sandık ekler, çoğaltır; uyarıları bulur", () => {
    const h: any = structuredClone(ORNEK_ICERIK["haritalar/deneme_yolu.json"]);
    expect(sandikUyarilari(h, ["ornek_a", "ornek_b", "ornek_c"])).toEqual([]);
    const id = sandikEkle(h);
    expect(id).toBe("sandik");
    const yeni = h.sandiklar.find((s: any) => s.id === "sandik");
    expect(yeni.konum[0]).toBeLessThan(-h.yol.genislik / 2);   // yolun kenarında
    expect(yeni.icerik.puanlar).toEqual({});
    expect(sandikCogalt(h, "sandik_1")).toBe("sandik_1_2");
    expect(sandikCogalt(h, "yok")).toBeNull();
    h.sandiklar[0].icerik.puanlar = { bilinmeyen: 1 }; h.sandiklar[1].kapak_ekseni = "yaw"; h.sandiklar[2].id = "Sandik";
    const u = sandikUyarilari(h, ["ornek_a"]).map(x => x.metin).join(" | ");
    expect(u).toMatch(/Bilinmeyen ölçek: bilinmeyen/); expect(u).toMatch(/roll/); expect(u).toMatch(/küçük harf/);
    expect(u).toMatch(/adı boş/);   // yeni sandığın içi boş
  });

  it("görev hedefleri haritadan gelir; uyarılar ve kimlik değişince hedef güncellenir", () => {
    const h: any = structuredClone(ORNEK_ICERIK["haritalar/deneme_yolu.json"]);
    expect(gorevHedefleri(h, "diyalog").map(x => x[0])).toEqual(h.npcler.map((n: any) => n.id));
    expect(gorevHedefleri(h, "sandik")[0]).toEqual(["sandik_1", "Eski sandık (sandik_1)"]);
    expect(gorevHedefleri(h, "bitis")).toEqual([]);
    expect(gorevUyarilari(h)).toEqual([]);
    gorevHedefiniYenile(h, "sandik", "sandik_1", "kutu");
    expect(h.gorevler[0].adimlar[2].hedef).toBe("kutu");
    expect(h.gorevler[0].adimlar[0].hedef).toBe("yolcu");   // başka türe dokunmaz
    const u = gorevUyarilari(h).map(x => x.yer + ": " + x.metin).join(" | ");
    expect(u).toMatch(/adım 3: Haritada "kutu" bulunamadı/);
    const id = gorevEkle(h);
    expect(id).toBe("gorev");
    h.gorevler[1].adimlar = [{ metin: "", tur: "bitis", hedef: "x" }, { metin: "a", tur: "uc", hedef: "" }];
    const u2 = gorevUyarilari(h).map(x => x.metin).join(" | ");
    expect(u2).toMatch(/Yazısı boş/); expect(u2).toMatch(/hedefi olmaz/); expect(u2).toMatch(/Bilinmeyen tür: uc/);
  });

  it("eşya ekler, çoğaltır ve uyarıları bulur", () => {
    const h: any = structuredClone(ORNEK_ICERIK["haritalar/deneme_yolu.json"]);
    const n = h.esyalar.length;
    const id = esyaEkle(h);
    expect(h.esyalar.length).toBe(n + 1);
    expect(id).toBe("esya");
    expect(h.esyalar[n].konum[0]).toBeGreaterThan(h.yol.genislik / 2);  // yolun kenarında
    const kopya = esyaCogalt(h, "defter")!;
    expect(kopya).toBe("defter_2");
    expect(h.esyalar[1].id).toBe("defter_2");
    expect(esyaUyarilari(h, ["ornek_a", "ornek_b", "ornek_c"])).toEqual([]);
    h.esyalar[0].id = "Defter"; h.esyalar[2].puanlar = { yok_olcek: 1 }; h.esyalar[3].id = h.esyalar[2].id;
    const u = esyaUyarilari(h, ["ornek_a"]).map(x => x.metin).join(" | ");
    expect(u).toMatch(/küçük harf/); expect(u).toMatch(/Bilinmeyen ölçek: yok_olcek/); expect(u).toMatch(/iki kez/);
  });

  it("kişi uyarıları: haritada olmayan kişi ve bozuk yol", () => {
    const k: any = structuredClone(ORNEK_ICERIK["karakterler.json"]);
    const npc = haritaKisileri(ORNEK_ICERIK).map(x => x.id);
    expect(npc).toContain("yolcu");
    expect(kisiUyarilari(k, npc)).toEqual([]);
    k.kisiler.hayalet = { unreal_govde: "MetaHumans/X" };
    const u = kisiUyarilari(k, npc).map(x => x.metin);
    expect(u).toContain("Hiçbir haritada bu kimlikte kişi yok");
    expect(u.some(m => m.includes("/Game/"))).toBe(true);
  });

  it("dosya türleri", () => {
    expect(dosyaTuru("karakterler.json")).toBe("karakterler");
    expect(dosyaTuru("haritalar/deneme_yolu.json")).toBe("harita");
    expect(dosyaTuru("diyaloglar/yolcu.json")).toBe("diyalog");
  });

  it("şema, oyunun gerçek dosyasındaki yeni alanları kapsıyor (BICIM.md 2026-11-16)", () => {
    const yollar = new Set([...OYUNCU_GRUPLARI, ...HARITA_GRUPLARI].flatMap(g => g.alanlar.map(([y]) => y)));
    for (const y of ["hareket.kamera_gore_kontrol", "hareket.serbest_donus_hizi", "hareket.serbest_donus_cevikligi", "hareket.serbest_donus_ivmesi",
      "unreal_model_aci", "ortam.unreal_zemin_klasoru", "ortam.unreal_zemin_karo", "yol.unreal_klasor", "yol.unreal_karo"]) expect(yollar).toContain(y);
    // örnek dosyadaki oyuncu sayılarının hepsi şemada ya da bir "digerleri" grubunda görünür
    const oyuncu = ORNEK_ICERIK["karakterler.json"].oyuncu;
    const digerYollari = new Set(OYUNCU_GRUPLARI.map(g => g.digerleri?.yol).filter(Boolean));
    for (const [grup, sozluk] of Object.entries<any>(oyuncu)) {
      if (typeof sozluk !== "object" || Array.isArray(sozluk)) continue;
      for (const k of Object.keys(sozluk)) expect(yollar.has(grup + "." + k) || digerYollari.has(grup), grup + "." + k).toBe(true);
    }
  });
});

describe("oyun içeriği durumu", () => {
  const depoYap = () => {
    const dosyalar: Record<string, string> = {};
    for (const [y, v] of Object.entries(ORNEK_ICERIK)) dosyalar[y] = JSON.stringify(v);
    const depo = {
      icerik_listesi: async () => Object.keys(dosyalar),
      icerik_oku: async (y: string) => JSON.parse(dosyalar[y]),
      icerik_yaz: async (y: string, v: any) => { dosyalar[y] = JSON.stringify(v); return true; },
    } as unknown as Depo;
    return { depo, dosyalar };
  };

  it("yükler, değiştirir, geri alır, kaydeder; bilinmeyen alanlar korunur", async () => {
    const { depo, dosyalar } = depoYap();
    const o = useOyun.getState();
    await o.yukle(depo, "test");
    expect(useOyun.getState().acik).toBe("karakterler.json");
    o.degistir("karakterler.json", d => { d.oyuncu.hareket.yurume_hizi = 180; }, "a");
    o.degistir("karakterler.json", d => { d.oyuncu.hareket.yurume_hizi = 190; }, "a");  // aynı anahtar: tek adım
    o.degistir("haritalar/deneme_yolu.json", d => { d.unreal_model_aci = 90; });
    expect(useOyun.getState().geri.length).toBe(2);
    expect(useOyun.getState().degisenler().sort()).toEqual(["haritalar/deneme_yolu.json", "karakterler.json"]);
    useOyun.getState().geriAl();
    expect(useOyun.getState().veri["haritalar/deneme_yolu.json"].unreal_model_aci).toBeUndefined();
    expect(useOyun.getState().acik).toBe("haritalar/deneme_yolu.json");
    useOyun.getState().yinele();
    expect(useOyun.getState().veri["haritalar/deneme_yolu.json"].unreal_model_aci).toBe(90);
    expect(await useOyun.getState().kaydet()).toBe(2);
    expect(useOyun.getState().degisenler()).toEqual([]);
    const k = JSON.parse(dosyalar["karakterler.json"]);
    expect(k.oyuncu.hareket.yurume_hizi).toBe(190);
    expect(k.oyuncu.animasyonlar).toEqual(ORNEK_ICERIK["karakterler.json"].oyuncu.animasyonlar);
    expect(Object.keys(k)).toEqual(Object.keys(ORNEK_ICERIK["karakterler.json"]));  // sıra korunur
  });

  it("değişiklikleri atınca dosyadaki hâle döner", async () => {
    const { depo } = depoYap();
    await useOyun.getState().yukle(depo, "test");
    useOyun.getState().degistir("karakterler.json", d => { d.kisiler.yolcu.unreal_govde = "/Game/X"; });
    useOyun.getState().degisiklikleriAt();
    expect(useOyun.getState().veri["karakterler.json"].kisiler.yolcu.unreal_govde).toBe(ORNEK_ICERIK["karakterler.json"].kisiler.yolcu.unreal_govde);
    expect(useOyun.getState().degisenler()).toEqual([]);
  });
});
