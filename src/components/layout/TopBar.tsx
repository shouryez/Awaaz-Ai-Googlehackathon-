import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Command, Sun, Moon, LogIn, ExternalLink } from "lucide-react";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { FEED_EVENTS, TYPE_META, STATUS_COLOR } from "@/data/mock";
import { formatDistanceToNow } from "date-fns";

import { useTranslation, type Language } from "@/lib/i18n";

const langs: { label: string; id: Language }[] = [
  { label: "🇮🇳 EN", id: "en" },
  { label: "हि", id: "hi" },
  { label: "ಕ", id: "kn" },
  { label: "த", id: "ta" },
];

export function TopBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const crumb = path === "/" ? "Dashboard" : path.replace("/", "").replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <header className="sticky top-0 z-30 h-16 glass-strong border-b border-[var(--glass-border)] flex items-center px-6 gap-4">
      <div className="hidden md:flex items-center text-sm text-[var(--text-secondary)] gap-2">
        <span className="text-[var(--color-blue-300)]">JanSeva</span>
        <span>/</span>
        <span className="text-white font-medium">{crumb}</span>
      </div>
      <div className="flex-1 max-w-md mx-auto">
        <div className="flex items-center gap-2 h-10 px-3 glass rounded-xl text-sm text-[var(--text-secondary)]">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t("search_placeholder")}</span>
          <span className="sm:hidden">Search…</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-[var(--glass-border)] font-mono"><Command className="h-2.5 w-2.5" />K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-1 glass rounded-full p-1">
        {langs.map((l) => (
          <button 
            key={l.id} 
            onClick={() => setLanguage(l.id)} 
            className={`text-xs px-2.5 py-1 rounded-full transition-all ${language === l.id ? "bg-[var(--color-blue-500)] text-white" : "text-[var(--text-secondary)] hover:text-white"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <button onClick={toggle} title="Toggle theme" className="h-10 w-10 grid place-items-center glass rounded-xl hover:text-[var(--color-blue-300)] transition-colors">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="relative h-10 w-10 grid place-items-center glass rounded-xl hover:text-[var(--color-blue-300)] transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-saffron)] ring-2 ring-[var(--color-navy-900)]"></span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content 
            className="w-80 glass-strong p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 z-[60] border border-[var(--glass-border)] rounded-2xl" 
            sideOffset={8}
            align="end"
          >
            <div className="p-4 border-b border-[var(--glass-border)] bg-white/5">
              <h3 className="text-sm font-bold flex items-center justify-between">
                Recent Activity
                <span className="text-[10px] font-medium bg-[var(--color-blue-500)]/20 text-[var(--color-blue-300)] px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
              </h3>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {FEED_EVENTS.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-secondary)]">No recent activities</div>
              ) : (
                FEED_EVENTS.map((ev, i) => {
                  const meta = TYPE_META[ev.type];
                  return (
                    <div key={i} className="p-3 border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg grid place-items-center text-sm shrink-0" style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate group-hover:text-[var(--color-blue-300)] transition-colors">{ev.title}</div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center justify-between">
                            <span>{ev.ward.split(" ")[0]} · {ev.ago}</span>
                            <span style={{ color: STATUS_COLOR[ev.status] }}>{ev.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Link to="/my-grievances" className="block p-3 text-center text-[10px] font-bold text-[var(--color-blue-300)] hover:bg-white/5 uppercase tracking-widest border-t border-[var(--glass-border)]">
              View All Activities <ExternalLink className="inline h-2.5 w-2.5 ml-1" />
            </Link>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {!user && (
        <Link to="/auth" className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-medium text-white" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-blue)" }}>
          <LogIn className="h-3.5 w-3.5" /> Sign in
        </Link>
      )}
    </header>
  );
}
