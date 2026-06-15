'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JobCard as JobCardType } from '@/lib/types';
import { COLUMN_STYLES, PRIORITY_META } from '@/lib/types';
import { daysSince } from '@/lib/utils';
import { ExternalLink, Pencil, Trash2, GripVertical, Calendar, Banknote, FileText } from 'lucide-react';

interface Props {
  job: JobCardType;
  onEdit: (job: JobCardType) => void;
  onDelete: (job: JobCardType) => void;
  overlay?: boolean;
}

export default function JobCard({ job, onEdit, onDelete, overlay = false }: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const days = daysSince(job.dateApplied);
  const cs   = COLUMN_STYLES[job.status];
  const pm   = PRIORITY_META[job.priority ?? 'medium'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'relative group rounded-xl border-l-4 p-3.5 select-none cursor-grab active:cursor-grabbing touch-none',
        cs.cardBorder,
        'bg-white dark:bg-white/[0.04] border border-l-4 border-slate-200/70 dark:border-white/[0.07]',
        overlay
          ? 'shadow-2xl shadow-brand-500/20 rotate-1 scale-[1.02] cursor-grabbing'
          : isDragging
          ? 'opacity-30'
          : 'hover:shadow-md dark:hover:shadow-black/40 transition-shadow',
      ].join(' ')}
    >
      {/* Grip indicator */}
      <div className="absolute right-2.5 top-3 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none text-slate-400">
        <GripVertical size={13} />
      </div>

      {/* Priority + Company + Title */}
      <div className="pr-6 mb-2">
        <div className="flex items-center gap-1.5 mb-1">
          {job.priority && job.priority !== 'low' && (
            <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${pm.badge}`}>
              <span className={`w-1 h-1 rounded-full ${pm.dot}`} />
              {pm.label}
            </span>
          )}
          {job.source && (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{job.source}</span>
          )}
        </div>
        <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">{job.companyName}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{job.jobTitle}</p>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {job.resumeUsed && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold
                           bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400
                           border border-slate-200 dark:border-white/[0.08]">
            <FileText size={9} />
            {job.resumeUsed}
          </span>
        )}

        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
          <Calendar size={9} />
          {days === 0 ? 'Today' : `${days}d ago`}
        </span>

        {job.salaryRange && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <Banknote size={9} />
            {job.salaryRange}
          </span>
        )}

        {job.linkedinUrl && (
          <a
            href={job.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            className="ml-auto inline-flex items-center gap-1 text-[10px] text-blue-500 dark:text-blue-400 hover:underline"
          >
            <ExternalLink size={9} />
            Link
          </a>
        )}
      </div>

      {job.notes && (
        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 leading-snug">
          {job.notes}
        </p>
      )}

      {/* Hover actions — stop pointer propagation so they don't trigger drag */}
      <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onEdit(job); }}
          className="w-6 h-6 flex items-center justify-center rounded-md
                     bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08]
                     text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        >
          <Pencil size={10} />
        </button>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(job); }}
          className="w-6 h-6 flex items-center justify-center rounded-md
                     bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08]
                     text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}
