import { useEffect } from "react";
import { recordAppOpen } from "@/lib/usagePattern";

// Registra uma abertura por sessão e a cada vez que o app volta ao foco
// após ficar oculto por >5 min — ajuda a aprender o horário preferido.
const FOCUS_GAP_MS = 5 * 60 * 1000;

export function useUsageTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    recordAppOpen();
    let lastHidden = 0;

    const onVis = () => {
      if (document.visibilityState === "hidden") {
        lastHidden = Date.now();
      } else if (document.visibilityState === "visible") {
        if (lastHidden && Date.now() - lastHidden > FOCUS_GAP_MS) {
          recordAppOpen();
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
}