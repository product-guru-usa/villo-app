import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Header, Shell } from "@/components/AppShell";
import { workerQuery } from "@/lib/data";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/provider/$id")({
  head: () => ({ meta: [{ title: "Service details — Vilo" }, { name: "description", content: "Service details and booking." }, { property: "og:title", content: "Service details — Vilo" }, { property: "og:description", content: "Service details and booking." }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery(workerQuery(id));
  const s = p?.services;
  return (
    <Shell nav={false}>
      <Header title={s ? `${s.name} Service` : "Service"} />
      {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading...</p>}
      {!isLoading && !p && <p className="p-4 text-sm text-muted-foreground">This worker is no longer available.</p>}
      {p && (
        <>
          <img src={hero} alt={s?.name ?? ""} width={1024} height={640} className="h-52 w-full object-cover" />
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={p.name} />
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground">{p.name}</div>
                <div className="text-sm text-muted-foreground">⭐ {p.rating} ({p.reviews}) · {p.years}+ Years Exp.</div>
              </div>
              <div className="ml-auto shrink-0 font-bold text-primary">৳ {p.rate}/hr</div>
            </div>
            <h3 className="mt-5 font-bold text-foreground">Service Details</h3>
            <ul className="mt-2 space-y-2">
              {(s?.details ?? []).map((d) => <li key={d} className="text-sm text-foreground"><span className="text-primary">✔</span> {d}</li>)}
            </ul>
            <Link to="/book/$id" params={{ id: p.id }} className="mt-8 block rounded-xl bg-primary py-3 text-center font-bold text-primary-foreground">Book Now</Link>
          </div>
        </>
      )}
    </Shell>
  );
}
