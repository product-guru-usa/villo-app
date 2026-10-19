import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookingCard, Header, Shell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { bookingsQuery, servicesQuery, workersQuery, type Service, type Worker } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { deleteUser, listUsers, setAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Vilo" }, { name: "description", content: "Manage services, workers, bookings and users." }, { property: "og:title", content: "Admin Panel — Vilo" }, { property: "og:description", content: "Manage Vilo." }] }),
  component: Admin,
});

const tabs = ["Services", "Workers", "Bookings", "Users"] as const;
const inp = "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const btn = "rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60";
const del = "text-sm font-semibold text-destructive";

function Admin() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Services");
  if (loading) return <Shell><p className="p-4 text-sm text-muted-foreground">Loading...</p></Shell>;
  if (!isAdmin)
    return (
      <Shell>
        <Header title="Admin Panel" />
        <div className="p-6 text-center"><p className="text-muted-foreground">You don't have admin access.</p><Link to="/home" className="mt-4 inline-block font-bold text-primary">Go home</Link></div>
      </Shell>
    );
  return (
    <Shell>
      <Header title="Admin Panel" />
      <div className="flex gap-2 overflow-x-auto px-4 pt-3">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" : "shrink-0 rounded-full bg-card px-4 py-2 text-sm text-foreground"}>{t}</button>
        ))}
      </div>
      <div className="p-4">
        {tab === "Services" && <ServicesAdmin />}
        {tab === "Workers" && <WorkersAdmin />}
        {tab === "Bookings" && <BookingsAdmin />}
        {tab === "Users" && <UsersAdmin />}
      </div>
    </Shell>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || String(Date.now());
}

function ServicesAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(servicesQuery);
  const blank = { name: "", description: "", icon: "🛠️", color: "#0f7a3d", details: "" };
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function save() {
    if (!f.name.trim()) return setErr("Name is required.");
    const row = { name: f.name.trim(), description: f.description, icon: f.icon, color: f.color, details: f.details.split("\n").map((d) => d.trim()).filter(Boolean) };
    const { error } = editing
      ? await supabase.from("services").update(row).eq("id", editing)
      : await supabase.from("services").insert({ ...row, id: slug(f.name), sort: data.length + 1 });
    if (error) return setErr(error.message);
    setF(blank); setEditing(null); setErr("");
    qc.invalidateQueries({ queryKey: ["services"] });
  }
  function edit(s: Service) {
    setEditing(s.id);
    setF({ name: s.name, description: s.description, icon: s.icon, color: s.color, details: s.details.join("\n") });
  }
  async function remove(id: string) {
    if (!confirm("Delete this service and all its workers?")) return;
    await supabase.from("services").delete().eq("id", id);
    qc.invalidateQueries();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="font-bold text-foreground">{editing ? "Edit service" : "Add service"}</h3>
        <input className={inp} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={inp} placeholder="Short description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="flex gap-2">
          <input className={inp} placeholder="Icon (emoji)" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} />
          <input type="color" aria-label="Color" className="h-10 w-14 shrink-0 rounded-lg border border-border" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} />
        </div>
        <textarea className={inp} rows={3} placeholder="Service details (one per line)" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex gap-3">
          <button className={btn} onClick={save}>{editing ? "Save" : "Add"}</button>
          {editing && <button className="text-sm text-muted-foreground" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}
        </div>
      </div>
      {data.map((s) => (
        <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg" style={{ backgroundColor: s.color }}>{s.icon}</span>
          <div className="min-w-0 flex-1"><div className="truncate font-semibold text-foreground">{s.name}</div><div className="truncate text-xs text-muted-foreground">{s.description}</div></div>
          <button className="text-sm font-semibold text-primary" onClick={() => edit(s)}>Edit</button>
          <button className={del} onClick={() => remove(s.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

function WorkersAdmin() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery(servicesQuery);
  const { data = [] } = useQuery(workersQuery());
  const blank = { service_id: "", name: "", rating: "5", reviews: "0", years: "1", rate: "300" };
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function save() {
    const service_id = f.service_id || services[0]?.id;
    if (!f.name.trim() || !service_id) return setErr("Name and service are required.");
    const row = { service_id, name: f.name.trim(), rating: Number(f.rating) || 0, reviews: parseInt(f.reviews) || 0, years: parseInt(f.years) || 0, rate: parseInt(f.rate) || 0 };
    const { error } = editing ? await supabase.from("workers").update(row).eq("id", editing) : await supabase.from("workers").insert(row);
    if (error) return setErr(error.message);
    setF(blank); setEditing(null); setErr("");
    qc.invalidateQueries({ queryKey: ["workers"] });
    qc.invalidateQueries({ queryKey: ["worker"] });
  }
  function edit(w: Worker) {
    setEditing(w.id);
    setF({ service_id: w.service_id, name: w.name, rating: String(w.rating), reviews: String(w.reviews), years: String(w.years), rate: String(w.rate) });
  }
  async function remove(id: string) {
    if (!confirm("Delete this worker?")) return;
    await supabase.from("workers").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["workers"] });
  }
  const num = (k: keyof typeof f, label: string) => (
    <label className="block flex-1"><span className="text-xs text-muted-foreground">{label}</span><input type="number" className={inp} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="font-bold text-foreground">{editing ? "Edit worker" : "Add worker"}</h3>
        <select className={inp} value={f.service_id || services[0]?.id || ""} onChange={(e) => setF({ ...f, service_id: e.target.value })}>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className={inp} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div className="flex gap-2">{num("rate", "Rate ৳/hr")}{num("years", "Years")}</div>
        <div className="flex gap-2">{num("rating", "Rating")}{num("reviews", "Reviews")}</div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex gap-3">
          <button className={btn} onClick={save}>{editing ? "Save" : "Add"}</button>
          {editing && <button className="text-sm text-muted-foreground" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}
        </div>
      </div>
      {data.map((w) => (
        <div key={w.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-foreground">{w.name}</div>
            <div className="truncate text-xs text-muted-foreground">{services.find((s) => s.id === w.service_id)?.name} · ৳ {w.rate}/hr · ⭐ {w.rating}</div>
          </div>
          <button className="text-sm font-semibold text-primary" onClick={() => edit(w)}>Edit</button>
          <button className={del} onClick={() => remove(w.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

function BookingsAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery(bookingsQuery(true));
  async function setStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this booking?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }
  return (
    <div className="space-y-3">
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isLoading && data.length === 0 && <p className="text-center text-sm text-muted-foreground">No bookings yet.</p>}
      {data.map((b) => (
        <BookingCard key={b.id} b={b}>
          <div className="mt-3 flex flex-wrap gap-3">
            {b.status !== "Confirmed" && <button className="text-sm font-semibold text-primary" onClick={() => setStatus(b.id, "Confirmed")}>Confirm</button>}
            {b.status !== "Completed" && <button className="text-sm font-semibold text-primary" onClick={() => setStatus(b.id, "Completed")}>Complete</button>}
            {b.status !== "Cancelled" && <button className={del} onClick={() => setStatus(b.id, "Cancelled")}>Cancel</button>}
            <button className={del} onClick={() => remove(b.id)}>Delete</button>
          </div>
        </BookingCard>
      ))}
    </div>
  );
}

function UsersAdmin() {
  const fetchUsers = useServerFn(listUsers);
  const setAdminFn = useServerFn(setAdmin);
  const deleteFn = useServerFn(deleteUser);
  const { user } = useAuth();
  const { data = [], isLoading, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchUsers() });
  const [err, setErr] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setErr("");
    try { await fn(); await refetch(); } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong"); }
  }

  return (
    <div className="space-y-3">
      {err && <p className="text-sm text-destructive">{err}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {data.map((u) => (
        <div key={u.id} className="rounded-2xl bg-card p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{u.name || "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
            </div>
            {u.isAdmin && <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-xs font-bold text-primary">Admin</span>}
          </div>
          {u.id !== user?.id && (
            <div className="mt-2 flex gap-4">
              <button className="text-sm font-semibold text-primary" onClick={() => run(() => setAdminFn({ data: { userId: u.id, admin: !u.isAdmin } }))}>{u.isAdmin ? "Remove admin" : "Make admin"}</button>
              <button className={del} onClick={() => confirm("Delete this user permanently?") && run(() => deleteFn({ data: { userId: u.id } }))}>Delete user</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
