// Oyun içeriği formlarında ortak kullanılan giriş kutuları (sayı, yazı, anahtar, vektör, kimlik, puanlar, listeler).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { RenkGiris } from "../editor/Ortak";
import { anahtarDegistir, unrealYoluSorunu, type Uyari } from "./icerik";
import type { Alan } from "./sema";
// ================================================================== giriş kutuları
export const yuvarla = (v: number) => Math.round(v * 1000) / 1000;

/** Sayı kutusu: boş bırakılabilir (oyun kendi varsayılanını kullanır). Virgül de kabul eder. */
export function SayiAlani({ deger, degisti, alan, testId, ipucu = "varsayılan" }: { deger: unknown; degisti: (v: number | undefined) => void; alan: Extract<Alan, { tur: "sayi" }>; testId?: string; ipucu?: string }) {
  const metinYap = (v: unknown) => (typeof v === "number" ? String(yuvarla(v)) : "");
  const [metin, setMetin] = useState(metinYap(deger));
  useEffect(() => setMetin(metinYap(deger)), [deger]);
  const sinirla = (v: number) => Math.min(alan.max ?? Infinity, Math.max(alan.min ?? -Infinity, v));
  const uygula = () => {
    const t = metin.trim().replace(",", ".");
    if (t === "") { if (deger !== undefined) degisti(undefined); return; }
    const v = Number(t);
    if (isNaN(v)) { setMetin(metinYap(deger)); return; }
    degisti(sinirla(v));
    setMetin(metinYap(sinirla(v)));
  };
  const kaydirici = alan.min !== undefined && alan.max !== undefined && alan.max - alan.min <= 2 && (alan.adim ?? 1) < 1;
  return (
    <div className="alan-satir">
      {kaydirici && typeof deger === "number" && (
        <input type="range" min={alan.min} max={alan.max} step={alan.adim} value={deger} onChange={e => degisti(Number(e.target.value))} />
      )}
      <div className="sayi-giris" style={{ width: kaydirici ? 90 : 140, flex: "none" }}>
        <input value={metin} placeholder={ipucu} onChange={e => setMetin(e.target.value)} onBlur={uygula} data-testid={testId}
          onKeyDown={e => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if ((e.key === "ArrowUp" || e.key === "ArrowDown") && typeof deger === "number") {
              e.preventDefault();
              const adim = (alan.adim ?? 1) * (e.shiftKey ? 10 : 1);
              degisti(sinirla(yuvarla(deger + (e.key === "ArrowUp" ? adim : -adim))));
            }
          }} />
      </div>
      {alan.birim && <span className="birim">{alan.birim}</span>}
    </div>
  );
}

/** Yazı kutusu: her tuşta değil, kutudan çıkınca (ya da Enter'da) yazar; geri al adımları temiz kalır. */
export function YaziAlani({ deger, degisti, ipucu, cokSatir, uyari, testId }: { deger: unknown; degisti: (v: string) => void; ipucu?: string; cokSatir?: boolean; uyari?: string; testId?: string }) {
  const [metin, setMetin] = useState(typeof deger === "string" ? deger : "");
  useEffect(() => setMetin(typeof deger === "string" ? deger : ""), [deger]);
  const uygula = () => { if (metin !== (deger ?? "")) degisti(metin); };
  const ortak = {
    className: "giris" + (uyari ? " uyarili" : ""), value: metin, placeholder: ipucu, "data-testid": testId,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMetin(e.target.value), onBlur: uygula,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {cokSatir ? <textarea rows={2} {...ortak} />
        : <input {...ortak} onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />}
      {uyari && <span className="alan-uyari"><AlertTriangle size={12} /> {uyari}</span>}
    </div>
  );
}

