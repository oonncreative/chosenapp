// Conteúdo bíblico/conforto para notificações horárias e card "Escolhida agora"
export type ChosenItem = {
  ref: string;
  text: string;
};

export const PSALMS: ChosenItem[] = [
  { ref: "Salmo 23:1", text: "O Senhor é o meu pastor; nada me faltará." },
  { ref: "Salmo 27:1", text: "O Senhor é a minha luz e a minha salvação; a quem temerei?" },
  { ref: "Salmo 34:18", text: "Perto está o Senhor dos que têm o coração quebrantado." },
  { ref: "Salmo 46:1", text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia." },
  { ref: "Salmo 46:10", text: "Aquietai-vos e sabei que eu sou Deus." },
  { ref: "Salmo 91:1", text: "Aquele que habita no esconderijo do Altíssimo descansará à sombra do Onipotente." },
  { ref: "Salmo 91:11", text: "Aos seus anjos dará ordens a teu respeito, para te guardarem em todos os teus caminhos." },
  { ref: "Salmo 121:1-2", text: "Elevo os meus olhos para os montes; de onde virá o meu socorro? O meu socorro vem do Senhor." },
  { ref: "Salmo 139:7", text: "Para onde me irei do teu Espírito? Para onde fugirei da tua face?" },
  { ref: "Salmo 143:8", text: "Faze-me ouvir pela manhã a tua benignidade, pois em ti confio." },
  { ref: "Salmo 119:105", text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." },
  { ref: "Salmo 16:11", text: "Tu me farás ver os caminhos da vida; na tua presença há plenitude de alegria." },
  { ref: "Salmo 37:4", text: "Deleita-te no Senhor, e ele te concederá o que deseja o teu coração." },
  { ref: "Salmo 56:3", text: "Em qualquer tempo em que eu temer, hei de confiar em ti." },
  { ref: "Salmo 62:1", text: "Somente em Deus, ó minha alma, espera silenciosa; dele vem a minha salvação." },
  { ref: "Salmo 73:26", text: "Deus é a fortaleza do meu coração e a minha porção para sempre." },
  { ref: "Filipenses 4:7", text: "A paz de Deus, que excede todo o entendimento, guardará o vosso coração." },
  { ref: "Isaías 41:10", text: "Não temas, porque eu sou contigo; eu te fortaleço e te ajudo." },
  { ref: "Mateus 11:28", text: "Vinde a mim, todos os que estais cansados, e eu vos aliviarei." },
  { ref: "João 14:27", text: "Deixo-vos a paz, a minha paz vos dou; não se turbe o vosso coração." },
  { ref: "Romanos 8:28", text: "Todas as coisas cooperam para o bem daqueles que amam a Deus." },
  { ref: "2 Coríntios 12:9", text: "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza." },
  { ref: "Provérbios 3:5", text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento." },
  { ref: "Lamentações 3:22-23", text: "As misericórdias do Senhor são novas a cada manhã; grande é a tua fidelidade." },
];

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
];

export const QUIET_HOURS = { start: 8, end: 22 } as const;

export function isWithinQuietHours(date = new Date()): boolean {
  const h = date.getHours();
  return h >= QUIET_HOURS.start && h < QUIET_HOURS.end;
}
