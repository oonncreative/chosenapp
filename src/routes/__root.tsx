import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RESSOA" },
      { name: "description", content: "Inspire-se nas palavras de Deus." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "RESSOA" },
      { property: "og:description", content: "Inspire-se nas palavras de Deus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "RESSOA" },
      { name: "twitter:description", content: "Inspire-se nas palavras de Deus." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/09141173-e117-4059-bd5e-51e8c7469f4c" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/09141173-e117-4059-bd5e-51e8c7469f4c" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useEffect(() => {
    // Check if we're in a "refreshing" state (first load or manual refresh)
    const handleBeforeUnload = () => sessionStorage.setItem('isRefreshing', 'true');
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    const wasRefreshing = sessionStorage.getItem('isRefreshing');
    if (wasRefreshing) {
      sessionStorage.removeItem('isRefreshing');
      const timer = setTimeout(() => {
        document.getElementById('initial-splash')?.classList.add('opacity-0');
        setTimeout(() => setAppReady(true), 500);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } else {
      setAppReady(true);
    }
    
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const [appReady, setAppReady] = useState(false);
  const isLoading = router.state.isLoading;

  return (
    <QueryClientProvider client={queryClient}>
      {(!appReady || isLoading) && (
        <div id="initial-splash" className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-100 border-t-black" />
            <p className="text-[10px] font-extralight tracking-[0.4em] text-gray-400 uppercase animate-pulse">Ressoa</p>
          </div>
        </div>
      )}
      <Outlet />
    </QueryClientProvider>
  );
}
