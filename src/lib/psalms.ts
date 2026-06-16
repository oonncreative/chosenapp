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

// Mensagens-convite: chamam o usuário a abrir o app para receber a palavra.
// Usadas intercaladas com os versículos nas notificações.
export const INVITATION_MESSAGES: ChosenItem[] = [
  { ref: "CHOSEN", text: "Você está precisando de uma mensagem agora… sinto isso. Abra o app." },
  { ref: "CHOSEN", text: "Este momento pede uma palavra especial. Vem ver o que foi escolhido para você." },
  { ref: "CHOSEN", text: "Tem algo separado só para você hoje. Toque para abrir." },
  { ref: "CHOSEN", text: "Pare por um instante… há uma mensagem te esperando." },
  { ref: "CHOSEN", text: "Sinto que seu coração precisa ouvir algo agora. Abre o app." },
  { ref: "CHOSEN", text: "Uma palavra foi escolhida para esse seu momento. Vem ler." },
  { ref: "CHOSEN", text: "Respira fundo. Tem uma mensagem aqui pra te abraçar." },
  { ref: "CHOSEN", text: "Hoje é dia de lembrar quem você é. Abra o app." },
  { ref: "CHOSEN", text: "Algo bom foi reservado pra você. Toque e descubra." },
  { ref: "CHOSEN", text: "Não é coincidência você ver isso agora. Vem ouvir." },
  { ref: "CHOSEN", text: "Sua alma pediu uma pausa. Estou aqui com uma palavra." },
  { ref: "CHOSEN", text: "Esse instante merece uma mensagem especial. Abra o CHOSEN." },
];

// Sorteia entre versículo (peso 2) e mensagem-convite (peso 1)
export function pickNotificationBody(date = new Date()): ChosenItem {
  const useInvite = Math.random() < 0.33;
  if (useInvite) {
    return INVITATION_MESSAGES[Math.floor(Math.random() * INVITATION_MESSAGES.length)];
  }
  return getChosenForHour(date);
}

export const QUIET_HOURS = { start: 8, end: 22 } as const;

export function isWithinQuietHours(date = new Date()): boolean {
  const h = date.getHours();
  return h >= QUIET_HOURS.start && h < QUIET_HOURS.end;
}
