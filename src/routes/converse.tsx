import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, Sparkles, RefreshCw, ChevronDown, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { converseChosen, type RespostaConversa } from "@/lib/converse.functions";
import { toggleFavorite } from "@/lib/favorites";

const DAILY_LIMIT = 2;
const USAGE_KEY = "chosen_converse_usage_v2";
const HISTORY_KEY = "chosen_converse_history_v1";
const HISTORY_TTL_MS = 24 * 60 * 60 * 1000;

type HistoryItem = {
  id: string;
  at: number;
  pergunta: string;
  resposta: RespostaConversa;
};

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list: HistoryItem[] = JSON.parse(raw);
    const now = Date.now();
    const fresh = list.filter((h) => now - h.at < HISTORY_TTL_MS);
    if (fresh.length !== list.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(fresh));
    }
    return fresh.sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

function pushHistory(item: HistoryItem) {
  const list = loadHistory();
  const next = [item, ...list].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function removeHistory(id: string) {
  const next = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function formatRestante(at: number): string {
  const restante = HISTORY_TTL_MS - (Date.now() - at);
  if (restante <= 0) return "expirando";
  const h = Math.floor(restante / (60 * 60 * 1000));
  const m = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
  if (h > 0) return `expira em ${h}h`;
  return `expira em ${m}min`;
}

const EXEMPLOS = [
  "briguei com minha mãe e me sinto culpado, ela não fala comigo há dias...",
  "tô ansioso com o trabalho, sinto que não vou dar conta de tudo esta semana",
  "tô me sentindo sozinho, faz tempo que não converso de verdade com ninguém",
  "perdi alguém que eu amo e não sei como seguir daqui pra frente",
  "tô com medo do futuro, não sei que decisão tomar agora",
];

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

  // Placeholder cycling
  const [placeholderIdx, setPlaceholderIdx] = useState(() =>
    Math.floor(Math.random() * EXEMPLOS.length),
  );
  useEffect(() => {
    if (texto.length > 0 || resposta) return;
    const id = window.setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % EXEMPLOS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [texto, resposta]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Auto-grow
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [texto]);

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

  const podeEnviar = !loading && !semSaldo && texto.trim().length >= 3;

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col bg-white"
      style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
    >
      <header className="shrink-0 grid grid-cols-3 h-14 items-center px-4">
        <Link
          to="/home"
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <div className="flex items-center justify-center gap-1.5">
          <img src={chosenLogo} alt="" className="h-5 w-5 object-contain" />
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-black/60">
            IA
          </span>
        </div>
        <span />
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5">
        <div className="mx-auto w-full max-w-md pb-40">
          {!resposta && !loading && (
            <div className="flex flex-col pt-4">
              <div className="text-center">
                <h1 className="text-[24px] leading-tight font-light text-black tracking-tight">
                  Como você está<br />se sentindo agora?
                </h1>
                <p className="mt-2 text-[13px] text-gray-400 leading-relaxed">
                  Escreva com suas palavras.
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 border border-black/5 focus-within:border-black/20 transition">
                <textarea
                  ref={textareaRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={`Ex.: ${EXEMPLOS[placeholderIdx]}`}
                  rows={6}
                  maxLength={1000}
                  disabled={loading || semSaldo}
                  className="w-full resize-none bg-transparent outline-none text-[15px] text-black placeholder:text-gray-400 leading-relaxed px-4 py-3 rounded-2xl"
                  style={{ minHeight: "160px" }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-400">
                <span>
                  {semSaldo
                    ? "Sem conversas hoje — volte amanhã"
                    : `${restantes} de ${DAILY_LIMIT} conversas por dia`}
                </span>
                <span>{texto.length}/1000</span>
              </div>

              <button
                onClick={enviar}
                disabled={!podeEnviar}
                className="mt-4 h-12 w-full rounded-full bg-[#f1f26c] text-black font-semibold text-sm tracking-wide flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 active:scale-[0.98] transition shadow-sm"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                Receber uma palavra
              </button>

              <p className="mt-3 text-center text-[10px] text-gray-400 leading-relaxed">
                Limite de 2 conversas por dia · até 1000 caracteres por mensagem
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
              <img src={chosenLogo} alt="" className="h-10 w-10 object-contain animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase">Escolhendo pra você</p>
            </div>
          )}

          {resposta && (
            <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
              <div className="text-center">
                <p className="text-[22px] font-light leading-snug text-black break-words">
                  “{resposta.versiculo}”
                </p>
                <p className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase text-black/50">
                  {resposta.referencia}
                </p>
              </div>

              <div className="h-px bg-black/5" />

              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">
                  Pra você
                </p>
                <p className="text-[15px] leading-relaxed text-black whitespace-pre-line">
                  {resposta.acolhimento}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">
                  Oração
                </p>
                <p className="text-[15px] leading-relaxed text-black/80 italic whitespace-pre-line">
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
                  Nova
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}