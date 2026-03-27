# Familiar

**Care, connected.**

Familiar is a caregiving coordination app that helps family members take care of their elderly loved ones through structured, purposeful voice calls.

## The Problem

Millions of families coordinate elder care informally — through scattered text threads, forgotten reminders, and guilt about not calling enough. Important things fall through the cracks: medications get missed, appointments go unscheduled, and no single family member has a clear picture of how their loved one is actually doing.

## The Vision

Familiar turns ad-hoc check-ins into a reliable care rhythm. Family members collaboratively schedule voice calls with specific purposes — medicine reminders, daily wellness check-ins — and the app ensures nothing gets missed. Every call generates actionable follow-ups, so the family always knows what needs to happen next.

### Core Principles

- **Calls with purpose**: Every call has a defined goal — whether it's confirming medications were taken or simply asking how the day went. Structure reduces anxiety for both the caller and the recipient.
- **Shared responsibility**: Care is distributed across the family circle. No one person carries the entire burden. Everyone can see who's calling when, and step in when needed.
- **Actionable outcomes**: Calls surface real needs — a prescription refill, a doctor's appointment, a grocery run. These become tracked action items visible to the whole family.
- **Warm, not clinical**: Familiar is a family tool, not a medical system. The tone is warm, the interface is inviting, and the goal is connection — not surveillance.

### What Familiar Does

- **Scheduled voice calls** with two core types: medicine/routine reminders and daily check-ins
- **Shared call calendar** so the family sees the full care rhythm at a glance
- **Action items** extracted from calls — tasks that need doing, visible to everyone
- **Family circle** — a shared space for notes, updates, and coordination among caregivers
- **Patient profile** — a living view of the loved one's health, medications, and upcoming needs

## Tech Stack

### Frontend
- **Next.js 16** (App Router) — React server and client components
- **Tailwind CSS v4** — Utility-first styling with custom design tokens
- **Lucide React** — Icon library

### Backend
- **Next.js API Routes** — RESTful API with Zod validation
- **Drizzle ORM** — Type-safe database access with PostgreSQL
- **Ghost** (ghost.build) — Managed PostgreSQL database

### Services & APIs
- **Bland AI** — Voice agent platform; the app triggers Bland AI to make the actual calls to patients

### Testing
- **Vitest** — Unit and integration tests
- **React Testing Library** — Component tests
- **Playwright** — E2E tests (configured)

### Planned
- **Auth0** — Authentication and user management

## Architecture

The app runs as a Next.js application on Vercel. Server components fetch data directly from Ghost PostgreSQL via Drizzle ORM. Client components handle interactivity (tab filtering, action item toggling, call triggering).

API routes in `src/app/api/` provide a RESTful interface with consistent JSON envelope responses (`{ success, data, error }`). All input is validated with Zod schemas.

Voice calls are triggered via the Bland AI API. When a user clicks "Call Now", the app looks up the patient's phone number from the database and sends a call request to Bland AI. After the call completes, Bland AI sends the transcript back to the webhook endpoint, which writes it to the `call_logs` table.

## Database Schema

PostgreSQL (Ghost.build). A user (family member) can manage multiple patients. Patients only interact via voice calls.

### Entity Relationship

```
users ──┤ user_patients ├── patient_profiles
                                 │
                    ┌────────────┼────────────┐
              call_schedules  call_logs   action_items
```

### Tables

#### `users` — Family members who use the dashboard

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | TEXT | UNIQUE, NOT NULL |
| name | TEXT | NOT NULL |
| avatar_url | TEXT | |
| auth_provider_id | TEXT | UNIQUE — for future Auth0 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### `patient_profiles` — Main table, one per patient

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| first_name | TEXT | NOT NULL |
| last_name | TEXT | NOT NULL |
| nickname | TEXT | e.g. "Mom", "Grandpa" |
| phone_number | TEXT | NOT NULL — used by Bland AI |
| date_of_birth | DATE | |
| location | TEXT | e.g. "San Francisco, CA" |
| timezone | TEXT | NOT NULL, DEFAULT 'America/Los_Angeles' |
| health_status | TEXT | DEFAULT 'stable' — stable / needs_attention / critical |
| medical_notes | TEXT | |
| preferences | JSONB | DEFAULT '{}' — voice, language, call prefs |
| bland_pathway_id | TEXT | default Bland AI pathway |
| bland_persona_id | TEXT | default Bland AI persona |
| status | TEXT | NOT NULL, DEFAULT 'active' — active / inactive / archived |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### `user_patients` — Many-to-many: user manages multiple patients

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | NOT NULL, FK → users ON DELETE CASCADE |
| patient_id | UUID | NOT NULL, FK → patient_profiles ON DELETE CASCADE |
| role | TEXT | NOT NULL, DEFAULT 'family_member' — primary_caregiver / family_member |
| relationship | TEXT | e.g. "Daughter", "Son", "Niece" |
| display_color | TEXT | for UI avatar — e.g. "#D4714E" |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| | | UNIQUE(user_id, patient_id) |

