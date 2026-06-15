import { openDB } from 'idb';
import type { JobCard, Resume } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbPromise: Promise<any> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('job-tracker', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('jobs')) {
          db.createObjectStore('jobs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('resumes')) {
          db.createObjectStore('resumes', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllJobs(): Promise<JobCard[]> {
  const db = await getDB();
  return db.getAll('jobs') as Promise<JobCard[]>;
}

export async function saveJob(job: JobCard): Promise<void> {
  const db = await getDB();
  await db.put('jobs', job);
}

export async function saveJobs(jobs: JobCard[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('jobs', 'readwrite');
  await Promise.all([...jobs.map((j: JobCard) => tx.store.put(j)), tx.done]);
}

export async function deleteJob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('jobs', id);
}

export async function getAllResumes(): Promise<Resume[]> {
  const db = await getDB();
  return db.getAll('resumes') as Promise<Resume[]>;
}

export async function saveResume(resume: Resume): Promise<void> {
  const db = await getDB();
  await db.put('resumes', resume);
}

export async function deleteResume(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('resumes', id);
}

export async function importAll(jobs: JobCard[], resumes: Resume[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['jobs', 'resumes'], 'readwrite');
  await tx.objectStore('jobs').clear();
  await tx.objectStore('resumes').clear();
  await Promise.all([
    ...jobs.map((j: JobCard) => tx.objectStore('jobs').put(j)),
    ...resumes.map((r: Resume) => tx.objectStore('resumes').put(r)),
    tx.done,
  ]);
}
