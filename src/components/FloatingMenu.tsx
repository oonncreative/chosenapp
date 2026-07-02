import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, RefreshCw, Sparkles, CalendarClock, Share2, HelpCircle, Trash2, Heart, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PSALMS, INVITATION_MESSAGES, NOTIFICATION_TITLES } from "@/lib/psalms";
import { getFavorites, removeFavorite, type Favorite } from "@/lib/favorites";
import { getRandomMensagemGlobal, getMensagemById } from "@/lib/data";
import { buildShareUrl } from "@/lib/share";

const SCHEDULED_KEY = "chosen_user_schedules";
const PWA_SCHEDULE_BASE_ID = 50000;

type ScheduleType = "motivacao" | "salmo" | "aleatorio";

interface UserSchedule {
  id: number;
  at: string; // ISO
  type: ScheduleType;
  title: string;
  body: string;
}

function isCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
}

function pickTitle(): string {
  return NOTIFICATION_TITLES[Math.floor(Math.random() * NOTIFICATION_TITLES.length)];
}

function pickBodyByType(type: ScheduleType): string {
  if (type === "motivacao") {
    const m = INVITATION_MESSAGES[Math.floor(Math.random() * INVITATION_MESSAGES.length)];
    return m.text;
  }
  if (type === "salmo") {
    const salmos = PSALMS.filter((p) => /salm/i.test(p.ref));
    const pool = salmos.length ? salmos : PSALMS;
    const s = pool[Math.floor(Math.random() * pool.length)];
    return `${s.ref} — ${s.text}`;
  }
  // aleatório
  const all = [...PSALMS, ...INVITATION_MESSAGES];
  const x = all[Math.floor(Math.random() * all.length)];
  return x.ref === "CHOSEN" ? x.text : `${x.ref} — ${x.text}`;
}

function loadSchedules(): UserSchedule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCHEDULED_KEY);
    if (!raw) return [];
    const list: UserSchedule[] = JSON.parse(raw);
    // Limpa as que já passaram
    const now = Date.now();
    return list.filter((s) => new Date(s.at).getTime() > now);
  } catch {
    return [];
  }
}

function saveSchedules(list: UserSchedule[]) {
  try {
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(list));
  } catch {}
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000); // +1h
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

