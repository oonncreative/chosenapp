import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIAS } from "@/lib/data";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const colors = [
  "bg-[#F0F26C] text-black", // Amarelo vibrante
  "bg-[#98D8B1] text-black", // Verde água/menta
  "bg-[#B4B1E8] text-black", // Roxo pastel
  "bg-[#B1E2F0] text-black", // Azul claro
  "bg-[#F7C1E1] text-black", // Rosa pastel
  "bg-[#FCE5C9] text-black", // Bege/pêssego
  "bg-[#91F2EB] text-black", // Ciano/turquesa
  "bg-[#E8C1F7] text-black", // Lavanda
  "bg-[#F7E1C1] text-black", // Creme
];


function HomePage() {
  return (
    <div className="h-screen overflow-hidden bg-white p-6 pt-8 flex flex-col">
      <header className="mb-8 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[10px] font-extralight tracking-[0.4em] text-gray-300 uppercase">Ressoa</h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 transition-opacity active:opacity-50"
          >
            <span className="text-[9px] font-light tracking-wider text-gray-300 uppercase">Atualizar</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xl font-light tracking-tight text-black">Qual seu sentimento?</p>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto no-scrollbar pb-6">
        <div className="flex flex-col gap-2.5">
          {CATEGORIAS.map((sentimento, index) => (
            <Link
              key={sentimento}
              to="/mensagem/$sentimento"
              params={{ sentimento }}
              className={`flex h-[60px] items-center rounded-[30px] px-8 transition-all active:scale-[0.98] ${colors[index % colors.length]}`}
            >
              <span className="text-xl font-bold tracking-tight">{sentimento}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-auto py-4 text-center">
        <a 
          href="https://oonn.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-light tracking-[0.2em] text-gray-300 uppercase transition-colors hover:text-gray-400"
        >
          OONN Creative — oonn.com.br
        </a>
      </footer>
    </div>
  );
}
