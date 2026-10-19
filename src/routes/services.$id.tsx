import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Header, Shell } from "@/components/AppShell";
import { servicesQuery, workersQuery } from "@/lib/data";

export const Route = createFileRoute("/services/$id")({
  head: () => ({ meta: [{ title: "Choose a professional — Vilo" }, { name: "description", content: "Choose a trusted professional." }, { property: "og:title", content: "Choose a professional — Vilo" }, { property: "og:description", content: "Choose a trusted professional." }] }),
  component: Providers,
});

function Providers() {
  const { id } = Route.useParams();
  const { data: services = [] } = useQuery(servicesQuery);
  const { data: workers = [], isLoading } = useQuery(workersQuery(id));
  const s = services.find((x) => x.id === id);
  return (
    <Shell>
      <Header title={s?.name ?? "Service"} />
      <div className="space-y-3 p-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && workers.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No workers available yet.</p>}
        {workers.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <Avatar name={p.name} />
            <Link to="/provider/$id" params={{ id: p.id }} className="min-w-0 flex-1">
              <div className="font-semibold text-foreground">{p.name}</div>
              <div className="text-xs text-muted-foreground">⭐ {p.rating} ({p.reviews}) · {p.years}+ Years Exp.</div>
              <div className="text-sm font-bold text-primary">৳ {p.rate}/hr</div>
            </Link>
            <Link to="/book/$id" params={{ id: p.id }} className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Book</Link>
          </div>
        ))}
      </div>
    </Shell>
  );
}
