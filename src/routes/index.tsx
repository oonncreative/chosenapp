import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ressoa" },
      { name: "description", content: "Ressoa - Minimalista e clean" },
      { property: "og:title", content: "Ressoa" },
      { property: "og:description", content: "Ressoa - Minimalista e clean" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <path d="M2 10v3" />
              <path d="M6 6v11" />
              <path d="M10 3v18" />
              <path d="M14 8v7" />
              <path d="M18 5v13" />
              <path d="M22 10v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Ressoa
          </h1>
          <p className="text-sm text-muted-foreground">
            Minimalista. Clean. Seu.
          </p>
        </div>

        <Link
          to="/app"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
