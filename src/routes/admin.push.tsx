import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { enviarPush, getPainelAdmin } from "@/lib/admin.functions";
import { searchMensagens } from "@/lib/searchMensagens";
import { ORACOES_CURTAS } from "@/lib/oracoesCurtas";

export const Route = createFileRoute("/admin/push")({
  component: AdminPush,
});

type Painel = Awaited<ReturnType<typeof getPainelAdmin>>;

const DESTINOS = [
  { valor: "/", rotulo: "Abrir o app" },
  { valor: "/biblia", rotulo: "Bíblia (onde a pessoa parou)" },
  { valor: "/converse", rotulo: "Chosen IA" },
  { valor: "/oracoes", rotulo: "Orações" },
  { valor: "/devocional", rotulo: "Devocional de 3 minutos" },
];

const PUBLICOS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ios", rotulo: "Só iPhone" },
  { valor: "android", rotulo: "Só Android" },
  { valor: "web", rotulo: "Só navegador" },
] as const;

function formatar(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function AdminPush() {
  const navigate = useNavigate();
  const carregar = useServerFn(getPainelAdmin);
  const disparar = useServerFn(enviarPush);

  const [painel, setPainel] = useState<Painel | null>(null);
  const [pronto, setPronto] = useState(false);

  const [busca, setBusca] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [destino, setDestino] = useState("/");
  const [publico, setPublico] = useState<(typeof PUBLICOS)[number]["valor"]>("todos");
  const [agendar, setAgendar] = useState(false);
  const [quando, setQuando] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function atualizar() {
    try {
      setPainel(await carregar({}));
    } catch {
      void navigate({ to: "/admin", replace: true });
    }
    setPronto(true);
  }

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        void navigate({ to: "/admin", replace: true });
        return;
      }
      await atualizar();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resultados = useMemo(() => {
    const termo = busca.trim();
    if (termo.length < 2) return [] as { titulo: string; texto: string }[];
    const frases = searchMensagens(termo, 10).map((h) => ({
      titulo: h.referencia,
      texto: h.texto,
    }));
    const alvo = termo.toLowerCase();
    const oracoes = ORACOES_CURTAS.filter((o) => o.text.toLowerCase().includes(alvo))
      .slice(0, 5)
      .map((o) => ({ titulo: o.ref, texto: o.text }));
    return [...frases, ...oracoes].slice(0, 12);
  }, [busca]);

  const alvos = painel
    ? publico === "todos"
      ? painel.dispositivos.ios + painel.dispositivos.android + painel.dispositivos.web
      : painel.dispositivos[publico]
    : 0;

  async function enviar(teste: boolean) {
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }
    if (agendar && !quando) {
      toast.error("Escolha a data e a hora do agendamento.");
      return;
    }
    if (!teste && !agendar) {
      const ok = window.confirm(
        `Enviar agora para ${alvos} ${alvos === 1 ? "aparelho" : "aparelhos"}?`,
      );
      if (!ok) return;
    }
    setEnviando(true);
    try {
      const r = await disparar({
        data: {
          titulo: titulo.trim(),
          mensagem: mensagem.trim(),
          destino,
          publico,
          teste,
          agendadoPara: agendar && quando ? new Date(quando).toISOString() : null,
        },
      });
      if (r.status === "agendada") toast.success("Mensagem agendada.");
      else if (r.status === "pendente_configuracao")
        toast.warning("Guardado, mas o envio ainda depende de conectar o serviço de notificações.");
      else toast.success(`Enviado para ${r.enviados} de ${r.alvos}.`);
      await atualizar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
    setEnviando(false);
  }

  if (!pronto) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-5 py-8 pb-24">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground">CHOSEN</p>
            <h1 className="text-xl font-semibold text-foreground">Push</h1>
          </div>
          <Link to="/admin" className="text-xs text-muted-foreground underline">
            Voltar
          </Link>
        </header>

        {painel && alvos === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Nenhum aparelho registrado ainda. As mensagens ficam guardadas e o envio começa a
            funcionar quando o serviço de notificações estiver conectado e o app atualizado nas
            lojas.
          </p>
        ) : null}

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Buscar uma frase do app</h2>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: paz, ansiedade, salmo 23…"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
          />
          <ul className="space-y-2">
            {resultados.map((r, i) => (
              <li key={`${r.titulo}-${i}`}>
                <button
                  onClick={() => {
                    setTitulo(r.titulo);
                    setMensagem(r.texto);
                  }}
                  className="w-full rounded-xl border border-border px-4 py-3 text-left"
                >
                  <span className="block text-xs text-muted-foreground">{r.titulo}</span>
                  <span className="block text-sm text-foreground">{r.texto}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Mensagem</h2>
          <div>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, 80))}
              placeholder="Título"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{titulo.length}/80</p>
          </div>
          <div>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value.slice(0, 300))}
              placeholder="Mensagem"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{mensagem.length}/300</p>
          </div>

          <div className="rounded-xl bg-foreground/90 p-4">
            <p className="text-xs text-background/70">Prévia na tela de bloqueio</p>
            <p className="mt-2 truncate text-sm font-semibold text-background">
              {titulo || "Título da mensagem"}
            </p>
            <p className="line-clamp-2 text-sm text-background/85">
              {mensagem || "Texto que a pessoa vai ler."}
            </p>
          </div>

          <label className="block text-xs text-muted-foreground">Ao tocar, abrir</label>
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
          >
            {DESTINOS.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.rotulo}
              </option>
            ))}
          </select>

          <label className="block text-xs text-muted-foreground">Para quem</label>
          <select
            value={publico}
            onChange={(e) => setPublico(e.target.value as typeof publico)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
          >
            {PUBLICOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={agendar}
              onChange={(e) => setAgendar(e.target.checked)}
            />
            Agendar para depois
          </label>
          {agendar ? (
            <input
              type="datetime-local"
              value={quando}
              onChange={(e) => setQuando(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
            />
          ) : null}

          <p className="text-xs text-muted-foreground">
            Vai para {alvos} {alvos === 1 ? "aparelho" : "aparelhos"}.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => void enviar(false)}
              disabled={enviando}
              className="rounded-xl bg-[#f1f26c] px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
            >
              {enviando ? "Enviando…" : agendar ? "Agendar envio" : "Enviar para todos"}
            </button>
            <button
              onClick={() => void enviar(true)}
              disabled={enviando}
              className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground disabled:opacity-60"
            >
              Enviar só para mim (teste)
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Histórico de envios</h2>
          {!painel || painel.campanhas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum envio ainda.</p>
          ) : (
            <ul className="space-y-3">
              {painel.campanhas.map((c) => (
                <li key={c.id} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-medium text-foreground">{c.titulo}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{c.mensagem}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatar(c.enviado_em ?? c.agendado_para ?? c.created_at)} ·{" "}
                    {c.status === "pendente_configuracao" ? "aguardando configuração" : c.status} ·{" "}
                    {c.total_enviado}/{c.total_alvo}
                    {c.total_falha ? ` · ${c.total_falha} falhas` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
