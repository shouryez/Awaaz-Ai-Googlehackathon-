import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, Phone, MapPin, Building2, Hash, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — JanSevaAI" }, { name: "description", content: "Sign in or create your citizen account." }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (!loading && user) nav({ to: "/" }); }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, mobile, address, ward, city, pincode },
          },
        });
        if (error) throw error;
      }
      nav({ to: "/" });
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 gap-0">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full" style={{ background: "var(--gradient-primary)", filter: "blur(120px)", opacity: 0.35 }} />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full" style={{ background: "var(--gradient-saffron)", filter: "blur(120px)", opacity: 0.25 }} />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="h-10 w-10 grid place-items-center" style={{ background: "var(--gradient-primary)", clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)" }}>
              <span className="font-display font-extrabold text-white text-sm">JS</span>
            </div>
            <div className="font-display font-extrabold text-xl">JanSeva<span className="text-[var(--color-saffron)]">AI</span></div>
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--color-saffron)] mb-4">
            <Sparkles className="h-3 w-3" /> Citizen Identity
          </div>
          <h2 className="font-display font-extrabold text-4xl leading-tight">
            Your voice. <br /> <span className="text-gradient">Tracked. Resolved.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)]">
            Create your citizen account to file grievances, track every escalation, and unlock personalised civic intelligence — all in one secure dashboard.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[{ k: "1.2M+", v: "Citizens" },{ k: "94%", v: "SLA met" },{ k: "12s", v: "Avg routing" }].map((s) => (
              <div key={s.k} className="glass p-3 text-center">
                <div className="font-display font-extrabold text-lg text-gradient-blue">{s.k}</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Powered by Bharat Civic Stack · End-to-end encrypted
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-1 p-1 glass rounded-full w-fit mx-auto mb-6">
            {(["signin","signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setErr(null); }} className={`px-5 h-9 rounded-full text-xs font-medium transition-all ${mode === m ? "text-white" : "text-[var(--text-secondary)]"}`} style={mode === m ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-blue)" } : {}}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display font-extrabold text-3xl">{mode === "signin" ? "Welcome back" : "Join JanSevaAI"}</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{mode === "signin" ? "Access your grievances and track resolutions." : "Tell us about you so we route smarter."}</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                  <Field icon={UserIcon} placeholder="Full name" value={fullName} onChange={setFullName} required />
                  <Field icon={Phone} placeholder="Mobile number (10 digits)" value={mobile} onChange={setMobile} pattern="\d{10}" required type="tel" />
                  <Field icon={MapPin} placeholder="Address" value={address} onChange={setAddress} required />
                  <div className="grid grid-cols-3 gap-3">
                    <Field icon={Hash} placeholder="Ward" value={ward} onChange={setWard} />
                    <Field icon={Building2} placeholder="City" value={city} onChange={setCity} required />
                    <Field icon={Hash} placeholder="Pincode" value={pincode} onChange={setPincode} pattern="\d{6}" required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Field icon={Mail} placeholder="you@example.com" value={email} onChange={setEmail} type="email" required />
            <Field icon={Lock} placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"} value={password} onChange={setPassword} type="password" required />

            {err && <div className="text-xs text-[var(--color-crimson)] glass p-3" style={{ borderColor: "rgba(239,68,68,0.4)" }}>{err}</div>}

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={busy} className="w-full h-12 rounded-xl text-white font-display font-bold flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-blue)" }}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
            </motion.button>

            <p className="text-center text-xs text-[var(--text-secondary)] pt-2">
              {mode === "signin" ? "New here? " : "Already have an account? "}
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-[var(--color-blue-300)] hover:underline font-medium">
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

type FieldProps = { icon: any; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">;
function Field({ icon: Icon, value, onChange, ...rest }: FieldProps) {
  return (
    <div className="flex items-center gap-2 h-11 px-3 glass rounded-xl focus-within:border-[var(--color-blue-400)] focus-within:shadow-[0_0_0_3px_rgba(59,125,232,0.15)] transition">
      <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-muted)]" />
    </div>
  );
}