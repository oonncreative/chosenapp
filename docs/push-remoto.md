# Push remoto (mensagens enviadas pelo painel)

Hoje o app já mostra avisos programados no próprio aparelho. Este documento cobre o
**push remoto**: mensagens escritas em `/admin/push` que saem de um servidor e chegam
no celular na hora.

## O que já está pronto no código

- `src/hooks/usePushRegistration.ts` — pede permissão e registra o aparelho ao abrir o app nativo.
- `src/lib/push.functions.ts` — grava o aparelho na tabela `push_devices`.
- `/admin/push` — escreve, agenda e dispara as mensagens (envio pelo Firebase Cloud Messaging).
- iOS: `AppDelegate.swift` já repassa o registro e `App.entitlements` já tem `aps-environment`.
- Android: `android/app/build.gradle` já aplica o plugin do Google quando o `google-services.json` existir.

## O que você precisa providenciar

### 1. Projeto no Firebase (grátis)

1. Abra <https://console.firebase.google.com> e clique em **Adicionar projeto**.
2. Nome sugerido: `Chosen`. Pode desativar o Google Analytics.
3. Dentro do projeto, vá em **Configurações do projeto** (engrenagem no topo esquerdo).

### 2. Chave de serviço (é o que o painel usa para enviar)

1. Em **Configurações do projeto → Contas de serviço**.
2. Clique em **Gerar nova chave privada** → confirme. Baixa um arquivo `.json`.
3. Esse arquivo é o que a Lovable pede na tela de conexão do Firebase Cloud Messaging.
   Nunca cole o conteúdo dele no chat — use somente o formulário da conexão.

### 3. App Android dentro do Firebase

1. Em **Configurações do projeto → Seus apps → Adicionar app → Android**.
2. Nome do pacote: `com.oonn.chosen`.
3. Baixe o `google-services.json` e coloque em `android/app/google-services.json`.

### 4. App iPhone dentro do Firebase + chave da Apple

1. Em **Seus apps → Adicionar app → iOS**, bundle: `com.oonn.chosen`.
2. Baixe o `GoogleService-Info.plist` e arraste para a pasta `App` no Xcode (marque
   "Copy items if needed" e o alvo **App**).
3. Na Apple: <https://developer.apple.com/account/resources/authkeys/list> →
   **+** → marque **Apple Push Notifications service (APNs)** → Continue → Register.
   Baixe o arquivo `.p8` (só é possível baixar uma vez) e anote o **Key ID**.
   O **Team ID** fica no canto superior direito do portal da Apple.
4. No Firebase: **Configurações do projeto → Cloud Messaging → Apple app →
   Certificados APNs → Fazer upload** do `.p8`, informando Key ID e Team ID.

### 5. Ajustes no Xcode (uma vez)

1. Abra `ios/App/App.xcworkspace`.
2. No alvo **App → Signing & Capabilities → + Capability**: adicione
   **Push Notifications** e **Background Modes** (marque *Remote notifications*).
3. **File → Add Package Dependencies** → `https://github.com/firebase/firebase-ios-sdk`
   → adicione **FirebaseMessaging** ao alvo **App**.
4. No `AppDelegate.swift`, acrescente `import FirebaseCore` e, dentro de
   `didFinishLaunchingWithOptions`, a linha `FirebaseApp.configure()`.

### 6. Publicar a nova versão

Gere um novo build (`npx cap sync` → Xcode/Android Studio) e envie para a App Store e o
Google Play. Só quem atualizar o app passa a receber as mensagens enviadas pelo painel;
quem não atualizar continua recebendo os avisos programados normalmente.

## Teste

1. Abra o app atualizado no celular e aceite as notificações.
2. Em `/admin/push`, o contador de aparelhos deve subir.
3. Escreva um título e uma mensagem e use **Enviar para todos**.
