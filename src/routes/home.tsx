import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIAS } from "@/lib/data";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const colors = [
  "bg-rose-50 border-rose-100 text-rose-700",
  "bg-blue-50 border-blue-100 text-blue-700",
  "bg-amber-50 border-amber-100 text-amber-700",
  "bg-emerald-50 border-emerald-100 text-emerald-700",
  "bg-indigo-50 border-indigo-100 text-indigo-700",
  "bg-orange-50 border-orange-100 text-orange-700",
  "bg-purple-50 border-purple-100 text-purple-700",
  "bg-sky-50 border-sky-100 text-sky-700",
  "bg-slate-50 border-slate-100 text-slate-700",
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background p-8 pt-12">
      <header className="mb-12 flex flex-col gap-1">
        <h1 className="text-lg font-medium tracking-tight text-foreground/80">Ressoa</h1>
        <p className="text-2xl font-light text-foreground">Inspire-se nas palavras de Deus</p>
      </header>

      <section>
        <h2 className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">Leia-me quando...</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIAS.map((sentimento, index) => (
            <Link
              key={sentimento}
              to="/mensagem/$sentimento"
              params={{ sentimento }}
              className={`flex h-28 flex-col items-center justify-center rounded-3xl border px-4 text-center transition-all hover:scale-[0.98] active:scale-95 ${colors[index % colors.length]}`}
            >
              <span className="text-sm font-medium leading-tight">{sentimento}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
