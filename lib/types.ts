export type JobStatus   = 'wishlist' | 'applied' | 'followup' | 'interview' | 'offer' | 'rejected';
export type JobPriority = 'high' | 'medium' | 'low';

export const JOB_SOURCES = [
  'LinkedIn', 'Indeed', 'Glassdoor', 'Company Website',
  'Referral', 'AngelList', 'Naukri', 'Other',
] as const;

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
  priority: JobPriority;
  source: string;
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
  priority: JobPriority;
  source: string;
}

export const COLUMNS: { id: JobStatus; label: string }[] = [
  { id: 'wishlist',  label: 'Wishlist'  },
  { id: 'applied',   label: 'Applied'   },
  { id: 'followup',  label: 'Follow-up' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer',     label: 'Offer'     },
  { id: 'rejected',  label: 'Rejected'  },
];

export const PRIORITY_META: Record<JobPriority, { label: string; dot: string; badge: string }> = {
  high:   { label: 'High',   dot: 'bg-red-500',   badge: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' },
  medium: { label: 'Medium', dot: 'bg-amber-500', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' },
  low:    { label: 'Low',    dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-500/20 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20' },
};

export const COLUMN_STYLES: Record<JobStatus, {
  dot: string; badge: string; cardBorder: string; dropRing: string;
  headerText: string; statGradient: string; statBg: string;
}> = {
  wishlist:  {
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400',
    cardBorder: 'border-l-slate-400', dropRing: 'ring-slate-400/40',
    headerText: 'text-slate-700 dark:text-slate-300',
    statGradient: 'from-slate-500 to-slate-700', statBg: '#64748b',
  },
  applied:   {
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    cardBorder: 'border-l-blue-500', dropRing: 'ring-blue-400/40',
    headerText: 'text-blue-700 dark:text-blue-400',
    statGradient: 'from-blue-500 to-indigo-700', statBg: '#3b82f6',
  },
  followup:  {
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    cardBorder: 'border-l-amber-500', dropRing: 'ring-amber-400/40',
    headerText: 'text-amber-700 dark:text-amber-400',
    statGradient: 'from-amber-400 to-orange-600', statBg: '#f59e0b',
  },
  interview: {
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
    cardBorder: 'border-l-violet-500', dropRing: 'ring-violet-400/40',
    headerText: 'text-violet-700 dark:text-violet-400',
    statGradient: 'from-violet-500 to-purple-700', statBg: '#8b5cf6',
  },
  offer:     {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    cardBorder: 'border-l-emerald-500', dropRing: 'ring-emerald-400/40',
    headerText: 'text-emerald-700 dark:text-emerald-400',
    statGradient: 'from-emerald-400 to-teal-600', statBg: '#10b981',
  },
  rejected:  {
    dot: 'bg-red-400',
    badge: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
    cardBorder: 'border-l-red-400', dropRing: 'ring-red-400/40',
    headerText: 'text-red-600 dark:text-red-400',
    statGradient: 'from-red-400 to-rose-600', statBg: '#f87171',
  },
};
