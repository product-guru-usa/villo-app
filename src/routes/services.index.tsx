import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header, Shell } from "@/components/AppShell";
import { servicesQuery } from "@/lib/data";

export const Route = createFileRoute("/services/")({
  head: () => ({ meta: [{ title: "All Services — Vilo" }, { name: "description", content: "Browse all local services." }, { property: "og:title", content: "All Services — Vilo" }, { property: "og:description", content: "Browse all local services." }] }),
  component: Services,
});

function Services() {
  const { data = [], isLoading } = useQuery(servicesQuery);
  return (
    <Shell>
      <Header title="All Services" />
      <div className="space-y-3 p-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {data.map((s) => (
          <Link key={s.id} to="/services/$id" params={{ id: s.id }} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl" style={{ backgroundColor: s.color }}>{s.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground">{s.name}</div>
              <div className="truncate text-xs text-muted-foreground">{s.description}</div>
            </div>
            <span className="text-muted-foreground">›</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
