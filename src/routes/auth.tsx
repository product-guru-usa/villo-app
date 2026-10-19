import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => {
    const r = s["redirect"];
    return typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? { redirect: r } : {};
  },
  head: () => ({ meta: [{ title: "Sign in — Vilo" }, { name: "description", content: "Sign in or create your Vilo account." }, { property: "og:title", content: "Sign in — Vilo" }, { property: "og:description", content: "Sign in or create your Vilo account." }] }),
  component: AuthPage,
});

const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: (redirect as "/home") ?? "/home", replace: true });
  }, [user, redirect, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg(r.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-10">
      <div className="text-center text-5xl font-extrabold text-primary">Vilo</div>
      <p className="mt-2 text-center text-sm text-muted-foreground">{mode === "in" ? "Welcome back! Sign in to continue." : "Create your account"}</p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "up" && <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={input} />}
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input required type="password" minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        {msg && <p className="text-sm text-destructive">{msg}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">{busy ? "Please wait..." : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <div className="my-4 text-center text-xs text-muted-foreground">or</div>
      <button onClick={google} className="w-full rounded-xl border border-border bg-card py-3 font-semibold text-foreground">Continue with Google</button>
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-6 text-sm font-semibold text-primary">
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
