import { AppFooter } from "@/components/AppFooter";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/oracoes")({
  head: () => ({
    meta: [
      { title: 'Orações Diárias — Chosen' },
      { name: 'description', content: 'Orações para cada momento do seu dia.' },
    ],
  }),
  component: OracoesPage,
});

interface Oracao {
  titulo: string;
  texto: string;
  momento: string;
}

const ORACOES: Oracao[] = [
  {
    titulo: "Ao Acordar",
    momento: "Manhã",
    texto: "Pai santo, Tu és digno de toda honra e o dono deste novo dia. Obrigado por mais este fôlego de vida, pela minha família e por Teu cuidado enquanto dormi. Perdoa o que em mim não Te agrada e renova o meu coração. Peço sabedoria para as decisões de hoje, proteção para os meus e sensibilidade para servir quem cruzar meu caminho. Entrego este dia em Tuas mãos: seja feita a Tua vontade. Em nome de Jesus, amém."
  },
  {
    titulo: "Novo Ciclo",
    momento: "Algo Novo",
    texto: "Senhor, Tu és o Deus que faz novas todas as coisas e nada foge do Teu controle. Obrigado pelo que vivi até aqui, pelas lições e pelas pessoas que colocaste no meu caminho. Perdoa os medos e as amarguras que ainda carrego. Peço coragem para abraçar este novo ciclo, discernimento nas escolhas e um coração aberto ao que o Espírito quer fazer. Coloco este começo em Tuas mãos: conduz-me segundo a Tua vontade. Em nome de Jesus, amém."
  },
  {
    titulo: "Novo Projeto",
    momento: "Algo Novo",
    texto: "Pai poderoso, tudo o que existe vem de Ti e é para Tua glória. Obrigado por sonhar comigo e por abrir este novo projeto diante dos meus olhos. Perdoa o orgulho e a pressa que às vezes me dominam. Peço sabedoria para planejar, disciplina para executar e integridade em cada passo; que meu trabalho produza fruto e abençoe outras vidas. Entrego este projeto ao Senhor: se for da Tua vontade, prospere; se não for, redireciona. Em nome de Jesus, amém."
  },
  {
    titulo: "Nova Amizade",
    momento: "Algo Novo",
    texto: "Deus de amor, Tu és o autor de todo bom relacionamento. Obrigado pelas novas pessoas que colocaste em minha vida. Perdoa as vezes em que fui egoísta ou julguei sem entender. Peço que esta amizade seja marcada pela verdade, pelo respeito e pelo cuidado mútuo, e que sejamos bênção um na vida do outro. Entrego este vínculo a Ti: molda-o conforme a Tua vontade. Em nome de Jesus, amém."
  },
  {
    titulo: "Nova Fase Espiritual",
    momento: "Algo Novo",
    texto: "Senhor santo, Tu és o Deus que chama, restaura e envia. Obrigado por não desistir de mim e por me convidar a caminhar mais perto de Ti. Perdoa o que ficou para trás e me livra de voltar ao que me afastava do Teu propósito. Peço fome da Tua Palavra, sede da Tua presença e coragem para obedecer. Entrego esta nova fase espiritual em Tuas mãos: faz de mim o que quiseres. Em nome de Jesus, amém."
  },
  {
    titulo: "Gratidão nas Refeições",
    momento: "Refeição",
    texto: "Pai bondoso, Tu és quem sustenta toda vida e enche a terra de frutos. Obrigado pelo alimento sobre esta mesa e por quem trabalhou para que ele chegasse até nós. Perdoa quando esquecemos que tudo vem de Ti. Peço que nunca falte o pão a quem tem fome e que a Tua Palavra também nutra nosso espírito. Entregamos este momento em Tuas mãos: abençoa esta mesa e esta família. Em nome de Jesus, amém."
  },
  {
    titulo: "Ao Deitar",
    momento: "Noite",
    texto: "Senhor, Tu és o Deus que não dorme nem cochila e que guarda a minha vida. Obrigado por cada bênção deste dia, pelas alegrias e até pelas dificuldades que me ensinaram a confiar mais em Ti. Perdoa minhas palavras e atitudes que não Te honraram. Peço descanso para o corpo, paz para a mente e cura para o que ficou dolorido. Entrego a noite em Tuas mãos: cuida do meu lar e renova minhas forças para o amanhã. Em nome de Jesus, amém."
  },
  {
    titulo: "Paz na Casa",
    momento: "Noite",
    texto: "Pai celestial, Tua presença é a nossa segurança e o nosso refúgio. Obrigado por este lar e por cada pessoa que vive debaixo deste teto. Perdoa as brigas, as palavras duras e as mágoas que ficaram no dia. Peço que a Tua paz visite esta casa, afaste toda inquietação e que possamos repousar sob as Tuas asas. Entregamos este lar em Tuas mãos: guarda-nos enquanto dormimos. Em nome de Jesus, amém."
  },
  {
    titulo: "Força no Desafio",
    momento: "Sempre",
    texto: "Deus forte, Tu és a minha rocha e o meu socorro bem presente na angústia. Obrigado porque, mesmo no meio da luta, Tu não me abandonas. Perdoa o desânimo e a falta de fé que às vezes tomam conta de mim. Peço que renoves as minhas forças, me dês coragem para não desistir e sabedoria para vencer este desafio com integridade. Entrego esta batalha ao Senhor: pelejas por mim e cumpre em mim a Tua vontade. Em nome de Jesus, amém."
  },
  {
    titulo: "Paz na Ansiedade",
    momento: "Sempre",
    texto: "Pai de toda consolação, Tu és o Deus que acalma tempestades e cuida do menor detalhe da minha vida. Obrigado por me convidar a lançar sobre Ti todas as minhas ansiedades. Perdoa a incredulidade que me faz carregar o que já é Teu. Peço que a Tua paz, que excede todo entendimento, guarde o meu coração e a minha mente agora; silencia os pensamentos que me acusam e me lembra das Tuas promessas. Entrego esta ansiedade em Tuas mãos. Em nome de Jesus, amém."
  },
  {
    titulo: "Pela Sabedoria",
    momento: "Sempre",
    texto: "Espírito Santo, Tu és o Consolador que ensina, guia e revela a verdade. Obrigado porque prometeste dar sabedoria a quem pede com fé. Perdoa quando confiei apenas no meu entendimento. Peço luz para enxergar o certo, coragem para escolher o certo e discernimento para não me deixar enganar. Entrego minhas decisões em Tuas mãos: guia-me pelo caminho da Tua vontade. Em nome de Jesus, amém."
  },
  {
    titulo: "Saúde e Cura",
    momento: "Sempre",
    texto: "Senhor, Tu és o Deus que cura e que sopra vida onde parece não haver. Obrigado por cada respiração, por cada batida do coração e pelo cuidado que tens comigo. Perdoa quando negligenciei o corpo e a alma que me confiaste. Peço cura física, emocional e espiritual; restaura o que está ferido e renova as minhas forças. Entrego minha saúde em Tuas mãos: seja feita a Tua vontade em minha vida. Em nome de Jesus, amém."
  },
  {
    titulo: "Proteção da Família",
    momento: "Sempre",
    texto: "Pai santo, Tu és o guardião da minha família e nenhum mal escapa aos Teus olhos. Obrigado por cada pessoa que colocaste na minha vida e pelo lar que me deste. Perdoa as vezes em que fui a causa de dor dentro de casa. Peço proteção sobre cada um, unidade no amor, cura das feridas antigas e fé viva em nossos corações. Entrego a minha família em Tuas mãos: guarda-nos em Teu amor e em Tua verdade. Em nome de Jesus, amém."
  },
  {
    titulo: "Pelo Próximo",
    momento: "Sempre",
    texto: "Deus de amor, Tu Te importas com cada vida e ouves o clamor do que sofre. Obrigado por me lembrar que não vivo só para mim. Perdoa a indiferença e a dureza do meu coração diante da dor do outro. Peço olhos para enxergar quem precisa, mãos dispostas a ajudar e palavras que curem em vez de ferir; conforta quem chora, sustenta quem está doente e guarda quem se sente sozinho. Entrego essas vidas em Tuas mãos. Em nome de Jesus, amém."
  },
  {
    titulo: "Trabalho e Estudo",
    momento: "Sempre",
    texto: "Senhor, Tu és o Deus que capacita e concede talentos para o Teu propósito. Obrigado pelas oportunidades de trabalhar e estudar, e por cada pessoa que caminha comigo nesta jornada. Perdoa o desânimo, a preguiça e a comparação que roubam minha paz. Peço sabedoria, foco, disciplina e integridade; que meu esforço seja feito para Ti e traga fruto. Entrego minhas tarefas em Tuas mãos: honra o que fizer segundo a Tua vontade. Em nome de Jesus, amém."
  },
  {
    titulo: "Luz no Caminho",
    momento: "Sempre",
    texto: "Pai fiel, Tua Palavra é lâmpada para os meus pés e luz para o meu caminho. Obrigado por não me deixar andar em trevas e por sempre me mostrar por onde ir. Perdoa quando escolhi atalhos e me afastei da Tua vontade. Peço direção clara, sensibilidade à voz do Espírito e coragem para obedecer, mesmo quando o caminho parece difícil. Entrego meus passos em Tuas mãos: guia-me até o fim. Em nome de Jesus, amém."
  },
  {
    titulo: "Perdão e Reconciliação",
    momento: "Sempre",
    texto: "Senhor misericordioso, Tu és o Deus que perdoa e que reconcilia. Obrigado porque a Tua graça é maior que as minhas falhas. Reconheço meus pecados diante de Ti: perdoa pensamentos, palavras e atitudes que feriram outras pessoas e entristeceram o Teu coração. Peço um coração humilde para pedir perdão a quem magoei e disposição para perdoar quem me magoou. Entrego essas relações em Tuas mãos: cura o que só Tu podes curar. Em nome de Jesus, amém."
  },
  {
    titulo: "Provisão e Finanças",
    momento: "Sempre",
    texto: "Pai provedor, Tu és o dono do ouro e da prata e sabes exatamente daquilo que preciso. Obrigado por cada pão que colocaste na minha mesa até hoje. Perdoa a ganância, a ansiedade com o amanhã e a falta de gratidão pelo que já tenho. Peço sabedoria para administrar o que me confias, portas abertas para o trabalho honesto e um coração generoso com quem tem menos. Entrego minhas finanças em Tuas mãos: seja feita a Tua vontade. Em nome de Jesus, amém."
  }
];

