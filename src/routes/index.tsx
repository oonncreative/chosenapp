import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Sempre mostrar diretamente a tela de sentimentos ao abrir o app
    navigate({ to: "/home" });
  }, [navigate]);


  return null;
}
