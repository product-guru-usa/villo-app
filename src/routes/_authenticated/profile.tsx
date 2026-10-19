import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, Header, Shell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Vilo" }, { name: "description", content: "Your Vilo account." }, { property: "og:title", content: "Profile — Vilo" }, { property: "og:description", content: "Your Vilo account." }] }),
  component: Profile,
});

const info: Record<string, string> = {
  wallet: "Wallet balance: ৳ 0. Pay cash after service is completed.",
  help: "Need help? Call 16XXX or email support@vilo.app (placeholder).",
  about: "Vilo connects you with trusted local service professionals. Version 1.0",
};

function Profile() {
  const { user, name, isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  const row = "flex w-full items-center justify-between rounded-2xl bg-card p-4 text-left font-medium text-foreground shadow-sm";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Shell>
      <Header title="Profile" back={false} />
      <div className="p-4">
        <div className="flex flex-col items-center py-4">
          <Avatar name={name || "U"} />
          <div className="mt-2 text-lg font-bold text-foreground">{name}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
          {isAdmin && <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">Admin</span>}
        </div>
        <div className="space-y-3">
          {isAdmin && <Link to="/admin" className="flex w-full items-center justify-between rounded-2xl bg-primary p-4 font-bold text-primary-foreground shadow-sm">🛠️ Admin Panel <span>›</span></Link>}
          <Link to="/bookings" className={row}>📅 My Bookings <span>›</span></Link>
          {([["wallet", "💳 My Wallet"], ["help", "❓ Help & Support"], ["about", "ℹ️ About Vilo"]] as const).map(([k, l]) => (
            <div key={k}>
              <button onClick={() => setOpen(open === k ? null : k)} className={row}>{l} <span>{open === k ? "⌄" : "›"}</span></button>
              {open === k && <p className="px-4 pt-2 text-sm text-muted-foreground">{info[k]}</p>}
            </div>
          ))}
          <button onClick={signOut} className={`${row} text-destructive`}>🚪 Sign out</button>
        </div>
      </div>
    </Shell>
  );
}
