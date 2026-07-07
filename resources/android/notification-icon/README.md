# Ícone de notificação Android — `ic_stat_chosen`

O `capacitor.config.ts` referencia `LocalNotifications.smallIcon = 'ic_stat_chosen'`.
O Android exige um drawable com esse nome (silhueta branca sobre fundo transparente).

O projeto nativo (`android/`) **não** está versionado neste repositório — ele é
gerado no ambiente de build com `npx cap add android`. Por isso os PNGs ficam aqui
e devem ser copiados após o `cap add`/`cap sync`, uma única vez:

```bash
cp -R resources/android/notification-icon/drawable-* android/app/src/main/res/
```

Isso cria/atualiza:

- `android/app/src/main/res/drawable-mdpi/ic_stat_chosen.png`     (24×24)
- `android/app/src/main/res/drawable-hdpi/ic_stat_chosen.png`     (36×36)
- `android/app/src/main/res/drawable-xhdpi/ic_stat_chosen.png`    (48×48)
- `android/app/src/main/res/drawable-xxhdpi/ic_stat_chosen.png`   (72×72)
- `android/app/src/main/res/drawable-xxxhdpi/ic_stat_chosen.png`  (96×96)

Todos são silhueta branca opaca (#FFFFFF) sobre fundo transparente, como o Android
exige a partir do Lollipop — qualquer pixel colorido é renderizado como bloco branco
na status bar.

O `iconColor: '#f1f26c'` do `capacitor.config.ts` continua sendo a cor de tint
aplicada pelo sistema por trás da silhueta.