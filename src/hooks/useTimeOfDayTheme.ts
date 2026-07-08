import { useEffect } from "react";
import { isTimeThemeEnabled } from "@/lib/timeThemePrefs";

// Períodos do dia → cor de fundo aplicada ao <html> (peek no safe-area).
// Pages mantêm bg-white para legibilidade; o tint aparece sutilmente nas bordas.
function periodFor(hour: number): { name: string; bg: string; meta: string } {
  if (hour >= 5 && hour < 12) {
    return { name: "morning", bg: "oklch(0.985 0.018 95)", meta: "#fdf8e9" };
  }
  if (hour >= 12 && hour < 18) {
    return { name: "afternoon", bg: "oklch(0.96 0.05 75)", meta: "#fbeed0" };
  }
  if (hour >= 18 && hour < 22) {
    return { name: "evening", bg: "oklch(0.9 0.05 40)", meta: "#f4d3bd" };
  }
  return { name: "night", bg: "oklch(0.22 0.04 265)", meta: "#1c2238" };
}

function apply() {
  if (typeof document === "undefined") return;
  if (!isTimeThemeEnabled()) {
    document.documentElement.style.removeProperty("--period-bg");
    delete document.documentElement.dataset.period;
    return;
  }
  const p = periodFor(new Date().getHours());
  document.documentElement.style.setProperty("--period-bg", p.bg);
  document.documentElement.dataset.period = p.name;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", p.meta);
}

export function useTimeOfDayTheme() {
  useEffect(() => {
    apply();
    // reaplica ao topo de cada hora
    const next = new Date();
    next.setMinutes(0, 5, 0);
    next.setHours(next.getHours() + 1);
    const ms = next.getTime() - Date.now();
    const t = setTimeout(() => {
      apply();
      const i = setInterval(apply, 60 * 60 * 1000);
      (window as any).__chosenThemeInterval = i;
    }, Math.max(1000, ms));

    const onVis = () => {
      if (document.visibilityState === "visible") apply();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("chosen:timetheme-changed", apply);
    return () => {
      clearTimeout(t);
      const i = (window as any).__chosenThemeInterval;
      if (i) clearInterval(i);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("chosen:timetheme-changed", apply);
    };
  }, []);
}