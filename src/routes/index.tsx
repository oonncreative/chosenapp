import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const done = typeof window !== "undefined" && localStorage.getItem("onboarded") === "true";
    navigate({ to: done ? "/home" : "/onboarding", replace: true });
  }, [navigate]);

  return null;
}
