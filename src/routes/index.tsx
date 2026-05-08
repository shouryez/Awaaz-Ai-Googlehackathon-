import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/app/GlassCard";
import { KpiCard } from "@/components/app/KpiCard";
import { KPIS, COMPLAINTS_BY_TYPE, FEED_EVENTS, TYPE_META, STATUS_COLOR } from "@/data/mock";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Dashboard });

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } } };

function Particles() {
  const arr = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {arr.map((_, i) => (
        <span key={i} className="absolute block h-1 w-1 rounded-full bg-[var(--color-blue-300)]" style={{
          left: `${(i * 37) % 100}%`,
          bottom: 0,
          opacity: 0.5,
          animation: `float-particle ${10 + (i % 8)}s linear infinite`,
          animationDelay: `${(i * 0.6) % 9}s`,
        }} />
      ))}
    </div>
  );
}

function Dashboard() {
  const { t } = useTranslation();
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6 max-w-[1400px] mx-auto">
      <motion.section variants={fadeUp} className="relative glass overflow-hidden p-8 md:p-12 grid-bg">
        <Particles />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--color-blue-300)] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-saffron)] animate-pulse" /> Bharat Civic Stack · v2.4
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight">
            {t("hero_title").split(" ").slice(0, -1).join(" ")} <span className="text-gradient">{t("hero_title").split(" ").slice(-1)}</span>
          </h1>
          <p className="mt-4 text-[var(--text-secondary)] text-base md:text-lg max-w-xl">{t("hero_subtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/file-complaint" className="inline-flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-medium text-white" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-blue)" }}>{t("file_btn")}</Link>
            <Link to="/heatmap" className="inline-flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-medium glass">{t("heatmap_btn")}</Link>
          </div>
        </div>
      </motion.section>

      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} variants={fadeUp}>
            <KpiCard {...k} seed={i + 2} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <GlassCard hover={false} className="h-[380px] flex flex-col">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">By Category</div>
                <h3 className="font-display font-bold text-xl mt-1">Complaints distribution</h3>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Last 30 days</div>
            </div>
            <div className="flex-1 -ml-2">
              <ResponsiveContainer>
                <BarChart data={COMPLAINTS_BY_TYPE}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6fa3f7" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#1a56c4" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(59,125,232,0.08)" vertical={false} />
                  <XAxis dataKey="type" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(59,125,232,0.06)" }} contentStyle={{ background: "rgba(7,15,43,0.95)", border: "1px solid rgba(59,125,232,0.3)", borderRadius: 12, backdropFilter: "blur(12px)" }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[8,8,0,0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard hover={false} className="h-[380px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Live Feed</div>
                <h3 className="font-display font-bold text-xl mt-1">Streaming grievances</h3>
              </div>
              <span className="text-xs flex items-center gap-1.5 text-[var(--color-emerald)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-emerald)] animate-pulse" />Live</span>
            </div>
            <div className="flex-1 relative overflow-hidden mask-fade">
              <div className="scroll-feed space-y-2">
                {[...FEED_EVENTS, ...FEED_EVENTS].map((g, i) => (
                  <div key={i} className="glass p-3 flex items-center gap-3 text-xs" style={{ borderLeft: `3px solid ${TYPE_META[g.type].color}` }}>
                    <span className="text-lg">{TYPE_META[g.type].icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] text-[var(--color-blue-300)]">{g.id}</div>
                      <div className="truncate text-[var(--text-primary)]">{g.title}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">{g.location} · {g.ago}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap" style={{ background: `${STATUS_COLOR[g.status]}22`, color: STATUS_COLOR[g.status] }}>{g.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <div className="flex items-baseline justify-between mb-3 px-1">
          <h3 className="font-display font-bold text-xl">Quick file by category</h3>
          <Link to="/file-complaint" className="text-xs text-[var(--color-blue-300)] hover:underline">All categories →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(TYPE_META) as Array<keyof typeof TYPE_META>).slice(0,6).map((t, i) => {
            const m = TYPE_META[t];
            return (
              <Link key={t} to="/file-complaint">
                <GlassCard className="text-center group cursor-pointer relative overflow-hidden">
                  <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: m.color }} />
                  <div className="text-3xl mb-2 transition-transform group-hover:scale-110">{m.icon}</div>
                  <div className="font-medium text-sm">{t}</div>
                  <div className="text-[10px] mt-1 text-[var(--text-secondary)]">{(120 + i * 47)} open</div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
