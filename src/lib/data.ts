export type TipoMensagem = "versiculo" | "salmo" | "reflexao";

export interface Mensagem {
  id: string;
  texto: string;
  referencia: string;
  tipo: TipoMensagem;
}

export const CATEGORIAS = [
  "Feliz", "Ansioso", "Triste", "Sozinho", "Agradecido", "Nervoso", "Preciso de esperança", "Preciso de paz", "Preciso de força"
] as const;

export type Categoria = typeof CATEGORIAS[number];

export const MENSAGENS: Record<Categoria, Mensagem[]> = {
  "Feliz": [
    { id: "f1", tipo: "versiculo", texto: "Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!", referencia: "Filipenses 4:4" },
    { id: "f2", tipo: "salmo", texto: "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele.", referencia: "Salmos 118:24" },
    { id: "f3", tipo: "reflexao", texto: "A felicidade não é um destino, é a presença de Deus no caminho.", referencia: "Ressoa" },
    { id: "f4", tipo: "versiculo", texto: "O coração alegre aformoseia o rosto.", referencia: "Provérbios 15:13" },
    { id: "f5", tipo: "salmo", texto: "Tu me farás conhecer a vereda da vida, a alegria plena da tua presença.", referencia: "Salmos 16:11" },
  ],
  "Ansioso": [
    { id: "a1", tipo: "versiculo", texto: "Não andem ansiosos por coisa alguma, mas em tudo apresentem seus pedidos a Deus.", referencia: "Filipenses 4:6" },
    { id: "a2", tipo: "versiculo", texto: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", referencia: "1 Pedro 5:7" },
    { id: "a3", tipo: "reflexao", texto: "O amanhã pertence a Deus. Respire e confie no agora.", referencia: "Ressoa" },
    { id: "a4", tipo: "salmo", texto: "Quando a ansiedade já me dominava, o teu consolo trouxe alívio à minha alma.", referencia: "Salmos 94:19" },
    { id: "a5", tipo: "versiculo", texto: "Quem de vocês, por mais que se preocupe, pode acrescentar uma hora que seja à sua vida?", referencia: "Mateus 6:27" },
  ],
  "Triste": [
    { id: "t1", tipo: "versiculo", texto: "O Senhor está perto dos que têm o coração quebrantado.", referencia: "Salmos 34:18" },
    { id: "t2", tipo: "versiculo", texto: "Bem-aventurados os que choram, pois serão consolados.", referencia: "Mateus 5:4" },
    { id: "t3", tipo: "reflexao", texto: "Mesmo nas noites mais escuras, o sol da justiça nunca deixa de brilhar.", referencia: "Ressoa" },
    { id: "t4", tipo: "salmo", texto: "O choro pode durar uma noite, mas a alegria vem pela manhã.", referencia: "Salmos 30:5" },
    { id: "t5", tipo: "versiculo", texto: "Ele enxugará dos seus olhos toda lágrima.", referencia: "Apocalipse 21:4" },
  ],
  "Sozinho": [
    { id: "s1", tipo: "versiculo", texto: "E eu estarei sempre com vocês, até o fim dos tempos.", referencia: "Mateus 28:20" },
    { id: "s2", tipo: "versiculo", texto: "Ele nunca o deixará, nunca o abandonará. Não tenha medo!", referencia: "Deuteronômio 31:8" },
    { id: "s3", tipo: "reflexao", texto: "Você nunca está sozinho quando está na presença do Criador.", referencia: "Ressoa" },
    { id: "s4", tipo: "salmo", texto: "Ainda que meu pai e minha mãe me abandonem, o Senhor me acolherá.", referencia: "Salmos 27:10" },
    { id: "s5", tipo: "versiculo", texto: "Não os deixarei órfãos; voltarei para vocês.", referencia: "João 14:18" },
  ],
  "Agradecido": [
    { id: "ag1", tipo: "versiculo", texto: "Dêem graças ao Senhor, porque ele é bom; o seu amor dura para sempre.", referencia: "Salmos 107:1" },
    { id: "ag2", tipo: "versiculo", texto: "Deem graças em todas as circunstâncias.", referencia: "1 Tessalonicenses 5:18" },
    { id: "ag3", tipo: "reflexao", texto: "Um coração grato é um ímã para novos milagres.", referencia: "Ressoa" },
    { id: "ag4", tipo: "salmo", texto: "Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.", referencia: "Salmos 103:2" },
    { id: "ag5", tipo: "versiculo", texto: "Toda boa dádiva e todo dom perfeito vêm do alto.", referencia: "Tiago 1:17" },
  ],
  "Nervoso": [
    { id: "n1", tipo: "versiculo", texto: "O Senhor é a minha luz e a minha salvação; de quem terei temor?", referencia: "Salmos 27:1" },
    { id: "n2", tipo: "versiculo", texto: "Pois Deus não nos deu espírito de covardia, mas de poder e equilíbrio.", referencia: "2 Timóteo 1:7" },
    { id: "n3", tipo: "reflexao", texto: "A paz começa quando o seu controle termina e a confiança em Deus assume.", referencia: "Ressoa" },
    { id: "n4", tipo: "salmo", texto: "Em paz me deito e logo pego no sono, pois só tu, Senhor, me fazes viver em segurança.", referencia: "Salmos 4:8" },
    { id: "n5", tipo: "versiculo", texto: "Aquietai-vos e sabei que eu sou Deus.", referencia: "Salmos 46:10" },
  ],
  "Preciso de esperança": [
    { id: "e1", tipo: "versiculo", texto: "Pois eu bem sei os planos que tenho para vocês, planos de dar a vocês esperança.", referencia: "Jeremias 29:11" },
    { id: "e2", tipo: "versiculo", texto: "Mas aqueles que esperam no Senhor renovam as suas forças.", referencia: "Isaías 40:31" },
    { id: "e3", tipo: "reflexao", texto: "A esperança é a âncora da alma, firme e segura.", referencia: "Ressoa" },
    { id: "e4", tipo: "salmo", texto: "Por que você está assim tão triste, ó minha alma? Ponha a sua esperança em Deus!", referencia: "Salmos 42:11" },
    { id: "e5", tipo: "versiculo", texto: "A esperança não nos decepciona, porque Deus derramou seu amor em nossos corações.", referencia: "Romanos 5:5" },
  ],
  "Preciso de paz": [
    { id: "p1", tipo: "versiculo", texto: "Deixo-lhes a paz; a minha paz lhes dou.", referencia: "João 14:27" },
    { id: "p2", tipo: "versiculo", texto: "Tu, Senhor, guardarás em perfeita paz aquele cujo propósito está firme.", referencia: "Isaías 26:3" },
    { id: "p3", tipo: "reflexao", texto: "A paz não é a ausência de tempestade, é o silêncio de Deus dentro de você.", referencia: "Ressoa" },
    { id: "p4", tipo: "salmo", texto: "O Senhor abençoa o seu povo com paz.", referencia: "Salmos 29:11" },
    { id: "p5", tipo: "versiculo", texto: "E a paz de Deus, que excede todo o entendimento, guardará os seus corações.", referencia: "Filipenses 4:7" },
  ],
  "Preciso de força": [
    { id: "f1_forca", tipo: "versiculo", texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13" },
    { id: "f2_forca", tipo: "salmo", texto: "O Senhor é a minha força e o meu escudo; nele o meu coração confia.", referencia: "Salmos 28:7" },
    { id: "f3", tipo: "reflexao", texto: "Sua fraqueza é o palco onde a força de Deus se manifesta.", referencia: "Ressoa" },
    { id: "f4", tipo: "versiculo", texto: "O Senhor dá força ao seu povo.", referencia: "Salmos 29:11" },
    { id: "f5", tipo: "versiculo", texto: "A minha graça é suficiente para você, pois o meu poder se aperfeiçoa na fraqueza.", referencia: "2 Coríntios 12:9" },
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

export function getProximaMensagem(categoria: Categoria): Mensagem {
  const todas = MENSAGENS[categoria];
  
  // 1. Remover mensagens exibidas nas últimas 5 interações
  let filtradas = todas.filter(m => !cache.lastMessages.includes(m.id));
  
  // Se filtrar tudo (muito improvável com o volume atual, mas por segurança), reseta o cache de IDs
  if (filtradas.length === 0) {
    cache.lastMessages = [];
    filtradas = todas;
  }

  // 2. Garantir que não apareça o mesmo tipo duas vezes seguidas
  let finalistas = filtradas.filter(m => m.tipo !== cache.lastType);

  // Se o filtro de tipo remover todas as opções restantes, ignora a restrição de tipo
  if (finalistas.length === 0) {
    finalistas = filtradas;
  }

  // 3. Selecionar aleatoriamente
  const selecionada = finalistas[Math.floor(Math.random() * finalistas.length)];

  // Atualizar cache
  cache.lastMessages = [...cache.lastMessages, selecionada.id].slice(-5);
  cache.lastType = selecionada.tipo;

  return selecionada;
}
