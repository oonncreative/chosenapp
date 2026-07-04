import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  getRandomMensagemGlobal,
  getRandomSalmo,
  getRandomMotivacional,
} from "@/lib/data";

// Atalhos do ícone (PWA shortcuts / Android/iOS home shortcuts).
// Ex.: /atalho/motivacao → sorteia e redireciona pra /mensagem/{categoria}?id=...
export const Route = createFileRoute("/atalho/$acao")({
  beforeLoad: ({ params }) => {
    const acao = params.acao;
    let picked: { categoria: string; id: string };

    if (acao === "motivacao") picked = getRandomMotivacional();
    else if (acao === "salmo") picked = getRandomSalmo();
    else picked = getRandomMensagemGlobal();

    throw redirect({
      to: "/mensagem/$sentimento",
      params: { sentimento: picked.categoria },
      search: { color: "#f1f26c", id: picked.id },
    });
  },
  component: () => null,
});