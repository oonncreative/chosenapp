import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  bootstrapAdmin,
  getPainelAdmin,
  marcarSenhaTrocada,
  registrarLoginFalho,
  registrarLoginOk,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

type Painel = Awaited<ReturnType<typeof getPainelAdmin>>;

function formatar(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function AdminHome() {
  const boot = useServerFn(bootstrapAdmin);
  const carregar = useServerFn(getPainelAdmin);
  const logOk = useServerFn(registrarLoginOk);
  const logFalha = useServerFn(registrarLoginFalho);
  const senhaTrocada = useServerFn(marcarSenhaTrocada);

  const [pronto, setPronto] = useState(false);
  const [painel, setPainel] = useState<Painel | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function atualizar() {
    try {
      const dados = await carregar({});
      setPainel(dados);
    } catch {
      setPainel(null);
    }
    setPronto(true);
  }

  useEffect(() => {
    void (async () => {
      try {
        await boot({});
      } catch {
        /* ignora */
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) await atualizar();
      else setPronto(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) {
      await logFalha({ data: { email: email.trim() } }).catch(() => {});
      toast.error("E-mail ou senha incorretos.");
      setEntrando(false);
      return;
    }
    await logOk({}).catch(() => {});
    setSenha("");
    await atualizar();
    setEntrando(false);
  }

  async function sair() {
    await supabase.auth.signOut();
    setPainel(null);
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 8) {
      toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setSalvandoSenha(true);
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
      current_password: senhaAtual,
    });
    if (error) {
      toast.error(error.message || "Não foi possível alterar a senha.");
      setSalvandoSenha(false);
      return;
    }
    await senhaTrocada({}).catch(() => {});
    setSenhaAtual("");
    setNovaSenha("");
    toast.success("Senha alterada.");
    await atualizar();
    setSalvandoSenha(false);
  }

  if (!pronto) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  if (!painel) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background px-6">
        <form onSubmit={entrar} className="w-full max-w-sm space-y-4">
          <div className="space-y-1 text-center">
            <p className="text-xs tracking-[0.3em] text-muted-foreground">CHOSEN</p>
            <h1 className="text-xl font-semibold text-foreground">Painel Admin</h1>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            autoComplete="username"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none"
            required
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none"
            required
          />
          <button
            type="submit"
            disabled={entrando}
            className="w-full rounded-xl bg-[#f1f26c] px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
          >
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  const total =
    painel.dispositivos.ios + painel.dispositivos.android + painel.dispositivos.web;

  return (
    <div className="h-[100dvh] overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-5 py-8 pb-20">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground">CHOSEN</p>
            <h1 className="text-xl font-semibold text-foreground">Painel Admin</h1>
          </div>
          <button onClick={sair} className="text-xs text-muted-foreground underline">
            Sair
          </button>
        </header>

        {painel.precisaTrocarSenha ? (
          <p className="rounded-xl bg-[#f1f26c] px-4 py-3 text-sm font-medium text-black">
            Sua senha ainda é a provisória. Troque logo abaixo.
          </p>
        ) : null}

        <section className="space-y-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Informações do admin</h2>
          <p className="text-sm text-muted-foreground">E-mail: {painel.email}</p>
          <p className="text-sm text-muted-foreground">Criado em: {formatar(painel.criadoEm)}</p>
          <p className="text-sm text-muted-foreground">
            Último acesso: {formatar(painel.ultimoAcesso)}
          </p>
        </section>

        <form
          onSubmit={trocarSenha}
          className="space-y-3 rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="text-sm font-semibold text-foreground">Alterar senha</h2>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Senha atual"
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
            required
          />
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Nova senha (mín. 8 caracteres)"
            autoComplete="new-password"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
            required
          />
          <button
            type="submit"
            disabled={salvandoSenha}
            className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
          >
            {salvandoSenha ? "Salvando…" : "Atualizar senha"}
          </button>
        </form>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Histórico de acesso</h2>
          <ul className="space-y-1.5">
            {painel.acessos.length === 0 ? (
              <li className="text-sm text-muted-foreground">Nenhum acesso registrado ainda.</li>
            ) : (
              painel.acessos.map((a) => (
                <li key={a.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatar(a.created_at)}</span>
                  <span className={a.success ? "text-foreground" : "text-destructive"}>
                    {a.success ? "entrou" : "falhou"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <Link
          to="/admin/push"
          className="flex items-center justify-between rounded-2xl bg-[#f1f26c] px-5 py-4 text-black"
        >
          <span className="text-sm font-semibold">Push</span>
          <span className="text-xs">
            {total} {total === 1 ? "aparelho" : "aparelhos"} ·{" "}
            {painel.campanhas.length} envios
          </span>
        </Link>
      </div>
    </div>
  );
}
