import { AppFooter } from "@/components/AppFooter";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/oracoes")({
  component: OracoesPage,
});

interface Oracao {
  titulo: string;
  texto: string;
  momento: string;
}

const ORACOES: Oracao[] = [
  {
    titulo: "Ao Acordar",
    momento: "Manhã",
    texto: "Senhor, obrigado por mais este fôlego de vida. Entrego meu dia em Tuas mãos. Que a Tua paz guie meus passos e que eu seja luz por onde eu passar. Amém."
  },
  {
    titulo: "Novo Ciclo",
    momento: "Algo Novo",
    texto: "Senhor, coloco este novo começo em Tuas mãos. Que as experiências passadas sirvam de lição e que os novos caminhos sejam iluminados pela Tua presença. Dai-me coragem para abraçar o novo com fé. Amém."
  },
  {
    titulo: "Novo Projeto",
    momento: "Algo Novo",
    texto: "Pai, abençoe este novo empreendimento. Que cada passo seja dado com sabedoria e que meu esforço produza frutos que glorifiquem o Teu nome. Que a ansiedade não me domine, mas a confiança em Ti me guie. Amém."
  },
  {
    titulo: "Nova Amizade",
    momento: "Algo Novo",
    texto: "Deus, obrigado pelas novas pessoas em minha vida. Que este novo relacionamento seja baseado na verdade, no respeito e no amor cristão. Que possamos ser bênção um para o outro. Amém."
  },
  {
    titulo: "Gratidão nas Refeições",
    momento: "Refeição",
    texto: "Obrigado, Senhor, pelo alimento em nossa mesa. Abençoa quem o preparou e que nunca falte o pão aos que têm fome. Nutre também nosso espírito com Tua palavra. Amém."
  },
  {
    titulo: "Ao Deitar",
    momento: "Noite",
    texto: "Pai, obrigado por este dia. Perdoa minhas falhas. Entrego meu descanso a Ti e confio que cuidas de tudo enquanto durmo. Renova minhas forças para o amanhã. Amém."
  },
  {
    titulo: "Paz na Casa",
    momento: "Noite",
    texto: "Senhor, visita meu lar nesta noite. Que Tua presença afaste toda inquietação e que possamos repousar em segurança sob as Tuas asas. Que o sono seja reparador e a mente se acalme. Amém."
  },
  {
    titulo: "Força no Desafio",
    momento: "Sempre",
    texto: "Senhor, em meio às lutas, renova minhas forças. Que eu não desfaleça, mas persevere com fé, sabendo que Tu és o meu auxílio bem presente na angústia. Amém."
  },
  {
    titulo: "Paz na Ansiedade",
    momento: "Sempre",
    texto: "Deus, meu coração está inquieto. Trago a Ti minhas preocupações. Peço que a Tua paz, que excede o entendimento, guarde meus pensamentos e acalme minha alma agora. Amém."
  },
  {
    titulo: "Pela Sabedoria",
    momento: "Sempre",
    texto: "Espírito Santo, ilumina meu entendimento. Que minhas escolhas hoje sejam guiadas pela Tua vontade e que eu saiba agir com discernimento e amor em cada situação. Amém."
  },
  {
    titulo: "Saúde e Cura",
    momento: "Sempre",
    texto: "Pai celestial, Tu és o Deus que cura. Peço por saúde e restauração, tanto física quanto emocional. Que Tua mão de misericórdia toque cada área da minha vida. Amém."
  },
  {
    titulo: "Proteção da Família",
    momento: "Sempre",
    texto: "Senhor, coloco minha família sob Tua proteção. Guarda nossa casa, afasta todo mal e mantém-nos unidos em Teu amor e em Tua verdade. Amém."
  },
  {
    titulo: "Pelo Próximo",
    momento: "Sempre",
    texto: "Deus, abre meus olhos para as necessidades dos que me cercam. Que eu possa ser um instrumento de Tua bondade, levando consolo e ajuda a quem precisa hoje. Amém."
  },
  {
    titulo: "Trabalho e Estudo",
    momento: "Sempre",
    texto: "Pai, dai-me sabedoria e paciência. Que meu trabalho seja feito com excelência e que eu encontre graça diante dos desafios. Fortaleça minha mente e meu foco. Amém."
  },
  {
    titulo: "Luz no Caminho",
    momento: "Sempre",
    texto: "Senhor, que Tua palavra seja lâmpada para os meus pés e luz para o meu caminho. Que eu não me desvie nem para a direita nem para a esquerda, mas siga firme em Ti. Amém."
  }
];

function OracoesPage() {
  const [expandida, setExpandida] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col w-full max-w-[100vw]">
      <header className="sticky top-0 px-4 sm:px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-2 flex flex-col gap-3 shrink-0 bg-white z-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h1 className="truncate text-sm sm:text-base font-light tracking-[0.4em] text-black uppercase">ORAÇÕES</h1>
          
          <div className="flex items-center gap-0 shrink-0">
            <button 
              onClick={() => {
                const current = document.documentElement.classList.contains('grayscale');
                const next = !current;
                localStorage.setItem('isMono', next.toString());
                if (next) {
                  document.documentElement.classList.add('grayscale');
                } else {
                  document.documentElement.classList.remove('grayscale');
                }
              }}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title="Modo Minimalista"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
              </svg>
            </button>
            <button 
              onClick={() => {
                setExpandida(null);
                navigate({ to: "/home" });
              }}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 -mr-2 transition-opacity active:opacity-50"
              title="Voltar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-1">
          <h1 className="text-sm sm:text-base font-light tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase">Momentos com Deus</h1>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 pb-12 pt-2">
        <ul className="flex flex-col w-full divide-y divide-black/10">
          {ORACOES.map((oracao, index) => {
            const isExpanded = expandida === index;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setExpandida(isExpanded ? null : index)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center gap-3 py-5 text-left active:opacity-60 transition-opacity"
                >
                  <span className="flex-1 min-w-0 text-base sm:text-lg font-medium tracking-tight uppercase text-black truncate">
                    {oracao.titulo}
                  </span>
                  <span className="shrink-0 text-[10px] font-light tracking-[0.25em] uppercase text-black/40">
                    {oracao.momento}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 text-black/50 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[15px] sm:text-base leading-relaxed text-black/80 font-light break-words pr-6">
                      {oracao.texto}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <AppFooter />
    </div>
  );
}