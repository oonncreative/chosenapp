// Conteúdo bíblico/conforto para notificações horárias e card "Escolhida agora".
// Fonte única: derivado de src/lib/data.ts para evitar duplicatas.
import { MENSAGENS } from "./data";

export type ChosenItem = {
  ref: string;
  text: string;
};

export const PSALMS: ChosenItem[] = Object.values(MENSAGENS)
  .flat()
  .map((m) => ({ ref: m.referencia, text: m.texto }));

// Seleção determinística por hora — todos veem a "mesma escolhida" naquela hora.
export function getChosenForHour(date = new Date()): ChosenItem {
  const key = Math.floor(date.getTime() / (60 * 60 * 1000));
  return PSALMS[key % PSALMS.length];
}

export function getChosenRandom(): ChosenItem {
  return PSALMS[Math.floor(Math.random() * PSALMS.length)];
}

export const NOTIFICATION_TITLES = [
  "Essa foi escolhida para você",
  "Uma palavra para agora",
  "CHOSEN — para o seu momento",
  "Pausa para a alma",
  "Respire e leia",
  "Uma luz para o seu caminho",
  "Deus tem algo para você",
  "Respire fundo e ouça",
  "Tempo de descansar nEle",
  "Uma promessa para hoje",
  "Para o seu coração agora",
  "Pare por um instante",
  "Você foi lembrado(a)",
  "Palavra do Pai para você",
  "Um sopro de paz",
  "Lembre-se de quem te ama",
  "Pequena pausa, grande verdade",
  "Hoje, isso é para você",
  "Recarregue a alma",
];

export const QUIET_HOURS = { start: 8, end: 22 } as const;

export function isWithinQuietHours(date = new Date()): boolean {
  const h = date.getHours();
  return h >= QUIET_HOURS.start && h < QUIET_HOURS.end;
}
