# CollabBoard — Feature Deep Dive: Dependency-Aware Task Prioritization

**Scope note:** This document covers a single feature within the larger CollabBoard project — the prioritization engine — including its architecture, algorithm, and the end-to-end user workflow around it.

---

## 1. Feature Overview

### The Problem
In any multi-person project, tasks aren't independent. Some tasks can't start until others finish, some tasks unlock a lot of downstream work, and due dates alone don't tell you what to work on *right now*. Left unmanaged, this leads to two failure modes:
1. **Wasted effort** — someone starts a task that's actually blocked.
2. **Silent deadlock** — a circular dependency (A needs B, B needs C, C needs A) that nobody notices until the whole board is stuck.

### The Solution
CollabBoard models task relationships as a **directed graph** and runs a well-known graph algorithm over it to produce a safe, ranked, actionable order — recomputed on demand as the board changes.

### Where It Lives in the Architecture
```
Route              GET /api/boards/:id/suggested-order
   │
Controller         parses boardId, calls service
   │
Service            builds graph, runs algorithm, computes scores   ← the actual feature
   │
Repository         fetches tasks + task_dependencies rows
   │
Database           PostgreSQL (tasks, task_dependencies tables)
```
This feature lives almost entirely in the **service layer** — it's a pure, testable unit of logic that doesn't care how it's called or where its data ultimately comes from, which is why `prioritization.test.js` can test it with fabricated graphs and no database at all.

### How It Works, Step by Step
1. **Fetch dependencies** — Repository pulls all `task_dependencies` rows for the board (edges: "Task X blocks Task Y").
2. **Build the graph** — Service constructs an in-memory adjacency list from those edges.
3. **Topological sort (Kahn's algorithm)** — Repeatedly removes nodes with no incoming edges, producing a valid execution order.
4. **Cycle detection** — If nodes remain that can never be removed (because they're stuck in a cycle), the algorithm detects this and the API returns a clear, specific error instead of a broken or arbitrary order.
5. **Priority scoring** — For each task, compute:
   ```
   score = w1 * (1 / days_until_due) + w2 * (number_of_dependent_tasks) + w3 * (manual_priority_flag)
   ```
6. **Return sorted list** — Tasks are returned ordered by score, respecting the valid dependency ordering underneath.

**Complexity:** O(V + E) — linear in the number of tasks and dependency links, so it stays fast even on large boards.

---

## 2. User Workflow

### 2.1 Setting Up Dependencies
1. A user opens a task and adds one or more dependencies ("This task is blocked by: [Task Name]").
2. Frontend sends `POST /api/tasks/:id/dependencies`.
3. Backend validates that the dependency doesn't already exist and writes a row to `task_dependencies`.
4. *(Optional, if desired)* a lightweight check can warn the user immediately if this new edge would create an obvious short cycle, before they even leave the task view.

### 2.2 Viewing the Suggested Order
1. User navigates to a board and clicks the **"Suggested Order"** tab (distinct from the raw Kanban columns).
2. Frontend calls `GET /api/boards/:boardId/suggested-order`.
3. Backend runs the full pipeline (fetch → build graph → topological sort → score → sort).
4. Frontend renders the tasks as a ranked list, each annotated with:
   - Why it's ranked where it is (e.g. "Blocks 3 other tasks," "Due in 2 days")
   - Its dependency status (ready to start vs. still blocked)

### 2.3 Handling a Circular Dependency
1. A user adds a dependency that, combined with existing ones, creates a cycle.
2. The next time anyone requests the suggested order, the topological sort cannot fully resolve the graph.
3. The API returns a `422` (or similar) with the specific tasks involved in the cycle, rather than a silent wrong answer.
4. The frontend surfaces this clearly: *"These 3 tasks have a circular dependency and can't be ordered: Task A → Task B → Task C → Task A."*
5. The user (typically an Admin, since resolving this often means reassigning ownership of a dependency) edits or removes one of the dependency links.
6. The next request succeeds and returns a valid order.

### 2.4 Working From the Suggested Order
1. A team member opens the Suggested Order view at the start of their work session instead of scanning the full backlog.
2. They pick the top task that is both **unblocked** and **assigned to them** (or unassigned and available).
3. As tasks are completed and marked done, dependent tasks that were previously blocked become eligible — the next call to the endpoint reflects this automatically, no manual recalculation needed.
4. This closes the loop: task completion → real-time board update (via Socket.io) → next suggested-order fetch reflects the new state.

### 2.5 Manual Override
1. An Admin can set a `manual_priority_flag` on a task (e.g. "this is urgent regardless of the graph").
2. This feeds directly into the scoring formula, letting human judgment override pure algorithmic ranking without breaking the underlying dependency safety guarantees (a manually-boosted task still can't be suggested before its blockers are done).

---

## 3. Impact Summary

| Angle | Impact |
|---|---|
| **Product** | Turns a flat backlog into an actionable, safe work queue; prevents wasted effort on blocked tasks and catches planning mistakes (cycles) before they stall a team |
| **Technical** | The one part of the codebase that isn't CRUD — demonstrates applied graph theory, not just framework usage |
| **Testing** | Fully unit-testable in isolation with fabricated graphs — no database needed — enabling rigorous edge-case coverage (cycles, diamonds, disconnected nodes) |
| **Interview story** | A concrete, whiteboard-explainable answer to "what was the hardest part of this project," differentiating it from typical CRUD-only portfolio projects |

