import { useEffect, useRef } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { getRandomMensagemGlobal } from "@/lib/data";

const SHAKE_THRESHOLD = 22; // m/s² delta
const COOLDOWN_MS = 1800;
const ENABLED_KEY = "chosen_shake_enabled";

export function isShakeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ENABLED_KEY) === "true";
}

export function setShakeEnabled(v: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, String(v));
    window.dispatchEvent(new CustomEvent("chosen:shake-changed"));
  } catch {}
}

export async function requestShakePermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const anyMotion = (window as any).DeviceMotionEvent;
  if (anyMotion && typeof anyMotion.requestPermission === "function") {
    try {
      const r = await anyMotion.requestPermission();
      return r === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

export function useShakeToChosen() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastFiredRef = useRef(0);
  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const enabledRef = useRef(isShakeEnabled());

  useEffect(() => {
    const onChange = () => {
      enabledRef.current = isShakeEnabled();
    };
    window.addEventListener("chosen:shake-changed", onChange);
    return () => window.removeEventListener("chosen:shake-changed", onChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // só ativo em /home e /mensagem
    const active = pathname === "/home" || pathname.startsWith("/mensagem");
    if (!active) return;

    const handler = (e: DeviceMotionEvent) => {
      if (!enabledRef.current) return;
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;

      const last = lastAccelRef.current;
      lastAccelRef.current = { x: a.x, y: a.y, z: a.z };
      if (!last) return;

      const dx = a.x - last.x;
      const dy = a.y - last.y;
      const dz = a.z - last.z;
      const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (delta < SHAKE_THRESHOLD) return;

      const now = Date.now();
      if (now - lastFiredRef.current < COOLDOWN_MS) return;
      lastFiredRef.current = now;

      try {
        const { categoria, id } = getRandomMensagemGlobal();
        toast("Você chacoalhou ✨", { description: "Uma palavra pra você." });
        // haptic best-effort
        import("@capacitor/haptics")
          .then(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle.Medium }))
          .catch(() => {
            if ("vibrate" in navigator) navigator.vibrate(40);
          });
        navigate({
          to: "/mensagem/$sentimento",
          params: { sentimento: categoria },
          search: { color: "#f1f26c", id },
        });
      } catch (err) {
        console.error("shake error", err);
      }
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [navigate, pathname]);
}