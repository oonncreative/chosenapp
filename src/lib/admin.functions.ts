import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "norton@oonn.com.br";
const SENHA_INICIAL = "224182";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Acesso restrito ao administrador.");
}

/**
 * Cria o administrador inicial se ainda nao existir nenhum.
 * Nao faz nada quando ja existe um admin cadastrado.
 */
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const db = await admin();
  const { count } = await db
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if ((count ?? 0) > 0) return { criado: false };

  const { data: created, error } = await db.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: SENHA_INICIAL,
    email_confirm: true,
    user_metadata: { must_change_password: true },
  });

  let userId = created?.user?.id;
  if (error && !userId) {
    // usuario ja existe no auth: localiza pelo e-mail
    const { data: list } = await db.auth.admin.listUsers();
    userId = list?.users?.find((u: { email?: string }) => u.email === ADMIN_EMAIL)?.id;
  }
  if (!userId) return { criado: false };

  await db.from("user_roles").insert({ user_id: userId, role: "admin" });
  return { criado: true };
});

export const registrarLoginFalho = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().max(200) }))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("admin_login_events").insert({ email: data.email, success: false });
    return { ok: true };
  });

export const registrarLoginOk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const db = await admin();
    await db.from("admin_login_events").insert({
      user_id: context.userId,
      email: (context.claims as { email?: string })?.email ?? "",
      success: true,
    });
    return { ok: true };
  });

export const getPainelAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const db = await admin();
    const [{ data: user }, { data: acessos }, { data: devices }, { data: campanhas }] =
      await Promise.all([
        db.auth.admin.getUserById(context.userId),
        db
          .from("admin_login_events")
          .select("id, email, success, created_at")
          .order("created_at", { ascending: false })
          .limit(30),
        db.from("push_devices").select("platform"),
        db
          .from("push_campaigns")
          .select("id, titulo, mensagem, status, publico, total_alvo, total_enviado, total_falha, agendado_para, enviado_em, teste, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    const porPlataforma = { ios: 0, android: 0, web: 0 } as Record<string, number>;
    for (const d of devices ?? []) porPlataforma[d.platform] = (porPlataforma[d.platform] ?? 0) + 1;

    return {
      email: user?.user?.email ?? "",
      criadoEm: user?.user?.created_at ?? null,
      ultimoAcesso: user?.user?.last_sign_in_at ?? null,
      precisaTrocarSenha: Boolean(
        (user?.user?.user_metadata as { must_change_password?: boolean })?.must_change_password,
      ),
      acessos: acessos ?? [],
      dispositivos: porPlataforma,
      campanhas: campanhas ?? [],
    };
  });

export const marcarSenhaTrocada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const db = await admin();
    await db.auth.admin.updateUserById(context.userId, {
      user_metadata: { must_change_password: false },
    });
    return { ok: true };
  });

const campanhaSchema = z.object({
  titulo: z.string().min(1).max(80),
  mensagem: z.string().min(1).max(300),
  destino: z.string().max(200).default("app"),
  publico: z.enum(["todos", "ios", "android", "web"]).default("todos"),
  agendadoPara: z.string().nullable().optional(),
  teste: z.boolean().default(false),
});

export const enviarPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(campanhaSchema)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const db = await admin();

    let query = db.from("push_devices").select("id, token, platform");
    if (data.publico !== "todos") query = query.eq("platform", data.publico);
    const { data: devices } = await query;
    const alvos = devices ?? [];

    const agendado = data.agendadoPara ? new Date(data.agendadoPara) : null;
    const base = {
      created_by: context.userId,
      titulo: data.titulo,
      mensagem: data.mensagem,
      destino: data.destino,
      publico: data.publico,
      teste: data.teste,
      total_alvo: alvos.length,
      agendado_para: agendado ? agendado.toISOString() : null,
    };

    if (agendado && agendado.getTime() > Date.now()) {
      const { data: row } = await db
        .from("push_campaigns")
        .insert({ ...base, status: "agendada" })
        .select("id")
        .single();
      return { status: "agendada" as const, id: row?.id, alvos: alvos.length, enviados: 0, falhas: 0 };
    }

    const lovableKey = process.env["LOVABLE_API_KEY"];
    const fcmKey = process.env["FIREBASE_MESSAGING_API_KEY"];

    if (!lovableKey || !fcmKey) {
      await db.from("push_campaigns").insert({
        ...base,
        status: "pendente_configuracao",
        erro: "Servico de notificacoes (Firebase) ainda nao conectado.",
      });
      return {
        status: "pendente_configuracao" as const,
        alvos: alvos.length,
        enviados: 0,
        falhas: 0,
      };
    }

    let enviados = 0;
    let falhas = 0;
    const invalidos: string[] = [];

    for (const device of alvos) {
      try {
        const res = await fetch(
          "https://connector-gateway.lovable.dev/firebase_messaging/v1/projects/_/messages:send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": fcmKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                token: device.token,
                notification: { title: data.titulo, body: data.mensagem },
                data: { url: data.destino },
              },
            }),
          },
        );
        if (res.ok) {
          enviados += 1;
        } else {
          falhas += 1;
          const body = await res.text();
          if (res.status === 404 || body.includes("UNREGISTERED")) invalidos.push(device.id);
          console.error(`FCM falhou [${res.status}]: ${body}`);
        }
      } catch (err) {
        falhas += 1;
        console.error(err);
      }
    }

    if (invalidos.length) await db.from("push_devices").delete().in("id", invalidos);

    await db.from("push_campaigns").insert({
      ...base,
      status: falhas && !enviados ? "falhou" : "enviada",
      enviado_em: new Date().toISOString(),
      total_enviado: enviados,
      total_falha: falhas,
    });

    return { status: "enviada" as const, alvos: alvos.length, enviados, falhas };
  });
