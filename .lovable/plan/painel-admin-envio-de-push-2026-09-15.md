# Painel Admin + Envio de Push

## Resposta curta

Sim, é possível. Mas hoje o app **não tem nenhum servidor**: tudo roda no celular. Os avisos que você recebe são "lembretes locais", agendados pelo próprio aparelho. Para você apertar um botão aqui e a mensagem chegar em todos os celulares, precisamos de três coisas novas:

1. Um **banco de dados** (Lovable Cloud) para guardar o login do admin, o histórico e a lista de aparelhos.
2. Uma **conta de envio de notificações** (Firebase), que é o serviço que a Apple e o Google exigem para entregar avisos. Isso pede uma chave da sua conta Apple Developer e um projeto Firebase — você cria, eu conecto.
3. Uma **nova versão do app** publicada nas lojas. Sem atualizar o app, os celulares que já estão instalados não sabem se registrar para receber. Quem não atualizar, não recebe.

Enquanto a nova versão não está nas lojas, dá para testar no navegador/PWA e no seu aparelho de teste.

## O painel admin

Rota `/admin`, protegida por login de verdade (e-mail + senha guardados com criptografia, nunca no código).

- **Informações do admin**: e-mail, data de criação, último acesso.
- **Senha**: alterar senha (pede a senha atual). A senha inicial `224182` é tratada como provisória: no primeiro login o painel obriga a trocar.
- **Histórico de acesso**: data e hora de cada login, com sucesso/falha.

Melhorias que sugiro aqui:
- Bloqueio após várias tentativas erradas (evita alguém ficar chutando a senha).
- Registrar também os envios de push feitos (quem enviou, quando, para quantos).
- Possibilidade de mais de um admin no futuro (a estrutura já nasce pronta pra isso).

## A aba Push (`/admin/push`)

O que você pediu:
- Busca por palavra dentro das frases do app (versículos, salmos, motivações, orações) e seleção de uma delas, que preenche título e mensagem.
- Ou escrever Título e Mensagem à mão.
- Botão enviar para todos.

O que sugiro acrescentar:
- **Prévia** mostrando como fica na tela de bloqueio do iPhone e do Android, com contador de caracteres (títulos longos são cortados).
- **Enviar só para mim** (teste), antes do disparo geral.
- **Para onde o toque leva**: abrir o app, uma mensagem específica, a Bíblia no ponto onde a pessoa parou, ou a Chosen IA.
- **Agendar** para data/hora, além do envio imediato.
- **Público**: todos, só iPhone, só Android, só navegador; e mais pra frente "quem não abre há 7 dias".
- **Histórico de envios** com quantos receberam, quantos falharam e quantos abriram.
- **Confirmação antes do disparo** ("vou enviar para X aparelhos") e trava de 1 disparo geral por hora, para evitar acidente.
- **Respeitar o silêncio**: não disparar entre 22h e 7h (com opção de forçar) e respeitar quem desligou notificações no app.
- **Rascunhos e modelos** de mensagens que você usa sempre.

## Ordem de implementação sugerida

1. Banco de dados + login do admin + histórico de acesso (`/admin` já funcionando).
2. Tela `/admin/push` completa, com busca de frases, prévia, agendamento e histórico — funcionando ponta a ponta para navegador/PWA.
3. Conexão com o Firebase e registro dos aparelhos no app nativo; nova versão para App Store e Google Play.

Dá pra parar depois da etapa 2 e ver tudo funcionando antes de mexer nas lojas.

## Detalhes técnicos

- Lovable Cloud (Postgres + RLS) para `admin_users`, `admin_login_events`, `push_devices`, `push_campaigns`, `push_deliveries`. Nenhuma tabela exposta ao público; leitura/escrita só por função de servidor após checagem de papel admin.
- Login admin com Supabase Auth + tabela `user_roles` separada e função `has_role` (security definer) — nunca papel no perfil.
- Envio via conector Firebase Cloud Messaging (HTTP v1) pelo gateway da Lovable, a partir de server functions; APNs configurado no Firebase com a chave `.p8` da conta Apple Developer.
- App nativo: adicionar `@capacitor/push-notifications`, registrar token no `push_devices` (token, plataforma, timezone), remover tokens que voltarem `UNREGISTERED`.
- Envio em lotes com retentativa em 429/5xx; agendamento por `pg_cron` chamando uma rota em `/api/public/*` com verificação de assinatura.
- Busca de frases reaproveita `src/lib/searchMensagens.ts`, `psalms.ts` e `oracoesCurtas.ts`.

## O que preciso de você

- Confirmar se quer o caminho completo (com nova versão nas lojas) ou começar só pelo painel + navegador.
- Acesso/criação de um projeto Firebase e a chave APNs da sua conta Apple Developer (na hora da etapa 3).
