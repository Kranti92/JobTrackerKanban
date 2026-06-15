# Task Plan — Job Tracker Kanban

## North Star
A beautiful local-first Kanban board to track job applications — drag-and-drop, IndexedDB persistence, dark/light mode, deploy to Vercel.

---

## Phase Checklist

### Protocol 0 ✅
- [x] Read BLAST.md, Objective.md, .env
- [x] Ask discovery questions (GROQ role, key security, resume UX, GitHub repo)
- [x] Define schema in LLM.md
- [x] Create task_plan.md, findings.md, progress.md

### Phase 1: Blueprint ✅
- [x] Stack: Next.js 16 + TypeScript + Tailwind + idb + @dnd-kit
- [x] 6 Kanban columns: Wishlist, Applied, Follow-up, Interview, Offer, Rejected
- [x] Data model defined
- [x] No GROQ — 100% local

### Phase 2: Link ✅
- [x] No external APIs to verify
- [x] idb, @dnd-kit packages to install

### Phase 3: Architect 🔄
- [ ] lib/types.ts — all types + COLUMNS + COLUMN_STYLES
- [ ] lib/db.ts — IndexedDB via idb
- [ ] lib/utils.ts — daysSince, formatDate, export/import helpers
- [ ] components/Header.tsx — logo, search, export, import, dark/light
- [ ] components/KanbanBoard.tsx — DnD context, all state, CRUD handlers
- [ ] components/KanbanColumn.tsx — droppable column, sortable list
- [ ] components/JobCard.tsx — useSortable card
- [ ] components/JobFormModal.tsx — add/edit form with resume manager
- [ ] components/DeleteModal.tsx — confirmation dialog
- [ ] app/layout.tsx, app/page.tsx, app/globals.css

### Phase 4: Stylize 🔄
- [ ] Dark navy / off-white theme
- [ ] Glass cards, gradient accents
- [ ] Column left-border color per status
- [ ] Drag overlay ghost card

### Phase 5: Trigger 🔄
- [ ] npx next build → EXIT:0
- [ ] Git init + push to Kranti92/JobTrackerKanban
- [ ] vercel --prod deploy

---

## Column → Color Map
| Column | Border | Dot |
|--------|--------|-----|
| Wishlist | slate | slate-400 |
| Applied | blue-500 | blue-500 |
| Follow-up | amber-500 | amber-500 |
| Interview | violet-500 | violet-500 |
| Offer | emerald-500 | emerald-500 |
| Rejected | red-400 | red-400 |