function OracoesPage() {
  const [expandida, setExpandida] = useState<number | null>(null);
  const [guiaAberto, setGuiaAberto] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col w-full max-w-[100vw]">
      <header className="sticky top-0 px-4 sm:px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-2 flex flex-col gap-3 shrink-0 bg-white z-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h1 className="truncate text-sm sm:text-base font-light tracking-[0.4em] text-black uppercase">ORAÇÕES</h1>
          
          <div className="flex items-center gap-0 shrink-0">
            <button 
              onClick={() => {
                const current = document.documentElement.classList.contains('grayscale');
                const next = !current;
                localStorage.setItem('isMono', next.toString());
                if (next) {
                  document.documentElement.classList.add('grayscale');
                } else {
                  document.documentElement.classList.remove('grayscale');
                }
              }}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title="Modo Minimalista"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
              </svg>
            </button>
            <button 
              onClick={() => {
                setExpandida(null);
                navigate({ to: "/home" });
              }}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 -mr-2 transition-opacity active:opacity-50"
              title="Voltar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-1">
          <h1 className="text-sm sm:text-base font-light tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase">Momentos com Deus</h1>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 pb-12 pt-2">
        <div className="mb-4 border border-black/10 rounded-sm bg-black/[0.02]">
          <button
            type="button"
            onClick={() => setGuiaAberto((v) => !v)}
            aria-expanded={guiaAberto}
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:opacity-60 transition-opacity"
          >
            <span className="flex-1 min-w-0 text-[11px] sm:text-xs font-light tracking-[0.3em] uppercase text-black">
              Como orar · Guia ACTS
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`shrink-0 text-black/50 transition-transform duration-300 ${guiaAberto ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={`grid transition-all duration-300 ease-out ${guiaAberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <div className="px-4 pb-5 text-[14px] leading-relaxed text-black/80 font-light space-y-4">
                <p>Não existe uma fórmula obrigatória para Deus ouvir uma oração, mas muitos cristãos usam uma estrutura simples que ajuda a organizar o coração e os pensamentos.</p>

                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-black/50 mb-1">Adoração</p>
                  <p>Reconheça quem Deus é — Seu caráter, Seu amor, Sua santidade e Seu poder.</p>
                  <p className="italic text-black/60 mt-1">"Pai, Tu és santo, fiel, poderoso e digno de toda honra."</p>
                </div>

                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-black/50 mb-1">Gratidão</p>
                  <p>Agradeça pela vida, pela família, pelo cuidado diário e até pelas dificuldades que trazem aprendizado.</p>
                  <p className="italic text-black/60 mt-1">"Obrigado por cuidar de mim e por nunca me abandonar."</p>
                </div>

                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-black/50 mb-1">Confissão</p>
                  <p>Reconheça seus pecados e peça perdão com sinceridade.</p>
                  <p className="italic text-black/60 mt-1">"Perdoa minhas falhas e atitudes que não Te agradaram."</p>
                </div>

                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-black/50 mb-1">Súplica</p>
                  <p>Apresente suas necessidades e interceda por outras pessoas.</p>
                  <p className="italic text-black/60 mt-1">"Peço sabedoria, proteção para os meus e força para os desafios."</p>
                </div>

                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-black/50 mb-1">Entrega</p>
                  <p>Coloque tudo nas mãos de Deus, confiando na vontade d'Ele.</p>
                  <p className="italic text-black/60 mt-1">"Seja feita a Tua vontade. Em nome de Jesus, amém."</p>
                </div>

                <p className="text-black/70">Essa estrutura é conhecida pelo acrônimo <strong className="font-medium">ACTS</strong>: Adoração, Confissão, <em>Thanksgiving</em> (Gratidão) e <em>Supplication</em> (Súplica).</p>

                <p>O próprio Jesus ensinou um modelo em <strong className="font-medium">Mateus 6:9-13</strong>, o Pai Nosso, começando por glorificar a Deus: <em>"Pai nosso que estás nos céus, santificado seja o teu nome…"</em></p>

                <p className="text-black/70">A Bíblia enfatiza a sinceridade do coração. A estrutura ajuda, mas Deus não exige palavras específicas — oração é, acima de tudo, uma conversa honesta com Ele.</p>
              </div>
            </div>
          </div>
        </div>

        <ul className="flex flex-col w-full divide-y divide-black/10">
          {ORACOES.map((oracao, index) => {
            const isExpanded = expandida === index;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setExpandida(isExpanded ? null : index)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center gap-3 py-5 text-left active:opacity-60 transition-opacity"
                >
                  <span className="flex-1 min-w-0 text-base sm:text-lg font-medium tracking-tight uppercase text-black truncate">
                    {oracao.titulo}
                  </span>
                  <span className="shrink-0 text-[10px] font-light tracking-[0.25em] uppercase text-black/40">
                    {oracao.momento}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`shrink-0 text-black/50 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[15px] sm:text-base leading-relaxed text-black/80 font-light break-words pr-6">
                      {oracao.texto}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <AppFooter />
    </div>
  );
}