/** Açık/kapalı düğmesi. Oyunda bazı alanlar 1/0, bazıları true/false; var olan türü korur. */
export function Anahtar({ deger, degisti, alan, testId }: { deger: unknown; degisti: (v: unknown) => void; alan: Extract<Alan, { tur: "anahtar" }>; testId?: string }) {
  const acik = deger === true || (typeof deger === "number" && deger !== 0);
  const mantik = typeof deger === "boolean" || (deger === undefined && alan.mantik);
  return (
    <label className="anahtar-kap">
      <button className={"anahtar" + (acik ? " acik" : "")} role="switch" aria-checked={acik} data-testid={testId}
        onClick={() => degisti(mantik ? !acik : acik ? 0 : 1)}><span /></button>
      <span className="soluk">{acik ? alan.acik || "Açık" : alan.kapali || "Kapalı"}</span>
    </label>
  );
}

export function VektorAlani({ deger, degisti, alan }: { deger: unknown; degisti: (v: number[]) => void; alan: Extract<Alan, { tur: "vektor" }> }) {
  const eksen = alan.eksenler || ["X", "Y", "Z"];
  const n = eksen.length;
  const v = Array.isArray(deger) && deger.length === n ? (deger as number[]) : new Array(n).fill(0);
  return (
    <div className="vektor">
      {eksen.map((ad, i) => (
        <div key={i} className="sayi-giris" title={ad}>
          <span>{ad}</span>
          <SayiKutusu deger={v[i]} degisti={x => { const y = [...v]; y[i] = x; degisti(y); }} />
        </div>
      ))}
      {alan.birim && <span className="birim">{alan.birim}</span>}
    </div>
  );
}

const RENK6 = /^#[0-9a-f]{6}$/i, RENK8 = /^#[0-9a-f]{8}$/i;
/** Boş bırakılabilen (oyunun varsayılanı) ve isteğe bağlı saydamlığı olan renk kutusu (#rrggbb ya da #rrggbbaa). */
export function RenkAlani({ deger, degisti, alan, testId }: { deger: unknown; degisti: (v: string) => void; alan: Extract<Alan, { tur: "renk" }>; testId?: string }) {
  const d = typeof deger === "string" && (RENK6.test(deger) || (alan.saydam && RENK8.test(deger))) ? deger.toLowerCase() : "";
  const temel = d ? d.slice(0, 7) : "#808080";
  const saydamlik = d.length === 9 ? parseInt(d.slice(7), 16) : 255;
  const [metin, setMetin] = useState(d);
  useEffect(() => setMetin(d), [d]);
  const yap = (renk: string, a: number) => renk + (alan.saydam && a < 255 ? Math.round(a).toString(16).padStart(2, "0") : "");
  const uygula = () => {
    const t = metin.trim().toLowerCase();
    if (t === "" && alan.bosOlabilir) { if (d) degisti(""); return; }
    if (RENK6.test(t) || (alan.saydam && RENK8.test(t))) { if (t !== d) degisti(t); return; }
    setMetin(d);
  };
  return (
    <div className="alan-satir" data-testid={testId}>
      <input type="color" value={temel} onChange={e => degisti(yap(e.target.value, saydamlik))} title="Renk seç" />
      <input className="giris" style={{ width: 110, flex: "none" }} value={metin} placeholder={alan.bosOlabilir ? "varsayılan" : ""}
        onChange={e => setMetin(e.target.value)} onBlur={uygula} onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        data-testid={testId && testId + "-metin"} />
      {alan.saydam && d && <>
        <input type="range" min={0} max={255} value={saydamlik} title="Görünürlük (sağ = tam opak)" style={{ width: 90 }}
          onChange={e => degisti(yap(temel, Number(e.target.value)))} data-testid={testId && testId + "-saydam"} />
        <span className="birim">%{Math.round(saydamlik / 2.55)}</span>
      </>}
      {alan.bosOlabilir && (d
        ? <button className="dugme hayalet" onClick={() => degisti("")} title="Oyunun kendi rengine dön" data-testid={testId && testId + "-sifirla"}>varsayılana dön</button>
        : <span className="soluk" style={{ fontSize: 11 }}>oyunun varsayılanı</span>)}
    </div>
  );
}

