// Harita → Kişiler: haritadaki kişilerin (npcler) dolaşma alanı, hızı, davranışı, konuşması, sözleri,
// tepkileri ve saldırıya uğrayınca tavrı; ayrıca otomatik "kalabalık". Biçim: hikaye_oyun/icerik/BICIM.md.
// Kişinin Godot görünümü (gorunum, tur: mh) burada düzenlenmez, yalnız özeti gösterilir: Unreal'de beden MetaHuman'dır.
import { useEffect, useRef } from "react";
import { Clock, Copy, Plus, RotateCcw, Trash2, UserRound, Users } from "lucide-react";
import { useOyun } from "./durum";
import {
  DAVRANISLAR, gorevHedefiniYenile, KISI_NITELIKLERI, kimlikGecerli, PROGRAM_ISLERI, programDuragiEkle, type ProgramDuragi, NPC_VARSAYILAN, npcCogalt, npcEkle, npcSeridi, npcUyarilari, SAVAS_TAVIRLARI, SELAMLASMALAR,
  TEPKI_TURLERI, unrealYoluSorunu, type Npc,
} from "./icerik";
import { AlanGirisi, KimlikGiris, MetinListesi, SayiAlani, SayiKutusu, SecimAlani, Uyarilar, YaziAlani } from "./girisler";
import { Kroki } from "./Kroki";

/** Godot görünümünün kısa özeti (salt okunur). */
function gorunumOzeti(g: any): string[] {
  if (!g || typeof g !== "object") return [];
  const s: string[] = [];
  if (g.cinsiyet) s.push(g.cinsiyet === "kadin" ? "kadın" : g.cinsiyet);
  if (g.yas_yil) s.push(`${g.yas_yil} yaş`);
  if (g.boy_cm) s.push(`${g.boy_cm} cm`);
  if (g.kilo_kg) s.push(`${g.kilo_kg} kg`);
  for (const k of ["takim", "ust", "alt", "sapka", "gozluk"]) if (g[k]) s.push(String(g[k]).replace(/_/g, " "));
  return s;
}

const secimAciklamasi = (liste: [string, string, string][], v: string | undefined) => (liste.find(s => s[0] === (v || liste[0][0])) || liste[0])[2];

