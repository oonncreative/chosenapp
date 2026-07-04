import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { requestNativeNotificationsPermission } from "@/hooks/useNativeNotifications";
import { Bell, Check, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const [step, setStep] = useState(1);
  const [notifStatus, setNotifStatus] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const navigate = useNavigate();

  // Detecta se a permissão já foi concedida antes
  useEffect(() => {
    if (step !== 3) return;
    if (typeof window === "undefined") return;
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      import("@capacitor/local-notifications")
        .then(({ LocalNotifications }) => LocalNotifications.checkPermissions())
        .then((p) => {
          if (p.display === "granted") setNotifStatus("granted");
          else if (p.display === "denied") setNotifStatus("denied");
        })
        .catch(() => {});
    } else if ("Notification" in window) {
      if (Notification.permission === "granted") setNotifStatus("granted");
      else if (Notification.permission === "denied") setNotifStatus("denied");
    }
  }, [step]);

  const handleAskNotifications = async () => {
    setNotifStatus("asking");
    try {
      const ok = await requestNativeNotificationsPermission();
      setNotifStatus(ok ? "granted" : "denied");
    } catch {
      setNotifStatus("denied");
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try { localStorage.setItem("onboarded", "true"); } catch {}
      navigate({ to: "/home", replace: true });
    }
  };

  const getStepStyles = () => {
    return { btn: "bg-[#f1f26c] text-black" };
  };

  const styles = getStepStyles();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white px-8 text-center transition-colors duration-700 overflow-hidden">
      <div className="absolute top-[max(env(safe-area-inset-top),1rem)] left-0 right-0 flex justify-center pointer-events-none">
        <span className="text-[10px] font-light tracking-[0.5em] uppercase text-black/30">
          Chosen
        </span>
      </div>
      <div className="w-full max-w-sm flex flex-col items-center justify-between h-full py-20">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <img src="/logo-chosen.png" alt="Chosen" className="h-32 w-32 mb-4 object-contain" />
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4">
              <h1 className="text-[11px] font-bold tracking-[0.4em] text-black uppercase">Chosen</h1>
              <p className="text-lg text-black/60 font-light tracking-tight italic">Inspirações - Escolhidas!</p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4 px-4">
              <h2 className="text-2xl font-light tracking-tight text-black">Escolha como você se sente</h2>
              <p className="text-sm text-black/60 font-light leading-relaxed">
                Encontraremos a mensagem certa para o seu momento.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4 px-4">
              <h2 className="text-2xl font-light tracking-tight text-black">Deixe o Chosen te encontrar</h2>
              <p className="text-sm text-black/60 font-light leading-relaxed">
                A gente analisa seu momento e, na hora certa,{" "}
                <em className="text-black/80">chosen</em> — você recebe a mensagem que faz sentido pra você.
              </p>
              <p className="text-xs text-black/40 font-light leading-relaxed">
                Para isso funcionar, precisamos da sua autorização para enviar notificações.
              </p>
              <Button
                variant="outline"
                disabled={notifStatus === "asking" || notifStatus === "granted"}
                className={`mt-6 h-[60px] w-full rounded-[24px] border-2 text-lg font-black tracking-tighter uppercase italic transition-all active:scale-95 shadow-none flex items-center justify-center gap-2 ${
                  notifStatus === "granted"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : notifStatus === "denied"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-black bg-white text-black hover:bg-gray-50"
                }`}
                onClick={handleAskNotifications}
              >
                {notifStatus === "asking" && <><Loader2 className="h-5 w-5 animate-spin" /> Aguardando…</>}
                {notifStatus === "granted" && <><Check className="h-5 w-5" /> Notificações ativas</>}
                {notifStatus === "denied" && <><X className="h-5 w-5" /> Permissão negada</>}
                {notifStatus === "idle" && <><Bell className="h-5 w-5" /> Permitir notificações</>}
              </Button>
              {notifStatus === "denied" && (
                <p className="text-[11px] text-red-600/80 leading-snug">
                  Você pode liberar depois nas configurações do seu celular.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="w-full px-4">
          <Button 
            className={`w-full h-[60px] rounded-[24px] ${styles.btn} hover:opacity-90 text-lg font-black tracking-tighter uppercase italic transition-all active:scale-95 border-none shadow-none`}
            onClick={nextStep}
          >
            {step === 3 ? (notifStatus === "granted" ? "Começar" : "Continuar mesmo assim") : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}