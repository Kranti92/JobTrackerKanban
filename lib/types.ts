export type JobStatus = 'wishlist' | 'applied' | 'followup' | 'interview' | 'offer' | 'rejected';

export interface JobCard {
  id: string;
  companyName: string;
  jobTitle: string;
  linkedinUrl: string;
  resumeUsed: string;
  dateApplied: string;
  salaryRange: string;
  notes: string;
  status: JobStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  name: string;
  createdAt: string;
}

export interface JobFormData {
  companyName: string;
  jobTitle: string;
  linkedinUrl: string;
  resumeUsed: string;
  dateApplied: string;
  salaryRange: string;
  notes: string;
  status: JobStatus;
}

export const COLUMNS: { id: JobStatus; label: string }[] = [
  { id: 'wishlist',  label: 'Wishlist'   },
  { id: 'applied',   label: 'Applied'    },
  { id: 'followup',  label: 'Follow-up'  },
  { id: 'interview', label: 'Interview'  },
  { id: 'offer',     label: 'Offer'      },
  { id: 'rejected',  label: 'Rejected'   },
];

export const COLUMN_STYLES: Record<JobStatus, {
  dot: string;
  badge: string;
  cardBorder: string;
  dropRing: string;
  headerText: string;
}> = {
  wishlist: {
    dot:        'bg-slate-400',
    badge:      'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400',
    cardBorder: 'border-l-slate-400',
    dropRing:   'ring-slate-400/40',
    headerText: 'text-slate-700 dark:text-slate-300',
  },
  applied: {
    dot:        'bg-blue-500',
    badge:      'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    cardBorder: 'border-l-blue-500',
    dropRing:   'ring-blue-400/40',
    headerText: 'text-blue-700 dark:text-blue-400',
  },
  followup: {
    dot:        'bg-amber-500',
    badge:      'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    cardBorder: 'border-l-amber-500',
    dropRing:   'ring-amber-400/40',
    headerText: 'text-amber-700 dark:text-amber-400',
  },
  interview: {
    dot:        'bg-violet-500',
    badge:      'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
    cardBorder: 'border-l-violet-500',
    dropRing:   'ring-violet-400/40',
    headerText: 'text-violet-700 dark:text-violet-400',
  },
  offer: {
    dot:        'bg-emerald-500',
    badge:      'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    cardBorder: 'border-l-emerald-500',
    dropRing:   'ring-emerald-400/40',
    headerText: 'text-emerald-700 dark:text-emerald-400',
  },
  rejected: {
    dot:        'bg-red-400',
    badge:      'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
    cardBorder: 'border-l-red-400',
    dropRing:   'ring-red-400/40',
    headerText: 'text-red-600 dark:text-red-400',
  },
};
