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
    <div className="h-screen overflow-hidden bg-white p-6 pt-12 flex flex-col">
      <header className="mb-10 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <span className="text-xs font-medium text-gray-400">April 15</span>
            <span className="text-xs font-medium text-gray-400">Yesterday</span>
          </div>
          <span className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white">Today</span>
        </div>
        <h1 className="mt-8 text-xs font-medium uppercase tracking-widest text-gray-300">Habits and routines</h1>
        <p className="text-2xl font-bold tracking-tight text-black">Ressoa</p>
      </header>

      <section className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <div className="flex flex-col gap-3">
          {CATEGORIAS.map((sentimento, index) => (
            <Link
              key={sentimento}
              to="/mensagem/$sentimento"
              params={{ sentimento }}
              className={`flex h-[72px] items-center justify-between rounded-[36px] px-8 transition-all active:scale-[0.98] ${colors[index % colors.length]}`}
            >
              <span className="text-2xl font-bold tracking-tight">{sentimento}</span>
              <span className="text-lg font-medium opacity-60">{(index + 1) * 7}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-auto flex justify-between py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
      </footer>
    </div>


  );
}
