'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors,
  DragOverlay, closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { JobCard as JobCardType, JobStatus, Resume, JobFormData } from '@/lib/types';
import { COLUMNS } from '@/lib/types';
import {
  getAllJobs, saveJob, saveJobs, deleteJob,
  getAllResumes, saveResume, deleteResume, importAll,
} from '@/lib/db';
import { newId, todayISO, exportJSON } from '@/lib/utils';
import Header from './Header';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import JobFormModal from './JobFormModal';
import DeleteModal from './DeleteModal';

export default function KanbanBoard() {
  const [jobs,          setJobs]         = useState<JobCardType[]>([]);
  const [resumes,       setResumes]       = useState<Resume[]>([]);
  const [search,        setSearch]        = useState('');
  const [activeCard,    setActiveCard]    = useState<JobCardType | null>(null);
  const [addStatus,     setAddStatus]     = useState<JobStatus | null>(null);
  const [editJob,       setEditJob]       = useState<JobCardType | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<JobCardType | null>(null);
  const [loaded,        setLoaded]        = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    Promise.all([getAllJobs(), getAllResumes()]).then(([j, r]) => {
      setJobs(j);
      setResumes(r);
      setLoaded(true);
    });
  }, []);

  const colJobs = (status: JobStatus) =>
    jobs.filter(j => j.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveCard(jobs.find(j => j.id === active.id) ?? null);

  const handleDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId   = over.id  as string;
    const activeJob = jobs.find(j => j.id === activeId);
    if (!activeJob) return;

    const isOverColumn  = COLUMNS.some(c => c.id === overId);
    const overJob       = jobs.find(j => j.id === overId);
    const targetStatus  = (isOverColumn ? overId : overJob?.status ?? activeJob.status) as JobStatus;

    if (activeJob.status === targetStatus && !isOverColumn) {
      // Same-column reorder
      const col    = colJobs(targetStatus);
      const oldIdx = col.findIndex(j => j.id === activeId);
      const newIdx = col.findIndex(j => j.id === overId);
      if (oldIdx === newIdx) return;

      const reordered = arrayMove(col, oldIdx, newIdx)
        .map((j, i) => ({ ...j, order: i, updatedAt: new Date().toISOString() }));

      setJobs(prev => prev.map(j => reordered.find(r => r.id === j.id) ?? j));
      await saveJobs(reordered);
    } else {
      // Cross-column move
      const targetLen = jobs.filter(j => j.status === targetStatus).length;
      const updated: JobCardType = {
        ...activeJob,
        status: targetStatus,
        order: targetLen,
        updatedAt: new Date().toISOString(),
      };
      setJobs(prev => prev.map(j => j.id === activeId ? updated : j));
      await saveJob(updated);
    }
  }, [jobs]);

  const handleAddJob = async (data: JobFormData) => {
    const now = new Date().toISOString();
    const job: JobCardType = {
      ...data,
      id:        newId(),
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

  const handleExport = () => {
    exportJSON(
      { jobs, resumes },
      `job-tracker-${todayISO()}.json`,
    );
  };

  const handleImport = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const importedJobs: JobCardType[]  = Array.isArray(data.jobs)    ? data.jobs    : [];
      const importedResumes: Resume[]    = Array.isArray(data.resumes) ? data.resumes : [];
      await importAll(importedJobs, importedResumes);
      setJobs(importedJobs);
      setResumes(importedResumes);
    } catch {
      alert('Invalid JSON file. Please export from this app first.');
    }
  };

  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-[#07091a]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header
        search={search}
        onSearchChange={setSearch}
        onAddJob={() => setAddStatus('wishlist')}
        onExport={handleExport}
        onImport={handleImport}
        totalJobs={jobs.length}
      />

      <main className="overflow-x-auto px-4 pb-6 pt-4" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 w-max">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                status={col.id}
                jobs={colJobs(col.id)}
                search={search}
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
