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
      navigate({ to: "/home" });
    }
  };

  const getStepStyles = () => {
    switch(step) {
      case 1:
        return { btn: "bg-[#F0F26C] text-black" };
      case 2:
        return { btn: "bg-[#B4B1E8] text-black" };
      case 3:
        return { btn: "bg-[#98D8B1] text-black" };
      default:
        return { btn: "bg-black text-white" };
    }
  };

  const styles = getStepStyles();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white px-8 text-center transition-colors duration-700 overflow-hidden">
      <div className="w-full max-w-sm flex flex-col items-center justify-between h-full py-20">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <img src="/0novalogo.png" alt="Ressoa" className="h-16 w-16 mb-4 object-contain" />
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4">
              <h1 className="text-4xl font-extralight tracking-[0.1em] text-black uppercase">Ressoa</h1>
              <p className="text-lg text-black/60 font-light tracking-tight italic">Inspire-se nas palavras de Deus</p>
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
                className="mt-6 h-12 w-full rounded-none border-black/10 bg-gray-50 font-light text-black hover:bg-gray-100"
                onClick={() => {
                  if ("Notification" in window) {
                    Notification.requestPermission();
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
            className={`w-full h-[60px] rounded-none ${styles.btn} hover:opacity-90 text-lg font-bold tracking-tight transition-all active:scale-95 border-none shadow-none`}
            onClick={nextStep}
          >
            {step === 3 ? "Começar" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}