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
- **Works with real accounts**: Supabase auth (Google or email/password) with
  persistent Postgres storage. OpenAI optional for AI drafts.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · lucide-react ·
Supabase · OpenAI (optional) · Gmail OAuth (optional).

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. **Supabase is required** — copy `.env.example` to
`.env.local`, add your Supabase URL and anon key, then sign up with Google or
email.

## Environment variables

Copy `.env.example` to `.env.local`. Supabase credentials are **required** for
sign-in and data storage.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (**required**). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (**required**). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side tasks (Gmail token storage, webhooks). |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL for OAuth redirects. |
| `OPENAI_API_KEY` | Enables real OpenAI generation. Falls back to templates if unset. |
| `OPENAI_MODEL` | Optional model override (default `gpt-4o-mini`). |
| `GOOGLE_GMAIL_CLIENT_ID` | Gmail OAuth client ID for send-as-user. |
| `GOOGLE_GMAIL_CLIENT_SECRET` | Gmail OAuth client secret. |
| `STRIPE_*` | Optional subscription billing. |

1. Create a Supabase project.
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   in the SQL editor. This creates the `profiles`, `leads`, `lead_notes`,
   `followups`, and `ai_generations` tables with Row Level Security (owner-only)
   and an auto-profile trigger on signup.
3. Put your URL + anon key in `.env.local` and restart `npm run dev`.
4. Sign up in the app (Google or email), then optionally run
   [`supabase/seed.sql`](supabase/seed.sql) to load sample leads.

## Follow-up logic

Implemented in [`src/lib/followups.ts`](src/lib/followups.ts):

- Lead is **due today** when `next_follow_up_date` is today or earlier.
- Lead is **stale** when last contact is 14+ days ago (or never) and not Won/Lost.
- **Proposal sent** + no contact 3+ days → high priority.
- **New** + no contact within 1 day → prioritized.
- The Follow up now queue ranks by an urgency score (status, overdue days,
  staleness, deal value).

## Feature flags

| Area | Without OpenAI | With OpenAI + Gmail |
| --- | --- | --- |
| Auth | Supabase (Google or email) | Same |
| Data | Supabase Postgres with RLS | Same |
| AI generation | Template engine | OpenAI with template fallback |
| Email sending | Copy/paste only | Send from connected Gmail |

The UI and follow-up logic use a single repository abstraction
([`src/lib/data`](src/lib/data)).

## Project structure

```
src/
  app/
    (auth)/login          # sign in (Google or email)
    (auth)/signup         # create account
    (app)/settings        # Gmail connect
    (app)/dashboard       # metrics + follow up now + activity
    (app)/leads           # CRM table
    (app)/leads/[id]      # lead detail + AI generator
    actions/              # server actions (leads, notes, followups, ai, auth)
  components/             # UI building blocks + shadcn/ui
  lib/
    data/                 # repository: Supabase impl + seed
    ai/generate.ts        # OpenAI + mock generator
    followups.ts          # follow-up rules & prioritization
    auth.ts, config.ts    # auth + feature flags
supabase/                 # SQL migrations + optional seed
```

## Recommended next steps

- Add calendar sync for discovery calls.
- Add a background job/cron to surface due reminders (email/notification).
- Add pagination/server-side filtering for large pipelines.
- Add tests around `lib/followups.ts` scoring and the repository layer.
