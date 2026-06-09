import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Ressoa" },
      { name: "description", content: "Ressoa app" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <path d="M2 10v3" />
            <path d="M6 6v11" />
            <path d="M10 3v18" />
            <path d="M14 8v7" />
            <path d="M18 5v13" />
            <path d="M22 10v4" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bem-vindo ao Ressoa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu espaço minimalista começa aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
