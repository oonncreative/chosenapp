import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";

export const Route = createFileRoute("/devocional")({
  head: () => ({
    meta: [
      { title: "Devocional de 3 minutos — Chosen" },
      {
        name: "description",
        content:
          "Um versículo, uma pergunta pra pensar e uma oração curta. Um por dia.",
      },
    ],
  }),
  component: DevocionalPage,
});

interface Devocional {
  versiculo: string;
  referencia: string;
  pergunta: string;
  oracao: string;
}

const DEVOCIONAIS: Devocional[] = [
  {
    versiculo: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
    referencia: "Salmos 37:5",
    pergunta: "O que você está tentando controlar sozinho hoje e precisa entregar a Deus?",
    oracao:
      "Senhor, hoje eu solto o que não é meu pra carregar. Entrego meus planos, meus medos e meus dias nas Tuas mãos. Confio que o Teu cuidado vai muito além do que eu consigo enxergar. Em nome de Jesus, amém.",
  },
  {
    versiculo: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    referencia: "Isaías 41:10",
    pergunta: "Onde o medo tem te paralisado ultimamente?",
    oracao:
      "Pai, obrigado por não me deixar sozinho. Toma o meu medo e coloca no lugar a Tua paz. Que hoje eu ande com a certeza de que Tu vais na minha frente. Em nome de Jesus, amém.",
  },
  {
    versiculo: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
    referencia: "Mateus 11:28",
    pergunta: "O que está pesando demais no seu coração agora?",
    oracao:
      "Jesus, eu venho como estou. Descanso em Ti o que me esgota e recebo o Teu alívio. Renova as minhas forças e ajuda-me a andar leve hoje. Em nome de Jesus, amém.",
  },
  {
    versiculo: "Buscai primeiro o Reino de Deus, e a sua justiça, e todas as coisas vos serão acrescentadas.",
    referencia: "Mateus 6:33",
    pergunta: "O que tem tomado o primeiro lugar dentro de você essa semana?",
    oracao:
      "Senhor, coloca no meu coração o desejo de Te buscar antes de tudo. Que as minhas escolhas de hoje reflitam o Teu Reino. Em nome de Jesus, amém.",
  },
  {
    versiculo: "O Senhor é o meu pastor; nada me faltará.",
    referencia: "Salmos 23:1",
    pergunta: "Em que área da sua vida você precisa lembrar que Deus já está cuidando?",
    oracao:
      "Bom Pastor, obrigado por conhecer cada uma das minhas necessidades. Ensina-me a confiar no Teu tempo e a descansar no Teu cuidado. Em nome de Jesus, amém.",
  },
  {
    versiculo: "Alegrai-vos sempre. Orai sem cessar. Em tudo dai graças.",
    referencia: "1 Tessalonicenses 5:16-18",
    pergunta: "Pelo que, mesmo pequeno, você pode agradecer agora mesmo?",
    oracao:
      "Pai, hoje eu escolho ver a Tua bondade nos detalhes. Obrigado pelo fôlego, pelas pessoas e pelo que ainda vou viver. Que a gratidão me acompanhe o dia todo. Em nome de Jesus, amém.",
  },
  {
    versiculo: "Bem-aventurados os que têm limpo o coração, porque eles verão a Deus.",
    referencia: "Mateus 5:8",
    pergunta: "Existe algo que Deus tem pedido pra você largar pra andar mais leve com Ele?",
    oracao:
      "Senhor, sonda o meu coração e mostra o que precisa mudar. Purifica o que me afasta de Ti e me dá coragem pra andar em verdade. Em nome de Jesus, amém.",
  },
];

function daySeed(): number {
  const d = new Date();
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`,
  );
}

function DevocionalPage() {
  const dev = DEVOCIONAIS[daySeed() % DEVOCIONAIS.length];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 h-14 items-center px-4 pt-[max(env(safe-area-inset-top),1rem)] shrink-0">
        <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start">
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">CHOSEN</span>
        <span />
      </header>

      <main className="flex-1 px-6 pb-32 pt-4 flex flex-col items-center">
        <div className="w-full max-w-md">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/50 mb-6 text-center">
            Devocional de 3 minutos
          </p>

          <section className="mb-8 text-center">
            <p className="text-xl font-light leading-snug text-black md:text-2xl">
              "{dev.versiculo}"
            </p>
            <p className="mt-4 text-[11px] font-bold tracking-[0.25em] uppercase text-black">
              {dev.referencia}
            </p>
          </section>

          <section className="mb-8 rounded-3xl bg-black/[0.04] p-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Pra pensar
            </p>
            <p className="text-base text-black leading-relaxed">{dev.pergunta}</p>
          </section>

          <section className="rounded-3xl bg-[#f1f26c]/40 p-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Oração
            </p>
            <p className="text-base text-black leading-relaxed">{dev.oracao}</p>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}