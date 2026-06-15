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

  const cards: {
    emoji: string; label: string; value: string | number; sub?: string;
    from: string; to: string;
  }[] = [
    { emoji: '🗃️', label: 'TOTAL',          value: total,                from: '#6366f1', to: '#8b5cf6' },
    { emoji: '🚀', label: 'APPLIED',        value: byStatus('applied'),  from: '#3b82f6', to: '#1d4ed8' },
    { emoji: '🎙️', label: 'INTERVIEW',      value: byStatus('interview'),from: '#8b5cf6', to: '#6d28d9' },
    { emoji: '🏆', label: 'OFFER',          value: byStatus('offer'),    from: '#10b981', to: '#059669' },
    { emoji: '💪', label: 'REJECTED',       value: byStatus('rejected'), from: '#ef4444', to: '#b91c1c', sub: 'keep going!' },
    { emoji: '📆', label: 'THIS MONTH',     value: thisMonth,            from: '#06b6d4', to: '#0891b2' },
    { emoji: '📊', label: 'INTERVIEW RATE', value: `${interviewRate}%`,  from: '#f97316', to: '#ea580c', sub: 'of apps' },
  ];

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-7 gap-3">
        {cards.map(c => (
          <div
            key={c.label}
            className="rounded-2xl text-white p-4 flex flex-col gap-1.5 shadow-lg relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
          >
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 bg-white" />
            <span className="text-2xl leading-none">{c.emoji}</span>
            <p className="text-[10px] font-extrabold tracking-wider opacity-75 uppercase leading-tight">{c.label}</p>
            <p className="text-3xl font-extrabold leading-none">{c.value}</p>
            {c.sub && <p className="text-[10px] opacity-65 leading-tight">{c.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
