// Kodla üretilen kısa sesler (Web Audio). Dosya gerekmez; tarayıcılar sesi ancak ilk dokunuştan sonra açar.
import type { Olay } from "./oyun/dunya";

let ctx: AudioContext | null = null;
let sessiz = false;

export function sesiAc(): void {
  if (sessiz) return;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch { ctx = null; }
}

export function sessizMi(): boolean { return sessiz; }
export function sessizYap(v: boolean): void {
  sessiz = v;
  if (v && ctx) void ctx.suspend();
  if (!v) sesiAc();
}

/** Frekansı f1'den f2'ye kayan kısa ton. */
function ton(f1: number, f2: number, sure: number, ses: number, tur: OscillatorType = "sine", gecikme = 0) {
  if (!ctx || sessiz) return;
  const t = ctx.currentTime + gecikme;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = tur;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + sure + 0.02);
}

export function olayiCal(olay: Olay): void {
  switch (olay) {
    case "cirp": ton(2100, 1500, 0.07, 0.05); ton(2100, 1500, 0.06, 0.018, "sine", 0.12); break;  // yankı ve tekrarı
    case "buyuk_sonar": ton(900, 2600, 0.35, 0.08, "triangle"); ton(900, 2600, 0.3, 0.03, "triangle", 0.3); break;
    case "bocek": ton(1320, 1320, 0.08, 0.06, "triangle"); ton(1760, 1760, 0.12, 0.05, "triangle", 0.07); break;
    case "carpma": ton(180, 60, 0.35, 0.18, "sawtooth"); break;
    case "ag": ton(320, 240, 0.25, 0.07, "square"); ton(300, 220, 0.2, 0.04, "square", 0.08); break;   // yapışkan vızıltı
    case "damla": ton(1900, 900, 0.09, 0.08); ton(1500, 700, 0.08, 0.04, "sine", 0.1); break;        // "plink"
    case "tamam": [660, 880, 1100, 1320].forEach((f, i) => ton(f, f, 0.16, 0.06, "triangle", i * 0.11)); break;   // küçük zafer melodisi
    case "basla": break;
  }
}
