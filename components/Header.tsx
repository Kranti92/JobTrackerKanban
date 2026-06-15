'use client';

import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Download, Upload, Plus, Briefcase, Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onAddJob: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  totalJobs: number;
}

export default function Header({ search, onSearchChange, onAddJob, onExport, onImport, totalJobs }: Props) {
  const [dark, setDark] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = () => {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-[#07091a]/90 backdrop-blur-xl">
      <div className="px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Briefcase size={14} className="text-white" />
          </div>
          <div className="hidden sm:flex items-baseline gap-0.5">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Job</span>
            <span className="font-extrabold text-sm bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">Tracker</span>
          </div>
          <span className="hidden lg:flex text-[10px] px-2 py-0.5 rounded-full font-bold
                           bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400
                           border border-slate-200 dark:border-white/[0.08]">
            {totalJobs} jobs
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm relative mx-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-sm
                       bg-slate-100 dark:bg-white/[0.06]
                       border border-transparent dark:border-white/[0.08]
                       text-slate-900 dark:text-white
                       placeholder-slate-400 dark:placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white dark:focus:bg-white/[0.08]
                       transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={onAddJob}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold
                       bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-accent-500
                       text-white shadow-md shadow-brand-500/25
                       hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span className="hidden sm:block">Add Job</span>
          </button>

          <button onClick={onExport} title="Export JSON"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
            <Download size={14} />
          </button>

          <button onClick={() => importRef.current?.click()} title="Import JSON"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
            <Upload size={14} />
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { onImport(f); e.target.value = ''; } }} />

          <button onClick={toggleDark}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
