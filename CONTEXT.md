# CONTEXT.md — Alexander's Cleaning CRM (ICM Layer 1)

> **This is the handoff document.** Read this to understand exactly where the project
> stands, what has been built, and what needs to happen next.
> After reading this, consult `docs/TASKS.md` for the specific next step.

---

## 📍 Current Project State

**Phase:** MVP — Core entities built, UI transformed, public booking page live  
**Status:** ✅ Build complete. Needs Supabase schema verification + dev server test.  
**Last Updated:** 2026-04-21

---

## ✅ What Has Been Built

### 1. Data Model Transformation
- `customers` table mapped to: `first_name`, `last_name`, `phone`, `email`,
  `address_line_1`, `city`, `state`, `zip`
- `jobs` table mapped to window cleaning domain:
  `customer_id`, `type` (estimate|job), `service_type`, `stories`,
  `panes_count`, `hard_water_stains`, `frequency`, `price_estimate`, `status`
- Job status lifecycle defined: `estimate_requested → estimate_scheduled → estimate_sent → job_scheduled → job_completed`
- New entities scoped: `appointments`, `scheduled_messages`

### 2. API & Validation Layer
| File | Status |
|------|--------|
| `src/lib/api/customers.ts` | ✅ Refactored |
| `src/lib/api/jobs.ts` | ✅ Refactored |
| `src/lib/api/appointments.ts` | ✅ Created |
| `src/lib/validation/schemas.ts` | ✅ Updated with all new schemas |
| `src/lib/forms/form-configs.ts` | ✅ Updated field configs |
| `src/lib/server-data.ts` | ✅ Updated fetchers, added `getScheduledMessagesIndexCached` |

### 3. Dashboard & Admin UI
| Route | Status | Notes |
|-------|--------|-------|
| `/dashboard` | ✅ Updated | KPIs now show Customers, Appointments, Jobs, SMS |
| `/dashboard/customers` | ✅ Updated | Table shows name, phone, address |
| `/dashboard/customers/[id]` | ✅ Updated | New premium customer detail view |
| `/dashboard/jobs` | ✅ Updated | Table shows type, customer, service, price, status |
| `/dashboard/schedule` | ✅ Created | Day-grouped calendar view |
| `/dashboard/messages` | ✅ Created | Scheduled SMS management |
| Sidebar | ✅ Branded | "ALEXANDER'S Admin" with teal accent |
| Login page | ✅ Branded | ACS logo badge + brand colors |

### 4. Public-Facing Pages
| Route | Status | Notes |
|-------|--------|-------|
| `/book` | ✅ Created | Premium lead-capture booking form |
| `/acs-estimates` | ✅ Created | Integrated ACS pricing calculator |

### 5. Status Badge System
All `job-status` StatusPill values now map to window cleaning statuses:
- `estimate_requested` → slate badge
- `estimate_scheduled` → blue badge  
- `estimate_sent` → indigo badge
- `job_scheduled` → teal badge
- `job_completed` → green badge

---

## ⚠️ Known Issues & Gaps (Must Verify)

### 🔴 Critical — Verify Before Testing
1. **Supabase Schema:** The code assumes these columns exist in your Supabase project:
   - `customers`: `first_name`, `last_name`, `phone`, `address_line_1`, `city`, `state`, `zip`
   - `jobs`: `customer_id`, `type`, `service_type`, `stories`, `panes_count`, `hard_water_stains`, `frequency`, `price_estimate`
   - Tables: `appointments`, `scheduled_messages`
   - **If these columns don't exist yet, run the migrations in `migrations/`.**

2. **Server Actions signature mismatch:** The `createCustomer` and `createJob` actions
   in `src/lib/actions/` follow the `(prevState, formData)` pattern.
   The `/book/page.tsx` public page calls them that way. Verify that the action
   signatures in `src/lib/actions/customers.ts` and `src/lib/actions/jobs.ts`
   accept `(null, FormData)`.

### 🟡 Medium — Polish Needed
3. **`entity-index-client.tsx`** — The `scheduled_messages` section was inserted and
   may have minor syntax issues (stray braces). Verify compilation with `pnpm build`.

4. **`Badge` import in entity-index-client:** The Jobs table uses a `<Badge>` component
   that needs to be imported from `@/components/ui/primitives/badge`.

5. **Customer Detail "Revenue" stat** is hardcoded to `$0`. Connect to real job 
   price aggregation once data flows.

### 🟢 Low Priority — Future Work
6. SMS backend not wired (see TASKS.md)
7. ACS calculator "Save to CRM" flow needs end-to-end test
8. Schedule view uses mock data — wire to real `appointments` table

---

## 🗃 Original Repos Referenced

| Repo | Role |
|------|------|
| https://github.com/EaZtoday/core-oss | Base CRM shell (Next.js + Supabase) |
| https://github.com/EaZtoday/ACS.ESTIMATES | Pricing calculator (ported to `/acs-estimates`) |
| https://github.com/EaZtoday/Interpreted-Context-Methodology | ICM framework used for this handoff |

---

## 🔗 Environment Setup

1. Copy `.env.example` → `.env.local`
2. Fill in: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Run: `pnpm install && pnpm dev`
4. Visit: `http://localhost:3000/book` (public) | `http://localhost:3000/dashboard` (admin)

---

**Next:** Read `docs/TASKS.md` for the prioritized task queue.
