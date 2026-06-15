'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverEvent,
  PointerSensor, useSensor, useSensors,
  DragOverlay, closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { JobCard as JobCardType, JobStatus, JobPriority, Resume, JobFormData } from '@/lib/types';
import { COLUMNS } from '@/lib/types';
import {
  getAllJobs, saveJob, saveJobs, deleteJob,
  getAllResumes, saveResume, deleteResume, importAll,
} from '@/lib/db';
import { newId, todayISO, exportJSON } from '@/lib/utils';
import Header, { type FilterState } from './Header';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import JobFormModal from './JobFormModal';
import DeleteModal from './DeleteModal';
import DashboardStats from './DashboardStats';
import DashboardAnalytics from './DashboardAnalytics';

const DEFAULT_FILTERS: FilterState = {
  search:   '',
  status:   '',
  priority: '',
  resume:   '',
  source:   '',
  dateFrom: '',
  dateTo:   '',
  sortBy:   'date',
  sortDir:  'desc',
};

export default function KanbanBoard() {
  const [jobs,         setJobsState]   = useState<JobCardType[]>([]);
  const [resumes,      setResumes]     = useState<Resume[]>([]);
  const [filters,      setFilters]     = useState<FilterState>(DEFAULT_FILTERS);
  const [activeCard,   setActiveCard]  = useState<JobCardType | null>(null);
  const [addStatus,    setAddStatus]   = useState<JobStatus | null>(null);
  const [editJob,      setEditJob]     = useState<JobCardType | null>(null);
  const [deleteTarget, setDeleteTarget]= useState<JobCardType | null>(null);
  const [loaded,       setLoaded]      = useState(false);
  const [view,         setView]        = useState<'dashboard' | 'kanban' | 'both'>('both');
  const [monthlyGoal,  setMonthlyGoalState] = useState(30);

  // ref always holds latest jobs — prevents stale closure in DnD handlers
  const jobsRef = useRef<JobCardType[]>([]);
  const setJobs = useCallback((u: JobCardType[] | ((p: JobCardType[]) => JobCardType[])) => {
    setJobsState(prev => {
      const next = typeof u === 'function' ? u(prev) : u;
      jobsRef.current = next;
      return next;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    Promise.all([getAllJobs(), getAllResumes()]).then(([j, r]) => {
      setJobs(j);
      setResumes(r);
      setLoaded(true);
    });
    const saved = localStorage.getItem('monthlyGoal');
    if (saved) setMonthlyGoalState(parseInt(saved, 10) || 30);
  }, [setJobs]);

  const setMonthlyGoal = (n: number) => {
    setMonthlyGoalState(n);
    localStorage.setItem('monthlyGoal', String(n));
  };

  /* ─── Filtered / sorted jobs for kanban columns ── */
  const filteredJobs = (jobs: JobCardType[]): JobCardType[] => {
    let out = [...jobs];
    const f = filters;
    if (f.search)   out = out.filter(j =>
      j.companyName.toLowerCase().includes(f.search.toLowerCase()) ||
      j.jobTitle.toLowerCase().includes(f.search.toLowerCase()) ||
      j.notes?.toLowerCase().includes(f.search.toLowerCase()) ||
      j.source?.toLowerCase().includes(f.search.toLowerCase())
    );
    if (f.status)   out = out.filter(j => j.status   === f.status);
    if (f.priority) out = out.filter(j => (j.priority ?? 'medium') === f.priority);
    if (f.resume)   out = out.filter(j => j.resumeUsed === f.resume);
    if (f.source)   out = out.filter(j => j.source   === f.source);
    if (f.dateFrom) out = out.filter(j => j.dateApplied >= f.dateFrom);
    if (f.dateTo)   out = out.filter(j => j.dateApplied <= f.dateTo);
    out.sort((a, b) => {
      let diff = 0;
      if (f.sortBy === 'date')    diff = a.dateApplied.localeCompare(b.dateApplied);
      if (f.sortBy === 'company') diff = a.companyName.localeCompare(b.companyName);
      if (f.sortBy === 'status')  diff = a.status.localeCompare(b.status);
      if (diff === 0) diff = a.order - b.order;
      return f.sortDir === 'asc' ? diff : -diff;
    });
    return out;
  };

  const colJobs = (status: JobStatus): JobCardType[] =>
    filteredJobs(jobs).filter(j => j.status === status);

  /* ─── DnD handlers ──────────────────────────────── */
  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveCard(jobsRef.current.find(j => j.id === active.id) ?? null);

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    const activeId = active.id as string;
    const overId   = over.id  as string;

    setJobs(prev => {
      const activeJob = prev.find(j => j.id === activeId);
      if (!activeJob) return prev;

      const isOverColumn = COLUMNS.some(c => c.id === overId);
      const targetStatus = isOverColumn
        ? (overId as JobStatus)
        : prev.find(j => j.id === overId)?.status;

      if (!targetStatus || activeJob.status === targetStatus) return prev;

      return prev.map(j => j.id === activeId ? { ...j, status: targetStatus } : j);
    });
  };

  const handleDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id  as string;
    const latest   = jobsRef.current;
    const activeJob = latest.find(j => j.id === activeId);
    if (!activeJob) return;

    const isOverColumn = COLUMNS.some(c => c.id === overId);
    const overJob      = latest.find(j => j.id === overId);

    // Same-column reorder
    if (!isOverColumn && overJob && overJob.status === activeJob.status && activeId !== overId) {
      const col     = latest.filter(j => j.status === activeJob.status).sort((a, b) => a.order - b.order);
      const oldIdx  = col.findIndex(j => j.id === activeId);
      const newIdx  = col.findIndex(j => j.id === overId);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(col, oldIdx, newIdx)
          .map((j, i) => ({ ...j, order: i, updatedAt: new Date().toISOString() }));
        setJobs(prev => prev.map(j => reordered.find(r => r.id === j.id) ?? j));
        await saveJobs(reordered);
        return;
      }
    }

    // Persist cross-column move (state already updated by onDragOver)
    const updated = { ...activeJob, updatedAt: new Date().toISOString() };
    setJobs(prev => prev.map(j => j.id === activeId ? updated : j));
    await saveJob(updated);
  }, [setJobs]);

  /* ─── CRUD ──────────────────────────────────────── */
  const handleAddJob = async (data: JobFormData) => {
    const now = new Date().toISOString();
    const job: JobCardType = {
      ...data,
      id:        newId(),
      priority:  data.priority ?? 'medium',
      source:    data.source   ?? '',
      order:     jobs.filter(j => j.status === data.status).length,
      createdAt: now,
      updatedAt: now,
    };
    await saveJob(job);
    setJobs(prev => [...prev, job]);
    setAddStatus(null);
  };

  const handleEditJob = async (data: JobFormData) => {
    if (!editJob) return;
    const updated: JobCardType = { ...editJob, ...data, updatedAt: new Date().toISOString() };
    await saveJob(updated);
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
    setEditJob(null);
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    await deleteJob(deleteTarget.id);
    setJobs(prev => prev.filter(j => j.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleAddResume = async (name: string) => {
    const r: Resume = { id: newId(), name, createdAt: new Date().toISOString() };
    await saveResume(r);
    setResumes(prev => [...prev, r]);
  };

  const handleDeleteResume = async (id: string) => {
    await deleteResume(id);
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  const handleExport = () => exportJSON({ jobs, resumes }, `job-tracker-${todayISO()}.json`);

  const handleImport = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const importedJobs: JobCardType[] = Array.isArray(data.jobs)    ? data.jobs    : [];
      const importedResumes: Resume[]   = Array.isArray(data.resumes) ? data.resumes : [];
      await importAll(importedJobs, importedResumes);
      setJobs(importedJobs);
      setResumes(importedResumes);
    } catch {
      alert('Invalid JSON file.');
    }
  };

  /* ─── Loading ────────────────────────────────────── */
  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-[#07091a]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const showDash   = view === 'both' || view === 'dashboard';
  const showKanban = view === 'both' || view === 'kanban';

  return (
    <>
      <Header
        filters={filters}
        onFilterChange={partial => setFilters(f => ({ ...f, ...partial }))}
        onClearFilters={() => setFilters(DEFAULT_FILTERS)}
        onAddJob={() => setAddStatus('wishlist')}
        onExport={handleExport}
        onImport={handleImport}
        totalJobs={jobs.length}
        resumes={resumes}
        view={view}
        onViewChange={setView}
      />

      <main className="bg-slate-50 dark:bg-[#07091a] min-h-[calc(100vh-88px)]">

        {/* Dashboard panels */}
        {showDash && (
          <>
            <DashboardStats jobs={jobs} />
            <DashboardAnalytics
              jobs={jobs}
              resumes={resumes}
              monthlyGoal={monthlyGoal}
              onSetGoal={setMonthlyGoal}
            />
          </>
        )}

        {/* Kanban section header */}
        {showDash && showKanban && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3">
              Kanban Board
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
          </div>
        )}

        {/* Kanban */}
        {showKanban && (
          <div className="overflow-x-auto px-4 pb-8">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 w-max">
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.id}
                    status={col.id}
                    jobs={colJobs(col.id)}
                    allJobs={jobs.filter(j => j.status === col.id)}
                    onEdit={setEditJob}
                    onDelete={setDeleteTarget}
                    onAdd={setAddStatus}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={null}>
                {activeCard && (
                  <JobCard job={activeCard} onEdit={() => {}} onDelete={() => {}} overlay />
                )}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </main>

      {addStatus && (
        <JobFormModal
          defaultStatus={addStatus}
          resumes={resumes}
          onSave={handleAddJob}
          onClose={() => setAddStatus(null)}
          onAddResume={handleAddResume}
          onDeleteResume={handleDeleteResume}
        />
      )}
      {editJob && (
        <JobFormModal
          job={editJob}
          defaultStatus={editJob.status}
          resumes={resumes}
          onSave={handleEditJob}
          onClose={() => setEditJob(null)}
          onAddResume={handleAddResume}
          onDeleteResume={handleDeleteResume}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          job={deleteTarget}
          onConfirm={handleDeleteJob}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
