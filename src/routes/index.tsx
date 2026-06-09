import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para onboarding na primeira visita
    navigate({ to: "/onboarding" });
  }, [navigate]);



  return null;
}
