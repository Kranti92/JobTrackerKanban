'use client';

import type { JobCard } from '@/lib/types';

interface Props { jobs: JobCard[] }

export default function DashboardStats({ jobs }: Props) {
  const now      = new Date();
  const thisYM   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const total     = jobs.length;
  const byStatus  = (s: string) => jobs.filter(j => j.status === s).length;
  const thisMonth = jobs.filter(j => j.dateApplied?.startsWith(thisYM)).length;

  const applied   = byStatus('applied') + byStatus('followup') + byStatus('interview') + byStatus('offer') + byStatus('rejected');
  const interviews = byStatus('interview') + byStatus('offer');
  const offers    = byStatus('offer');

  const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
  const successRate   = applied > 0 ? Math.round((offers     / applied) * 100) : 0;
  const offerRate     = interviews > 0 ? Math.round((offers  / interviews) * 100) : 0;

  const avgDays = (fromStatus: string[], toStatus: string) => {
    const matched = jobs.filter(j => toStatus === j.status && j.dateApplied && j.updatedAt);
    if (!matched.length) return 0;
    const total = matched.reduce((acc, j) => {
      const diff = new Date(j.updatedAt).getTime() - new Date(j.dateApplied).getTime();
      return acc + Math.max(0, Math.floor(diff / 86400000));
    }, 0);
    return Math.round(total / matched.length);
  };

  const avgDaysOffer    = avgDays(['applied'], 'offer');
  const avgDaysRejected = avgDays(['applied'], 'rejected');

  const cards: {
    emoji: string; label: string; value: string | number; sub?: string;
    from: string; to: string;
  }[] = [
    { emoji: '🗃️',  label: 'TOTAL',           value: total,                  from: '#6366f1', to: '#8b5cf6' },
    { emoji: '🌟',  label: 'WISHLIST',         value: byStatus('wishlist'),   from: '#64748b', to: '#475569' },
    { emoji: '🚀',  label: 'APPLIED',          value: byStatus('applied'),    from: '#3b82f6', to: '#1d4ed8' },
    { emoji: '🔔',  label: 'FOLLOW-UP',        value: byStatus('followup'),   from: '#f59e0b', to: '#d97706' },
    { emoji: '🎙️',  label: 'INTERVIEW',        value: byStatus('interview'),  from: '#8b5cf6', to: '#6d28d9' },
    { emoji: '🏆',  label: 'OFFER',            value: byStatus('offer'),      from: '#10b981', to: '#059669' },
    { emoji: '💪',  label: 'REJECTED',         value: byStatus('rejected'),   from: '#ef4444', to: '#b91c1c', sub: 'keep going!' },
    { emoji: '📆',  label: 'THIS MONTH',       value: thisMonth,              from: '#06b6d4', to: '#0891b2' },
    { emoji: '📊',  label: 'INTERVIEW RATE',   value: `${interviewRate}%`,    from: '#f97316', to: '#ea580c', sub: 'of applications' },
    { emoji: '🎯',  label: 'SUCCESS RATE',     value: `${successRate}%`,      from: '#22c55e', to: '#16a34a', sub: 'applied → offer' },
    { emoji: '💼',  label: 'OFFER RATE',       value: `${offerRate}%`,        from: '#14b8a6', to: '#0d9488', sub: 'interview → offer' },
    { emoji: '⚡',  label: 'AVG DAYS→OFFER',   value: `${avgDaysOffer}d`,     from: '#a855f7', to: '#7c3aed', sub: 'applied to offer' },
    { emoji: '🔄',  label: 'AVG DAYS→REJ',     value: `${avgDaysRejected}d`,  from: '#ec4899', to: '#be185d', sub: 'applied to reject' },
  ];

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {cards.map(c => (
          <div
            key={c.label}
            className="shrink-0 rounded-2xl text-white p-3 w-[120px] flex flex-col gap-1 shadow-lg relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          >
            {/* Background glow blob */}
            <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full opacity-20 bg-white" />

            <span className="text-lg leading-none">{c.emoji}</span>
            <p className="text-[9px] font-extrabold tracking-widest opacity-80 uppercase leading-tight mt-0.5">{c.label}</p>
            <p className="text-2xl font-extrabold leading-none mt-0.5">{c.value}</p>
            {c.sub && <p className="text-[9px] opacity-70 leading-tight">{c.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
