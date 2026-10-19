import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Header({ title, back = true, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
      {back && (
        <button aria-label="Back" onClick={() => router.history.back()} className="text-2xl leading-none text-foreground">←</button>
      )}
      <h1 className="flex-1 truncate text-lg font-bold text-foreground">{title}</h1>
      {right}
    </header>
  );
}

const tabs = [
  { to: "/home", label: "Home", icon: "🏠" },
  { to: "/services", label: "Services", icon: "▦" },
  { to: "/bookings", label: "Bookings", icon: "📅" },
  { to: "/profile", label: "Profile", icon: "👤" },
] as const;

export function Shell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className={nav ? "flex-1 pb-20" : "flex-1"}>{children}</main>
      {nav && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex w-full max-w-md border-t border-border bg-card">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} className="flex flex-1 flex-col items-center py-2 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">{initials}</div>;
}

export function BookingCard({ b, onCancel, children }: { b: { service_name: string; worker_name: string; date: string; time: string; address: string; status: string }; onCancel?: (() => void) | undefined; children?: ReactNode }) {
  const color = b.status === "Cancelled" ? "text-destructive" : "text-primary";
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-bold text-foreground">{b.service_name}</span>
        <span className={`shrink-0 text-xs font-bold ${color}`}>{b.status}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{b.worker_name} · {b.date} at {b.time}</p>
      <p className="text-sm text-muted-foreground">📍 {b.address}</p>
      {onCancel && <button onClick={onCancel} className="mt-2 text-sm font-semibold text-destructive">Cancel booking</button>}
      {children}
    </div>
  );
}
