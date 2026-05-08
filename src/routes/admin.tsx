import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronUp, ChevronDown, Search } from "lucide-react";
import { GlassCard } from "@/components/app/GlassCard";
import { KpiCard } from "@/components/app/KpiCard";
import { KPIS, MONTHLY_TREND, GRIEVANCES, TYPE_META, STATUS_COLOR } from "@/data/mock";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Intel — JanSevaAI" }, { name: "description", content: "AI-driven civic intelligence for administrators." }] }),
  component: Admin,
});

const COLORS: Record<string, string> = { Water: "#3b7de8", Road: "#f97316", Electricity: "#fbbf24", Housing: "#a78bfa", Sanitation: "#22d3ee" };

function Admin() {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "riskScore", dir: -1 });
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let r = GRIEVANCES.slice(0, 15);
    if (q) r = r.filter((x) => `${x.id}${x.type}${x.location}`.toLowerCase().includes(q.toLowerCase()));
    return [...r].sort((a, b) => {
      const av = (a as any)[sort.key]; const bv = (b as any)[sort.key];
      return av > bv ? sort.dir : av < bv ? -sort.dir : 0;
    });
  }, [sort, q]);

  const escalate = GRIEVANCES.filter((g) => g.riskScore >= 8).slice(0, 3);

  return (
    <div className="max-w-[1500px] mx-auto space-y-5">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--color-saffron)]">Administrator</div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl">Civic intelligence</h1>
        </div>
        <div className="text-xs glass px-3 py-1.5 rounded-full text-[var(--text-secondary)]">Last sync · 12s ago</div>
      </div>

      <div className="grid lg:grid-cols-10 gap-5">
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KPIS.map((k, i) => <KpiCard key={k.label} {...k} seed={i + 9} />)}
          </div>

          <GlassCard hover={false} className="h-[360px] flex flex-col">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">6-month trend</div>
                <h3 className="font-display font-bold text-xl mt-1">Complaints by category</h3>
              </div>
              <div className="flex gap-3 text-[10px] text-[var(--text-secondary)]">
                {Object.entries(COLORS).map(([k, c]) => <span key={k} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{k}</span>)}
              </div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer>
                <AreaChart data={MONTHLY_TREND}>
                  <defs>
                    {Object.entries(COLORS).map(([k, c]) => (
                      <linearGradient key={k} id={`area-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgba(59,125,232,0.08)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(7,15,43,0.95)", border: "1px solid rgba(59,125,232,0.3)", borderRadius: 12, backdropFilter: "blur(12px)" }} />
                  {Object.entries(COLORS).map(([k, c]) => (
                    <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={c} strokeWidth={2} fill={`url(#area-${k})`} animationDuration={900} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-3 gap-3">
              <h3 className="font-display font-bold text-xl">Live grievance queue</h3>
              <div className="flex items-center gap-2 h-9 px-3 glass rounded-lg text-xs flex-1 max-w-xs">
                <Search className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="bg-transparent outline-none flex-1 placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                    {[
                      { k: "id", l: "ID" }, { k: "type", l: "Type" }, { k: "ward", l: "Ward" }, { k: "filed", l: "Filed" },
                      { k: "status", l: "Status" }, { k: "daysOpen", l: "Days" }, { k: "riskScore", l: "AI Risk" }, { k: "_", l: "" }
                    ].map((c) => (
                      <th key={c.k} className="text-left font-medium px-3 py-2 cursor-pointer select-none" onClick={() => c.k !== "_" && setSort((s) => ({ key: c.k, dir: s.key === c.k ? (s.dir === 1 ? -1 : 1) : -1 }))}>
                        <span className="inline-flex items-center gap-1">{c.l}{sort.key === c.k && (sort.dir === 1 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((g, i) => {
                    const tm = TYPE_META[g.type];
                    const c = STATUS_COLOR[g.status];
                    const r = g.riskScore;
                    const rc = r <= 3 ? "#10b981" : r <= 6 ? "#f97316" : "#ef4444";
                    return (
                      <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className={`border-t border-[var(--glass-border)] ${i % 2 ? "bg-white/[0.015]" : ""} hover:bg-white/5 transition-colors`}>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-[var(--color-blue-300)] whitespace-nowrap">{g.id}</td>
                        <td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5"><span>{tm.icon}</span>{g.type}</span></td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)] whitespace-nowrap">{g.location}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)] whitespace-nowrap">{new Date(g.filed).toLocaleDateString()}</td>
                        <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${c}22`, color: c }}>{g.status}</span></td>
                        <td className="px-3 py-2.5">{g.daysOpen}d</td>
                        <td className="px-3 py-2.5"><span className="inline-flex items-center justify-center h-6 w-8 rounded-md font-mono font-bold text-[10px]" style={{ background: `${rc}22`, color: rc, border: `1px solid ${rc}44` }}>{r}</span></td>
                        <td className="px-3 py-2.5"><button className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10"><MoreHorizontal className="h-4 w-4" /></button></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="px-1">
            <h3 className="font-display font-bold text-base text-gradient">Gemini Intelligence Feed</h3>
            <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1">Updated continuously</div>
          </div>

          {[
            { title: "Water cluster forming", text: "Predictive model: 89% probability of full Koramangala outage in 48h. Pre-position 6 tankers.", conf: 89, trend: ArrowUpRight },
            { title: "Road complaints normalising", text: "Whitefield repair velocity +42% w/w. ETA to baseline: 11 days.", conf: 76, trend: ArrowDownRight },
            { title: "Pension delays anomaly", text: "Detected unusual delay clustering at Treasury Office #14. Suggested audit.", conf: 81, trend: ArrowUpRight },
          ].map((c, i) => {
            const Trend = c.trend;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-display font-bold text-sm">{c.title}</div>
                  <Trend className="h-3.5 w-3.5 text-[var(--color-saffron)]" />
                </div>
                <div className="h-12 mt-2">
                  <ResponsiveContainer>
                    <BarChart data={[1,3,2,5,4,7,6].map((y, x) => ({ x, y }))}>
                      <Bar dataKey="y" fill="#3b7de8" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{c.text}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono text-emerald-400 bg-emerald-400/10">{c.conf}% conf</span>
                  <a className="text-[10px] text-[var(--color-blue-300)] hover:underline">View full analysis →</a>
                </div>
              </motion.div>
            );
          })}

          <div className="glass p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-bold text-sm">Escalation queue</h4>
              <span className="text-[10px] text-[var(--color-crimson)]">{escalate.length} urgent</span>
            </div>
            <div className="space-y-2">
              {escalate.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-[var(--color-blue-300)]">{g.id}</div>
                    <div className="text-xs truncate">{g.title}</div>
                  </div>
                  <button className="text-[10px] px-2 h-7 rounded-md text-white" style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>Escalate</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
