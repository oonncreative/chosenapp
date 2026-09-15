import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { registrarDispositivo } from "@/lib/push.functions";

function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

function plataforma(): "ios" | "android" | "web" {
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const p = cap?.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

/**
 * Registra o aparelho para receber notificacoes enviadas pelo painel (push remoto).
 * So roda no app nativo instalado; no navegador nao faz nada.
 */
export function usePushRegistration() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCapacitor()) return;
    let ativo = true;

    void (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");

        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== "granted" || !ativo) return;

        await PushNotifications.addListener("registration", (token) => {
          void registrarDispositivo({
            data: {
              token: token.value,
              platform: plataforma(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          }).catch(() => {});
        });

        await PushNotifications.addListener("registrationError", (err) => {
          console.warn("Push remoto indisponivel:", err);
        });

        await PushNotifications.addListener("pushNotificationActionPerformed", (acao) => {
          const url = (acao.notification.data as { url?: string } | undefined)?.url;
          if (url && url.startsWith("/")) void navigate({ to: url });
        });

        await PushNotifications.register();
      } catch (err) {
        console.warn("Push remoto nao configurado neste build:", err);
      }
    })();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
