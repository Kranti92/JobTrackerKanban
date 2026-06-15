'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Moon, Sun, Download, Upload, Plus, Briefcase, Search,
  ChevronDown, X, SlidersHorizontal, LayoutDashboard, Columns3, List,
} from 'lucide-react';
import type { JobStatus, JobPriority, Resume } from '@/lib/types';
import { COLUMNS, JOB_SOURCES } from '@/lib/types';

export interface FilterState {
  search:     string;
  status:     JobStatus | '';
  priority:   JobPriority | '';
  resume:     string;
  source:     string;
  dateFrom:   string;
  dateTo:     string;
  sortBy:     'date' | 'company' | 'status';
  sortDir:    'asc' | 'desc';
}

interface Props {
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onAddJob: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  totalJobs: number;
  resumes: Resume[];
  view: 'dashboard' | 'kanban' | 'both' | 'list';
  onViewChange: (v: 'dashboard' | 'kanban' | 'both' | 'list') => void;
}

export default function Header({
  filters, onFilterChange, onClearFilters,
  onAddJob, onExport, onImport,
  totalJobs, resumes,
  view, onViewChange,
}: Props) {
  const [dark,        setDark]        = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  const hasActiveFilters = !!(
    filters.status || filters.priority || filters.resume ||
    filters.source || filters.dateFrom || filters.dateTo
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/90 dark:bg-[#07091a]/95 backdrop-blur-xl">
      {/* Purpose banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 px-4 py-1.5 flex items-center justify-center gap-3 border-b border-slate-700/50">
        <span className="text-[10px] font-semibold tracking-wide uppercase text-slate-400">Job Tracker Kanban</span>
        <span className="text-slate-700 text-xs">|</span>
        <p className="text-[11px] text-slate-400">
          Track every application · measure your funnel · store resumes locally · 100% private
        </p>
      </div>

      {/* Main nav row */}
      <div className="px-4 h-12 flex items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 mr-1">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow shadow-brand-500/30">
            <Briefcase size={13} className="text-white" />
          </div>
          <div className="hidden sm:flex items-baseline gap-0.5">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Job</span>
            <span className="font-extrabold text-sm bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">Tracker</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold
                           bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400
                           border border-slate-200 dark:border-white/[0.08]">
            {totalJobs} jobs
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={e => onFilterChange({ search: e.target.value })}
            placeholder="Search company, role, notes..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs
                       bg-slate-100 dark:bg-white/[0.06]
                       border border-transparent dark:border-white/[0.08]
                       text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white dark:focus:bg-white/[0.08]
                       transition-all"
          />
        </div>

        {/* Quick filter selects */}
        <div className="hidden md:flex items-center gap-1.5">
          <FilterSelect
            value={filters.status}
            onChange={v => onFilterChange({ status: v as JobStatus | '' })}
            placeholder="Status"
            options={COLUMNS.map(c => ({ value: c.id, label: c.label }))}
          />
          <FilterSelect
            value={filters.priority}
            onChange={v => onFilterChange({ priority: v as JobPriority | '' })}
            placeholder="Priority"
            options={[
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
          <FilterSelect
            value={filters.resume}
            onChange={v => onFilterChange({ resume: v })}
            placeholder="Resume"
            options={resumes.map(r => ({ value: r.name, label: r.name }))}
          />
          <FilterSelect
            value={filters.source}
            onChange={v => onFilterChange({ source: v })}
            placeholder="Source"
            options={JOB_SOURCES.map(s => ({ value: s, label: s }))}
          />
        </div>

        {/* Filter toggle for smaller screens / date filters */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all relative
            ${showFilters || hasActiveFilters
              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-500 border border-brand-200 dark:border-brand-500/20'
              : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          title="Advanced filters"
        >
          <SlidersHorizontal size={13} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>

        {/* View toggle */}
        <div className="hidden sm:flex items-center rounded-lg border border-slate-200 dark:border-white/[0.08] overflow-hidden">
          {([
            ['both',   <LayoutDashboard size={11} key="d" />, 'Dashboard + Kanban'],
            ['kanban', <Columns3 size={11} key="k" />,        'Kanban only'],
            ['list',   <List size={11} key="l" />,            'List view'],
          ] as const).map(([v, icon, tip]) => (
            <button key={v} onClick={() => onViewChange(v)} title={tip}
              className={`px-2.5 py-1.5 transition-all ${
                view === v
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}>
              {icon}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={onAddJob}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
                       bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-accent-500
                       text-white shadow shadow-brand-500/25
                       hover:shadow-md hover:shadow-brand-500/30 active:scale-95 transition-all">
            <Plus size={13} />
            <span className="hidden sm:block">Add Job</span>
          </button>

          <button onClick={onExport} title="Export JSON"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
            <Download size={13} />
          </button>
          <button onClick={() => importRef.current?.click()} title="Import JSON"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
            <Upload size={13} />
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { onImport(f); e.target.value = ''; } }} />

          <button onClick={toggleDark}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all">
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {/* Advanced filter bar */}
      {showFilters && (
        <div className="px-4 pb-3 border-t border-slate-100 dark:border-white/[0.04] pt-2.5 flex flex-wrap gap-2 items-end">
          {/* Mobile-only basic filters */}
          <div className="flex md:hidden gap-2 flex-wrap">
            <FilterSelect value={filters.status} onChange={v => onFilterChange({ status: v as JobStatus | '' })} placeholder="Status"
              options={COLUMNS.map(c => ({ value: c.id, label: c.label }))} />
            <FilterSelect value={filters.priority} onChange={v => onFilterChange({ priority: v as JobPriority | '' })} placeholder="Priority"
              options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
            <FilterSelect value={filters.source} onChange={v => onFilterChange({ source: v })} placeholder="Source"
              options={JOB_SOURCES.map(s => ({ value: s, label: s }))} />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold text-slate-400 shrink-0">From</label>
            <input type="date" value={filters.dateFrom} onChange={e => onFilterChange({ dateFrom: e.target.value })}
              className={dateCls} />
            <label className="text-[10px] font-semibold text-slate-400 shrink-0">To</label>
            <input type="date" value={filters.dateTo} onChange={e => onFilterChange({ dateTo: e.target.value })}
              className={dateCls} />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 shrink-0">Sort</label>
            <select value={filters.sortBy} onChange={e => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className={selectCls}>
              <option value="date">Date Applied</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
            </select>
            <button onClick={() => onFilterChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[10px] font-bold">
              {filters.sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button onClick={onClearFilters}
              className="flex items-center gap-1 text-[10px] font-bold text-red-500 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
              <X size={10} />
              Clear filters
            </button>
          )}
        </div>
      )}
    </header>
  );
}

const selectCls = 'text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all';
const dateCls   = 'text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all';

function FilterSelect({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${selectCls} appearance-none pr-6 ${value ? 'font-bold text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
    </div>
  );
}
