// Başlangıç ekranı ve açılır pencereler: yeni proje, komut paleti, ayarlar, proje ayarları, kısayollar, hakkında.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { X, FilePlus, FolderOpen, Keyboard, Gamepad2, Sparkles, Bird, Moon, Footprints, Map as Harita, Search, Clapperboard } from "lucide-react";
import { useDurum } from "../depo/durum";
import { KOMUTLAR, kullanilabilir } from "./komutlar";
import { oyunIceriginiAc } from "../oyun/ac";

function Pencere({ baslik, children, alt, genislik }: { baslik: string; children: ReactNode; alt?: ReactNode; genislik?: number }) {
  const kapat = () => useDurum.getState().set("pencere", null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") kapat(); };
    addEventListener("keydown", esc); return () => removeEventListener("keydown", esc);
  }, []);
  return (
    <div className="perde" onPointerDown={e => { if (e.target === e.currentTarget) kapat(); }}>
      <div className="pencere" style={genislik ? { width: genislik } : undefined} role="dialog" aria-label={baslik}>
        <header>{baslik}<button className="ikon-dugme" onClick={kapat} aria-label="Kapat"><X size={16} /></button></header>
        {children}
        {alt && <footer>{alt}</footer>}
      </div>
    </div>
  );
}

// ============================================================ Başlangıç ekranı
const SABLONLAR = [
  { id: "bos", ad: "Boş proje", aciklama: "Sıfırdan başla", ikon: <FilePlus size={30} /> },
  { id: "ornek", ad: "Örnek: Kanat Çırp", aciklama: "Nesneleri ve kuralları incele", ikon: <Bird size={30} /> },
  { id: "yanki", ad: "Yankı (karanlık mağara)", aciklama: "Aşama 4", ikon: <Moon size={30} />, yakinda: true },
  { id: "platform", ad: "Platform oyunu", aciklama: "Aşama 5", ikon: <Footprints size={30} />, yakinda: true },
  { id: "ustten", ad: "Yukarıdan bakış", aciklama: "Aşama 5", ikon: <Harita size={30} />, yakinda: true },
] as const;