export function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Esconde o FAB na splash/onboarding
  const hidden = pathname === "/" || pathname.startsWith("/onboarding");

  if (hidden) return null;

  const handleAtualizar = async () => {
    setOpen(false);
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      // No nativo, o JS roda do bundle empacotado — limpar cache não baixa
      // versão nova. Redireciona pro onboarding (3 telas iniciais) pra dar
      // a sensação de "recomeço" e mostra a versão atual.
      try {
        const { App } = await import("@capacitor/app");
        const info = await App.getInfo().catch(() => null);
        if (info?.version) {
          toast("Você já está na versão " + info.version, {
            description: "Atualizações novas chegam pela loja de apps.",
          });
        }
      } catch {}
      window.location.replace("/onboarding");
      return;
    }
    try {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {}
    window.location.replace(`/onboarding?v=${Date.now()}`);
  };

  const handleOracoes = () => {
    setOpen(false);
    navigate({ to: "/oracoes" });
  };

  const handleAgendar = () => {
    setOpen(false);
    setScheduleOpen(true);
  };

  const handleAjuda = () => {
    setOpen(false);
    setHelpOpen(true);
  };

  const handleCompartilhar = async () => {
    setOpen(false);
    const url = "https://chosen.oonn.com.br";
    const text = `CHOSEN — Inspirações escolhidas pra cada momento do seu dia 💛\nBaixe e use também: ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("Link copiado!", {
        description: "Cole onde quiser compartilhar 💛",
      });
    } catch {
      toast.error("Não foi possível copiar", { description: url });
    }
  };

  const handleFavoritos = () => {
    setOpen(false);
    navigate({ to: "/escolhidas" });
  };

  const handleEnviarPraAlguem = () => {
    setOpen(false);
    setSendOpen(true);
  };

  const handleMono = () => {
    setOpen(false);
    const current = document.documentElement.classList.contains("grayscale");
    const next = !current;
    localStorage.setItem("isMono", next.toString());
    if (next) document.documentElement.classList.add("grayscale");
    else document.documentElement.classList.remove("grayscale");
    toast(next ? "Modo preto e branco ativado" : "Modo colorido ativado");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="fixed z-40 bottom-[max(env(safe-area-inset-bottom),0.5rem)] right-4 mb-9 w-12 h-12 rounded-full bg-[#f1f26c] text-black shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Menu className="h-5 w-5" strokeWidth={2.25} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-0 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-base font-light tracking-[0.3em] uppercase">
              Menu
            </SheetTitle>
            <SheetDescription className="sr-only">Opções do app</SheetDescription>
          </SheetHeader>

          <div className="mt-2 flex flex-col">
            <MenuItem icon={<Sparkles className="h-5 w-5" />} label="Orações" onClick={handleOracoes} />
            <MenuItem
              icon={<Heart className="h-5 w-5" />}
              label="Minhas escolhidas"
              onClick={handleFavoritos}
            />
            <MenuItem
              icon={<Send className="h-5 w-5" />}
              label="Chosen pra alguém"
              onClick={handleEnviarPraAlguem}
            />
            <MenuItem
              icon={<CalendarClock className="h-5 w-5" />}
              label="Agendar uma mensagem"
              onClick={handleAgendar}
            />

            <Divider />

            <MenuItem
              icon={<Share2 className="h-5 w-5" />}
              label="Compartilhar o app"
              onClick={handleCompartilhar}
            />
            <MenuItem
              icon={<MonoIcon />}
              label="Modo preto e branco"
              onClick={handleMono}
            />
            <MenuItem
              icon={<RefreshCw className="h-5 w-5" />}
              label="Atualizar app"
              onClick={handleAtualizar}
            />

            <Divider />

            <MenuItem icon={<HelpCircle className="h-5 w-5" />} label="Ajuda" onClick={handleAjuda} />
          </div>
        </SheetContent>
      </Sheet>

      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <FavoritesDialog open={favoritesOpen} onOpenChange={setFavoritesOpen} />
      <SendDialog open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full px-2 py-4 text-left rounded-xl active:bg-black/5 transition-colors"
    >
      <span className="shrink-0 text-black">{icon}</span>
      <span className="text-[15px] text-black">{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-black/5" />;
}

function MonoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
    </svg>
  );
}

/* ============== Agendar mensagem ============== */

function ScheduleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const native = isCapacitor();
  const initial = useMemo(() => defaultDateTime(), [open]);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [type, setType] = useState<ScheduleType>("motivacao");
  const [schedules, setSchedules] = useState<UserSchedule[]>([]);

  useEffect(() => {
    if (open) {
      const d = defaultDateTime();
      setDate(d.date);
      setTime(d.time);
      setSchedules(loadSchedules());
    }
  }, [open]);

  const handleAgendar = async () => {
    if (!date || !time) {
      toast.error("Escolha data e hora");
      return;
    }
    const at = new Date(`${date}T${time}:00`);
    if (at.getTime() <= Date.now()) {
      toast.error("Escolha um horário no futuro");
      return;
    }

    const title = pickTitle();
    const body = pickBodyByType(type);
    const id = Date.now() % 1000000;

    if (native) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") {
          const req = await LocalNotifications.requestPermissions();
          if (req.display !== "granted") {
            toast.error("Permissão de notificação negada");
            return;
          }
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title,
              body,
              schedule: { at },
              smallIcon: "ic_stat_chosen",
              iconColor: "#f1f26c",
              extra: { url: "/home" },
            },
          ],
        });
        toast.success("Mensagem agendada", {
          description: at.toLocaleString("pt-BR"),
        });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao agendar");
        return;
      }
    } else {
      // PWA fallback: só dispara se o app estiver aberto
      const delay = at.getTime() - Date.now();
      const timeoutId = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          toast(title, { description: body, duration: 10000 });
        }
        if ("serviceWorker" in navigator && Notification.permission === "granted") {
          try {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, {
              body,
              icon: "/logo-chosen.png",
              badge: "/logo-chosen.png",
              tag: `chosen-scheduled-${id}`,
              data: { url: "/home" },
            });
          } catch {}
        }
        // Remove da lista
        const updated = loadSchedules().filter((s) => s.id !== id);
        saveSchedules(updated);
      }, delay);
      // Guarda referência para limpar (best-effort; o setTimeout vive enquanto a página existe)
      (window as any).__chosenScheduleTimers = (window as any).__chosenScheduleTimers || {};
      (window as any).__chosenScheduleTimers[id] = timeoutId;
      toast.success("Agendamento criado", {
        description: "Funciona enquanto o app estiver aberto.",
      });
    }

    const next: UserSchedule[] = [
      ...loadSchedules(),
      { id, at: at.toISOString(), type, title, body },
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    saveSchedules(next);
    setSchedules(next);
  };

  const handleCancel = async (s: UserSchedule) => {
    if (native) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        await LocalNotifications.cancel({ notifications: [{ id: s.id }] });
      } catch {}
    } else {
      const timers = (window as any).__chosenScheduleTimers || {};
      if (timers[s.id]) {
        clearTimeout(timers[s.id]);
        delete timers[s.id];
      }
    }
    const updated = loadSchedules().filter((x) => x.id !== s.id);
    saveSchedules(updated);
    setSchedules(updated);
    toast("Agendamento cancelado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Agendar mensagem
          </DialogTitle>
          <DialogDescription>
            Escolha quando você quer receber uma mensagem.
          </DialogDescription>
        </DialogHeader>

        {!native && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
            <strong>Atenção:</strong> no navegador, o lembrete só dispara
            enquanto o app estiver aberto. Para garantir, instale o app no
            seu celular.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sched-date" className="text-xs">Data</Label>
            <Input
              id="sched-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sched-time" className="text-xs">Hora</Label>
            <Input
              id="sched-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              step={60}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs">Tipo de mensagem</Label>
          <RadioGroup
            value={type}
            onValueChange={(v) => setType(v as ScheduleType)}
            className="grid grid-cols-3 gap-2"
          >
            {([
              { v: "motivacao", l: "Motivação" },
              { v: "salmo", l: "Salmo" },
              { v: "aleatorio", l: "Aleatório" },
            ] as const).map((opt) => (
              <label
                key={opt.v}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm ${
                  type === opt.v ? "border-black bg-black text-white" : "border-black/10"
                }`}
              >
                <RadioGroupItem value={opt.v} className="sr-only" />
                {opt.l}
              </label>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleAgendar} className="w-full">
          Agendar
        </Button>

        {schedules.length > 0 && (
          <div className="mt-2">
            <div className="text-xs uppercase tracking-widest text-black/50 mb-2">
              Próximos agendamentos
            </div>
            <div className="flex flex-col gap-2">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {new Date(s.at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-black/50 capitalize">{s.type}</div>
                  </div>
                  <button
                    onClick={() => handleCancel(s)}
                    className="p-2 text-black/50 hover:text-red-600 transition-colors"
                    aria-label="Cancelar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============== Ajuda ============== */

function HelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Sobre o Chosen
          </DialogTitle>
          <DialogDescription className="sr-only">Informações do app</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm text-black/80 leading-relaxed">
          <p>
            <strong>Chosen</strong> é um app de inspirações escolhidas — uma palavra
            certa pra cada momento do seu dia: alegria, ansiedade, tristeza,
            gratidão, força, esperança ou paz.
          </p>

          <div>
            <div className="text-xs uppercase tracking-widest text-black/50 mb-1">
              Como funciona
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Escolha um sentimento e receba uma mensagem.</li>
              <li>Toque em <em>aleatório</em> 🔀 pra receber algo do nada.</li>
              <li>Compartilhe mensagens em imagem com quem você ama.</li>
              <li>Receba lembretes em horários do dia (8h, 10h, 12h, 14h, 18h, 21h).</li>
              <li>Agende mensagens pessoais pelo menu flutuante.</li>
              <li>Orações para cada momento — botão ⭐ no topo.</li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-black/50 mb-1">
              Desenvolvido por
            </div>
            <a
              href="https://oonn.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium underline"
            >
              OONN Creative — oonn.com.br
            </a>
          </div>

          <div className="text-xs text-black/40">Versão 1.0</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============== Favoritos ============== */

function FavoritesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [list, setList] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!open) return;
    setList(getFavorites());
    const onChange = () => setList(getFavorites());
    window.addEventListener("chosen:favorites-changed", onChange);
    return () => window.removeEventListener("chosen:favorites-changed", onChange);
  }, [open]);

  const handleOpen = (f: Favorite) => {
    onOpenChange(false);
    navigate({
      to: "/mensagem/$sentimento",
      params: { sentimento: f.categoria },
      search: { color: "#f1f26c", id: f.id },
    });
  };

  const handleRemove = (id: string) => {
    removeFavorite(id);
    setList(getFavorites());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Minhas escolhidas
          </DialogTitle>
          <DialogDescription>
            Suas mensagens favoritas — toque pra abrir de novo.
          </DialogDescription>
        </DialogHeader>

        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-black/50">
            Você ainda não favoritou nenhuma mensagem.
            <div className="mt-1 text-xs">
              Toque no <Heart className="inline h-3 w-3" /> no topo de uma mensagem.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((f) => (
              <div
                key={f.id}
                className="flex items-start gap-2 rounded-lg border border-black/10 p-3"
              >
                <button
                  onClick={() => handleOpen(f)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-[10px] uppercase tracking-widest text-black/40 mb-1">
                    {f.categoria}
                  </div>
                  <div className="text-sm text-black line-clamp-3">"{f.text}"</div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-black/60 mt-1">
                    {f.ref}
                  </div>
                </button>
                <button
                  onClick={() => handleRemove(f.id)}
                  className="shrink-0 p-2 text-black/40 hover:text-red-600 transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============== Chosen pra alguém ============== */

function SendDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [current, setCurrent] = useState<{ t: string; r: string; c: string } | null>(null);

  const sortear = () => {
    const { categoria, id } = getRandomMensagemGlobal();
    const m = getMensagemById(categoria, id);
    setCurrent({ t: m.texto, r: m.referencia, c: categoria });
  };

  useEffect(() => {
    if (open) {
      sortear();
      try {
        const saved = localStorage.getItem("chosen_sender_name");
        if (saved) setName(saved);
      } catch {}
    }
  }, [open]);

  const handleEnviar = async () => {
    if (!current) return;
    try {
      if (name) localStorage.setItem("chosen_sender_name", name.trim());
    } catch {}
    const url = buildShareUrl({
      t: current.t,
      r: current.r,
      c: current.c,
      n: name.trim() || undefined,
    });
    const text = `Escolhi essa palavra pensando em você 💛\n\n"${current.t}"\n— ${current.r}\n\n${url}`;

    const isNative = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

    try {
      if (isNative) {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title: "CHOSEN — uma palavra pra você",
          text,
          url,
          dialogTitle: "Enviar pra alguém",
        });
      } else if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: "CHOSEN — uma palavra pra você",
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast("Mensagem copiada!", {
          description: "Cole no WhatsApp, SMS ou onde quiser 💛",
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        toast("Mensagem copiada!");
      } catch {
        toast.error("Não foi possível enviar");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Chosen pra alguém
          </DialogTitle>
          <DialogDescription>
            Envie uma palavra anônima ou assinada. Quem receber vai abrir um
            link bonito com a mensagem.
          </DialogDescription>
        </DialogHeader>

        {current && (
          <div className="rounded-2xl bg-black/[0.03] p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-black/40 mb-2">
              {current.c}
            </p>
            <p className="text-base font-light leading-snug text-black">
              "{current.t}"
            </p>
            <p className="mt-2 text-[11px] font-bold tracking-widest uppercase text-black/70">
              {current.r}
            </p>
            <button
              onClick={sortear}
              className="mt-3 text-[11px] uppercase tracking-widest text-black/50 hover:text-black"
            >
              sortear outra
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sender-name" className="text-xs">
            Seu nome <span className="text-black/40">(opcional)</span>
          </Label>
          <Input
            id="sender-name"
            placeholder="Deixe em branco para enviar anônimo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </div>

        <Button
          onClick={handleEnviar}
          className="w-full bg-[#f1f26c] text-black hover:opacity-90"
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </DialogContent>
    </Dialog>
  );
}