import { createFileRoute } from "@tanstack/react-router";
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
    titulo: "Antes do Trabalho/Estudo",
    momento: "Dia",
    texto: "Pai, dai-me sabedoria e paciência. Que meu trabalho seja feito com excelência e que eu encontre graça diante dos desafios. Fortaleça minha mente e meu foco. Amém."
  },
  {
    titulo: "Momento de Ansiedade",
    momento: "Sempre",
    texto: "Deus, meu coração está inquieto. Trago a Ti minhas preocupações. Peço que a Tua paz, que excede o entendimento, guarde meus pensamentos e acalme minha alma agora. Amém."
  },
  {
    titulo: "Gratidão nas Refeições",
    momento: "Refeição",
    texto: "Obrigado, Senhor, pelo alimento em nossa mesa. Abençoa quem o preparou e que nunca falte o pão aos que têm fome. Nutre também nosso espírito com Tua palavra. Amém."
  },
  {
    titulo: "Proteção da Família",
    momento: "Sempre",
    texto: "Senhor, coloco minha família sob Tua proteção. Guarda nossa casa, afasta todo mal e mantém-nos unidos em Teu amor e em Tua verdade. Amém."
  },
  {
    titulo: "Antes de Dormir",
    momento: "Noite",
    texto: "Pai, obrigado por este dia. Perdoa minhas falhas. Entrego meu descanso a Ti e confio que cuidas de tudo enquanto durmo. Renova minhas forças para o amanhã. Amém."
  }
];

function OracoesPage() {
  const [expandida, setExpandida] = useState<number | null>(null);

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-[0.4em] text-black uppercase">ORAÇÕES</h1>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center p-3 -mr-3 transition-opacity active:opacity-50"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 tracking-wider uppercase">Momentos de conversa com Deus</p>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-12">
        <div className="flex flex-col gap-4">
          {ORACOES.map((oracao, index) => (
            <div 
              key={index}
              onClick={() => setExpandida(expandida === index ? null : index)}
              className={`p-6 rounded-[24px] border-2 border-black transition-all cursor-pointer ${
                expandida === index ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  expandida === index ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {oracao.momento}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2 tracking-tighter">
                {oracao.titulo}
              </h3>
              {expandida === index && (
                <p className="text-lg leading-relaxed font-medium mt-4 border-t border-gray-700 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {oracao.texto}
                </p>
              )}
              {expandida !== index && (
                <p className="text-sm opacity-60 line-clamp-1 italic">
                  Clique para ler a oração completa...
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="py-4 text-center bg-white border-t border-gray-50 shrink-0">
        <a 
          href="https://oonn.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-light tracking-[0.2em] text-gray-400 uppercase"
        >
          OONN Creative — oonn.com.br
        </a>
      </footer>
    </div>
  );
}