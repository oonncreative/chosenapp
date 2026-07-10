import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — CHOSEN" },
      {
        name: "description",
        content:
          "Política de privacidade do CHOSEN: o app não coleta dados pessoais, não exige login e mantém tudo salvo localmente no seu aparelho.",
      },
      { property: "og:title", content: "Política de Privacidade — CHOSEN" },
      {
        property: "og:description",
        content:
          "O CHOSEN respeita sua privacidade. Sem cadastro, sem coleta de dados pessoais, sem compartilhamento com terceiros.",
      },
      { property: "og:url", content: "https://chosen.oonn.com.br/privacy" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://chosen.oonn.com.br/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-background px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-32">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-block text-xs font-bold tracking-[0.25em] text-black/60 uppercase"
        >
          ← Voltar
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-black">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Última atualização: 10 de julho de 2026
        </p>

        <section className="prose prose-neutral mt-8 max-w-none space-y-6 text-[15px] leading-relaxed text-black/80">
          <p>
            Esta Política de Privacidade descreve como o aplicativo{" "}
            <strong>CHOSEN</strong> ("app", "nós") trata as informações
            relacionadas ao seu uso. A privacidade dos usuários é prioridade — e
            o CHOSEN foi construído para funcionar com o mínimo possível de
            dados.
          </p>

          <div>
            <h2 className="text-lg font-bold text-black">
              1. Dados pessoais coletados
            </h2>
            <p className="mt-2">
              <strong>Nenhum dado pessoal é coletado pelo CHOSEN.</strong> O app
              não exige cadastro, não pede nome, e-mail, telefone, localização,
              contatos, fotos ou qualquer outra informação pessoal para
              funcionar.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              2. Notificações locais
            </h2>
            <p className="mt-2">
              O CHOSEN envia notificações de incentivo, versículos e lembretes
              espirituais durante o dia. Essas notificações são{" "}
              <strong>agendadas localmente no seu próprio aparelho</strong>. Não
              existem servidores nossos enviando push para você — nada sai do
              seu dispositivo. Você pode desativar as notificações a qualquer
              momento nas configurações do sistema.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              3. Conteúdo salvo no aparelho
            </h2>
            <p className="mt-2">
              Informações como mensagens favoritas ("Escolhidas"), preferências
              de horário/tema, momentos de gratidão e histórico de uso ficam
              armazenadas <strong>apenas no armazenamento local</strong> do seu
              dispositivo (localStorage / storage nativo). Esses dados nunca são
              enviados para nós nem para nenhum terceiro. Ao desinstalar o app,
              esse conteúdo é apagado do aparelho.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              4. Conversa com o CHOSEN (IA)
            </h2>
            <p className="mt-2">
              Quando o usuário utiliza o recurso "Converse com o CHOSEN", o
              texto digitado é enviado, apenas naquele momento, para o serviço
              de IA que gera a resposta pastoral. O conteúdo{" "}
              <strong>não é vinculado à sua identidade</strong> (não há login),
              não é armazenado por nós e serve exclusivamente para gerar a
              palavra de acolhimento e a oração devolvidas na tela.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              5. Compartilhamento com terceiros
            </h2>
            <p className="mt-2">
              <strong>Não compartilhamos dados com terceiros.</strong> O CHOSEN
              não vende, aluga nem troca informações com anunciantes, redes
              sociais ou parceiros comerciais.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              6. Crianças
            </h2>
            <p className="mt-2">
              O CHOSEN pode ser utilizado livremente por qualquer pessoa. Como
              não coletamos dados pessoais, não realizamos tratamento de dados
              de menores.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              7. Alterações nesta política
            </h2>
            <p className="mt-2">
              Podemos atualizar esta Política de Privacidade para refletir
              melhorias no app ou exigências legais. A data no topo desta página
              indica a versão mais recente.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">8. Contato</h2>
            <p className="mt-2">
              Dúvidas, sugestões ou solicitações relacionadas à privacidade
              podem ser enviadas para:{" "}
              <a
                href="mailto:contato@oonn.com.br"
                className="font-semibold underline"
              >
                contato@oonn.com.br
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}