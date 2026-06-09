export interface Versiculo {
  id: string;
  texto: string;
  referencia: string;
  reflexao: string;
}

export const CATEGORIAS = [
  "Feliz", "Ansioso", "Triste", "Sozinho", "Agradecido", "Nervoso", "Preciso de esperança", "Preciso de paz", "Preciso de força"
] as const;

export type Categoria = typeof CATEGORIAS[number];

export const VERSICULOS: Record<Categoria, Versiculo[]> = {
  "Feliz": [
    {
      id: "f1",
      texto: "Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!",
      referencia: "Filipenses 4:4",
      reflexao: "A alegria que vem de Deus é constante e renova nossas forças a cada dia."
    },
    {
      id: "f2",
      texto: "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele.",
      referencia: "Salmos 118:24",
      reflexao: "Cada novo amanhecer é um presente divino que merece ser celebrado com gratidão."
    }
  ],
  "Ansioso": [
    {
      id: "a1",
      texto: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
      referencia: "Filipenses 4:6",
      reflexao: "Entregue suas preocupações ao Criador; Ele cuida de cada detalhe com amor infinito."
    },
    {
      id: "a2",
      texto: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.",
      referencia: "1 Pedro 5:7",
      reflexao: "Você não precisa carregar o peso do mundo sozinho. Descanse na promessa de cuidado divino."
    }
  ],
  "Triste": [
    {
      id: "t1",
      texto: "O Senhor está perto dos que têm o coração quebrantado e salva os de espírito abatido.",
      referencia: "Salmos 34:18",
      reflexao: "Nos momentos de dor, a presença de Deus se torna o nosso consolo mais profundo."
    },
    {
      id: "t2",
      texto: "Bem-aventurados os que choram, pois serão consolados.",
      referencia: "Mateus 5:4",
      reflexao: "Suas lágrimas não são ignoradas. Existe um consolo divino reservado para você."
    }
  ],
  "Sozinho": [
    {
      id: "s1",
      texto: "E eu estarei sempre com vocês, até o fim dos tempos.",
      referencia: "Mateus 28:20",
      reflexao: "Mesmo quando o mundo parece vazio, você nunca caminha sem companhia divina."
    },
    {
      id: "s2",
      texto: "O próprio Senhor irá à sua frente e estará com você; ele nunca o deixará, nunca o abandonará. Não tenha medo! Não desanime!",
      referencia: "Deuteronômio 31:8",
      reflexao: "Deus é o amigo que nunca falha e está presente em cada passo da sua jornada."
    }
  ],
  "Agradecido": [
    {
      id: "ag1",
      texto: "Dêem graças ao Senhor, porque ele é bom; o seu amor dura para sempre.",
      referencia: "Salmos 107:1",
      reflexao: "A gratidão abre nossos olhos para as inúmeras bênçãos que recebemos diariamente."
    },
    {
      id: "ag2",
      texto: "Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.",
      referencia: "1 Tessalonicenses 5:18",
      reflexao: "Um coração grato encontra paz e propósito mesmo nos pequenos detalhes da vida."
    }
  ],
  "Nervoso": [
    {
      id: "n1",
      texto: "O Senhor é a minha luz e a minha salvação; de quem terei temor?",
      referencia: "Salmos 27:1",
      reflexao: "Quando o medo ou a agitação tentam dominar, lembre-se de quem é a sua proteção."
    },
    {
      id: "n2",
      texto: "Pois Deus não nos deu espírito de covardia, mas de poder, de amor e de equilíbrio.",
      referencia: "2 Timóteo 1:7",
      reflexao: "A calma e o autocontrole são presentes que Deus coloca à sua disposição hoje."
    }
  ],
  "Preciso de esperança": [
    {
      id: "e1",
      texto: "Pois eu bem sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
      referencia: "Jeremias 29:11",
      reflexao: "O seu futuro está em boas mãos. Confie nos planos perfeitos de Deus para você."
    },
    {
      id: "e2",
      texto: "Mas aqueles que esperam no Senhor renovam as suas forças. Voam alto como águias; correm e não ficam exaustos, caminham e não se cansam.",
      referencia: "Isaías 40:31",
      reflexao: "A esperança em Deus é a fonte de energia que nos permite superar qualquer obstáculo."
    }
  ],
  "Preciso de paz": [
    {
      id: "p1",
      texto: "Deixo-lhes a paz; a minha paz lhes dou. Não a dou como o mundo a dá. Não se perturbem os seus corações, nem tenham medo.",
      referencia: "João 14:27",
      reflexao: "A paz verdadeira não depende das circunstâncias, mas da presença de Cristo em nós."
    },
    {
      id: "p2",
      texto: "Tu, Senhor, guardarás em perfeita paz aquele cujo propósito está firme, porque em ti confia.",
      referencia: "Isaías 26:3",
      reflexao: "Mantenha seu foco no Criador e experimente uma tranquilidade que excede todo o entendimento."
    }
  ],
  "Preciso de força": [
    {
      id: "f1_forca",
      texto: "Tudo posso naquele que me fortalece.",
      referencia: "Filipenses 4:13",
      reflexao: "Sua força não vem de suas próprias habilidades, mas da capacitação divina em você."
    },
    {
      id: "f2_forca",
      texto: "O Senhor é a minha força e o meu escudo; nele o meu coração confia, e dele recebo ajuda.",
      referencia: "Salmos 28:7",
      reflexao: "Quando se sentir fraco, lembre-se que Deus é a rocha inabalável onde você pode se apoiar."
    }
  ]
};

export function getVersiculoAleatorio(categoria: Categoria): Versiculo {
  const lista = VERSICULOS[categoria];
  const index = Math.floor(Math.random() * lista.length);
  return lista[index];
}
