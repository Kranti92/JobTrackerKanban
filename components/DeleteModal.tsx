'use client';

import type { JobCard } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

interface Props {
  job: JobCard;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({ job, onConfirm, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d1120] border border-slate-200 dark:border-white/[0.08] shadow-2xl">
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-red-500 to-rose-500" />

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white mb-1.5">Delete Job Card</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
                Remove{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{job.jobTitle}</span>
                {' '}at{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{job.companyName}</span>?
                <br />
                <span className="text-xs">This cannot be undone.</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                         bg-gradient-to-r from-red-500 to-rose-500
                         hover:shadow-lg hover:shadow-red-500/25 active:scale-95 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
