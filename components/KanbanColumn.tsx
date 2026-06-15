'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JobCard as JobCardType, JobStatus } from '@/lib/types';
import { COLUMNS, COLUMN_STYLES } from '@/lib/types';
import JobCard from './JobCard';
import { Plus } from 'lucide-react';

interface Props {
  status: JobStatus;
  jobs: JobCardType[];
  search: string;
  onEdit: (job: JobCardType) => void;
  onDelete: (job: JobCardType) => void;
  onAdd: (status: JobStatus) => void;
}

export default function KanbanColumn({ status, jobs, search, onEdit, onDelete, onAdd }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const col = COLUMNS.find(c => c.id === status)!;
  const cs  = COLUMN_STYLES[status];

  const filtered = search
    ? jobs.filter(j =>
        j.companyName.toLowerCase().includes(search.toLowerCase()) ||
        j.jobTitle.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${cs.dot}`} />
          <span className={`font-bold text-sm ${cs.headerText}`}>{col.label}</span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${cs.badge}`}>
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAdd(status)}
          className="w-6 h-6 flex items-center justify-center rounded-lg
                     text-slate-400 dark:text-slate-600
                     hover:bg-slate-100 dark:hover:bg-white/[0.06]
                     hover:text-slate-600 dark:hover:text-slate-300
                     transition-all"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 rounded-2xl p-1.5 min-h-[120px] transition-all duration-200',
          isOver
            ? `bg-white/60 dark:bg-white/[0.04] ring-2 ${cs.dropRing}`
            : 'bg-slate-100/60 dark:bg-white/[0.02]',
        ].join(' ')}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 max-h-[calc(100vh-9rem)] overflow-y-auto pr-0.5 scrollbar-thin">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} />
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center pointer-events-none">
                <p className="text-xs text-slate-300 dark:text-slate-700 font-medium">
                  {search ? 'No matches' : 'Drop here'}
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
