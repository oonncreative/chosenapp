import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

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
      <div className="w-full max-w-sm flex flex-col items-center justify-between h-full py-20">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <img src="/logo-chosen.png" alt="Chosen" className="h-16 w-16 mb-4 object-contain" />
          
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
              <h2 className="text-2xl font-light tracking-tight text-black">Ativar notificações</h2>
              <p className="text-sm text-black/60 font-light leading-relaxed">
                Receba lembretes diários de esperança e paz.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 h-[60px] w-full rounded-[24px] border-2 border-black bg-white text-lg font-black tracking-tighter text-black hover:bg-gray-50 uppercase italic transition-all active:scale-95 shadow-none"
                onClick={async () => {
                  if ("Notification" in window) {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted" && "serviceWorker" in navigator) {
                      const registration = await navigator.serviceWorker.ready;
                      registration.showNotification('Chosen', {
                        body: 'Notificações ativadas! Enviaremos mensagens de fé para você.',
                        icon: '/logo-chosen.png'
                      });
                    }
                  }
                }}
              >
                Permitir notificações
              </Button>
            </div>
          )}
        </div>

        <div className="w-full px-4">
          <Button 
            className={`w-full h-[60px] rounded-[24px] ${styles.btn} hover:opacity-90 text-lg font-black tracking-tighter uppercase italic transition-all active:scale-95 border-none shadow-none`}
            onClick={nextStep}
          >
            {step === 3 ? "Começar" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}