/** Çıplak sayı kutusu (vektör ve puan gibi yerlerde). */
export function SayiKutusu({ deger, degisti, testId }: { deger: number; degisti: (v: number) => void; testId?: string }) {
  const [metin, setMetin] = useState(String(yuvarla(deger)));
  useEffect(() => setMetin(String(yuvarla(deger))), [deger]);
  return <input value={metin} onChange={e => setMetin(e.target.value)} data-testid={testId}
    onBlur={() => { const n = Number(metin.replace(",", ".")); if (!isNaN(n) && metin.trim() !== "") degisti(n); else setMetin(String(yuvarla(deger))); }}
    onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />;
}

/** Şemadaki bir alanı türüne göre çizer. */
export function AlanGirisi({ alan, deger, degisti, testId }: { alan: Alan; deger: unknown; degisti: (v: any) => void; testId?: string }) {
  switch (alan.tur) {
    case "sayi": return <SayiAlani alan={alan} deger={deger} degisti={degisti} testId={testId} />;
    case "anahtar": return <Anahtar alan={alan} deger={deger} degisti={degisti} testId={testId} />;
    case "renk": return alan.bosOlabilir || alan.saydam ? <RenkAlani alan={alan} deger={deger} degisti={degisti} testId={testId} />
      : <RenkGiris deger={typeof deger === "string" && /^#[0-9a-f]{6}$/i.test(deger) ? deger : "#808080"} degisti={degisti} />;
    case "vektor": return <VektorAlani alan={alan} deger={deger} degisti={degisti} />;
    case "unreal": return <YaziAlani deger={deger} degisti={degisti} ipucu={alan.ipucu} uyari={unrealYoluSorunu(String(deger ?? ""))} testId={testId} />;
    case "yollar": return <MetinListesi liste={deger as string[]} degisti={degisti} ipucu={alan.ipucu} ekleYazisi="Yol ekle" testId={testId} />;
    case "yazi": return <YaziAlani deger={deger} degisti={degisti} ipucu={alan.ipucu} cokSatir={alan.cokSatir} testId={testId} />;
  }
}

export function AlanSatiri({ alan, yeni, children }: { alan: Alan; yeni?: boolean; children: ReactNode }) {
  return <>
    <label title={alan.aciklama}>{alan.ad}{yeni && <span className="rozet" style={{ marginLeft: 6 }} title="Bu alanın açıklaması henüz yok">yeni</span>}</label>
    <div>{children}{alan.aciklama && alan.tur !== "unreal" && alan.tur !== "yollar" && <div className="alan-aciklama">{alan.aciklama}</div>}</div>
  </>;
}

export function Uyarilar({ liste }: { liste: Uyari[] }) {
  if (!liste.length) return null;
  return (
    <div className="uyari-kutusu" data-testid="uyarilar">
      <b><AlertTriangle size={14} /> Dikkat ({liste.length})</b>
      {liste.map((u, i) => <div key={i}><span className="soluk">{u.yer}:</span> {u.metin}</div>)}
    </div>
  );
}

/** Kimlik kutusu: kutudan çıkınca dener; kural dışıysa eski hâline döner ve nedenini gösterir. */
export function KimlikGiris({ deger, dene, liste, testId }: { deger: string; dene: (yeni: string) => string; liste?: string[]; testId?: string }) {
  const [metin, setMetin] = useState(deger);
  const [hata, setHata] = useState("");
  const listeId = useRef("kimlikler-" + Math.random().toString(36).slice(2)).current;
  useEffect(() => setMetin(deger), [deger]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <input className={"giris" + (hata ? " uyarili" : "")} value={metin} list={liste ? listeId : undefined} data-testid={testId}
        onChange={e => { setMetin(e.target.value); setHata(""); }}
        onBlur={() => { if (metin === deger) return; const h = dene(metin.trim()); if (h) { setHata(h); setMetin(deger); } }}
        onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
      {liste && <datalist id={listeId}>{liste.map(x => <option key={x} value={x} />)}</datalist>}
      {hata && <span className="alan-uyari"><AlertTriangle size={12} /> {hata}</span>}
    </div>
  );
}

/** Puanlar: { olcek_id: sayı }. Her satır bir ölçek. */
export function PuanDuzenleyici({ puanlar, olcekler, degisti, testId }: { puanlar: Record<string, number>; olcekler: { id: string; ad: string }[]; degisti: (p: Record<string, number>) => void; testId?: string }) {
  const satirlar = Object.entries(puanlar);
  const bos = olcekler.find(o => !(o.id in puanlar));
  return (
    <div className="puanlar" data-testid={testId}>
      {satirlar.map(([o, v]) => (
        <div key={o} className="puan-satiri">
          <select className="giris" value={o} onChange={e => degisti(anahtarDegistir(puanlar, o, e.target.value))}>
            {!olcekler.some(x => x.id === o) && <option value={o}>{o} (bilinmiyor)</option>}
            {olcekler.map(x => <option key={x.id} value={x.id} disabled={x.id !== o && x.id in puanlar}>{x.ad}</option>)}
          </select>
          <div className="sayi-giris" style={{ width: 70, flex: "none" }}><SayiKutusu deger={v} degisti={n => degisti({ ...puanlar, [o]: n })} /></div>
          <button className="ikon-dugme" title="Kaldır" onClick={() => { const p = { ...puanlar }; delete p[o]; degisti(p); }}><Trash2 size={13} /></button>
        </div>
      ))}
      {bos ? <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} onClick={() => degisti({ ...puanlar, [bos.id]: 1 })} data-testid={testId && testId + "-ekle"}>
        <Plus size={13} /> Puan ekle</button>
        : !satirlar.length && <span className="cok-soluk">Ölçek tanımlı değil (oyun.json)</span>}
    </div>
  );
}

