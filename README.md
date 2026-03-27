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
- **Next.js** — React framework for the dashboard UI
- Deployed on **Vercel**

### Backend
- **FastAPI** (Python) — API server
- **uv** — Python package and project manager

### Services & APIs
- **Auth0** — Authentication and user management
- **Ghost** (ghost.build) — Managed PostgreSQL database
- **Bland AI** — Voice agent platform; the app triggers Bland AI to make the actual calls to patients
- **Macrospace** — Automated code review

_This list will grow as the project evolves._

## Architecture

The backend runs as FastAPI serverless functions on Vercel's Python runtime. All API routes are defined in `api/index.py` and routed via Vercel rewrites. Python 3.12 is pinned via `.python-version`.

Voice calls are triggered via the Bland AI API. The app sends a call request to Bland AI with a persona (the "Elderly Care Companion" agent), and Bland AI calls the patient. After the call completes, Bland AI sends the transcript back to our webhook endpoint.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hello` | GET | Hello greeting |
| `/api/health` | GET | Health check |
| `/api/calls/trigger` | POST | Trigger a Bland AI voice call |
| `/api/calls/webhook` | POST | Receive post-call transcript from Bland AI |

## Project Structure

```
familiar/
  api/
    index.py            # FastAPI app — all API routes
  mock/
    index.html          # Dashboard design mock
  vercel.json           # Vercel routing config
  requirements.txt      # Python dependencies
  .python-version       # Python 3.12
```

## Environment Variables

Set these in Vercel via `vercel env add`:

| Variable | Description |
|----------|-------------|
| `BLAND_API_KEY` | Bland AI API key |
| `BLAND_AGENT_ID` | Default Bland AI persona ID (Elderly Care Companion) |
| `BASE_URL` | Deployed app URL for webhook callbacks |

## Development

```bash
pip install -r requirements.txt
uvicorn api.index:app --reload
```

The API will be available at `http://localhost:8000`.

## Deployment

Deployed on Vercel: https://familiar-fawn.vercel.app

```bash
vercel deploy          # Preview deployment
vercel --prod          # Production deployment
```

## Status

Early stage — FastAPI backend deployed on Vercel, design mocks complete.
