import { AppFooter } from "@/components/AppFooter";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Clock, Trash2 } from "lucide-react";
import {
  getFavorites,
  getHistory,
  removeFavorite,
  clearHistory,
  type Favorite,
  type HistoryEntry,
} from "@/lib/favorites";

export const Route = createFileRoute("/escolhidas")({
  head: () => ({
    meta: [
      { title: "Minhas escolhidas — Chosen" },
      {
        name: "description",
        content:
          "Suas mensagens favoritas e o histórico das últimas palavras recebidas — tudo offline.",
      },
    ],
  }),
  component: EscolhidasPage,
});

type Tab = "fav" | "hist";

function EscolhidasPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("fav");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      setFavorites(getFavorites());
      setHistory(getHistory());
    };
    refresh();
    window.addEventListener("chosen:favorites-changed", refresh);
    window.addEventListener("chosen:history-changed", refresh);
    return () => {
      window.removeEventListener("chosen:favorites-changed", refresh);
      window.removeEventListener("chosen:history-changed", refresh);
    };
  }, []);

  const goToMessage = (categoria: string, id: string) => {
    navigate({
      to: "/mensagem/$sentimento",
      params: { sentimento: categoria },
      search: { color: "#f1f26c", id },
    });
  };

  const list = tab === "fav" ? favorites : history;

  return (
    <div
      className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-white"
      style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)" }}
    >
      <header className="shrink-0 z-20 bg-white grid grid-cols-3 h-14 items-center px-4">
        <Link
          to="/home"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">
          CHOSEN
        </span>
        <span />
      </header>

      <div className="px-4 sm:px-6 pt-2">
        <h1 className="text-sm sm:text-base font-light tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase">
          Minhas escolhidas
        </h1>
      </div>

      <div className="px-4 sm:px-6 pt-4 flex items-center gap-1">
        <TabButton active={tab === "fav"} onClick={() => setTab("fav")}>
          <Heart className="h-3.5 w-3.5" strokeWidth={2} />
          Favoritas ({favorites.length})
        </TabButton>
        <TabButton active={tab === "hist"} onClick={() => setTab("hist")}>
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          Histórico ({history.length})
        </TabButton>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 pt-3 pb-24">
        {list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <ul className="flex flex-col gap-2 w-full">
            {list.map((item) => (
              <li key={`${tab}-${item.id}`}>
                <button
                  onClick={() => goToMessage(item.categoria, item.id)}
                  className="w-full text-left rounded-2xl border border-gray-100 bg-white px-4 py-3 transition-all active:scale-[0.98] hover:border-gray-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                        {item.categoria} · {item.ref}
                      </p>
                      <p className="mt-1 text-sm text-black line-clamp-3 break-words">
                        "{item.text}"
                      </p>
                    </div>
                    {tab === "fav" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(item.id);
                        }}
                        className="shrink-0 p-1.5 text-red-500 hover:text-red-600"
                        aria-label="Remover"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "hist" && history.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                if (confirm("Apagar todo o histórico?")) clearHistory();
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-gray-400 hover:text-black"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar histórico
            </button>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-black text-white" : "text-gray-500 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {tab === "fav" ? (
        <>
          <Heart className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">
            Você ainda não salvou nenhuma mensagem.
          </p>
          <p className="text-[11px] text-gray-400">
            Toque no coração em qualquer mensagem para guardar aqui.
          </p>
        </>
      ) : (
        <>
          <Clock className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
          <p className="text-sm text-gray-500">Histórico vazio.</p>
          <p className="text-[11px] text-gray-400">
            As últimas mensagens que você abrir aparecem aqui.
          </p>
        </>
      )}
    </div>
  );
}