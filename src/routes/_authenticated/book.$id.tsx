import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, Header, Shell } from "@/components/AppShell";
import { workerQuery } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/book/$id")({
  head: () => ({ meta: [{ title: "Booking — Vilo" }, { name: "description", content: "Confirm your service booking." }, { property: "og:title", content: "Booking — Vilo" }, { property: "og:description", content: "Confirm your service booking." }] }),
  component: Book,
});

const field = "w-full bg-transparent text-sm font-medium text-foreground outline-none";

function Book() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: p } = useQuery(workerQuery(id));
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [address, setAddress] = useState("Sylhet, Bangladesh");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!p || !user) return;
    if (!date || !time || !address.trim()) return setErr("Please fill in date, time and address.");
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id, worker_id: p.id, worker_name: p.name, service_name: p.services?.name ?? "", date, time, address: address.trim(),
    });
    setBusy(false);
    if (error) return setErr(error.message);
    qc.invalidateQueries({ queryKey: ["bookings"] });
    navigate({ to: "/bookings" });
  }

  return (
    <Shell nav={false}>
      <Header title="Booking" />
      <div className="space-y-3 p-4">
        {p && (
          <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <Avatar name={p.name} />
            <div><div className="font-bold text-foreground">{p.services?.name} Service</div><div className="text-sm text-muted-foreground">{p.name} · ৳ {p.rate}/hr</div></div>
          </div>
        )}
        <label className="block rounded-2xl bg-card p-3 shadow-sm"><span className="text-xs text-muted-foreground">📅 Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label>
        <label className="block rounded-2xl bg-card p-3 shadow-sm"><span className="text-xs text-muted-foreground">🕙 Time</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} /></label>
        <label className="block rounded-2xl bg-card p-3 shadow-sm"><span className="text-xs text-muted-foreground">📍 Address</span><input value={address} onChange={(e) => setAddress(e.target.value)} className={field} /></label>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={busy || !p} onClick={confirm} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Saving..." : "Confirm Booking"}</button>
      </div>
    </Shell>
  );
}
