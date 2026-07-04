import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Registra os atalhos de "long-press" no ícone do app (Android/iOS) via
 * @capawesome/capacitor-app-shortcuts e escuta os cliques para navegar.
 *
 * Só roda em plataformas nativas (Capacitor). Em web/PWA, os mesmos
 * atalhos já estão declarados em public/manifest.json.
 */
export function useAppShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    let clickHandler: { remove: () => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { AppShortcuts } = await import(
          "@capawesome/capacitor-app-shortcuts"
        );

        // Define os 4 atalhos toda vez que o app abre (idempotente).
        await AppShortcuts.set({
          shortcuts: [
            {
              id: "mensagem",
              shortLabel: "Preciso de mensagem",
              title: "Preciso de mensagem",
              description: "Uma palavra pra agora",
            },
            {
              id: "motivacao",
              shortLabel: "Uma motivação",
              title: "Uma motivação",
              description: "Um empurrão pro seu dia",
            },
            {
              id: "salmo",
              shortLabel: "Um salmo",
              title: "Um salmo",
              description: "Palavra do Senhor",
            },
            {
              id: "oracoes",
              shortLabel: "Orações",
              title: "Orações",
              description: "Fale com Deus",
            },
          ],
        });

        if (cancelled) return;

        const handler = await AppShortcuts.addListener("click", ({ shortcutId }) => {
          const target =
            shortcutId === "oracoes"
              ? "/oracoes?src=shortcut"
              : `/atalho/${shortcutId}?src=shortcut`;
          router.navigate({ to: target }).catch(() => {
            // fallback caso a rota tipada rejeite
            window.location.href = target;
          });
        });
        clickHandler = handler;
      } catch (err) {
        console.warn("[AppShortcuts] indisponível:", err);
      }
    })();

    return () => {
      cancelled = true;
      clickHandler?.remove();
    };
  }, [router]);
}