import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  texto: z.string().min(3).max(1000),
});

const RespostaSchema = z.object({
  versiculo: z.string(),
  referencia: z.string(),
  acolhimento: z.string(),
  oracao: z.string(),
});

export type RespostaConversa = z.infer<typeof RespostaSchema>;

const SYSTEM_PROMPT = `Você é o Chosen, um companheiro cristão evangélico brasileiro, acolhedor e maduro na fé. Uma pessoa vai desabafar sobre o que está sentindo agora. Sua tarefa:

1. ESCOLHER um versículo bíblico REAL e conhecido (Bíblia protestante — Antigo ou Novo Testamento) que fale diretamente com a situação da pessoa. Nunca invente versículo ou referência. Prefira versículos amplamente conhecidos e traduzidos em português (NVI, ARC ou ARA). Cite a referência no formato exato "Livro capítulo:versículo" (ex.: "Salmos 34:18", "Filipenses 4:6-7", "Mateus 11:28").

2. Escrever uma palavra de ACOLHIMENTO em 2 a 3 parágrafos curtos (100 a 160 palavras total), falando com a pessoa em segunda pessoa (você/sua), reconhecendo o que ela sente, sem julgar, e conectando com o versículo escolhido. Linguagem simples, pastoral, calorosa. Nunca cite outros versículos aqui. Não use clichês como "Deus tem um plano" ou "tudo tem seu tempo".

3. Escrever uma ORAÇÃO curta (40 a 70 palavras) para a pessoa fazer AGORA, em primeira pessoa ("Senhor, eu venho..."), pessoal e específica ao momento dela, não genérica.

Regras importantes:
- Nunca use aspas duplas dentro dos textos (use aspas simples se precisar).
- Nunca julgue a pessoa, mesmo se ela contar algo grave (pecado, dúvida, raiva). Acolha primeiro.
- Se a pessoa mencionar risco à vida (suicídio, automutilação), inclua no acolhimento uma frase gentil sugerindo procurar o CVV (188) ou alguém de confiança.
- Não indique psicólogo/médico como resposta padrão — só se claramente necessário.
- Fale como brasileiro, natural, sem "vós" nem português de Portugal.`;

export const converseChosen = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<RespostaConversa> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    try {
      const { output } = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt: `A pessoa disse:\n\n"${data.texto}"\n\nResponda em JSON com as chaves: versiculo, referencia, acolhimento, oracao.`,
        output: Output.object({ schema: RespostaSchema }),
      });
      return output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        // Fallback: try to salvage JSON from raw text.
        try {
          const raw = err.text ?? "";
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return RespostaSchema.parse(parsed);
          }
        } catch {}
      }
      throw new Error("Não foi possível gerar a resposta agora. Tente novamente em instantes.");
    }
  });