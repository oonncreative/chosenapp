import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel Admin · Chosen" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área restrita de administração do Chosen." },
    ],
  }),
  component: () => <Outlet />,
});
