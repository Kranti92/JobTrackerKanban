'use client';

import { useState } from 'react';
import type { JobCard, Resume } from '@/lib/types';
import { COLUMNS, COLUMN_STYLES } from '@/lib/types';
import { Target, Activity, FileText, BarChart2, TrendingUp, Filter } from 'lucide-react';

interface Props {
  jobs: JobCard[];
  resumes: Resume[];
  monthlyGoal: number;
  onSetGoal: (n: number) => void;
}

/* ─── helpers ─────────────────────────────────────── */

function monthKey(dateStr: string) {
  return dateStr?.slice(0, 7) ?? '';
}

function last6Months(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    out.push({ key, label });
  }
  return out;
}

/* ─── Monthly Goal ────────────────────────────────── */
function MonthlyGoal({ jobs, goal, onSetGoal }: { jobs: JobCard[]; goal: number; onSetGoal: (n: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [input,   setInput]   = useState(String(goal));

  const now     = new Date();
  const thisYM  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const applied = jobs.filter(j => j.dateApplied?.startsWith(thisYM)).length;
  const pct     = Math.min(100, goal > 0 ? Math.round((applied / goal) * 100) : 0);

  const save = () => {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n > 0) onSetGoal(n);
    setEditing(false);
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <Target size={14} className="text-brand-500" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Monthly Goal</span>
        </div>
        <button onClick={() => { setInput(String(goal)); setEditing(v => !v); }}
          className="text-[10px] text-brand-500 font-bold hover:underline">
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input type="number" value={input} onChange={e => setInput(e.target.value)} min={1}
            className="flex-1 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          <button onClick={save}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors">
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{applied}</span>
            <span className="text-lg font-bold text-slate-400 dark:text-slate-500">/{goal}</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">applications this month</p>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>{pct}% of goal</span>
              <span>{Math.max(0, goal - applied)} remaining</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100
                    ? 'linear-gradient(90deg,#10b981,#059669)'
                    : pct >= 60
                    ? 'linear-gradient(90deg,#3b82f6,#6366f1)'
                    : 'linear-gradient(90deg,#f59e0b,#f97316)',
                }}
              />
            </div>
          </div>
          {/* mini calendar dots */}
          <div className="grid grid-cols-7 gap-1 mt-1">
            {Array.from({ length: 31 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
              if (d.getMonth() !== now.getMonth()) return null;
              const iso = d.toISOString().split('T')[0];
              const hasJob = jobs.some(j => j.dateApplied === iso);
              const isToday = iso === now.toISOString().split('T')[0];
              return (
                <div key={i} className={[
                  'w-full aspect-square rounded-sm text-[8px] flex items-center justify-center font-bold transition-all',
                  hasJob
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                    : isToday
                    ? 'border-2 border-brand-400 text-brand-500'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-300 dark:text-slate-600',
                ].join(' ')}>
                  {i + 1}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Recent Activity ─────────────────────────────── */
function RecentActivity({ jobs }: { jobs: JobCard[] }) {
  const recent = [...jobs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
          <Activity size={14} className="text-violet-500" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Recent Activity</span>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-56 scrollbar-thin">
        {recent.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No jobs yet. Add your first one!</p>
        )}
        {recent.map(j => {
          const cs = COLUMN_STYLES[j.status];
          const d  = new Date(j.createdAt);
          const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          return (
            <div key={j.id} className="flex items-center gap-2.5 py-1.5 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cs.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {j.companyName} — {j.jobTitle}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{j.status}</p>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Resume Analytics ────────────────────────────── */
function ResumeAnalytics({ jobs, resumes }: { jobs: JobCard[]; resumes: Resume[] }) {
  const allResumeNames = [
    ...new Set([
      ...resumes.map(r => r.name),
      ...jobs.map(j => j.resumeUsed).filter(Boolean),
    ]),
  ];

  const rows = allResumeNames.map(name => {
    const resume = resumes.find(r => r.name === name);
    const used   = jobs.filter(j => j.resumeUsed === name);
    const inter  = used.filter(j => j.status === 'interview' || j.status === 'offer').length;
    const offer  = used.filter(j => j.status === 'offer').length;
    const iRate  = used.length > 0 ? Math.round((inter / used.length) * 100) : 0;
    const oRate  = used.length > 0 ? Math.round((offer / used.length) * 100) : 0;
    return { name, count: used.length, iRate, oRate, fileData: resume?.fileData, fileSize: resume?.fileSize };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
          <FileText size={14} className="text-emerald-500" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Resume Analytics</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No resumes tracked yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                <th className="text-left pb-2 font-semibold text-slate-500 dark:text-slate-400">Resume</th>
                <th className="text-right pb-2 font-semibold text-slate-500 dark:text-slate-400">Used</th>
                <th className="text-right pb-2 font-semibold text-slate-500 dark:text-slate-400">📞 Int%</th>
                <th className="text-right pb-2 font-semibold text-slate-500 dark:text-slate-400">🎉 Off%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.name} className="border-b border-slate-50 dark:border-white/[0.03] last:border-0">
                  <td className="py-2 font-medium text-slate-700 dark:text-slate-300 max-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      {r.fileData
                        ? <a href={r.fileData} download={r.name} title={`Download ${r.name}`}
                            className="text-emerald-500 hover:text-emerald-600 transition-colors shrink-0" onClick={e => e.stopPropagation()}>
                            ⬇
                          </a>
                        : <span className="text-slate-300 dark:text-slate-600 shrink-0 text-[10px]">📄</span>
                      }
                      <span className="truncate">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-2 text-right text-slate-500 dark:text-slate-400">{r.count}x</td>
                  <td className="py-2 text-right">
                    <span className={r.iRate > 0 ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-300 dark:text-slate-600'}>
                      {r.iRate}%
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span className={r.oRate > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-300 dark:text-slate-600'}>
                      {r.oRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Status Distribution ─────────────────────────── */
function StatusDistribution({ jobs }: { jobs: JobCard[] }) {
  const total = jobs.length || 1;
  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
          <Filter size={14} className="text-blue-500" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Status Distribution</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {COLUMNS.map(col => {
          const count = jobs.filter(j => j.status === col.id).length;
          const pct   = (count / total) * 100;
          if (count === 0) return null;
          return (
            <div
              key={col.id}
              className="h-full transition-all duration-500 rounded-sm"
              style={{
                width: `${pct}%`,
                background: COLUMN_STYLES[col.id].statBg,
              }}
              title={`${col.label}: ${count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {COLUMNS.map(col => {
          const count = jobs.filter(j => j.status === col.id).length;
          const cs    = COLUMN_STYLES[col.id];
          return (
            <div key={col.id} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${cs.dot}`} />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">{col.label}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Apps by Month ───────────────────────────────── */
function AppsByMonth({ jobs }: { jobs: JobCard[] }) {
  const months = last6Months();
  const counts = months.map(m => jobs.filter(j => monthKey(j.dateApplied) === m.key).length);
  const max    = Math.max(...counts, 1);

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <BarChart2 size={14} className="text-amber-500" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Apps by Month</span>
      </div>

      <div className="flex items-end gap-2 h-28 pt-2">
        {months.map((m, i) => {
          const h   = counts[i] === 0 ? 4 : Math.max(8, (counts[i] / max) * 96);
          const cur = m.key === last6Months()[5].key;
          return (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
              {counts[i] > 0 && (
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{counts[i]}</span>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-700"
                style={{
                  height: `${h}px`,
                  background: cur
                    ? 'linear-gradient(180deg,#6366f1,#8b5cf6)'
                    : 'linear-gradient(180deg,#3b82f6,#60a5fa)',
                  opacity: cur ? 1 : 0.7,
                }}
                title={`${m.label}: ${counts[i]}`}
              />
              <span className="text-[9px] text-slate-400 dark:text-slate-500">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Interview Funnel ────────────────────────────── */
function InterviewFunnel({ jobs }: { jobs: JobCard[] }) {
  const stages: { label: string; count: number; color: string }[] = [
    { label: 'Wishlist',    count: jobs.length,                                                               color: '#64748b' },
    { label: 'Applied',     count: jobs.filter(j => ['applied','followup','interview','offer','rejected'].includes(j.status)).length, color: '#f59e0b' },
    { label: 'Interviewed', count: jobs.filter(j => j.status === 'interview' || j.status === 'offer').length, color: '#8b5cf6' },
    { label: 'Offered',     count: jobs.filter(j => j.status === 'offer').length,                             color: '#10b981' },
  ];
  const maxCount = Math.max(stages[0].count, 1);

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
          <TrendingUp size={14} className="text-purple-500" />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Interview Funnel</span>
      </div>

      <div className="flex flex-col gap-3">
        {stages.map(s => {
          const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 w-20 shrink-0">{s.label}</span>
              <div className="flex-1 h-3.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 w-5 text-right">{s.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── About Banner ────────────────────────────────── */
function AboutBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="text-[10px] font-bold text-brand-500 hover:underline mb-1">
      Show about ▾
    </button>
  );
  return (
    <div className="rounded-2xl border border-brand-200 dark:border-brand-500/20
                    bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-500/5 dark:to-violet-500/5
                    p-4 flex gap-4 items-start">
      <div className="text-3xl shrink-0">🎯</div>
      <div className="flex-1">
        <h2 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
          About Job Tracker Kanban
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Built for <strong>QA Engineers, Developers &amp; every job seeker</strong> who wants a clear picture of their hunt.
          Track applications from wishlist to offer, measure your interview conversion rate, see which resume gets callbacks,
          hit monthly application goals, and stay motivated through rejections.
          <span className="text-emerald-600 dark:text-emerald-400 font-bold"> 100% local</span> — stored in your browser's IndexedDB,
          no account needed, no data ever leaves your device.
        </p>
        <div className="flex flex-wrap gap-3 mt-2.5">
          {[
            ['🚀', 'Kanban board — drag to move'],
            ['📊', 'Analytics & funnel metrics'],
            ['📄', 'Resume file upload & tracking'],
            ['🎯', 'Monthly application goal'],
            ['🔍', 'Advanced search & filters'],
            ['💾', 'Export / Import JSON backup'],
          ].map(([icon, label]) => (
            <span key={label} className="inline-flex items-center gap-1 text-[10px] font-semibold
                                          text-slate-600 dark:text-slate-400">
              <span>{icon}</span>{label}
            </span>
          ))}
        </div>
      </div>
      <button onClick={() => setOpen(false)}
        className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 text-lg leading-none">
        ×
      </button>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────── */
export default function DashboardAnalytics({ jobs, resumes, monthlyGoal, onSetGoal }: Props) {
  return (
    <div className="px-4 pb-4 space-y-3">
      {/* About */}
      <AboutBanner />
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MonthlyGoal jobs={jobs} goal={monthlyGoal} onSetGoal={onSetGoal} />
        <RecentActivity jobs={jobs} />
        <ResumeAnalytics jobs={jobs} resumes={resumes} />
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatusDistribution jobs={jobs} />
        <AppsByMonth jobs={jobs} />
        <InterviewFunnel jobs={jobs} />
      </div>
    </div>
  );
}
