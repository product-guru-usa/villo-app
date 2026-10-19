import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Shell } from "@/components/AppShell";
import { servicesQuery } from "@/lib/data";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — Vilo" }, { name: "description", content: "Find local services near you." }, { property: "og:title", content: "Home — Vilo" }, { property: "og:description", content: "Find local services near you." }] }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery(servicesQuery);
  const list = data.filter((s) => s.name.toLowerCase().indexOf(q.toLowerCase()) !== -1);
  return (
    <Shell>
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-primary">Vilo</span>
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-foreground">📍 Sylhet</span>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search service..." className="mt-4 w-full rounded-full border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-primary">
          <img src={hero} alt="Electrician at work" width={1024} height={640} className="absolute right-0 top-0 h-full w-1/2 object-cover" />
          <div className="relative w-3/5 p-4 text-primary-foreground">
            <h2 className="text-lg font-bold leading-tight">Need Any Local Service?</h2>
            <p className="mt-1 text-xs">We are here for you!</p>
            <button onClick={() => navigate({ to: "/services" })} className="mt-3 rounded-full bg-card px-4 py-2 text-xs font-bold text-primary">Book Now →</button>
          </div>
        </div>
        <h3 className="mt-5 font-bold text-foreground">Services</h3>
        {isLoading && <p className="mt-3 text-sm text-muted-foreground">Loading...</p>}
        <div className="mt-3 grid grid-cols-4 gap-3">
          {list.map((s) => (
            <Link key={s.id} to="/services/$id" params={{ id: s.id }} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: s.color }}>{s.icon}</span>
              <span className="mt-1 text-xs text-foreground">{s.name}</span>
            </Link>
          ))}
        </div>
        {!isLoading && list.length === 0 && <p className="mt-4 text-center text-sm text-muted-foreground">No service found.</p>}
      </div>
    </Shell>
  );
}
