import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIAS, getRandomIdForCategoria } from "@/lib/data";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const cardColors = [
  "bg-gradient-to-br from-[#FF9500] to-[#FFCC00] text-white", // Laranja Amarelado
  "bg-gradient-to-br from-[#5856D6] to-[#AF52DE] text-white", // Roxo
  "bg-gradient-to-br from-[#FF3B30] to-[#FF2D55] text-white", // Vermelho
  "bg-gradient-to-br from-[#FF7043] to-[#FF8A65] text-white", // Coral
  "bg-gradient-to-br from-[#4CD964] to-[#2D8C3C] text-white", // Verde
  "bg-gradient-to-br from-[#C678DD] to-[#AF52DE] text-white", // Violeta
  "bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] text-white", // Azul
];

const headerColors = [
  "#FF9500",
  "#5856D6",
  "#FF3B30",
  "#FF7043",
  "#4CD964",
  "#C678DD",
  "#007AFF",
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Olá</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => navigate({ to: "/oracoes" })}
              className="p-2.5 rounded-full bg-black text-white transition-transform active:scale-95"
              title="Orações Diárias"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 20c0-1.5 1-3.5 2.5-4.5L12 14l2.5 1.5c1.5 1 2.5 3 2.5 4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10c0-1.1.9-2 2-2s2 .9 2 2v4H10v-4z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2v6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6l2 2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6l-2 2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={() => navigate({ to: "/onboarding" })}
              className="p-2.5 rounded-full bg-gray-100 text-black transition-transform active:scale-95 ml-1"
              title="Configurações"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <h1 className="text-3xl font-bold tracking-tight text-black">Sentimentos</h1>
          <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-2">
            {["TODOS", "DIÁRIOS", "SAÚDE", "FOCO"].map((cat, i) => (
              <button key={cat} className={`text-[10px] font-bold tracking-widest uppercase ${i === 0 ? 'text-black' : 'text-gray-400'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-8">
        <div className="flex flex-col -space-y-4">
          {CATEGORIAS.map((sentimento, index) => {
            const colorClass = cardColors[index % cardColors.length];
            const hexColor = headerColors[index % headerColors.length];
            
            return (
              <Link
                key={sentimento}
                to="/mensagem/$sentimento"
                params={{ sentimento }}
                search={{ 
                  color: hexColor,
                  id: getRandomIdForCategoria(sentimento)
                }}
                className={`group relative flex flex-col justify-between h-[110px] px-6 py-5 transition-all active:scale-[0.98] active:z-20 rounded-[28px] shadow-lg border border-white/10 ${colorClass} hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold leading-tight">
                      {sentimento}
                    </span>
                    <span className="text-[11px] opacity-80 font-medium">
                      Inspiração para hoje
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div className="flex items-end justify-between w-full mt-auto">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                     </div>
                  </div>
                  
                  <svg width="40" height="15" viewBox="0 0 40 15" className="opacity-40">
                    <path d="M0 10 Q 5 0, 10 10 T 20 10 T 30 10 T 40 10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="py-4 text-center bg-white border-t border-gray-50 shrink-0">
        <a 
          href="https://oonn.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-light tracking-[0.2em] text-gray-400 uppercase transition-colors hover:text-black"
        >
          OONN Creative — oonn.com.br
        </a>
      </footer>
    </div>
  );
}
