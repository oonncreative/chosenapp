import { createFileRoute } from "@tanstack/react-router";

import { PSALMS, SALMOS_POOL, INVITATION_MESSAGES, type ChosenItem } from "@/lib/psalms";
import { MENSAGENS } from "@/lib/data";
import { ORACOES_CURTAS } from "@/lib/oracoesCurtas";

// Endpoint público para widgets nativos (iOS lock screen, Android home).
// Reutiliza a mesma pool de mensagens do app (src/lib/data.ts via psalms.ts),
// sem duplicar conteúdo. Rotação determinística em 3 slots diários
// (manhã / tarde / noite — a cada 8 horas), alinhada ao ritmo 3x/dia.
//
// Público (sem auth): apenas leitura de conteúdo devocional não-sensível.
// CORS liberado (`*`) — widgets nativos não passam pelo browser, mas assim
// também funciona se alguém quiser consumir de outro domínio no futuro.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// Pools por tipo. "misto" = comportamento original (tudo em data.ts).
const MOTIVACIONAL_POOL: ChosenItem[] = [
  ...(MENSAGENS["Motivação"] || []).map((m) => ({ ref: m.referencia, text: m.texto })),
  ...INVITATION_MESSAGES,
];

const POOLS = {
  misto: PSALMS,
  versiculo: SALMOS_POOL,
  motivacional: MOTIVACIONAL_POOL,
  oracao: ORACOES_CURTAS,
} as const;

type TipoFiltro = keyof typeof POOLS;
const TIPOS_VALIDOS = new Set<string>(Object.keys(POOLS));

function pickForSlot(pool: ChosenItem[], daySeed: number, slot: number) {
  // Hash simples e estável: mesmo dia + slot → sempre a mesma mensagem.
  // Offset por slot garante 3 mensagens distintas no dia mesmo em pools pequenos.
  const idx = Math.abs((daySeed * 31 + slot * 97) % pool.length);
  return pool[idx];
}

export const Route = createFileRoute("/api/public/widget-messages")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tipoParam = url.searchParams.get("tipo");
        if (tipoParam && !TIPOS_VALIDOS.has(tipoParam)) {
          return new Response(
            JSON.stringify({
              error: "tipo inválido",
              tipos_validos: Array.from(TIPOS_VALIDOS),
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                ...CORS_HEADERS,
              },
            },
          );
        }
        const tipo: TipoFiltro = (tipoParam as TipoFiltro | null) ?? "misto";
        const pool = POOLS[tipo];

        const now = new Date();
        // Seed do dia em horário de Brasília (America/Sao_Paulo, UTC-3, sem DST
        // desde 2019). Vira à meia-noite local — faz sentido para o público BR.
        const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;
        const daySeed = Math.floor((now.getTime() - BRT_OFFSET_MS) / (24 * 60 * 60 * 1000));

        const mensagens = [0, 1, 2].map((slot) => {
          const item = pickForSlot(pool, daySeed, slot);
          return { texto: item.text, referencia: item.ref };
        });

        // "Atualizado em" = meia-noite de Brasília desse dia (em ISO UTC).
        const atualizado_em = new Date(daySeed * 24 * 60 * 60 * 1000 + BRT_OFFSET_MS).toISOString();

        return new Response(
          JSON.stringify({ tipo, mensagens, atualizado_em }, null, 2),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              // Cache leve na borda: seguro reprocessar de hora em hora.
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
              ...CORS_HEADERS,
            },
          },
        );
      },
    },
  },
});