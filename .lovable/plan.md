## Plano: mascote da categoria "Motivação"

A imagem enviada (`motivacao.png`) vai virar o novo mascote da categoria **Motivação**, substituindo o `mascote1` que reutilizei provisoriamente.

### Passos

1. **Upload do mascote para a CDN**
   - Subir `/mnt/user-uploads/motivacao.png` via `lovable-assets create --filename mascote-10.png`
   - Gravar o pointer em `src/assets/mascotes/mascote-10.png.asset.json` (segue o padrão dos mascotes 1–9 já existentes)

2. **Atualizar `src/routes/home.tsx`**
   - Importar `mascote10` a partir do novo `.asset.json`
   - Trocar o mapeamento `"Motivação": mascote1.url` → `"Motivação": mascote10.url`

### O que não muda
- As 60 frases motivacionais já criadas
- A posição da categoria (depois de "Preciso de força")
- Os outros 9 mascotes
