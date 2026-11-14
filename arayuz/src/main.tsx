import { createRoot } from "react-dom/client";
import "./stil/tema.css";
import { Uygulama } from "./editor/Cerceve";
import { depoyuBekle } from "./depo/api";
import { useDurum } from "./depo/durum";
import { kisayollariBagla } from "./editor/komutlar";

createRoot(document.getElementById("kok")!).render(<Uygulama />);
kisayollariBagla();
depoyuBekle().then(depo => useDurum.getState().baslat(depo));
(window as any).__atolye = useDurum;   // otomatik testler için
