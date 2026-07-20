import { createFileRoute } from "@tanstack/react-router";

import { PSALMS } from "@/lib/psalms";

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

function pickForSlot(daySeed: number, slot: number) {
  // Hash simples e estável: mesmo dia + slot → sempre a mesma mensagem.
  const idx = Math.abs((daySeed * 31 + slot * 97) % PSALMS.length);
  return PSALMS[idx];
}

export const Route = createFileRoute("/api/public/widget-messages")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async () => {
        const now = new Date();
        // Seed do dia em UTC (widgets podem estar em qualquer fuso; manter estável).
        const daySeed = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));

        const mensagens = [0, 1, 2].map((slot) => {
          const item = pickForSlot(daySeed, slot);
          return { texto: item.text, referencia: item.ref };
        });

        // "Atualizado em" = início do dia UTC (marca clara para o widget cachear).
        const atualizado_em = new Date(daySeed * 24 * 60 * 60 * 1000).toISOString();

        return new Response(
          JSON.stringify({ mensagens, atualizado_em }, null, 2),
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