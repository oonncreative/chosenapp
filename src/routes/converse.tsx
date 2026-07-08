import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, Sparkles, Heart, Send, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { converseChosen, type RespostaConversa } from "@/lib/converse.functions";
import { toggleFavorite } from "@/lib/favorites";

const DAILY_LIMIT = 5;
const USAGE_KEY = "chosen_converse_usage_v1";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getUsageToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return 0;
    const obj = JSON.parse(raw) as { date: string; count: number };
    if (obj.date !== todayKey()) return 0;
    return obj.count ?? 0;
  } catch {
    return 0;
  }
}

function bumpUsage() {
  if (typeof window === "undefined") return;
  const current = getUsageToday();
  localStorage.setItem(
    USAGE_KEY,
    JSON.stringify({ date: todayKey(), count: current + 1 }),
  );
}

export const Route = createFileRoute("/converse")({
  head: () => ({
    meta: [
      { title: "Chosen com IA — Fale o que sente" },
      {
        name: "description",
        content:
          "Desabafe o que está sentindo agora e receba uma palavra bíblica escolhida para o seu momento, com acolhimento e oração.",
      },
    ],
  }),
  component: ConversePage,
});

function ConversePage() {
  const navigate = useNavigate();
  const chamar = useServerFn(converseChosen);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<RespostaConversa | null>(null);
  const [saved, setSaved] = useState(false);
  const [usadoHoje, setUsadoHoje] = useState(() => getUsageToday());

  const restantes = Math.max(0, DAILY_LIMIT - usadoHoje);
  const semSaldo = restantes === 0;

  const enviar = async () => {
    const t = texto.trim();
    if (t.length < 3) {
      toast.error("Escreva um pouquinho mais sobre o que você sente");
      return;
    }
    if (semSaldo) {
      toast.error("Você já usou suas 5 conversas de hoje", {
        description: "Volte amanhã. Enquanto isso, escolha um sentimento na home.",
      });
      return;
    }
    setLoading(true);
    setResposta(null);
    setSaved(false);
    try {
      const r = await chamar({ data: { texto: t } });
      setResposta(r);
      bumpUsage();
      setUsadoHoje(getUsageToday());
    } catch (err) {
      console.error(err);
      toast.error("Não deu para responder agora", {
        description: "Tente de novo em alguns segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const outraPalavra = () => {
    setResposta(null);
    setSaved(false);
  };

  const salvar = () => {
    if (!resposta) return;
    const id = `ia-${Date.now()}`;
    toggleFavorite({
      id,
      categoria: "IA",
      ref: resposta.referencia,
      text: resposta.versiculo,
    });
    setSaved(true);
    toast("Salvo em Minhas escolhidas 💛");
  };

  const compartilhar = async () => {
    if (!resposta) return;
    const texto = `"${resposta.versiculo}" — ${resposta.referencia}\n\n${resposta.acolhimento}\n\n${resposta.oracao}\n\nvia CHOSEN — https://chosen.oonn.com.br`;
    try {
      if (navigator.share) {
        await navigator.share({ text: texto });
      } else {
        await navigator.clipboard.writeText(texto);
        toast("Mensagem copiada 💛");
      }
    } catch {}
  };

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

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 sm:px-6 pt-2 pb-32">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-black" />
            <h1 className="text-sm font-light tracking-[0.3em] uppercase text-black">
              Chosen com IA
            </h1>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Escreva o que você está sentindo agora, com suas palavras. O Chosen escolhe um versículo pra você, com uma palavra de acolhimento e uma oração pra este momento.
          </p>

          {!resposta && (
            <div className="mt-6 flex flex-col gap-3">
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ex.: briguei com minha mãe e me sinto culpado, ela não fala comigo há dias..."
                rows={6}
                maxLength={1000}
                disabled={loading}
                className="resize-none rounded-2xl border-gray-200 text-base"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>
                  {restantes} de {DAILY_LIMIT} conversas hoje
                </span>
                <span>{texto.length}/1000</span>
              </div>
              <Button
                onClick={enviar}
                disabled={loading || semSaldo || texto.trim().length < 3}
                className="h-12 rounded-full bg-[#f1f26c] text-black hover:opacity-90 shadow-none flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">
                  {loading ? "Escutando você..." : "Receber uma palavra"}
                </span>
              </Button>
              {semSaldo && (
                <p className="text-[11px] text-center text-gray-400 mt-1">
                  Volte amanhã pra 5 novas conversas. Enquanto isso, escolha um sentimento na home.
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-8 flex flex-col items-center gap-3 text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
              </div>
              <p className="text-xs tracking-widest uppercase">Escolhendo uma palavra pra você</p>
            </div>
          )}

          {resposta && (
            <div className="mt-6 flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="rounded-2xl bg-[#f1f26c]/40 px-5 py-6 text-center">
                <p className="text-lg font-light leading-snug text-black break-words">
                  “{resposta.versiculo}”
                </p>
                <p className="mt-3 text-[11px] font-bold tracking-[0.25em] uppercase text-black/70">
                  {resposta.referencia}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-2">
                  Uma palavra pra você
                </p>
                <p className="text-[15px] leading-relaxed text-black whitespace-pre-line">
                  {resposta.acolhimento}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-2">
                  Uma oração pra este momento
                </p>
                <p className="text-[15px] leading-relaxed text-black italic whitespace-pre-line">
                  {resposta.oracao}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={salvar}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition ${
                    saved
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black/10 active:scale-95"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Salvo" : "Salvar"}
                </button>
                <button
                  onClick={compartilhar}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs text-black active:scale-95"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Compartilhar
                </button>
                <button
                  onClick={outraPalavra}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs text-black active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Nova conversa
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}