# CollabBoard — Architecture, Roles & Feature Workflow Guide (v2 — No Redis / No BullMQ)

This version removes Redis and BullMQ entirely. Real-time sync now runs on a single Socket.io server instance, and notifications are handled in-process using Node's built-in `EventEmitter` instead of a distributed job queue.

**Honest tradeoff to know going in:** the earlier version's "distributed systems at scale" story leaned heavily on Redis pub/sub (multi-instance Socket.io) and BullMQ (a genuinely separate worker process). Removing both means the system is now a single, well-architected monolith rather than multiple independently-scalable services. That's a completely reasonable scope decision for a student project — it's faster to build and has fewer moving parts to debug — but if asked in an interview "is this deployed as multiple services," the honest answer is no, not anymore. What still stands strong regardless: layered OOP design, RBAC, the prioritization algorithm, relational schema design, real-time UI updates, and automated testing — which covers most of the JD's actual requirements anyway.

---

## PART 1: System Architecture — Every Component's Role

Now three components instead of five.

### 1. React Frontend (Client)
**Role:** Renders the UI, manages local/optimistic state, talks to the API over HTTP, and keeps a WebSocket connection open for live updates.

**Why it's separate from the backend:** Decoupling client from server is standard practice and lets you reason about each independently, even without a distributed backend.

### 2. Express API Server (the "brain")
**Role:** Handles all CRUD operations, authentication, authorization, real-time broadcasting (Socket.io lives inside this same process now), and notification dispatch. Still a **layered architecture**:

```
Route  →  Controller  →  Service  →  Repository  →  Database
```

- **Route:** defines the URL + HTTP method (e.g. `POST /api/tasks`)
- **Controller:** parses the request, calls the right service, formats the response
- **Service:** contains business logic (e.g. "can this user create a task on this board?"), and now also emits internal events for notifications
- **Repository:** the only layer that talks to PostgreSQL directly

**Why this matters for the JD:** This is still your "object-oriented design" answer — each layer has a single responsibility. Nothing about removing Redis/BullMQ changes this part of the story.

