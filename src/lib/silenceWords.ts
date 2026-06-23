// Palavras-únicas do silêncio. Uma por semana (sábado de manhã).
// Sem versículo, sem explicação — apenas a palavra.
export const SILENCE_WORDS = [
  "Confia.",
  "Respira.",
  "Hoje não.",
  "Descansa.",
  "Espera.",
  "Continua.",
  "Solta.",
  "Permanece.",
  "Acalma.",
  "Recomeça.",
  "Perdoa.",
  "Volta.",
  "Silencia.",
  "Recebe.",
  "Está bem.",
  "Você foi visto(a).",
];

export function pickSilenceWord(seed?: number): string {
  const i =
    typeof seed === "number"
      ? Math.abs(seed) % SILENCE_WORDS.length
      : Math.floor(Math.random() * SILENCE_WORDS.length);
  return SILENCE_WORDS[i];
}