#### `call_schedules` — Recurring call definitions

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| patient_id | UUID | NOT NULL, FK → patient_profiles ON DELETE CASCADE |
| created_by_user_id | UUID | FK → users ON DELETE SET NULL |
| title | TEXT | NOT NULL — e.g. "Morning Medicine Reminder" |
| call_type | TEXT | NOT NULL, DEFAULT 'checkin' — medicine / checkin |
| purpose | TEXT | what to discuss during the call |
| cadence | TEXT | NOT NULL — daily / weekly / biweekly / monthly / custom |
| scheduled_time | TIME | NOT NULL |
| days_of_week | INTEGER[] | for custom cadence, 0=Sun..6=Sat |
| assigned_user_id | UUID | FK → users ON DELETE SET NULL |
| bland_pathway_id | TEXT | override patient default |
| bland_task | TEXT | Bland AI task prompt override |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### `call_logs` — Individual call records with transcripts

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| patient_id | UUID | NOT NULL, FK → patient_profiles ON DELETE CASCADE |
| schedule_id | UUID | FK → call_schedules ON DELETE SET NULL — null for ad-hoc calls |
| bland_call_id | TEXT | UNIQUE — from Bland AI webhook |
| status | TEXT | NOT NULL, DEFAULT 'queued' — queued / in_progress / completed / missed / failed / no_answer |
| transcript | TEXT | full concatenated transcript |
| summary | TEXT | AI-generated summary |
| recording_url | TEXT | |
| call_duration_secs | INTEGER | |
| sentiment | TEXT | positive / neutral / negative / concerned |
| metadata | JSONB | DEFAULT '{}' |
| started_at | TIMESTAMPTZ | |
| ended_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### `action_items` — Tasks from calls or manually created

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| patient_id | UUID | NOT NULL, FK → patient_profiles ON DELETE CASCADE |
| call_id | UUID | FK → call_logs ON DELETE SET NULL — null for manual items |
| created_by_user_id | UUID | FK → users ON DELETE SET NULL |
| assigned_user_id | UUID | FK → users ON DELETE SET NULL |
| title | TEXT | NOT NULL |
| description | TEXT | |
| priority | TEXT | NOT NULL, DEFAULT 'medium' — low / medium / high / urgent |
| status | TEXT | NOT NULL, DEFAULT 'pending' — pending / in_progress / completed / dismissed |
| due_date | DATE | |
| completed_at | TIMESTAMPTZ | |
| completed_by_user_id | UUID | FK → users ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

### Indexes

```sql
CREATE INDEX idx_patient_profiles_phone ON patient_profiles(phone_number);
CREATE INDEX idx_patient_profiles_status ON patient_profiles(status);
CREATE INDEX idx_user_patients_user ON user_patients(user_id);
CREATE INDEX idx_user_patients_patient ON user_patients(patient_id);
CREATE INDEX idx_call_schedules_patient ON call_schedules(patient_id, is_active);
CREATE INDEX idx_call_logs_patient ON call_logs(patient_id, created_at DESC);
CREATE INDEX idx_call_logs_bland_id ON call_logs(bland_call_id);
CREATE INDEX idx_action_items_patient ON action_items(patient_id, status);
CREATE INDEX idx_action_items_assigned ON action_items(assigned_user_id, status);
```

### Design Notes

