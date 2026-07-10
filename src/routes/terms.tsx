import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — CHOSEN" },
      {
        name: "description",
        content:
          "Termos de uso do aplicativo CHOSEN: regras de utilização, propriedade do conteúdo bíblico e devocional, isenções e contato.",
      },
      { property: "og:title", content: "Termos de Uso — CHOSEN" },
      {
        property: "og:description",
        content:
          "Leia os termos de uso do CHOSEN antes de utilizar o aplicativo.",
      },
      { property: "og:url", content: "https://chosen.oonn.com.br/terms" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://chosen.oonn.com.br/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
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
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Última atualização: 10 de julho de 2026
        </p>

        <section className="prose prose-neutral mt-8 max-w-none space-y-6 text-[15px] leading-relaxed text-black/80">
          <p>
            Bem-vindo(a) ao <strong>CHOSEN</strong>. Ao instalar, acessar ou
            utilizar o aplicativo, você concorda com os termos descritos abaixo.
            Leia com atenção.
          </p>

          <div>
            <h2 className="text-lg font-bold text-black">1. Sobre o app</h2>
            <p className="mt-2">
              O CHOSEN é um aplicativo cristão de acolhimento, oração,
              devocionais e conteúdo bíblico, oferecido de forma gratuita e sem
              cadastro. Seu objetivo é servir como companheiro de fé no
              dia a dia, entregando uma palavra, oração ou reflexão adequada ao
              momento do usuário.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              2. Uso permitido
            </h2>
            <p className="mt-2">
              Você pode utilizar o CHOSEN livremente para uso pessoal,
              devocional e não comercial. Não é permitido:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>copiar, revender ou redistribuir o app ou seus conteúdos como se fossem seus;</li>
              <li>usar o app para fins ilícitos, ofensivos ou contrários à fé cristã;</li>
              <li>tentar burlar, descompilar ou explorar falhas de segurança do aplicativo;</li>
              <li>utilizar o app para disseminar conteúdo de ódio, discriminação ou desinformação.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              3. Propriedade do conteúdo
            </h2>
            <p className="mt-2">
              As Escrituras Sagradas são de domínio público. Os textos
              pastorais, devocionais, orações guiadas, ilustrações, mascotes,
              nome "CHOSEN", identidade visual, código e interface do
              aplicativo são de propriedade dos autores do app. É permitido
              compartilhar mensagens individuais geradas pelo app (por exemplo,
              cards de versículos) em suas redes pessoais, desde que sem
              alteração do conteúdo e mantendo a referência ao CHOSEN.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              4. Conteúdo gerado por IA
            </h2>
            <p className="mt-2">
              O recurso "Converse com o CHOSEN" utiliza inteligência artificial
              para gerar palavras de acolhimento e orações a partir do que o
              usuário escreve. Apesar do cuidado no desenvolvimento, respostas
              geradas por IA podem eventualmente conter imprecisões. O CHOSEN
              não substitui aconselhamento pastoral, psicológico, médico ou
              jurídico.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              5. Isenção de responsabilidade
            </h2>
            <p className="mt-2">
              O CHOSEN é oferecido "como está". Fazemos o melhor para manter o
              aplicativo estável, atualizado e livre de erros, mas não
              garantimos que ele funcionará ininterruptamente ou sem falhas em
              qualquer dispositivo. Na medida máxima permitida por lei, não nos
              responsabilizamos por decisões tomadas com base nas mensagens
              exibidas ou por eventuais danos indiretos decorrentes do uso do
              app.
            </p>
            <p className="mt-2">
              Em situações de emergência emocional ou risco à vida, procure
              ajuda imediata: no Brasil, o <strong>CVV — 188</strong> atende
              24 horas, gratuitamente.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              6. Alterações e encerramento
            </h2>
            <p className="mt-2">
              Podemos atualizar, modificar ou descontinuar recursos do CHOSEN a
              qualquer momento, com o objetivo de melhorar a experiência ou
              atender a exigências legais e das lojas de aplicativos.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">
              7. Legislação aplicável
            </h2>
            <p className="mt-2">
              Estes termos são regidos pelas leis da República Federativa do
              Brasil.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black">8. Contato</h2>
            <p className="mt-2">
              Para dúvidas, sugestões ou solicitações sobre o CHOSEN, entre em
              contato:{" "}
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