export function BaslangicEkrani() {
  const projeler = useDurum(d => d.projeler);
  const { projeyiAc, set } = useDurum.getState();
  return (
    <div className="baslangic" data-testid="baslangic">
      <aside>
        <h1><span className="isaret" style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#4f9cf7,#a78bfa)" }} /> Oyun Atölyesi</h1>
        <div className="soluk" style={{ marginBottom: 16 }}>Kod yazmadan oyun tasarla, anında oyna.</div>
        <button className="dugme birincil" onClick={() => set("pencere", "yeniProje")} data-testid="yeni-proje"><FilePlus size={15} /> Yeni proje</button>
        <button className="dugme" onClick={() => oyunIceriginiAc()} data-testid="oyun-icerigi-ac"><Clapperboard size={15} /> Oyun içeriğini aç</button>
        <div className="cok-soluk" style={{ fontSize: 12, marginTop: -4 }}>3D hikâye oyununun karakterleri, haritaları ve eşyaları</div>
        <button className="dugme" onClick={() => useDurum.getState().depo?.klasoru_ac()}><FolderOpen size={15} /> Proje klasörünü aç</button>
        <button className="dugme hayalet" onClick={() => set("pencere", "kisayollar")}><Keyboard size={15} /> Klavye kısayolları</button>
        <span style={{ flex: 1 }} />
        <div className="cok-soluk" style={{ fontSize: 12 }}>Sürüm 0.4 · oyun içeriği düzenleyicisi</div>
      </aside>
      <main>
        <h2>Projelerin</h2>
        <div className="proje-kartlari">
          {projeler.map(ad => (
            <button key={ad} className="proje-karti" onClick={() => projeyiAc(ad)} data-testid="proje-karti">
              <div className="resim"><Gamepad2 size={34} /></div>
              <div className="bilgi"><b>{ad}</b><span className="soluk">Açmak için tıkla</span></div>
            </button>
          ))}
        </div>
        <h2>Şablondan başla</h2>
        <div className="proje-kartlari">
          {SABLONLAR.map(s => (
            <button key={s.id} className="proje-karti" disabled={"yakinda" in s} style={"yakinda" in s ? { opacity: 0.55, cursor: "default" } : undefined}
              onClick={() => { (window as any).__sablon = s.id; set("pencere", "yeniProje"); }}>
              <div className="resim" style={{ height: 80 }}>{s.ikon}</div>
              <div className="bilgi"><b>{s.ad}</b><span className={"yakinda" in s ? "rozet yakinda" : "soluk"}>{s.aciklama}</span></div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

// ============================================================ Yeni proje
export function YeniProjePenceresi() {
  const [ad, setAd] = useState("");
  const [sablon, setSablon] = useState<"bos" | "ornek">(((window as any).__sablon as "bos" | "ornek") || "bos");
  const [hata, setHata] = useState("");
  const olustur = async () => {
    const temiz = ad.trim().replace(/[<>:"/\\|?*]/g, "");
    if (!temiz) { setHata("Önce bir ad yaz."); return; }
    const tamam = await useDurum.getState().yeniProje(temiz, sablon);
    if (!tamam) { setHata("Bu adda bir proje zaten var."); return; }
    (window as any).__sablon = undefined;
    useDurum.getState().set("pencere", null);
  };
  return (
    <Pencere baslik="Yeni proje" alt={<>
      <button className="dugme" onClick={() => useDurum.getState().set("pencere", null)}>Vazgeç</button>
      <button className="dugme birincil" onClick={olustur} data-testid="olustur">Oluştur</button></>}>
      <div className="govde">
        <label>Oyunun adı</label>
        <input className="giris" autoFocus value={ad} maxLength={50} placeholder="ör. Uzay Kaçışı" data-testid="proje-adi"
          onChange={e => { setAd(e.target.value); setHata(""); }} onKeyDown={e => e.key === "Enter" && olustur()} />
        {hata && <span className="hata-yazi" data-testid="hata">{hata}</span>}
        <label>Başlangıç</label>
        <select className="giris" value={sablon} onChange={e => setSablon(e.target.value as "bos" | "ornek")}>
          <option value="bos">Boş proje</option><option value="ornek">Örnek: Kanat Çırp</option>
        </select>
      </div>
    </Pencere>
  );
}

// ============================================================ Komut paleti
export function KomutPaleti() {
  const [ara, setAra] = useState("");
  const [secili, setSecili] = useState(0);
  const liste = useMemo(() => {
    const a = ara.toLocaleLowerCase("tr");
    return KOMUTLAR.filter(k => !k.menudeGizli && (k.kategori + " " + k.ad).toLocaleLowerCase("tr").includes(a));
  }, [ara]);
  const calistir = (i: number) => {
    const k = liste[i]; if (!k || !kullanilabilir(k)) return;
    useDurum.getState().set("pencere", null); k.calistir();
  };
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => { ref.current?.children[secili]?.scrollIntoView({ block: "nearest" }); }, [secili]);
  return (
    <div className="perde" onPointerDown={e => { if (e.target === e.currentTarget) useDurum.getState().set("pencere", null); }}>
      <div className="pencere komut-paleti" data-testid="komut-paleti">
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 14 }}><Search size={16} className="soluk" />
          <input autoFocus placeholder="Bir komut ara… (ör. oynat, ızgara, sürüm)" value={ara}
            onChange={e => { setAra(e.target.value); setSecili(0); }}
            onKeyDown={e => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSecili(Math.min(liste.length - 1, secili + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSecili(Math.max(0, secili - 1)); }
              else if (e.key === "Enter") calistir(secili);
              else if (e.key === "Escape") useDurum.getState().set("pencere", null);
            }} /></div>
        <ul ref={ref}>
          {liste.map((k, i) => (
            <li key={k.id} className={i === secili ? "secili" : ""} onMouseEnter={() => setSecili(i)} onClick={() => calistir(i)}
              style={!kullanilabilir(k) ? { opacity: 0.45 } : undefined}>
              <span className="cok-soluk" style={{ width: 64 }}>{k.kategori}</span>{k.ad}
              {k.yakinda && <span className="rozet yakinda">{k.yakinda}</span>}
              <span className="kisayol">{k.kisayol}</span>
            </li>
          ))}
          {!liste.length && <li className="cok-soluk">Eşleşen komut yok</li>}
        </ul>
      </div>
    </div>
  );
}

// ============================================================ Ayarlar
export function AyarlarPenceresi() {
  const t = useDurum(d => d.tercih);
  const { tercihAyarla } = useDurum.getState();
  return (
    <Pencere baslik="Ayarlar" alt={<button className="dugme birincil" onClick={() => useDurum.getState().set("pencere", null)}>Tamam</button>}>
      <div className="govde">
        <label>Izgara boyutu</label>
        <select className="giris" value={t.izgaraBoyutu} onChange={e => tercihAyarla({ izgaraBoyutu: Number(e.target.value) })}>
          {[8, 16, 24, 32, 48, 64].map(v => <option key={v} value={v}>{v} piksel</option>)}
        </select>
        <label>Izgara</label><label><input type="checkbox" checked={t.izgaraGoster} onChange={e => tercihAyarla({ izgaraGoster: e.target.checked })} /> Göster</label>
        <label>Çarpışma alanları</label><label><input type="checkbox" checked={t.carpismaGoster} onChange={e => tercihAyarla({ carpismaGoster: e.target.checked })} /> Göster</label>
        <label>Mıknatıs</label><label><input type="checkbox" checked={t.miknatis} onChange={e => tercihAyarla({ miknatis: e.target.checked })} /> Nesneler ızgaraya yapışsın</label>
        <label>Otomatik kayıt</label><label><input type="checkbox" checked={t.otomatikKayit} onChange={e => tercihAyarla({ otomatikKayit: e.target.checked })} /> Her değişiklikte kaydet</label>
        <label>Arayüz ölçeği</label>
        <select className="giris" value={t.arayuzOlcek} onChange={e => tercihAyarla({ arayuzOlcek: Number(e.target.value) })}>
          {[0.9, 1, 1.1, 1.25].map(v => <option key={v} value={v}>%{Math.round(v * 100)}</option>)}
        </select>
        <label>Tema</label><span className="soluk">Koyu <span className="rozet yakinda">açık tema yakında</span></span>
      </div>
    </Pencere>
  );
}

// ============================================================ Proje ayarları
export function ProjeAyarlari() {
  const p = useDurum(d => d.proje);
  const { degistir } = useDurum.getState();
  if (!p) return null;
  return (
    <Pencere baslik="Proje ayarları" alt={<button className="dugme birincil" onClick={() => useDurum.getState().set("pencere", null)}>Tamam</button>}>
      <div className="govde">
        <label>Proje adı</label><span>{useDurum.getState().projeAdi}</span>
        <label>Oyun ekranı</label>
        <div className="ikili">
          <input className="giris" type="number" value={p.ayarlar.ekranGenislik} onChange={e => degistir(x => { x.ayarlar.ekranGenislik = Number(e.target.value) || 960; })} />
          <input className="giris" type="number" value={p.ayarlar.ekranYukseklik} onChange={e => degistir(x => { x.ayarlar.ekranYukseklik = Number(e.target.value) || 540; })} />
        </div>
        <label>Başlangıç sahnesi</label>
        <select className="giris" value={p.ayarlar.baslangicSahnesi} onChange={e => degistir(x => { x.ayarlar.baslangicSahnesi = e.target.value; })}>
          {p.sahneler.map(s => <option key={s.id} value={s.id}>{s.ad}</option>)}
        </select>
      </div>
    </Pencere>
  );
}

// ============================================================ Kısayollar ve hakkında
export function KisayollarPenceresi() {
  const kategoriler = ["Dosya", "Düzen", "Hizala", "Araç", "Görünüm", "Oyun", "Yardım"] as const;
  return (
    <Pencere baslik="Klavye kısayolları" genislik={640}>
      <div style={{ maxHeight: "60vh", overflow: "auto" }}>
        {kategoriler.map(kat => (
          <div key={kat}>
            <div className="liste-baslik" style={{ padding: "12px 16px 0" }}>{kat}</div>
            <div className="kisayol-tablosu" style={{ paddingTop: 8 }}>
              {KOMUTLAR.filter(k => k.kategori === kat && k.kisayol).map(k => <Satir key={k.id} ad={k.ad} kisayol={k.kisayol!} />)}
              {kat === "Görünüm" && <><Satir ad="Sahneyi kaydır" kisayol="Boşluk + sürükle" /><Satir ad="Yakınlaştır / uzaklaştır" kisayol="Fare tekerleği" /></>}
              {kat === "Araç" && <><Satir ad="Döndürürken 15° adımla" kisayol="Shift" /><Satir ad="Köşeden boyutlandırırken oranı koru" kisayol="Shift" />
                <Satir ad="Seçime ekle / çıkar" kisayol="Shift + tık" /><Satir ad="Kutu ile seç" kisayol="Boş alanda sürükle" /></>}
            </div>
          </div>
        ))}
      </div>
    </Pencere>
  );
}
function Satir({ ad, kisayol }: { ad: string; kisayol: string }) {
  return <><span>{ad}</span><span>{kisayol.split("+").map((p, i) => <span key={i}>{i > 0 && " + "}<kbd>{p || "+"}</kbd></span>)}</span></>;
}

export function Hakkinda() {
  return (
    <Pencere baslik="Oyun Atölyesi hakkında">
      <div style={{ padding: 20, lineHeight: 1.7 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 16, fontWeight: 600 }}><Sparkles size={18} /> Oyun Atölyesi 0.4</div>
        <p className="soluk">Kod yazmadan 2D oyun tasarlama ortamı. Fikir ve yön: Harun. Kodlama, tasarım ve test: Claude.</p>
        <p className="soluk">Hedef: Yankı'yı bu araçla, kod yazmadan, sıfırdan birebir yapabilmek.</p>
      </div>
    </Pencere>
  );
}
