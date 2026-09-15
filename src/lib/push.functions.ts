import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(10).max(500),
  platform: z.enum(["ios", "android", "web"]),
  timezone: z.string().max(80).optional(),
  appVersion: z.string().max(40).optional(),
});

/**
 * Registra (ou atualiza) o aparelho que vai receber as notificacoes enviadas
 * pelo painel. Chamado pelo app nativo assim que o sistema devolve o token.
 */
export const registrarDispositivo = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("push_devices").upsert(
      {
        token: data.token,
        platform: data.platform,
        timezone: data.timezone ?? null,
        app_version: data.appVersion ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
    if (error) {
      console.error("Falha ao registrar dispositivo de push:", error.message);
      return { ok: false };
    }
    return { ok: true };
  });