- **Activity feed** is derived from `call_logs` + `action_items` via UNION query on timestamps — no separate table needed.
- **`call_id` on action_items** is nullable so items can be created manually by family members, not just extracted from calls.
- **`preferences` JSONB** on patient_profiles allows flexible config (voice, language, preferred call times) without schema migrations.
- **`call_schedules`** is a separate table (not JSONB on patient) because each schedule can have a different assignee, type, and cadence.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hello` | GET | Hello greeting |
| `/api/health` | GET | Health check |
| `/api/calls/trigger` | POST | Trigger a Bland AI voice call |
| `/api/calls/webhook` | POST | Receive post-call transcript from Bland AI |
| `/api/users` | GET, POST | List / create users |
| `/api/users/[id]` | GET, PATCH, DELETE | Get / update / delete user |
| `/api/patients` | GET, POST | List / create patients |
| `/api/patients/[id]` | GET, PATCH, DELETE | Get / update / delete patient |
| `/api/patients/[id]/family` | GET | Get family circle for patient |
| `/api/patients/[id]/activity` | GET | Get activity feed for patient |
| `/api/schedules` | GET, POST | List / create call schedules |
| `/api/schedules/[id]` | GET, PATCH, DELETE | Get / update / delete schedule |
| `/api/action-items` | GET, POST | List / create action items |
| `/api/action-items/[id]` | GET, PATCH, DELETE | Get / update / delete action item |
| `/api/action-items/[id]/toggle` | PATCH | Toggle action item completion |

### POST `/api/calls/trigger`

Triggers an outbound voice call via Bland AI. Phone number is resolved from: request body > patient profile DB lookup > `DEFAULT_PHONE_NUMBER` env var.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `phoneNumber` | string? | Patient DB phone | Phone number to call |
| `patientId` | string? | — | Patient ID (used for phone lookup) |
| `task` | string? | — | Free-form task/prompt for the call |
| `pathwayId` | string? | — | Bland AI pathway ID |
| `personaId` | string? | `BLAND_AGENT_ID` env var | Bland AI persona ID |
| `voice` | string | `"mason"` | Voice for the call |
| `maxDuration` | int | `10` | Max call duration in minutes |
| `record` | bool | `true` | Whether to record the call |
| `metadata` | object? | — | Arbitrary metadata passed through |

## Project Structure

```
familiar/
  src/
    app/
      layout.tsx              # Root layout (fonts, metadata)
      page.tsx                # Dashboard (server component)
      globals.css             # Tailwind v4 theme + design tokens
      settings/
        page.tsx              # Settings page (patient profile editor)
      api/
        hello/route.ts
        health/route.ts
        calls/
          trigger/route.ts    # Bland AI call trigger
          webhook/route.ts    # Bland AI post-call webhook
        users/                # CRUD
        patients/             # CRUD + /family, /activity
        schedules/            # CRUD
        action-items/         # CRUD + /toggle
    components/
      ui/                     # Avatar, Badge, Button, Modal, Tabs
      layout/                 # Sidebar, RightPanel, AppShell
      dashboard/              # GreetingBanner, CallCard, ActivityFeed, NewCallModal
      settings/               # PatientProfileForm
    db/
      index.ts                # Drizzle client
      schema/                 # 6 table schemas + relations
    repositories/             # Data access layer (one per entity)
    lib/
      api/                    # Response envelope, validation helpers
      validations/            # Zod schemas per entity
      utils.ts                # cn(), getInitials(), formatTime()
  mock/
    index.html                # Original design mock (reference)
  e2e/                        # Playwright E2E tests
  vitest.config.ts
  playwright.config.ts
  drizzle.config.ts
  next.config.ts
  vercel.json
  package.json
  tsconfig.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Ghost PostgreSQL connection string |
| `BLAND_API_KEY` | Bland AI API key |
| `BLAND_AGENT_ID` | Default Bland AI persona ID (Elderly Care Companion) |
| `DEFAULT_PHONE_NUMBER` | Fallback patient phone number for calls |
| `BASE_URL` | Deployed app URL for webhook callbacks |

## Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run test:e2e      # Playwright E2E tests
```

### Database

```bash
npm run db:push       # Push schema changes to database
npm run db:generate   # Generate migrations
npm run db:studio     # Open Drizzle Studio
```

## Deployment

Deployed on Vercel: https://familiar-fawn.vercel.app

```bash
vercel deploy          # Preview deployment
vercel --prod          # Production deployment
```

## Status

Full-stack Next.js app with Ghost PostgreSQL database. Dashboard with call scheduling, action item tracking, and Bland AI voice call integration working end-to-end. Settings page for patient profile management. 37 tests passing.
