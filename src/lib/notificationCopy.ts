// Textos centralizados das notificações — tom mais espiritual.
// Alterar aqui muda em todo o app.

export const COPY = {
  morningMood: {
    title: 'Como seu coração acordou?',
    body: 'Toca em como Deus te encontrou nesse começo de dia.',
    actions: {
      tired: '😴 Cansado',
      grateful: '🙏 Grato',
      anxious: '😟 Ansioso',
      calm: '🌤️ Tranquilo',
    },
  },
  talkInvite: {
    title: 'Vamos ficar juntos por um minuto?',
    body: 'Tem uma palavra esperando por você.',
    actions: {
      yes: '💛 Sim, quero',
      word: '📖 Só uma palavra',
      later: '⏭️ Depois',
    },
  },
  need: {
    title: 'O que sua alma pede agora?',
    body: 'Escolhe o que fala com você nesse momento.',
    actions: {
      force: '🙏 Força',
      peace: '🕊️ Paz',
      joy: '✨ Ânimo',
      love: '❤️ Carinho',
      talk: '✍️ Contar',
    },
  },
  micro: {
    title: 'Respira. Deus está aqui.',
    body: 'Só um segundo pra você respirar com Ele.',
    actions: {
      ok: '👍 Estou',
      notOk: '😔 Nem tanto',
    },
  },
  dayMood: {
    title: 'Como Deus te encontrou hoje?',
    body: 'Toca no que tocou seu coração até aqui.',
    actions: {
      good: '😊 Bem',
      normal: '😐 Mais ou menos',
      hard: '😞 Difícil',
      stress: '😤 Estressante',
    },
  },
  nightWord: {
    title: 'Que palavra você quer levar pro descanso?',
    body: 'Escolhe o que quer levar contigo até amanhã.',
    actions: {
      write: '✍️ Escrever',
      peace: '🕊️ Paz',
      gratitude: '🙏 Gratidão',
      hope: '💛 Esperança',
    },
  },
  gratitude: {
    title: 'Uma bênção de hoje pra guardar no coração?',
    body: 'Fecha o dia agradecendo. 💛',
    actions: {
      write: '✍️ Escrever',
      save: '💛 Salvar',
      later: '⏭️ Amanhã',
    },
  },
  // Palavras nas horas fixas
  wordSlots: {
    default: 'Uma palavra habita você agora 👇',
    morning: 'Bom dia. Começa o dia com Ele 👇',
    midMorning: 'Uma pausa pra respirar com Deus 👇',
    lunch: 'Pausa do almoço — uma palavra pra você 👇',
    afternoon: 'Respira. Tem algo de Deus pra você 👇',
    lateAfternoon: 'Fim de tarde — uma palavra habita você 👇',
    night: 'Antes de dormir, guarda isso no coração 👇',
  },
  // Follow-ups (mini-conversa)
  follow: {
    tiredSoft: {
      title: 'Quer começar devagar?',
      body: 'Uma palavra de descanso te espera.',
      actions: { yes: '🕊️ Sim', later: '⏭️ Depois' },
    },
    anxiousBreath: {
      title: 'Respira comigo por 1 minuto?',
      body: 'Deus está no seu fôlego.',
      actions: { breathe: '🫁 Respirar', word: '📖 Palavra de paz' },
    },
    gratefulKeep: {
      title: 'Guarda essa gratidão. Amém?',
      body: 'Uma bênção rápida pra selar o momento.',
      actions: { amem: '🙏 Amém e salvar', share: '💛 Compartilhar' },
    },
    forcePray: {
      title: 'Uma oração breve fortalece. Vamos?',
      body: 'É rápido — só um minuto com Ele.',
      actions: { pray: '🙏 Orar', word: '📖 Só a palavra' },
    },
    peaceSilence: {
      title: '1 minuto de silêncio te ajuda agora?',
      body: 'Uma palavra pra habitar em silêncio com Deus.',
      actions: { yes: '🤫 Sim', later: '⏭️ Depois' },
    },
    gratitudeBless: {
      title: 'Que bom. Uma bênção pra fechar o dia?',
      body: 'Descansa nas mãos dEle.',
      actions: { amem: '🙏 Amém', sleep: '🌙 Dormir em paz' },
    },
  },
  // Streak / personalização
  personalized: {
    anxietyStreak: {
      title: 'Notei que a ansiedade tem batido.',
      body: 'Quer começar hoje pela Palavra de Paz?',
      actions: { peace: '🕊️ Sim', force: '🙏 Prefiro força' },
    },
    gratefulStreak: {
      title: 'Sua gratidão tem sido forte.',
      body: 'Registra ela pra guardar essa fase?',
      actions: { write: '✍️ Escrever', save: '💛 Salvar' },
    },
  },
  // Reativas
  reactive: {
    missed: {
      title: 'Sumido do Chosen. Tá tudo bem por aí?',
      body: 'Se quiser, tô aqui. 💛',
      actions: { ok: '👍 Tô bem', need: '💭 Preciso', pray: '🙏 Ore por mim' },
    },
    remember: {
      title: 'Passei aqui pra lembrar:',
      body: 'Você é escolhido. 💛',
    },
  },
  // Ajuda pro título dinâmico com humor dominante
  wordByMood(mood: string | null): string {
    if (!mood) return COPY.wordSlots.default;
    const map: Record<string, string> = {
      'Preciso de paz': 'Uma palavra de paz habita você 👇',
      Ansiedade: 'Uma palavra de calma habita você 👇',
      Força: 'Uma palavra de força habita você 👇',
      Esperança: 'Uma palavra de esperança habita você 👇',
      Feliz: 'Uma palavra de gratidão habita você 👇',
      Triste: 'Uma palavra de consolo habita você 👇',
      Nervoso: 'Uma palavra de calma habita você 👇',
    };
    return map[mood] || COPY.wordSlots.default;
  },
};