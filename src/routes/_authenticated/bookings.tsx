import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookingCard, Header, Shell } from "@/components/AppShell";
import { bookingsQuery } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — Vilo" }, { name: "description", content: "View and manage your bookings." }, { property: "og:title", content: "My Bookings — Vilo" }, { property: "og:description", content: "View and manage your bookings." }] }),
  component: Bookings,
});

function Bookings() {
  const qc = useQueryClient();
  const { data: list = [], isLoading } = useQuery(bookingsQuery(false));
  async function cancel(id: string) {
    await supabase.from("bookings").update({ status: "Cancelled" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }
  return (
    <Shell>
      <Header title="My Bookings" back={false} />
      <div className="space-y-3 p-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && list.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No bookings yet.</p>
            <Link to="/services" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground">Find a service</Link>
          </div>
        )}
        {list.map((b) => <BookingCard key={b.id} b={b} onCancel={b.status === "Upcoming" ? () => cancel(b.id) : undefined} />)}
      </div>
    </Shell>
  );
}