### 3. PostgreSQL Database
**Role:** The single source of truth — users, teams, boards, tasks, comments, activity logs, and now notifications too (previously notifications were transient queue jobs; now they're just rows in a `notifications` table).

**Why relational over NoSQL here:** Unchanged — tasks, assignees, dependencies, and comments are naturally relational.

---

## PART 2: User Roles (RBAC — Role-Based Access Control)

Unchanged from before.

| Role | Can do | Cannot do |
|---|---|---|
| **Owner** | Everything below, plus delete the team, transfer ownership, manage billing/settings | N/A — top of hierarchy |
| **Admin** | Create/delete boards, invite/remove members, assign tasks to anyone, edit any task | Delete the team, remove the Owner |
| **Member** | Create tasks, edit/comment on tasks assigned to them or that they created, view all boards | Delete boards, remove other members, edit others' tasks |

**Workflow — how a permission check actually happens:**
1. User sends `PATCH /api/tasks/42` with their JWT in the `Authorization` header.
2. Auth middleware verifies the JWT signature and attaches `req.user`.
3. A permission check (in the service layer) queries `team_members` to find this user's role on the team owning this task's board.
4. Rule applied: is this user the assignee/creator, or Admin/Owner? If not → `403 Forbidden`.
5. Only then does the repository layer touch the database.

---

## PART 3: Feature-by-Feature Deep Dive

### Feature 1 — Authentication (JWT)
Unchanged.

**Workflow:**
1. User submits email/password to `POST /api/auth/login`.
2. Server compares the password against the stored bcrypt hash.
3. If valid, signs a JWT `{ userId, email, exp }` and returns it.
4. Client sends it in the `Authorization: Bearer <token>` header on every request.
5. Server verifies the signature per-request — no server-side session storage needed.

---

### Feature 2 — Task & Board CRUD
Unchanged in shape, minus the queue step.

**Workflow (creating/assigning a task):**
1. Frontend sends `POST /api/boards/:boardId/tasks` (or `PATCH .../assign`).
2. Controller validates the request shape.
3. Service checks permission (RBAC).
4. Repository writes to `tasks` table (foreign keys to `board_id`, `assignee_id`).
5. Service writes a row to `activity_logs`.
6. Service directly triggers the notification step (see Feature 4 below) and the real-time broadcast (see Feature 3) — both happen in the same request, not via a separate queued job.
7. Response returns to the frontend.

---

### Feature 3 — Real-Time Sync (Socket.io, single instance)
**What it does:** When one user updates a task, everyone else viewing that board sees it live.

**What changed:** No Redis adapter, because there's only one server process — Socket.io's default in-memory event handling is enough. This is the correct, honest scope for a single-instance deployment; the adapter only becomes necessary the moment you run more than one server instance.

**Workflow:**
1. Client connects via WebSocket and joins a room named after the board (`socket.join('board:42')`).
2. User A updates a task via a normal HTTP request (not through the socket).
3. After the database write succeeds, the server calls `io.to('board:42').emit('task:updated', taskData)`.
4. Since all connected clients are on this one server process, Socket.io delivers the event directly to everyone in that room — no external pub/sub needed.

**What to say in an interview:** "I broadcast only after the database write succeeds, so the database is always the source of truth. Right now this runs as a single instance — if I needed to scale horizontally, the natural next step would be a Redis (or similar) adapter so multiple instances could share broadcast state, but that wasn't necessary at this scale."

---

### Feature 4 — In-App Notifications (event-driven, in-process)
**What it does:** When a task is assigned, the assignee gets a notification — without a separate infrastructure piece.

**What changed:** Instead of pushing a job to a Redis-backed queue for a separate worker to pick up, the API process itself handles it, decoupled logically (not physically) using Node's built-in `EventEmitter`.

**Workflow:**
1. When a task is assigned, the service layer emits an internal event: `eventBus.emit('task:assigned', { taskId, userId })` — this returns instantly, it's just a synchronous function call under the hood.
2. A separate **listener module** (registered once at startup) is subscribed to `'task:assigned'`. It runs asynchronously via the Node event loop (not blocking the original request), and:
   - Writes a row to a `notifications` table (so the user sees an in-app notification badge)
   - Optionally calls an email API (e.g. Resend) if you want actual emails
3. If step 2 fails (e.g., email API is down), you handle it with a simple try/catch and a logged error — there's no automatic retry queue anymore, so any retry logic (if you want it) has to be written by hand, or you can decide dropped notifications are an acceptable tradeoff for a student project.

**What to say in an interview:** "I used an in-process event emitter to keep the notification logic decoupled from the request/response cycle — the task-creation code doesn't need to know how notifications are delivered. For this scale, that's sufficient; a dedicated queue like BullMQ would be the natural upgrade if I needed retries or wanted to move notification delivery to a separate service."

---

### Feature 5 — Task Prioritization Algorithm
Unchanged — this doesn't depend on Redis/BullMQ at all.

**Workflow:**
1. Backend builds a dependency graph in memory from `task_dependencies` rows for a board.
2. Runs a topological sort (Kahn's algorithm) to determine valid ordering and detect circular dependencies.
3. Computes a priority score per task: `score = w1*(1/days_until_due) + w2*(number_of_dependent_tasks) + w3*(manual_priority_flag)`.
4. Returns tasks sorted by score as a "Suggested order" view.
5. Complexity: O(V + E) — cheap even for large boards.

---

### Feature 6 — Full-Text Search
Unchanged — pure Postgres, never touched Redis/BullMQ.

**Workflow:**
1. A `tsvector` column on `tasks`, auto-updated via a Postgres trigger.
2. GIN index on that column for fast lookups.
3. Query: `SELECT * FROM tasks WHERE search_vector @@ to_tsquery('bug & login') ORDER BY ts_rank(...) DESC`.

---

### Feature 7 — Analytics Dashboard
Unchanged — reads from `activity_logs`, no queue dependency.

**Workflow:**
1. Aggregate SQL queries grouped by week.
2. Returned as JSON time-series data.
3. Rendered with Recharts (velocity chart, activity by member).

---

### Feature 8 — Load Testing (k6 or Artillery)
**What changed:** You're now load-testing a single-instance server instead of a multi-instance + Redis setup — simpler to run, still a legitimate and honest number to report (e.g., "sustained 300 concurrent WebSocket connections on a single instance with sub-200ms broadcast latency"). Don't inflate the claim to sound distributed if it isn't anymore.

---

### Feature 9 — CI/CD Pipeline (GitHub Actions + optional Jenkins)
**What changed:** Your CI pipeline gets simpler — it only needs to spin up Postgres as a service now, no Redis container required.

**Workflow:**
1. On push, GitHub Actions spins up a fresh container, starts a temporary Postgres instance.
2. Installs dependencies, runs lint, then runs the test suite (Jest + Supertest).
3. Fails the build if anything breaks.

---

### Feature 10 — Monitoring & Health Checks
**What changed:** The `/health` endpoint now only checks Postgres connectivity (no Redis ping needed).

**Workflow:**
1. `/health` endpoint checks DB connectivity, returns `200` or `503`.
2. Structured request logging (Winston/Pino) with request ID, status, duration.
3. Small admin page surfacing recent errors/logs.

---

## PART 4: Full Request Lifecycle (Updated — No Redis/BullMQ)

What happens end-to-end when a user assigns a task:

1. **Frontend** sends `PATCH /api/tasks/42/assign` with JWT and new assignee ID.
2. **Auth middleware** verifies the JWT, attaches the requesting user.
3. **Permission check (RBAC)** confirms Admin/Owner or task creator.
4. **Service layer** updates the task via the **repository**, writing to **PostgreSQL**.
5. **Service layer** writes an entry to `activity_logs`.
6. **Service layer** emits an in-process `'task:assigned'` event via `EventEmitter` — a registered listener asynchronously writes a notification row (and optionally sends an email), without blocking the response.
7. **Socket.io** broadcasts `task:updated` directly to all clients connected to this single server instance who are in that board's room.
8. The HTTP response returns to the frontend once steps 4–6 complete (step 6's actual listener work happens off the main return path, but on the same process).
9. **Analytics query** later aggregates this activity log entry for the team's dashboard.
10. Every step is covered by **automated tests** (unit tests on service/permission logic, integration tests on the API endpoint), enforced by the **CI pipeline** on every push.

This still covers real-time collaboration, RBAC, OOP-layered design, an actual graph algorithm, relational modeling, and automated testing — the core of what the Salesforce JD is screening for. The one thing it no longer demonstrates is genuine multi-service/distributed deployment, which is a fair and explainable scope cut for a solo student project on a deadline.
