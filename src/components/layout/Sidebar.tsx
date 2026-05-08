import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, FilePlus2, ListChecks, Map, BrainCircuit, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";

import { useTranslation } from "@/lib/i18n";

const useNavItems = () => {
  const { t } = useTranslation();
  return [
    { to: "/", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/file-complaint", label: t("file_complaint"), icon: FilePlus2 },
    { to: "/my-grievances", label: t("my_grievances"), icon: ListChecks },
    { to: "/heatmap", label: t("heatmap"), icon: Map },
    { to: "/admin", label: t("admin"), icon: BrainCircuit },
  ];
};

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const items = useNavItems();
  const initial = (user?.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase() ?? "G";
  const display = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Guest";
  const sub = user ? (user.user_metadata?.city ? `Citizen · ${user.user_metadata.city}` : "Citizen account") : "Sign in to file complaints";
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] glass-strong z-40 flex-col p-4 border-r border-[var(--glass-border)]">
      <Link to="/" className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="relative h-10 w-10 grid place-items-center" style={{
          background: "var(--gradient-primary)",
          clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
        }}>
          <span className="font-display font-extrabold text-white text-sm tracking-tighter">JS</span>
        </div>
        <div className="leading-tight">
          <div className="font-display font-extrabold text-lg">JanSeva<span className="text-[var(--color-saffron)]">AI</span></div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">Civic Intelligence</div>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 mt-2">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link key={it.to} to={it.to} className="block">
              <div className={`relative flex items-center gap-3 h-11 px-3 rounded-xl transition-all ${active ? "text-[var(--color-blue-300)]" : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"}`}>
                {active && (
                  <motion.div layoutId="sb-active" className="absolute inset-0 rounded-xl glass" style={{ borderLeft: "3px solid var(--color-blue-400)" }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <Icon className="h-[18px] w-[18px] relative z-10" />
                <span className="relative z-10 text-sm font-medium">{it.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 pt-3 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-2 px-2 text-xs text-[var(--text-secondary)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-emerald)]"></span>
          </span>
          System Live · 12ms
        </div>
        <div className="flex items-center gap-3 px-2 py-2 glass rounded-xl">
          <div className="h-8 w-8 rounded-full grid place-items-center font-display font-bold text-sm text-white" style={{ background: "var(--gradient-saffron)" }}>{initial}</div>
          <div className="text-xs leading-tight flex-1 min-w-0">
            <div className="font-medium truncate">{display}</div>
            <div className="text-[var(--text-secondary)] truncate">{sub}</div>
          </div>
          {user ? (
            <button onClick={() => signOut()} title="Sign out" className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10 text-[var(--text-secondary)]">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link to="/auth" title="Sign in" className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10 text-[var(--color-blue-300)]">
              <LogIn className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = useNavItems();
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-strong rounded-2xl p-2 flex justify-between">
      {items.map((it) => {
        const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
        const Icon = it.icon;
        return (
          <Link key={it.to} to={it.to} className={`flex-1 flex flex-col items-center py-2 rounded-xl text-[10px] ${active ? "text-[var(--color-blue-300)] bg-white/5" : "text-[var(--text-secondary)]"}`}>
            <Icon className="h-5 w-5 mb-0.5" />
            <span className="font-medium">{it.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
