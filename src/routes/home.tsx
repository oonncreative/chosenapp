import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="h-screen overflow-hidden bg-white p-6 pt-10 flex flex-col">
      <header className="mb-8 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[11px] font-bold tracking-[0.4em] text-black uppercase">Ressoa</h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="flex items-center gap-1.5 transition-opacity active:opacity-50"
              title={viewMode === "list" ? "Ver em grade" : "Ver em lista"}
            >
              {viewMode === "list" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
            </button>

            <button 
              onClick={() => {
                navigate({ to: "/onboarding" });
              }}
              className="flex items-center transition-opacity active:opacity-50"
              title="Voltar ao início"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xl font-light tracking-tight text-black">Qual seu sentimento?</p>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-4">
        <div className={viewMode === "list" ? "flex flex-col h-full gap-1.5" : "grid grid-cols-2 gap-1"}>
          {CATEGORIAS.map((sentimento, index) => (
            <Link
              key={sentimento}
              to="/mensagem/$sentimento"
              params={{ sentimento }}
              className={`flex items-center justify-center transition-all active:scale-[0.98] ${colors[index % colors.length]} ${
                viewMode === "list" ? "flex-1 px-8 justify-start rounded-[15px]" : "aspect-square p-4 text-center rounded-sm"
              }`}
            >
              <span className={`${viewMode === "list" ? "text-lg md:text-xl" : "text-sm"} font-bold tracking-tight`}>
                {sentimento}
              </span>
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
