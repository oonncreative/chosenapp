export type TipoMensagem = "versiculo" | "salmo" | "reflexao";

export interface Mensagem {
  id: string;
  texto: string;
  referencia: string;
  tipo: TipoMensagem;
   fraseMotivacional?: string;
  resumo?: string;
}

export const CATEGORIAS = [
  "Feliz", "Ansioso", "Triste", "Sozinho", "Agradecido", "Nervoso", "Preciso de esperança", "Preciso de paz", "Preciso de força"
] as const;

export type Categoria = typeof CATEGORIAS[number];

export const MENSAGENS: Record<Categoria, Mensagem[]> = {
  "Feliz": [
    { id: "f1", tipo: "versiculo", texto: "Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!", referencia: "Filipenses 4:4", resumo: "Escrito por Paulo à igreja em Filipos, este versículo é um comando para manter a alegria espiritual independentemente das circunstâncias externas." },
    { id: "f2", tipo: "salmo", texto: "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele.", referencia: "Salmos 118:24", resumo: "Parte de um hino de gratidão usado em festividades em Jerusalém, celebrando a vitória e a providência de Deus em cada novo amanhecer." },
    { id: "f4", tipo: "versiculo", texto: "O coração alegre aformoseia o rosto.", referencia: "Provérbios 15:13", resumo: "Um ensinamento de sabedoria que destaca como nosso estado emocional interno reflete diretamente em nossa aparência e saúde." },
    { id: "f5", tipo: "salmo", texto: "Tu me farás conhecer a vereda da vida, a alegria plena da tua presença.", referencia: "Salmos 16:11", resumo: "Um salmo de confiança de Davi, expressando que a verdadeira satisfação e o sentido da vida são encontrados na comunhão com o Criador." },
  ],
  "Ansioso": [
    { id: "a1", tipo: "versiculo", texto: "Não andem ansiosos por coisa alguma, mas em tudo apresentem seus pedidos a Deus.", referencia: "Filipenses 4:6", resumo: "Paulo ensina que a oração com gratidão é o antídoto para a ansiedade, trazendo a paz que excede o entendimento." },
    { id: "a2", tipo: "versiculo", texto: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", referencia: "1 Pedro 5:7", resumo: "Pedro encoraja os cristãos a confiarem no cuidado pessoal de Deus, transferindo suas preocupações para Aquele que pode resolvê-las." },
    { id: "a4", tipo: "salmo", texto: "Quando a ansiedade já me dominava, o teu consolo trouxe alívio à minha alma.", referencia: "Salmos 94:19", resumo: "Um salmo que reconhece a realidade das lutas internas, mas aponta para o conforto divino como a fonte de renovação mental." },
    { id: "a5", tipo: "versiculo", texto: "Quem de vocês, por mais que se preocupe, pode acrescentar uma hora que seja à sua vida?", referencia: "Mateus 6:27", resumo: "Palavras de Jesus no Sermão do Monte, lembrando que a preocupação é ineficaz e que devemos confiar na providência diária." },
  ],
  "Triste": [
    { id: "t1", tipo: "versiculo", texto: "O Senhor está perto dos que têm o coração quebrantado.", referencia: "Salmos 34:18", resumo: "Davi escreveu este salmo enquanto fugia, lembrando que Deus é atraído pelo nosso sofrimento e humildade." },
    { id: "t2", tipo: "versiculo", texto: "Bem-aventurados os que choram, pois serão consolados.", referencia: "Mateus 5:4", resumo: "Nas Bem-aventuranças, Jesus ensina que a dor não é o fim, mas uma oportunidade para experimentar o consolo profundo de Deus." },
    { id: "t4", tipo: "salmo", texto: "O choro pode durar uma noite, mas a alegria vem pela manhã.", referencia: "Salmos 30:5", resumo: "Um hino de ação de graças que celebra a natureza passageira das dificuldades em comparação com a fidelidade eterna de Deus." },
    { id: "t5", tipo: "versiculo", texto: "Ele enxugará dos seus olhos toda lágrima.", referencia: "Apocalipse 21:4", resumo: "A promessa final da Bíblia sobre um futuro sem dor, sofrimento ou luto, onde a presença de Deus restaurará todas as coisas." },
  ],
  "Sozinho": [
    { id: "s1", tipo: "versiculo", texto: "E eu estarei sempre com vocês, até o fim dos tempos.", referencia: "Mateus 28:20", resumo: "A promessa final de Jesus antes de sua ascensão, garantindo sua presença espiritual constante com todos os seus seguidores." },
    { id: "s2", tipo: "versiculo", texto: "Ele nunca o deixará, nunca o abandonará. Não tenha medo!", referencia: "Deuteronômio 31:8", resumo: "Moisés encorajando Josué antes da conquista da terra prometida, assegurando que a liderança de Deus é inabalável." },
    { id: "s4", tipo: "salmo", texto: "Ainda que meu pai e minha mãe me abandonem, o Senhor me acolherá.", referencia: "Salmos 27:10", resumo: "Uma declaração de fé que mostra que o amor de Deus supera até os vínculos humanos mais fundamentais." },
    { id: "s5", tipo: "versiculo", texto: "Não os deixarei órfãos; voltarei para vocês.", referencia: "João 14:18", resumo: "Jesus consolando os discípulos sobre sua partida, prometendo o Espírito Santo como o companheiro constante." },
  ],
  "Agradecido": [
    { id: "ag1", tipo: "versiculo", texto: "Dêem graças ao Senhor, porque ele é bom; o seu amor dura para sempre.", referencia: "Salmos 107:1", resumo: "Um convite à adoração comunitária, reconhecendo que a bondade de Deus é a base de toda a nossa gratidão." },
    { id: "ag2", tipo: "versiculo", texto: "Deem graças em todas as circunstâncias.", referencia: "1 Tessalonicenses 5:18", resumo: "Uma instrução prática de Paulo que desafia a encontrar motivos para agradecer mesmo quando a vida parece difícil." },
    { id: "ag4", tipo: "salmo", texto: "Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.", referencia: "Salmos 103:2", resumo: "Um monólogo interior onde Davi ordena a si mesmo lembrar das bênçãos recebidas, combatendo o esquecimento espiritual." },
    { id: "ag5", tipo: "versiculo", texto: "Toda boa dádiva e todo dom perfeito vêm do alto.", referencia: "Tiago 1:17", resumo: "Tiago ensina que tudo o que é bom em nossa vida tem uma origem divina e generosa." },
  ],
  "Nervoso": [
    { id: "n1", tipo: "versiculo", texto: "O Senhor é a minha luz e a minha salvação; de quem terei temor?", referencia: "Salmos 27:1", resumo: "Uma declaração de total confiança em Deus, escrita por Davi, que substitui o medo pela certeza da proteção divina." },
    { id: "n2", tipo: "versiculo", texto: "Pois Deus não nos deu espírito de covardia, mas de poder e equilíbrio.", referencia: "2 Timóteo 1:7", resumo: "Paulo encoraja o jovem Timóteo a lembrar que a força cristã vem do Espírito Santo, trazendo clareza e autocontrole." },
    { id: "n4", tipo: "salmo", texto: "Em paz me deito e logo pego no sono, pois só tu, Senhor, me fazes viver em segurança.", referencia: "Salmos 4:8", resumo: "Uma oração noturna que expressa como a paz interior, fruto da confiança em Deus, permite o descanso real mesmo em tempos de crise." },
    { id: "n5", tipo: "versiculo", texto: "Aquietai-vos e sabei que eu sou Deus.", referencia: "Salmos 46:10", resumo: "Um comando para cessar as lutas e preocupações próprias, reconhecendo a soberania e o controle final de Deus sobre todas as coisas." },
  ],
  "Preciso de esperança": [
    { id: "e1", tipo: "versiculo", texto: "Pois eu bem sei os planos que tenho para vocês, planos de dar a vocês esperança.", referencia: "Jeremias 29:11", resumo: "Uma mensagem de Deus aos exilados em Babilônia, garantindo que, apesar do sofrimento atual, Ele tem um futuro planejado com propósito." },
    { id: "e2", tipo: "versiculo", texto: "Mas aqueles que esperam no Senhor renovam as suas forças.", referencia: "Isaías 40:31", resumo: "O profeta Isaías descreve como a dependência de Deus fornece uma energia sobrenatural que nos faz superar o cansaço humano." },
    { id: "e4", tipo: "salmo", texto: "Por que você está assim tão triste, ó minha alma? Ponha a sua esperança em Deus!", referencia: "Salmos 42:11", resumo: "Um salmo de lamento onde o autor questiona sua própria tristeza, escolhendo conscientemente direcionar sua fé para Deus." },
    { id: "e5", tipo: "versiculo", texto: "A esperança não nos decepciona, porque Deus derramou seu amor em nossos corações.", referencia: "Romanos 5:5", resumo: "Paulo explica que a esperança cristã é segura porque está fundamentada na experiência direta do amor de Deus através do Espírito Santo." },
  ],
  "Preciso de paz": [
    { id: "p1", tipo: "versiculo", texto: "Deixo-lhes a paz; a minha paz lhes dou.", referencia: "João 14:27", fraseMotivacional: "Receba hoje uma paz que acalma qualquer tempestade mental." },
    { id: "p2", tipo: "versiculo", texto: "Tu, Senhor, guardarás em perfeita paz aquele cujo propósito está firme.", referencia: "Isaías 26:3", fraseMotivacional: "Mantenha o seu foco no bem e a tranquilidade será o seu lar." },
    { id: "p4", tipo: "salmo", texto: "O Senhor abençoa o seu povo com paz.", referencia: "Salmos 29:11", fraseMotivacional: "A paz é um presente que você merece desfrutar agora." },
    { id: "p5", tipo: "versiculo", texto: "E a paz de Deus, que excede todo o entendimento, guardará os seus corações.", referencia: "Filipenses 4:7", fraseMotivacional: "Deixe que a serenidade envolva cada pensamento seu hoje." },
  ],
  "Preciso de força": [
    { id: "f1_forca", tipo: "versiculo", texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13", fraseMotivacional: "Você é capaz de superar muito mais do que imagina." },
    { id: "f2_forca", tipo: "salmo", texto: "O Senhor é a minha força e o meu escudo; nele o meu coração confia.", referencia: "Salmos 28:7", fraseMotivacional: "Sua proteção é real e sua força é inesgotável." },
    { id: "f4", tipo: "versiculo", texto: "O Senhor dá força ao seu povo.", referencia: "Salmos 29:11", fraseMotivacional: "Mesmo cansado, você encontrará energia para o próximo passo." },
    { id: "f5", tipo: "versiculo", texto: "A minha graça é suficiente para você, pois o meu poder se aperfeiçoa na fraqueza.", referencia: "2 Coríntios 12:9", fraseMotivacional: "Suas limitações são o espaço onde o impossível acontece." },
  ]
};

// Sistema de Cache Local Requisitado
interface Cache {
  lastMessages: string[];
  lastType: TipoMensagem | null;
}

// O cache deve ser resetado ao fechar/abrir o app (instância em memória)
const cache: Cache = {
  lastMessages: [],
  lastType: null,
};

export function getRandomIdForCategoria(categoria: Categoria): string {
  const todas = MENSAGENS[categoria];
  
  // 1. Remover mensagens exibidas nas últimas 5 interações (cache local na memória do cliente)
  let filtradas = todas.filter(m => !cache.lastMessages.includes(m.id));
  
  if (filtradas.length === 0) {
    cache.lastMessages = [];
    filtradas = todas;
  }

  // 2. Garantir que não apareça o mesmo tipo duas vezes seguidas
  let finalistas = filtradas.filter(m => m.tipo !== cache.lastType);

  if (finalistas.length === 0) {
    finalistas = filtradas;
  }

  // 3. Selecionar aleatoriamente
  const selecionada = finalistas[Math.floor(Math.random() * finalistas.length)];

  // Atualizar cache (isso acontece no cliente antes de navegar)
  cache.lastMessages = [...cache.lastMessages, selecionada.id].slice(-5);
  cache.lastType = selecionada.tipo;

  return selecionada.id;
}

export function getMensagemById(categoria: Categoria, id: string): Mensagem {
  const todas = MENSAGENS[categoria];
  return todas.find(m => m.id === id) || todas[0];
}

export function getProximaMensagem(categoria: Categoria): Mensagem {
  const id = getRandomIdForCategoria(categoria);
  return getMensagemById(categoria, id);
}
