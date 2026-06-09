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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-8 text-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-12">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4">
            <h1 className="text-4xl font-light tracking-tight text-foreground">Ressoa</h1>
            <p className="text-lg text-muted-foreground font-light">Inspire-se nas palavras de Deus</p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4">
            <h2 className="text-2xl font-light tracking-tight text-foreground">Escolha como você se sente</h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Encontraremos a mensagem certa para o seu momento.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-4">
            <h2 className="text-2xl font-light tracking-tight text-foreground">Ativar notificações</h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Receba lembretes diários de esperança e paz.
            </p>
            <Button 
              variant="outline" 
              className="mt-4 w-full rounded-full border-primary/20 hover:bg-primary/5"
              onClick={() => {
                alert("Notificações ativadas!");
              }}
            >
              Permitir notificações
            </Button>
          </div>
        )}

        <div className="w-full pt-8">
          <Button 
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium transition-all"
            onClick={nextStep}
          >
            {step === 3 ? "Começar" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
