'use client';

import { useState } from 'react';
import type { JobCard, JobStatus, JobPriority, Resume, JobFormData } from '@/lib/types';
import { COLUMNS, PRIORITY_META, JOB_SOURCES } from '@/lib/types';
import { todayISO } from '@/lib/utils';
import { X, Bookmark } from 'lucide-react';

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
    priority:    job?.priority    ?? 'medium',
    source:      job?.source      ?? '',
  });
  const [errors, setErrors] = useState<{ companyName?: string; jobTitle?: string }>({});

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

  const saveResumeName = () => {
    const name = form.resumeUsed.trim();
    if (!name || resumes.some(r => r.name === name)) return;
    onAddResume(name);
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
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" error={errors.companyName}>
              <input type="text" value={form.companyName} onChange={set('companyName')}
                placeholder="Acme Corp" autoFocus className={inputCls(!!errors.companyName)} />
            </Field>
            <Field label="Job Title *" error={errors.jobTitle}>
              <input type="text" value={form.jobTitle} onChange={set('jobTitle')}
                placeholder="Senior QA Engineer" className={inputCls(!!errors.jobTitle)} />
            </Field>
          </div>

          <Field label="LinkedIn / Job URL">
            <input type="url" value={form.linkedinUrl} onChange={set('linkedinUrl')}
              placeholder="https://linkedin.com/jobs/view/..." className={inputCls()} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={inputCls()}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={set('priority')} className={inputCls()}>
                {(Object.keys(PRIORITY_META) as JobPriority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_META[p].label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Source">
              <select value={form.source} onChange={set('source')} className={inputCls()}>
                <option value="">— select source —</option>
                {JOB_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
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

          {/* Resume — text input with datalist */}
          <Field label="Resume Used">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={form.resumeUsed}
                  onChange={set('resumeUsed')}
                  list="resume-list"
                  placeholder="e.g. SDE_Resume_v3 (type freely or pick below)"
                  className={inputCls()}
                />
                <datalist id="resume-list">
                  {resumes.map(r => <option key={r.id} value={r.name} />)}
                </datalist>
              </div>
              <button
                type="button"
                onClick={saveResumeName}
                title="Save for future use"
                disabled={!form.resumeUsed.trim() || resumes.some(r => r.name === form.resumeUsed.trim())}
                className="px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1
                           bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400
                           border border-brand-100 dark:border-brand-500/20
                           hover:bg-brand-100 dark:hover:bg-brand-500/20
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Bookmark size={11} />
                Save
              </button>
            </div>

            {resumes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {resumes.map(r => (
                  <button key={r.id} type="button"
                    onClick={() => setForm(f => ({ ...f, resumeUsed: r.name }))}
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all
                      ${form.resumeUsed === r.name
                        ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-200 dark:border-brand-500/40 text-brand-600 dark:text-brand-400 font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400'
                      }`}>
                    {r.name}
                    <span onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); onDeleteResume(r.id); }}
                      className="ml-0.5 hover:text-red-500 transition-colors cursor-pointer">
                      <X size={9} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label="Notes">
            <textarea value={form.notes} onChange={set('notes')}
              placeholder="Recruiter: Jane, referral via LinkedIn, interview Tue..."
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
