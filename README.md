# Follow-Up Desk

**Turn warm leads into next conversations.**

A calm, practical CRM-style tool for coaches, consultants, and small agencies to
track prospects, see who needs a follow-up, and draft AI-assisted follow-up
messages. Built to be used every day, not to look like a landing page.

## Highlights

- **Dashboard** with metric cards (total / hot / needs follow-up today / stale),
  recent activity, and a prioritized **Follow up now** queue.
- **Leads** CRM table: search, filter by status, sort by next follow-up, add /
  edit / delete, and quick status actions (contacted / won / lost).
- **Lead detail** with notes timeline, follow-up history, a suggested next
  action, the AI follow-up generator, and a one-click reminder.
- **AI follow-up generator**: tone + goal aware, produces an email subject &
  body, a short SMS/DM, and a suggested next follow-up date. Everything is
  editable with copy-to-clipboard.
- **Works offline-first**: runs on seeded demo data with mock auth out of the
  box, and cleanly upgrades to Supabase + OpenAI when env vars are present.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · lucide-react ·
Supabase (optional) · OpenAI (optional).

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables set, you land in
**demo mode** — click "Continue in demo mode" (or sign in with any email /
password) and you'll see the seeded pipeline immediately.

## Environment variables

Copy `.env.example` to `.env.local`. All are optional.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Enables real DB + auth when set. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (paired with the URL). |
| `SUPABASE_SERVICE_ROLE_KEY` | Reserved for future server-side admin tasks. |
| `OPENAI_API_KEY` | Enables real OpenAI generation. Falls back to a template engine if unset or failing. |
| `OPENAI_MODEL` | Optional model override (default `gpt-4o-mini`). |
| `RESEND_API_KEY` | Placeholder for future email sending. |

The app switches to Supabase only when **both** `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

## Setting up Supabase (optional)

1. Create a Supabase project.
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   in the SQL editor. This creates the `profiles`, `leads`, `lead_notes`,
   `followups`, and `ai_generations` tables with Row Level Security (owner-only)
   and an auto-profile trigger on signup.
3. Put your URL + anon key in `.env.local` and restart `npm run dev`.
4. Sign up in the app, then optionally run
   [`supabase/seed.sql`](supabase/seed.sql) to load the demo leads.

## Follow-up logic

Implemented in [`src/lib/followups.ts`](src/lib/followups.ts):

- Lead is **due today** when `next_follow_up_date` is today or earlier.
- Lead is **stale** when last contact is 14+ days ago (or never) and not Won/Lost.
- **Proposal sent** + no contact 3+ days → high priority.
- **New** + no contact within 1 day → prioritized.
- The Follow up now queue ranks by an urgency score (status, overdue days,
  staleness, deal value).

## What's mocked vs production-ready

| Area | Demo mode (default) | Production (configured) |
| --- | --- | --- |
| Data | In-memory seeded store (resets on server restart) | Supabase Postgres with RLS |
| Auth | Local session cookie, any credentials | Supabase email/password |
| AI generation | Deterministic template engine | OpenAI (`gpt-4o-mini`), template fallback on error |
| Email sending | Not sent (reminders are stored) | Resend hookup is a documented placeholder |

The UI, follow-up logic, CRUD flows, and AI generator are production-shaped and
identical across both modes via a single repository abstraction
([`src/lib/data`](src/lib/data)).

## Project structure

```
src/
  app/
    (auth)/login          # sign in / sign up / demo mode
    (app)/dashboard       # metrics + follow up now + activity
    (app)/leads           # CRM table
    (app)/leads/[id]      # lead detail + AI generator
    actions/              # server actions (leads, notes, followups, ai, auth)
  components/             # UI building blocks + shadcn/ui
  lib/
    data/                 # repository: mock store + Supabase impl + seed
    ai/generate.ts        # OpenAI + mock generator
    followups.ts          # follow-up rules & prioritization
    auth.ts, config.ts    # auth + feature flags
supabase/                 # SQL migration + demo seed
```

## Recommended next steps

- Wire Resend to actually send scheduled follow-ups and mark `sent_at`.
- Add a background job/cron to surface due reminders (email/notification).
- Persist demo mode to local storage or SQLite so edits survive restarts.
- Add pagination/server-side filtering for large pipelines.
- Add tests around `lib/followups.ts` scoring and the repository layer.
