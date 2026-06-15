'use client';

import { useState } from 'react';
import type { JobCard, JobStatus, Resume, JobFormData } from '@/lib/types';
import { COLUMNS } from '@/lib/types';
import { todayISO } from '@/lib/utils';
import { X, Plus } from 'lucide-react';

interface Props {
  job?: JobCard;
  defaultStatus: JobStatus;
  resumes: Resume[];
  onSave: (data: JobFormData) => void;
  onClose: () => void;
  onAddResume: (name: string) => void;
  onDeleteResume: (id: string) => void;
}

export default function JobFormModal({
  job, defaultStatus, resumes, onSave, onClose, onAddResume, onDeleteResume,
}: Props) {
  const [form, setForm] = useState<JobFormData>({
    companyName: job?.companyName ?? '',
    jobTitle:    job?.jobTitle    ?? '',
    linkedinUrl: job?.linkedinUrl ?? '',
    resumeUsed:  job?.resumeUsed  ?? '',
    dateApplied: job?.dateApplied ?? todayISO(),
    salaryRange: job?.salaryRange ?? '',
    notes:       job?.notes       ?? '',
    status:      job?.status      ?? defaultStatus,
  });
  const [errors, setErrors] = useState<{ companyName?: string; jobTitle?: string }>({});
  const [newResume, setNewResume] = useState('');

  const set = (k: keyof JobFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.jobTitle.trim())    e.jobTitle    = 'Required';
    setErrors(e);
    return !e.companyName && !e.jobTitle;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  const addResume = () => {
    const name = newResume.trim();
    if (!name) return;
    onAddResume(name);
    setForm(f => ({ ...f, resumeUsed: name }));
    setNewResume('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0d1120] border border-slate-200 dark:border-white/[0.08] shadow-2xl flex flex-col max-h-[92vh]">
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-brand-500 via-violet-500 to-accent-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <h2 className="font-bold text-slate-900 dark:text-white">{job ? 'Edit Job' : 'Add Job'}</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" error={errors.companyName}>
              <input type="text" value={form.companyName} onChange={set('companyName')}
                placeholder="Acme Corp" className={inputCls(!!errors.companyName)} />
            </Field>
            <Field label="Job Title *" error={errors.jobTitle}>
              <input type="text" value={form.jobTitle} onChange={set('jobTitle')}
                placeholder="Senior QA Engineer" className={inputCls(!!errors.jobTitle)} />
            </Field>
          </div>

          <Field label="LinkedIn URL">
            <input type="url" value={form.linkedinUrl} onChange={set('linkedinUrl')}
              placeholder="https://linkedin.com/jobs/view/..." className={inputCls()} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={inputCls()}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Date Applied">
              <input type="date" value={form.dateApplied} onChange={set('dateApplied')} className={inputCls()} />
            </Field>
          </div>

          <Field label="Salary Range">
            <input type="text" value={form.salaryRange} onChange={set('salaryRange')}
              placeholder="₹25-30 LPA / $150-180K" className={inputCls()} />
          </Field>

          {/* Resume Manager */}
          <Field label="Resume Used">
            <select value={form.resumeUsed} onChange={set('resumeUsed')} className={inputCls()}>
              <option value="">— select —</option>
              {resumes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newResume}
                onChange={e => setNewResume(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addResume(); } }}
                placeholder="Add new resume name..."
                className={`${inputCls()} py-1.5 text-xs`}
              />
              <button type="button" onClick={addResume}
                className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-xs font-bold transition-colors shrink-0">
                <Plus size={12} />
              </button>
            </div>
            {resumes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {resumes.map(r => (
                  <span key={r.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                                               bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400
                                               border border-slate-200 dark:border-white/[0.08]">
                    {r.name}
                    <button type="button" onClick={() => onDeleteResume(r.id)}
                      className="hover:text-red-500 transition-colors ml-0.5">
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Notes">
            <textarea value={form.notes} onChange={set('notes')}
              placeholder="Recruiter: Jane, Applied via referral, Round 1 scheduled..."
              rows={3} className={`${inputCls()} resize-none`} />
          </Field>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
            Cancel
          </button>
          <button type="submit" onClick={submit}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                       bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-accent-500
                       hover:shadow-lg hover:shadow-brand-500/25 active:scale-95 transition-all">
            {job ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function inputCls(err = false) {
  return [
    'w-full px-3 py-2 rounded-xl text-sm transition-all',
    'bg-white dark:bg-white/[0.06]',
    err
      ? 'border border-red-400 focus:ring-red-400/40 focus:border-red-400'
      : 'border border-slate-200 dark:border-white/[0.10] focus:ring-brand-500/40 focus:border-brand-500 dark:focus:border-brand-400',
    'text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
    'focus:outline-none focus:ring-2',
  ].join(' ');
}
