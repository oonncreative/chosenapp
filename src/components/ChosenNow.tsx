import { useEffect, useState } from "react";
import { getChosenForHour, type ChosenItem } from "@/lib/psalms";

export function ChosenNow() {
  const [item, setItem] = useState<ChosenItem>(() => getChosenForHour());

  useEffect(() => {
    // Atualiza ao virar de hora
    const tick = () => setItem(getChosenForHour());
    const next = new Date();
    next.setMinutes(0, 10, 0);
    next.setHours(next.getHours() + 1);
    const ms = next.getTime() - Date.now();
    const t = setTimeout(() => {
      tick();
      const i = setInterval(tick, 60 * 60 * 1000);
      (window as any).__chosenTickInterval = i;
    }, Math.max(1000, ms));
    return () => {
      clearTimeout(t);
      const i = (window as any).__chosenTickInterval;
      if (i) clearInterval(i);
    };
  }, []);

  return (
    <section
      aria-label="Mensagem escolhida para você agora"
      className="mx-4 sm:mx-6 mb-3 rounded-[24px] border border-black/10 bg-[#f1f26c]/40 px-4 py-3"
    >
      <p className="text-[10px] font-bold tracking-[0.3em] text-black/60 uppercase">
        Essa foi escolhida para você agora
      </p>
      <p className="mt-1.5 text-sm sm:text-base leading-snug text-black break-words">
        “{item.text}”
      </p>
      <p className="mt-1 text-[11px] font-medium tracking-wide text-black/60 uppercase">
        {item.ref}
      </p>
    </section>
  );
}
