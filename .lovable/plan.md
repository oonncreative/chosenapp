# Bíblia — Novo Testamento (com marcador de leitura)

Nova área de leitura bíblica no app, com link no menu logo **acima de "Orações"**.

## O que o usuário vai ver

1. **Menu → "Bíblia NT"** (antes de Orações).
2. **Lista dos livros** na ordem: Mateus, Marcos, Lucas, João, Atos, Romanos, 1 e 2 Coríntios, Gálatas, Efésios, Filipenses, Colossenses, 1 e 2 Tessalonicenses, 1 e 2 Timóteo, Tito, Filemom, Hebreus, Tiago, 1 e 2 Pedro, 1, 2 e 3 João, Judas — e **Apocalipse por último**, destacado em um bloco separado no fim da lista.
3. **Escolha do capítulo** em uma grade de números.
4. **Tela de leitura**: versículos numerados, tipografia leve como o resto do app, botões "anterior / próximo capítulo", e barra de progresso do capítulo.
5. **"Continuar de onde parei"**: um cartão fixo no topo da página da Bíblia mostrando o último ponto lido (ex.: "João 3 · versículo 16") com um toque para voltar direto pra lá.
6. **Marcar onde parei**: o app salva automaticamente o capítulo aberto e o versículo mais recente que ficou visível na tela; além disso, um toque longo (ou toque no número) em um versículo o marca como "parei aqui", com destaque visual.
7. Tudo funciona **sem internet** e sem login — igual ao resto do app.

## Decisão que preciso de você

O texto completo do Novo Testamento é grande (~8.000 versículos, cerca de 1,5 MB a 2 MB). Duas formas de entregar:

- **A — Tudo dentro do app (offline total).** Baixo o texto de uma tradução em domínio público em português e guardo no próprio app, dividido por livro para não pesar o carregamento inicial. Funciona no avião, no metrô, sem sinal. Aumenta o tamanho do app.
- **B — Buscar da internet conforme lê.** O app baixa só o capítulo aberto e guarda no aparelho depois de lido. App continua leve, mas o primeiro acesso a cada capítulo precisa de conexão.

Minha recomendação: **A**, porque o Chosen hoje funciona 100% offline e leitura bíblica é justamente o momento em que a pessoa não quer depender de sinal.

Sobre a tradução: usaria uma versão em domínio público (Almeida — texto livre de direitos). Traduções modernas (NVI, NAA, ARA) são licenciadas e não podem ser embutidas sem contrato.

## Detalhes técnicos

- Rotas novas: `/biblia` (lista de livros + cartão "continuar"), `/biblia/$livro` (grade de capítulos), `/biblia/$livro/$capitulo` (leitura). Rota pai só com `<Outlet />`.
- Conteúdo em `src/lib/biblia/` — um arquivo por livro, carregado sob demanda com import dinâmico, para não inflar o bundle inicial nem a renderização no servidor.
- Índice leve (`src/lib/biblia/index.ts`): id, nome, abreviação, número de capítulos, ordem — usado nas listas sem carregar texto.
- Marcador em `localStorage` (`chosen_biblia_marcador`): livro, capítulo, versículo, data. Versículo corrente detectado com `IntersectionObserver` e gravado com debounce.
- Histórico dos últimos livros lidos para a seção "continuar".
- `head()` próprio em cada rota (título/descrição por livro e capítulo).
- Item novo no `FloatingMenu` imediatamente antes de "Orações", mesmo padrão de `MenuItem`, e entrada correspondente no bloco "Sobre o App".

## Fora do escopo desta etapa

Busca por palavra dentro da Bíblia, planos de leitura, áudio, anotações e grifos — dá pra somar depois em cima dessa base.
