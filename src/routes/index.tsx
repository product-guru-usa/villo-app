import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vilo — Local Services, Just a Tap Away" },
      { name: "description", content: "Book electricians, plumbers, AC repair, cleaning and more near you." },
      { property: "og:title", content: "Vilo — Local Services" },
      { property: "og:description", content: "Book trusted local service providers in seconds." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/home" }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <button onClick={() => navigate({ to: "/home" })} className="flex min-h-screen w-full flex-col items-center justify-center bg-primary text-primary-foreground">
      <div className="text-7xl font-extrabold tracking-tight">Vilo</div>
      <p className="mt-3 font-semibold">Local Services, Just a Tap Away</p>
      <div className="mt-16 h-1 w-24 overflow-hidden rounded-full bg-primary-foreground/30">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary-foreground" />
      </div>
    </button>
  );
}