export function KisilerListesi({ dosya, harita }: { dosya: string; harita: any }) {
  const { degistir, sec } = useOyun.getState();
  const secili = useOyun(o => o.secili);
  const dosyalar = useOyun(o => o.dosyalar);
  const karakterler = useOyun(o => o.veri["karakterler.json"]);
  const diyaloglar = dosyalar.filter(d => d.startsWith("diyaloglar/"));
  const diyalogSecenekleri: [string, string][] = diyaloglar.map(d => [d, d.replace(/^diyaloglar\//, "").replace(/\.json$/, "")]);
  const npcler: Npc[] = harita?.npcler || [];
  const uyarilar = npcUyarilari(harita, diyaloglar);
  const kartlar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (secili) kartlar.current?.querySelector(`[data-kisi="${CSS.escape(secili)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [secili]);
  const npcDegistir = (id: string, fn: (n: Npc) => void, anahtar?: string) =>
    degistir(dosya, d => { const n = (d.npcler || []).find((x: Npc) => x.id === id); if (n) fn(n); }, anahtar);
  /** Boş/undefined değeri alandan siler (oyun varsayılanını kullanır). */
  const alanYaz = (id: string, alan: string, v: unknown, anahtar?: string) =>
    npcDegistir(id, n => { if (v === undefined || v === "") delete n[alan]; else n[alan] = v; }, anahtar);

  /** Kimlik değişince haritadaki görev adımları ve karakterler.json'daki beden kaydı da yeni kimliğe geçer. */
  const kimlikDegistir = (eski: string, yeni: string) => {
    degistir(dosya, d => {
      const n = (d.npcler || []).find((x: Npc) => x.id === eski); if (n) n.id = yeni;
      gorevHedefiniYenile(d, "diyalog", eski, yeni);
    });
    if (karakterler?.kisiler && eski in karakterler.kisiler && !(yeni in karakterler.kisiler))
      degistir("karakterler.json", d => {
        const s: Record<string, any> = {};
        for (const [k, v] of Object.entries(d.kisiler)) s[k === eski ? yeni : k] = v;
        d.kisiler = s;
      });
  };

  return <>
    <p className="sayfa-aciklama">Haritada dolaşan kişiler. Krokide bir kişinin alanını sürükleyerek yerini, seçince kenarındaki beyaz noktayı çekerek
      büyüklüğünü değiştirebilirsin. Boş bırakılan kutular oyunun varsayılanını kullanır.</p>
    <Kroki dosya={dosya} harita={harita} mod="kisi" />
    <Uyarilar liste={uyarilar} />
    <div className="kartlar" ref={kartlar}>
      {npcler.map(n => {
        const ozet = gorunumOzeti(n.gorunum);
        const merkez = n.alan?.merkez;
        const serit = npcSeridi(n);
        const bedenKarakterlerde = karakterler?.kisiler?.[n.id]?.unreal_govde;
        return (
          <div key={n.id} data-kisi={n.id} className={"liste-karti" + (secili === n.id ? " secili" : "")} data-testid={"npc-" + n.id}
            onPointerDown={() => secili !== n.id && sec(n.id)}>
            <div className="liste-karti-baslik">
              <UserRound size={15} /><b>{n.ad || n.id}</b><span className="soluk">{n.id}</span>
              <span style={{ marginLeft: "auto" }} />
              <button className="ikon-dugme" title="Çoğalt" data-testid={"npc-cogalt-" + n.id}
                onClick={() => { let yeni: string | null = null; degistir(dosya, d => { yeni = npcCogalt(d, n.id); }); sec(yeni); }}><Copy size={14} /></button>
              <button className="ikon-dugme" title="Sil" data-testid={"npc-sil-" + n.id}
                onClick={() => degistir(dosya, d => { d.npcler = d.npcler.filter((x: Npc) => x.id !== n.id); })}><Trash2 size={14} /></button>
            </div>
            <div className="kart-icerik">
              <label>Kimlik</label>
              <KimlikGiris deger={n.id} testId={"npc-kimlik-" + n.id} dene={yeni => {
                if (!kimlikGecerli(yeni)) return "Yalnız küçük harf, rakam ve _";
                if (yeni !== n.id && npcler.some(x => x.id === yeni)) return "Bu kimlik zaten var";
                kimlikDegistir(n.id, yeni); if (secili === n.id) sec(yeni);
                return "";
              }} />
              <label>Ad</label>
              <YaziAlani deger={n.ad} ipucu="Konuşurken görünen ad" degisti={v => alanYaz(n.id, "ad", v)} testId={"npc-ad-" + n.id} />
              <label>Davranış</label>
              <div>
                <SecimAlani deger={n.davranis} secenekler={DAVRANISLAR.map(([d, ad]) => [d, ad])} varsayilan="Dolaşır (varsayılan)" testId={"npc-davranis-" + n.id}
                  degisti={v => alanYaz(n.id, "davranis", v)} />
                <div className="secim-aciklama">{Array.isArray(n.program) && n.program.length
                  ? "Günlük programı var: davranışı saatine göre programdaki iş belirler."
                  : secimAciklamasi(DAVRANISLAR, n.davranis)}</div>
              </div>
              {(n.grup !== undefined) && <><label title="Kişinin ait olduğu grup (ör. köy); bilgi içindir">Grup</label>
                <YaziAlani deger={n.grup} testId={"npc-grup-" + n.id} degisti={v => alanYaz(n.id, "grup", v)} /></>}

              <div className="kart-alt-baslik">Yer ve hareket</div>
              <label title="Metre. X: yolun sağı/solu (0 = yolun ortası), Z: yol boyunca (ileri = eksi)">Alanın ortası</label>
              <div className="vektor">
                {(["X", "Z"] as const).map((e, i) => <div key={e} className="sayi-giris" title={e}><span>{e}</span>
                  <SayiKutusu deger={merkez?.[i] ?? 0} testId={`npc-merkez-${i}-${n.id}`} degisti={v => npcDegistir(n.id, x => {
                    const m: [number, number] = [...(x.alan?.merkez ?? [0, 0])] as [number, number]; m[i] = v;
                    x.alan = { yaricap: x.alan?.yaricap ?? NPC_VARSAYILAN.yaricap, ...x.alan, merkez: m };
                  })} /></div>)}
                <span className="birim">m</span>
              </div>
              <label>Alanın yarıçapı</label>
              <SayiAlani alan={{ tur: "sayi", ad: "", birim: "m", min: 0.5, adim: 0.5 }} deger={n.alan?.yaricap} testId={"npc-yaricap-" + n.id}
                degisti={v => npcDegistir(n.id, x => { x.alan = { merkez: x.alan?.merkez ?? [0, 0], ...x.alan, yaricap: v ?? NPC_VARSAYILAN.yaricap }; }, "yaricap:" + n.id)} />
              <label title="Oyun 0–3 m/sn arasına kırpar">Yürüme hızı</label>
              <div>
                <SayiAlani alan={{ tur: "sayi", ad: "", birim: "m/sn", min: 0, max: NPC_VARSAYILAN.hizEnFazla, adim: 0.05 }} deger={n.hiz} testId={"npc-hiz-" + n.id}
                  degisti={v => alanYaz(n.id, "hiz", v, "hiz:" + n.id)} />
                <div className="secim-aciklama">Normal yürüyüş ≈ 1.2 · ağır aksak ≈ 0.8 · aceleci ≈ 1.6</div>
              </div>
              <label title="Oyuncu bu kadar yaklaşınca kişi durup ona döner">Durma mesafesi</label>
              <SayiAlani alan={{ tur: "sayi", ad: "", birim: "m", min: 0, adim: 0.1 }} deger={n.durma_mesafesi} testId={"npc-durma-" + n.id}
                degisti={v => alanYaz(n.id, "durma_mesafesi", v, "durma:" + n.id)} />
              {n.davranis === "yol" && <>
                <label title="Kişi bu çizgi boyunca ileri geri yürür. Krokide şeridin uçlarını çekebilirsin.">Yaya şeridi</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="vektor">
                    {([["Yan (X)", serit.x, "y"], ["Baş (Z)", serit.zBas, "bas"], ["Son (Z)", serit.zSon, "son"]] as const).map(([ad, deger, hangi]) =>
                      <div key={hangi} className="sayi-giris" title={ad}><span>{ad.split(" ")[0]}</span>
                        <SayiKutusu deger={deger} testId={`npc-serit-${hangi}-${n.id}`} degisti={v => npcDegistir(n.id, x => {
                          const s = npcSeridi(x);
                          const yan = hangi === "y" ? v : s.x, zb = hangi === "bas" ? v : s.zBas, zs = hangi === "son" ? v : s.zSon;
                          x.serit_y = Math.round(yan * 100);
                          x.serit_x_min = Math.round(-Math.max(zb, zs) * 100);
                          x.serit_x_max = Math.round(-Math.min(zb, zs) * 100);
                        })} /></div>)}
                    <span className="birim">m</span>
                  </div>
                  {typeof n.serit_y === "number" ? <button className="dugme hayalet" style={{ alignSelf: "flex-start" }}
                    onClick={() => npcDegistir(n.id, x => { delete x.serit_y; delete x.serit_x_min; delete x.serit_x_max; })}>
                    <RotateCcw size={13} /> Varsayılana dön (alanın ortasından ±{NPC_VARSAYILAN.seritYari} m)</button>
                    : <span className="secim-aciklama">Varsayılan: alanın ortasından geçen ±{NPC_VARSAYILAN.seritYari} m'lik şerit.</span>}
                </div>
              </>}

              <label title="Beklerken baktığı yön (derece)">Bakış yönü</label>
              <SayiAlani alan={{ tur: "sayi", ad: "", birim: "°" }} deger={n.aci} testId={"npc-aci-" + n.id} degisti={v => alanYaz(n.id, "aci", v, "aci:" + n.id)} />

              <div className="kart-alt-baslik">Günlük program</div>
              <label title="Saati gelen durağın yerine yürür ve oradaki işi yapar. Program varsa davranış yerine bu geçerlidir.">Duraklar</label>
              <ProgramDuzenleyici n={n} degistir={(fn, anahtar) => npcDegistir(n.id, fn, anahtar)} />

              <div className="kart-alt-baslik">Konuşma ve sözler</div>
              <label>Konuşma</label>
              <SecimAlani deger={n.diyalog} secenekler={diyalogSecenekleri} varsayilan="(konuşmaz, yalnız dolaşır)" testId={"npc-diyalog-" + n.id}
                degisti={v => npcDegistir(n.id, x => { x.diyalog = v ?? ""; })} />
              <label>Selamlaşma</label>
              <SecimAlani deger={n.selamlasma} secenekler={SELAMLASMALAR} varsayilan="(oyunun varsayılanı)" testId={"npc-selamlasma-" + n.id}
                degisti={v => alanYaz(n.id, "selamlasma", v)} />
              <label title="Oyuncu yanından geçerken kişinin söylediği kısa sözler (biri rastgele seçilir)">Yanından geçerken</label>
              <MetinListesi liste={n.selamlar} ipucu="ör. Merhaba!" testId={"npc-selamlar-" + n.id}
                degisti={l => npcDegistir(n.id, x => { x.selamlar = l; }, "selamlar:" + n.id)} />

              <div className="kart-alt-baslik">Çarpışma ve saldırı</div>
              <label>Saldırıya uğrayınca</label>
              <div>
                <SecimAlani deger={n.savas_tavri} secenekler={SAVAS_TAVIRLARI.map(([d, ad]) => [d, ad])} varsayilan="Karışık (varsayılan)" testId={"npc-tavir-" + n.id}
                  degisti={v => alanYaz(n.id, "savas_tavri", v)} />
                <div className="secim-aciklama">{secimAciklamasi(SAVAS_TAVIRLARI, n.savas_tavri)}</div>
              </div>
              {TEPKI_TURLERI.map(([tur, ad]) => <Tepki key={tur} ad={ad} liste={n.tepkiler?.[tur]} testId={`npc-tepki-${tur}-${n.id}`}
                degisti={l => npcDegistir(n.id, x => {
                  const t = { ...(x.tepkiler || {}) };
                  if (l.length) t[tur] = l; else delete t[tur];
                  if (Object.keys(t).length) x.tepkiler = t; else delete x.tepkiler;
                }, `tepki:${tur}:${n.id}`)} />)}

              <label title="Boş kutular Karakterler → Kişiler'deki ortak değerleri kullanır">Bu kişinin canı</label>
              <NitelikDuzenleyici n={n} ortak={karakterler?.kisi_nitelikler || {}} degistir={(fn, anahtar) => npcDegistir(n.id, fn, anahtar)} />

              <div className="kart-alt-baslik">Görünüş</div>
              <label>Beden (MetaHuman)</label>
              <div>
                <AlanGirisi alan={{ tur: "unreal", ad: "", ipucu: bedenKarakterlerde || "/Game/MetaHumans/Ad/BP_Ad" }} deger={n.unreal_govde} testId={"npc-govde-" + n.id}
                  degisti={v => alanYaz(n.id, "unreal_govde", v)} />
                <div className="secim-aciklama">{bedenKarakterlerde
                  ? "Boş bırakırsan Karakterler → Kişiler (beden ve can) sekmesindeki beden kullanılır."
                  : "Boşsa Karakterler → Kişiler (beden ve can) sekmesine bakılır; orada da yoksa oyuncunun bedeni kullanılır."}</div>
              </div>
              {ozet.length > 0 && <>
                <label title="Godot sürümündeki görünüm; Unreal sürümü okumaz. Burada değiştirilmez.">Eski görünüm <span className="rozet">Godot</span></label>
                <div className="kisi-ozet">{ozet.map((o, i) => <span key={i}>{o}</span>)}</div>
              </>}
            </div>
          </div>
        );
      })}
    </div>
    <div className="ekle-satiri">
      <button className="dugme birincil" data-testid="npc-ekle" onClick={() => { let id = ""; degistir(dosya, d => { id = npcEkle(d); }); sec(id); }}>
        <Plus size={14} /> Kişi ekle</button>
    </div>
    <KalabalikKarti dosya={dosya} harita={harita} diyalogSecenekleri={diyalogSecenekleri} />
  </>;
}

/** Günlük program: her satır bir durak (saat, iş, yer, yarıçap / bakış yönü). */
function ProgramDuzenleyici({ n, degistir }: { n: Npc; degistir: (fn: (n: Npc) => void, anahtar?: string) => void }) {
  const liste: ProgramDuragi[] = Array.isArray(n.program) ? (n.program as ProgramDuragi[]) : [];
  const durak = (i: number, fn: (p: ProgramDuragi) => void, anahtar?: string) =>
    degistir(x => { const p = (x.program as ProgramDuragi[] | undefined)?.[i]; if (p) fn(p); }, anahtar);
  return (
    <div className="gorev-adimlari" data-testid={"npc-program-" + n.id}>
      {liste.map((p, i) => (
        <div key={i} className="gorev-adimi">
          <div className="sayi-giris" style={{ width: 92, flex: "none" }} title="Saat (0–24; 7.5 = 07:30)"><span>Saat</span>
            <SayiKutusu deger={typeof p.saat === "number" ? p.saat : 0} testId={`npc-program-saat-${n.id}-${i}`}
              degisti={v => durak(i, x => { x.saat = Math.max(0, Math.min(24, v)); })} /></div>
          <div style={{ width: 120, flex: "none" }}>
            <SecimAlani deger={p.is} secenekler={PROGRAM_ISLERI} testId={`npc-program-is-${n.id}-${i}`} degisti={v => durak(i, x => { x.is = v || "bekle"; })} />
          </div>
          {(["X", "Z"] as const).map((e, j) => <div key={e} className="sayi-giris" style={{ width: 84, flex: "none" }} title={`Yer ${e} (m); boşsa alanın ortası`}><span>{e}</span>
            <SayiKutusu deger={p.yer?.[j] ?? (n.alan?.merkez?.[j] ?? 0)} testId={`npc-program-yer${j}-${n.id}-${i}`}
              degisti={v => durak(i, x => { const y: [number, number] = [...(x.yer ?? n.alan?.merkez ?? [0, 0])] as [number, number]; y[j] = v; x.yer = y; })} /></div>)}
          {p.is === "dolas"
            ? <div className="sayi-giris" style={{ width: 92, flex: "none" }} title="Dolaşma yarıçapı (m; boşsa 5)"><span>r</span>
              <SayiKutusu deger={typeof p.yaricap === "number" ? p.yaricap : 5} degisti={v => durak(i, x => { x.yaricap = Math.max(0.5, v); })} /></div>
            : <div className="sayi-giris" style={{ width: 92, flex: "none" }} title="Bakış yönü (°)"><span>°</span>
              <SayiKutusu deger={typeof p.aci === "number" ? p.aci : 0} degisti={v => durak(i, x => { x.aci = v; })} /></div>}
          <button className="ikon-dugme" title="Durağı sil" data-testid={`npc-program-sil-${n.id}-${i}`}
            onClick={() => degistir(x => { (x.program as ProgramDuragi[]).splice(i, 1); if (!(x.program as ProgramDuragi[]).length) delete x.program; })}><Trash2 size={13} /></button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button className="dugme hayalet" data-testid={"npc-program-ekle-" + n.id} onClick={() => degistir(x => programDuragiEkle(x))}><Plus size={13} /> Durak ekle</button>
        {liste.length > 1 && <button className="dugme hayalet" data-testid={"npc-program-sirala-" + n.id}
          onClick={() => degistir(x => { (x.program as ProgramDuragi[]).sort((a, b) => (a.saat ?? 0) - (b.saat ?? 0)); })}><Clock size={13} /> Saate göre sırala</button>}
        {!liste.length && <span className="cok-soluk" style={{ alignSelf: "center" }}>Program yok: kişi bütün gün yukarıdaki davranışı yapar.</span>}
      </div>
    </div>
  );
}

/** Kişiye özel can değerleri: boş kutu = karakterler.json'daki ortak değer (kutuda soluk görünür). */
function NitelikDuzenleyici({ n, ortak, degistir }: { n: Npc; ortak: Record<string, unknown>; degistir: (fn: (n: Npc) => void, anahtar?: string) => void }) {
  const kendi = (n.nitelikler && typeof n.nitelikler === "object" ? n.nitelikler : {}) as Record<string, number>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }} data-testid={"npc-nitelikler-" + n.id}>
      {KISI_NITELIKLERI.map(([alan, ad, birim]) => (
        <div key={alan} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="soluk" style={{ fontSize: 12, minWidth: 128 }}>{ad}</span>
          <SayiAlani alan={{ tur: "sayi", ad: "", birim, min: 0, adim: alan.endsWith("orani") || alan.endsWith("carpani") ? 0.05 : 1 }}
            deger={kendi[alan]} ipucu={typeof ortak[alan] === "number" ? String(ortak[alan]) : "varsayılan"} testId={`npc-nitelik-${alan}-${n.id}`}
            degisti={v => degistir(x => {
              const y = { ...((x.nitelikler as Record<string, number>) || {}) };
              if (v === undefined) delete y[alan]; else y[alan] = v;
              if (Object.keys(y).length) x.nitelikler = y; else delete x.nitelikler;
            }, `nitelik:${alan}:${n.id}`)} />
        </div>
      ))}
    </div>
  );
}

function Tepki({ ad, liste, degisti, testId }: { ad: string; liste?: string[]; degisti: (l: string[]) => void; testId: string }) {
  return <>
    <label>{ad} der ki</label>
    <MetinListesi liste={liste} ipucu="ör. Dikkat et!" testId={testId} degisti={degisti} />
  </>;
}

/** Haritada "kalabalık": otomatik üretilmiş MetaHuman'lardan yolda dolaşan kişiler. */
function KalabalikKarti({ dosya, harita, diyalogSecenekleri }: { dosya: string; harita: any; diyalogSecenekleri: [string, string][] }) {
  const degistir = useOyun.getState().degistir;
  const k = harita?.kalabalik;
  const yaz = (alan: string, v: unknown, anahtar?: string) =>
    degistir(dosya, d => { if (!d.kalabalik) return; if (v === undefined || v === "") delete d.kalabalik[alan]; else d.kalabalik[alan] = v; }, anahtar);
  return (
    <div className="liste-karti" style={{ marginTop: 16 }} data-testid="kalabalik">
      <div className="liste-karti-baslik">
        <Users size={15} /><b>Kalabalık</b><span className="soluk">yoldan geçen, otomatik üretilmiş kişiler</span>
        <span style={{ marginLeft: "auto" }} />
        {k && <button className="ikon-dugme" title="Kalabalığı kaldır" data-testid="kalabalik-sil"
          onClick={() => degistir(dosya, d => { delete d.kalabalik; })}><Trash2 size={14} /></button>}
      </div>
      {!k ? <div className="kart-icerik">
        <div className="grup-aciklama">Bu haritada kalabalık yok. Eklersen Unreal'deki otomatik üretilmiş MetaHuman'lar (adı belli bir önekle başlayanlar) yolda dolaşır.</div>
        <button className="dugme" style={{ justifySelf: "start" }} data-testid="kalabalik-ekle" onClick={() => degistir(dosya, d => {
          d.kalabalik = { sayi: 6, klasor: "/Game/MetaHumans", onek: "BP_Uretilen", ad: "Yoldan geçen", yaricap: 10, selamlar: [] };
        })}><Plus size={14} /> Kalabalık ekle</button>
      </div> : <div className="kart-icerik">
        <div className="grup-aciklama">Klasördeki, adı önekle başlayan MetaHuman'lardan en fazla “Kişi sayısı” kadarı yolda dolaşır. Hiç yoksa kimse eklenmez.</div>
        <label>Kişi sayısı</label>
        <SayiAlani alan={{ tur: "sayi", ad: "", min: 0, max: 50 }} deger={k.sayi} testId="kalabalik-sayi" degisti={v => yaz("sayi", v, "kalabalik-sayi")} />
        <label>Görünen ad</label>
        <YaziAlani deger={k.ad} testId="kalabalik-ad" degisti={v => yaz("ad", v)} />
        <label>MetaHuman klasörü</label>
        <YaziAlani deger={k.klasor} ipucu="/Game/MetaHumans" uyari={unrealYoluSorunu(String(k.klasor ?? ""))} testId="kalabalik-klasor" degisti={v => yaz("klasor", v)} />
        <label>Ad öneki</label>
        <YaziAlani deger={k.onek} ipucu="BP_Uretilen" testId="kalabalik-onek" degisti={v => yaz("onek", v)} />
        <label>Dolaşma yarıçapı</label>
        <SayiAlani alan={{ tur: "sayi", ad: "", birim: "m", min: 1, adim: 0.5 }} deger={k.yaricap} degisti={v => yaz("yaricap", v, "kalabalik-yaricap")} />
        <label>Konuşma</label>
        <SecimAlani deger={k.diyalog} secenekler={diyalogSecenekleri} varsayilan="(konuşmazlar)" testId="kalabalik-diyalog" degisti={v => yaz("diyalog", v)} />
        <label>Yanından geçerken</label>
        <MetinListesi liste={k.selamlar} ipucu="ör. İyi günler." testId="kalabalik-selamlar" degisti={l => yaz("selamlar", l, "kalabalik-selamlar")} />
      </div>}
    </div>
  );
}
