# LLM.md — Project Constitution (Job Tracker Kanban)
> Law. Only update on schema change, new rule, or architecture change.

---

## Data Schemas

### JobCard
```json
{
  "id": "uuid string",
  "companyName": "string (required)",
  "jobTitle": "string (required)",
  "linkedinUrl": "string (optional URL)",
  "resumeUsed": "string (name from saved resumes list)",
  "dateApplied": "YYYY-MM-DD",
  "salaryRange": "string (e.g. ₹25-30 LPA)",
  "notes": "string (recruiter name, referral, etc.)",
  "status": "JobStatus enum",
  "order": "number (position within column)",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### Resume
```json
{
  "id": "uuid string",
  "name": "string (e.g. SDE_Resume_v3)",
  "createdAt": "ISO datetime"
}
```

### JobStatus Enum
```
'wishlist' | 'applied' | 'followup' | 'interview' | 'offer' | 'rejected'
```

### JobFormData (modal payload)
```json
{
  "companyName": "string",
  "jobTitle": "string",
  "linkedinUrl": "string",
  "resumeUsed": "string",
  "dateApplied": "YYYY-MM-DD",
  "salaryRange": "string",
  "notes": "string",
  "status": "JobStatus"
}
```

---

## IndexedDB Schema
- **DB name:** `job-tracker`
- **Version:** 1
- **Object stores:** `jobs` (keyPath: id), `resumes` (keyPath: id)
- No backend. No API. 100% browser-local.

---

## Behavioral Rules
1. **No GROQ, no API calls** — 100% offline/local
2. **Dark mode via Tailwind `class`** — localStorage persists preference, inline script in layout.tsx prevents flash
3. **Drag-and-drop via @dnd-kit** — cards draggable between and within columns
4. **Order preserved** — `order` field tracks position within column; always updated on drag
5. **IndexedDB writes are immediate** — every CRUD op persists before re-render
6. **Resumes are shared** — one list across all jobs; user manages add/delete in modal
7. **.env not needed** — no secrets, no keys; `.env.local.example` kept for completeness

---

## Architectural Invariants
- Next.js 16 App Router, all interactive components are `'use client'`
- `idb` library only called from `useEffect`/event handlers (never SSR)
- `crypto.randomUUID()` used for ID generation (browser + Node 19+)
- Column order is fixed: Wishlist → Applied → Follow-up → Interview → Offer → Rejected
- Export/Import JSON for backup (full `{ jobs, resumes }` payload)
