# Findings — Job Tracker Kanban

## Stack Decisions

### Why Next.js over Vite
- Objective.md specified Vite, but user confirmed Next.js when warned about GROQ key exposure
- Next.js on Vercel = zero config deploy
- App Router allows future server-side features without refactor
- Same stack as JiraTestStrategyGenerator — already proven on this machine

### Why No GROQ
- User confirmed: "No GROQ — local only"
- Objective.md also says "No API calls — 100% local"
- The .env file had a GROQ key but user chose not to use it

## @dnd-kit Notes
- `@dnd-kit/core` — DndContext, DragOverlay, sensors
- `@dnd-kit/sortable` — SortableContext, useSortable, arrayMove
- `@dnd-kit/utilities` — CSS.Transform
- Must be used in 'use client' components only
- `PointerSensor` with `activationConstraint: { distance: 5 }` prevents accidental drags on click
- `closestCorners` collision detection works best for Kanban
- `DragOverlay` renders a "ghost" card during drag

## IndexedDB via idb
- `idb` package wraps IndexedDB with Promise API
- DB must be initialized client-side only (useEffect)
- `openDB` with `upgrade` callback handles schema migration
- `saveJobs(jobs[])` uses a transaction for batch updates (important for reorder)

## Corporate SSL Proxy
- Same machine as JiraTestStrategyGenerator
- `npm config set strict-ssl false` already applied globally
- No runtime HTTPS calls needed (100% local) — no `ignoreHTTPSErrors` needed
- Vercel CLI: use `NODE_OPTIONS=--use-system-ca` for auth

## Layout Constraints
- 6 columns × min-width = wide board → horizontal scroll required
- Column card area: `max-h-[calc(100vh-9rem)]` with `overflow-y-auto scrollbar-thin`
- Main board: `overflow-x-auto` + `min-w-max` inner wrapper

## Dark Mode
- Tailwind `darkMode: 'class'`
- Inline script in layout.tsx reads localStorage on load (prevents flash)
- Dark bg: `#07091a` (same as JiraTestStrategyGenerator)
