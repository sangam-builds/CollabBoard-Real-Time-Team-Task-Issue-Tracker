# CollabBoard

Real-time team task tracker built for a full-stack SWE portfolio project.

## Architecture (v2 — no Redis / no BullMQ)
- **Frontend:** React + Vite + Tailwind, real-time via Socket.io client
- **Backend:** Express (layered: routes → controllers → services → repositories), single instance
- **Database:** PostgreSQL (normalized schema, full-text search, dependency graph)
- **Real-time:** Socket.io, single server instance (no Redis adapter — see note below)
- **Notifications:** in-process EventEmitter (no BullMQ/queue — see note below)

See `collabboard-architecture-guide-v2.md` for the full breakdown of every component, role, and workflow.

## Why no Redis/BullMQ
This was a deliberate scope decision to reduce infra complexity for a solo student project.
A single Node.js process comfortably handles the ~500 concurrent users this project targets;
Redis (Socket.io adapter) and BullMQ only become necessary once you run multiple server instances
or need durable retry-based job processing. Both are called out inline in the code where relevant.

## Running locally (Supabase + Prisma)

### Backend
```
cd backend
cp .env.example .env
# Fill in DATABASE_URL (pooled, port 6543) and DIRECT_URL (direct, port 5432)
# from Supabase Dashboard -> Settings -> Database -> Connection string.

npm install
npx prisma migrate dev --name init     # creates tables in Supabase from prisma/schema.prisma
npx prisma generate                    # generates the Prisma client
npx prisma db seed                     # populates realistic test data (see below)

# One-time: run prisma/manual-sql/full_text_search.sql against Supabase
# (paste into Supabase Dashboard -> SQL Editor -> Run) to add the
# search trigger + GIN index that Prisma's schema language can't express.

npm run dev                 # http://localhost:4000
```

### Seed data

`prisma/seed.js` populates a fully working dataset so you can actually click around and test
every feature immediately, instead of starting from an empty database:

- **4 users**, all sharing the password `Password123!`:
  `sangam@collabboard.dev` (team owner), `aisha@collabboard.dev` (admin),
  `rahul@collabboard.dev` and `priya@collabboard.dev` (members) — covers all 3 RBAC roles
- **1 team** ("Engineering") with all 4 as members at their respective roles
- **1 board** ("Sprint 12") with **8 tasks** across `todo` / `in_progress` / `done`, with due dates,
  assignees, and one intentionally unassigned task
- **A real dependency graph** across those tasks (a chain plus a branch) — enough to actually
  exercise the topological-sort prioritization endpoint and see it return a non-trivial order
- **Comments, activity log entries, and notifications** already populated, so the analytics
  dashboard and notification badge have real data to render on first load

It's safe to re-run (`npx prisma db seed`) — it wipes and recreates the seed data each time rather than duplicating rows.

Useful Prisma commands:
- `npm run prisma:studio` — visual DB browser (`prisma studio`)
- `npm run prisma:migrate` — create/apply a new migration after schema changes
- `npm run prisma:generate` — regenerate the client after pulling schema changes

### Frontend
```
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### Tests
```
cd backend && npm test
```

### Load test (validates the 500-concurrent-user target)
```
cd backend
k6 run loadtest/api-load.js
```
Report your actual measured p95 latency and error rate — don't reuse the threshold values in the script as if they were results.