/** Açılır seçim. `secenekler`: [değer, görünen ad]. Boş değer "varsayılan" seçeneğiyle gösterilir. */
export function SecimAlani({ deger, degisti, secenekler, varsayilan, testId }: {
  deger: unknown; degisti: (v: string | undefined) => void; secenekler: [string, string][]; varsayilan?: string; testId?: string;
}) {
  const v = typeof deger === "string" ? deger : "";
  const bilinmiyor = v !== "" && !secenekler.some(s => s[0] === v);
  return (
    <select className="giris" value={v} data-testid={testId} onChange={e => degisti(e.target.value === "" ? undefined : e.target.value)}>
      {varsayilan !== undefined && <option value="">{varsayilan}</option>}
      {bilinmiyor && <option value={v}>{v} (bilinmiyor)</option>}
      {secenekler.map(([d, ad]) => <option key={d} value={d}>{ad}</option>)}
    </select>
  );
}

/** Yazı listesi (ör. kişinin söyledikleri): her satır bir söz; satır eklenir, silinir. */
export function MetinListesi({ liste, degisti, ipucu, ekleYazisi = "Söz ekle", testId }: {
  liste: string[] | undefined; degisti: (l: string[]) => void; ipucu?: string; ekleYazisi?: string; testId?: string;
}) {
  const l = Array.isArray(liste) ? liste : [];
  return (
    <div className="puanlar" data-testid={testId}>
      {l.map((m, i) => (
        <div key={i} className="puan-satiri">
          <div style={{ flex: 1 }}>
            <YaziAlani deger={m} ipucu={ipucu} testId={testId && `${testId}-${i}`} degisti={v => { const y = [...l]; y[i] = v; degisti(y); }} />
          </div>
          <button className="ikon-dugme" title="Kaldır" onClick={() => degisti(l.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
        </div>
      ))}
      <button className="dugme hayalet" style={{ alignSelf: "flex-start" }} data-testid={testId && testId + "-ekle"} onClick={() => degisti([...l, ""])}>
        <Plus size={13} /> {ekleYazisi}</button>
    </div>
  );
}
