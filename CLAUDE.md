# CLAUDE.md — Alexander's Cleaning CRM (ICM Layer 0)

> **READ THIS FIRST.** This is the global context file for this repository.
> It tells you WHERE you are, WHAT this project is, and WHAT THE RULES ARE.
> Always read this before writing a single line of code.

---

## 🏢 What Is This Project?

This is **Alexander's Cleaning – Window Cleaning CRM**, a domain-specialized fork
of the open-source `core-oss` CRM by Envisioning.

**Business Owner:** Kyle & Pamella Alexander  
**Business Type:** Family-owned residential & commercial window cleaning service  
**Region:** Scranton / NEPA, Pennsylvania  
**Phone:** (570) 614-9595  
**Brand Voice:** Professional, warm, family-owned, quality-obsessed  
**Brand Colors:** Teal (#0d9488 / teal-600) + Slate Navy (#0f172a / slate-900)

---

## 🗂 ICM Folder Map

This project follows the **Interpreted Context Methodology (ICM)**. Read files
in this order when starting any task:

```
CLAUDE.md               ← YOU ARE HERE (Layer 0: Global "where am I?")
CONTEXT.md              ← Layer 1: Full project state & handoff summary
docs/
  ARCHITECTURE.md       ← Layer 3: Technical architecture deep-dive
  DATA_MODEL.md         ← Layer 3: Database schema & entity relationships
  TASKS.md              ← Layer 2: Current open tasks & next steps
  BRAND.md              ← Layer 3: Brand, copy voice, and design system
```

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Package Manager | pnpm |
| Validation | Zod |
| Forms | Unified Form System (see ARCHITECTURE.md) |

---

## 🔑 Core Domain Entities

These are the primary business entities. **Do not confuse with generic CRM terms.**

| Entity | Table | Purpose |
|--------|-------|---------|
| Customer | `customers` | Homeowner or business receiving service |
| Job | `jobs` | Either an `estimate` or a confirmed `job` |
| Appointment | `appointments` | Scheduled on-site visit |
| Scheduled Message | `scheduled_messages` | Automated SMS to customer |

**Jobs have a lifecycle:**
```
estimate_requested → estimate_scheduled → estimate_sent → job_scheduled → job_completed
```

---

## 🚦 Key Rules (Non-Negotiable)

1. **Never use `organization_id`** on the `jobs` or `customers` entities. This app
   is B2C. Jobs link to `customer_id`, not organizations.

2. **The `jobs` table** has window-cleaning-specific fields:
   `customer_id`, `type` (estimate|job), `service_type`, `stories`,
   `panes_count`, `hard_water_stains`, `frequency`, `price_estimate`, `status`.

3. **The `customers` table** uses `first_name`, `last_name`, `phone`, 
   `address_line_1`, `city`, `state`, `zip` — NOT a generic `name` blob.

4. **Status values** are `snake_case` strings (e.g., `estimate_requested`, 
   `job_scheduled`). Never use Title Case statuses from the old core-oss.

5. **The public booking page** is at `/book`. It's a customer-facing page — 
   keep it beautiful, trust-building, and on-brand (teal, dark navy, premium).

6. **The ACS calculator** lives at `/acs-estimates`. This is the pricing engine
   ported from https://github.com/EaZtoday/ACS.ESTIMATES

---

## 🗺 Key File Reference

| File | What it does |
|------|-------------|
| `src/lib/api/customers.ts` | Customer interface & service |
| `src/lib/api/jobs.ts` | Job interface & service |
| `src/lib/api/appointments.ts` | Appointment interface & service |
| `src/lib/validation/schemas.ts` | All Zod schemas — single source of truth |
| `src/lib/forms/form-configs.ts` | Form field configs per entity |
| `src/lib/navigation-config.ts` | Sidebar nav items |
| `src/lib/server-data.ts` | Server-side data fetching & caching |
| `src/components/features/entities/entity-index-client.tsx` | Table column definitions |
| `src/components/entities/customers/customer-detail.tsx` | Customer detail view |
| `src/app/book/page.tsx` | Public booking/lead-capture page |
| `src/app/acs-estimates/page.tsx` | Integrated pricing calculator |
| `src/app/dashboard/schedule/page.tsx` | Day-grouped schedule view |
| `src/app/dashboard/messages/page.tsx` | Scheduled SMS view |

---

## 🏃 Commands

```bash
pnpm dev       # Start dev server on port 3000
pnpm build     # Production build
pnpm lint      # ESLint check
```

---

**Next:** Read `CONTEXT.md` for the full project state and handoff summary.
