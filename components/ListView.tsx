'use client';

import { useState } from 'react';
import type { JobCard } from '@/lib/types';
import { COLUMN_STYLES, PRIORITY_META } from '@/lib/types';
import { daysSince } from '@/lib/utils';
import {
  Pencil, Trash2, ExternalLink, ChevronUp, ChevronDown,
  FileText, Calendar, Banknote, Globe,
} from 'lucide-react';

type SortKey = 'companyName' | 'jobTitle' | 'status' | 'priority' | 'dateApplied' | 'source' | 'salaryRange';

interface Props {
  jobs: JobCard[];
  onEdit: (job: JobCard) => void;
  onDelete: (job: JobCard) => void;
}

export default function ListView({ jobs, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('dateApplied');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const STATUS_ORDER   = { wishlist: 0, applied: 1, followup: 2, interview: 3, offer: 4, rejected: 5 };

  const sorted = [...jobs].sort((a, b) => {
    let diff = 0;
    switch (sortKey) {
      case 'companyName':  diff = a.companyName.localeCompare(b.companyName); break;
      case 'jobTitle':     diff = a.jobTitle.localeCompare(b.jobTitle); break;
      case 'status':       diff = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0); break;
      case 'priority':     diff = (PRIORITY_ORDER[a.priority ?? 'medium']) - (PRIORITY_ORDER[b.priority ?? 'medium']); break;
      case 'dateApplied':  diff = a.dateApplied.localeCompare(b.dateApplied); break;
      case 'source':       diff = (a.source ?? '').localeCompare(b.source ?? ''); break;
      case 'salaryRange':  diff = (a.salaryRange ?? '').localeCompare(b.salaryRange ?? ''); break;
    }
    return sortDir === 'asc' ? diff : -diff;
  });

  return (
    <div className="px-4 pb-8">
      <div className="rounded-2xl border border-slate-200 dark:border-white/[0.07] overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm">

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
                <Th label="#" />
                <Th label="Company"      sortKey="companyName"  active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Role"         sortKey="jobTitle"     active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Status"       sortKey="status"       active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Priority"     sortKey="priority"     active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Source"       sortKey="source"       active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Date"         sortKey="dateApplied"  active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Resume" />
                <Th label="Salary"       sortKey="salaryRange"  active={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Notes" />
                <Th label="" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-sm text-slate-400 dark:text-slate-600">
                    No jobs match current filters.
                  </td>
                </tr>
              )}
              {sorted.map((job, idx) => {
                const cs   = COLUMN_STYLES[job.status];
                const pm   = PRIORITY_META[job.priority ?? 'medium'];
                const days = daysSince(job.dateApplied);
                return (
                  <tr
                    key={job.id}
                    className="border-b border-slate-50 dark:border-white/[0.04] last:border-0
                               hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors group"
                  >
                    {/* # */}
                    <td className="py-3 pl-4 pr-2 text-[11px] text-slate-400 dark:text-slate-600 font-mono w-8">
                      {idx + 1}
                    </td>

                    {/* Company */}
                    <td className="py-3 px-3 min-w-[130px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cs.dot}`} />
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                          {job.companyName}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3 min-w-[160px]">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] block">
                        {job.jobTitle}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${cs.badge}`}>
                        {job.status === 'followup' ? 'Follow-up' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${pm.badge}`}>
                        <span className={`w-1 h-1 rounded-full ${pm.dot}`} />
                        {pm.label}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3">
                      {job.source ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Globe size={10} />
                          {job.source}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                          <Calendar size={10} />
                          {job.dateApplied}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600">
                          {days === 0 ? 'today' : `${days}d ago`}
                        </span>
                      </div>
                    </td>

                    {/* Resume */}
                    <td className="py-3 px-3 max-w-[120px]">
                      {job.resumeUsed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                                         text-slate-500 dark:text-slate-400 truncate
                                         bg-slate-100 dark:bg-white/[0.08] px-1.5 py-0.5 rounded
                                         border border-slate-200 dark:border-white/[0.08]">
                          <FileText size={9} />
                          {job.resumeUsed}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Salary */}
                    <td className="py-3 px-3">
                      {job.salaryRange ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Banknote size={10} />
                          {job.salaryRange}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-3 max-w-[180px]">
                      {job.notes ? (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-snug">
                          {job.notes}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-2 pr-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {job.linkedinUrl && (
                          <a
                            href={job.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center rounded-lg
                                       bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]
                                       text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}
                        <button
                          onClick={() => onEdit(job)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]
                                     text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={() => onDelete(job)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]
                                     text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {sorted.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
            <p className="text-[11px] text-slate-400 dark:text-slate-600">
              {sorted.length} {sorted.length === 1 ? 'job' : 'jobs'} · click column headers to sort
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sortable header cell ───────────────────────── */
function Th({
  label, sortKey, active, dir, onSort,
}: {
  label: string;
  sortKey?: SortKey;
  active?: SortKey;
  dir?: 'asc' | 'desc';
  onSort?: (k: SortKey) => void;
}) {
  const isActive = sortKey && active === sortKey;
  return (
    <th
      className={`px-3 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider select-none
        ${sortKey ? 'cursor-pointer hover:text-brand-500 dark:hover:text-brand-400 transition-colors' : ''}
        ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}
      onClick={() => sortKey && onSort?.(sortKey)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortKey && (
          <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
            {isActive && dir === 'asc'
              ? <ChevronUp size={10} />
              : <ChevronDown size={10} />}
          </span>
        )}
      </span>
    </th>
  );
}
