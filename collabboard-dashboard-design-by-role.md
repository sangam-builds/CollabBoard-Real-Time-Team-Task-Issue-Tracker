# CollabBoard — Full Dashboard Design Spec by User Role

This document specifies every major section of the CollabBoard app shell and exactly what each role (Owner, Admin, Member) sees, can do, and cannot do in it. Use this as the single reference when building screens — every section below should be designed once, then conditionally rendered/restricted per role rather than built as three separate UIs.

---

## Role Recap

| Role | Scope |
|---|---|
| **Owner** | Everything Admin can do, plus billing, team deletion, ownership transfer |
| **Admin** | Manage boards, members, permissions within a team; cannot delete the team or touch billing |
| **Member** | Work within boards they're part of; cannot manage people, permissions, or workspace settings |

---

## 1. Icon Rail / Primary Navigation

**All roles see:** Logo/workspace switcher, Search, Inbox, My Tasks, Boards, Analytics icon.

| Element | Owner | Admin | Member |
|---|---|---|---|
| Settings (gear) icon | Visible → full workspace settings | Visible → team/board settings only | Hidden (personal settings live under avatar menu instead) |
| "Admin" badge on avatar | Shown | Shown | Not shown |
| Billing icon | Visible | Hidden | Hidden |

**Design note:** Don't hide the rail structure itself between roles — hide/gray individual icons. A consistent rail across roles keeps the product feeling like one app, not three.

---

## 2. Top Bar (Board Context)

**All roles see:** Board title, view tabs (Board/Timeline/Suggested Order/Calendar/List), presence avatars, notification bell.

| Element | Owner | Admin | Member |
|---|---|---|---|
| "Share" button | Full sharing + link permissions control | Full sharing + link permissions control | Can share view-only links only |
| Board settings (⋯ menu) | Rename, archive, delete, change owner | Rename, archive | View board info only, no edit |
| "Invite member" | Yes | Yes | No (sees "Ask an Admin to invite" if attempted) |

---

## 3. Board View (Kanban)

**Identical layout for all roles** — columns, cards, drag-and-drop. This is intentional: the working surface should feel egalitarian so contributors aren't reminded of hierarchy while doing the work itself.

| Interaction | Owner | Admin | Member |
|---|---|---|---|
| Create task | ✅ | ✅ | ✅ |
| Edit any task | ✅ | ✅ | ❌ (only tasks they created or are assigned to) |
| Delete any task | ✅ | ✅ | ❌ (only their own, and only if unassigned to others) |
| Reassign task to anyone | ✅ | ✅ | ❌ (can only assign to self or unassign) |
| Add/edit columns | ✅ | ✅ | ❌ |
| Drag cards between columns | ✅ | ✅ | ✅ (only cards they have edit rights on) |

**Design detail:** When a Member hovers a task they can't edit, show a subtle lock icon on the card corner (not a jarring red border) — signals "this isn't yours" without feeling punitive.

---

## 4. Timeline / Gantt View

**All roles:** Read access to the full timeline (seeing the whole plan matters for everyone).

| Element | Owner | Admin | Member |
|---|---|---|---|
| Drag to reschedule a task | ✅ (any task) | ✅ (any task) | ✅ (own tasks only) |
| Edit dependency lines | ✅ | ✅ | ❌ (view-only; request changes via comment) |
| Export timeline (PDF/PNG) | ✅ | ✅ | ✅ |

---

## 5. Suggested Order View

**Fully identical across all roles** — this view is read-heavy and informational by nature (it's the output of the prioritization algorithm, not a management tool). The only role-sensitive element:

| Element | Owner | Admin | Member |
|---|---|---|---|
| Set "manual priority flag" override | ✅ | ✅ | ❌ (can suggest via comment, cannot set directly) |

---

## 6. Calendar View

Identical for all roles — a calendar is inherently a viewing surface. Editing a task from the calendar follows the same permission rules as the Board view (edit only own/assigned tasks if Member).

---

## 7. List / Table View

| Element | Owner | Admin | Member |
|---|---|---|---|
| Visible columns | All fields including custom fields | All fields | All fields (read), edit restricted per-row same as Kanban |
| Bulk edit (select multiple rows) | ✅ | ✅ | ❌ (bulk actions disabled entirely for Members to prevent accidental mass changes) |
| Export to CSV | ✅ | ✅ | ✅ |

---

## 8. Task Detail Panel/Modal

**All roles see:** Title, description, comments thread, activity log for that task, attachments.

| Element | Owner | Admin | Member (not assignee/creator) | Member (assignee/creator) |
|---|---|---|---|---|
| Edit title/description | ✅ | ✅ | ❌ | ✅ |
| Change assignee | ✅ | ✅ | ❌ | ✅ (can reassign to self→other or unassign) |
| Add comment | ✅ | ✅ | ✅ | ✅ |
| Delete comment (own) | ✅ | ✅ | ✅ | ✅ |
| Delete comment (others') | ✅ | ✅ | ❌ | ❌ |
| Set dependencies | ✅ | ✅ | ❌ | ✅ (own task only) |

**Design detail:** Instead of disabling fields with a grayed-out look (which reads as "broken"), render non-editable fields as plain text (no input border) for Members without edit rights — it should look like *information*, not a broken form.

---

## 9. Notifications Center

Identical UI and functionality for all roles — notification preferences are a personal setting, not a role-gated one. Everyone gets: unread badge, mark-as-read, filter by type (mentions/assignments/due-soon/blocked→ready), digest frequency toggle.

---

## 10. Activity Feed (Board-level)

Identical for all roles — transparency into "who changed what" is valuable at every level and isn't a permission-sensitive surface. Exception: Owners/Admins additionally see a small "Export activity log" button (ties into audit log for compliance).

---

## 11. Analytics Dashboard

| Element | Owner | Admin | Member |
|---|---|---|---|
| Team velocity chart | ✅ | ✅ | ✅ (view only, motivates transparency) |
| Individual workload breakdown (per-person hours/task count) | ✅ | ✅ | ✅ but limited to their own row highlighted; can view team totals, not drill into a specific teammate's individual breakdown |
| Custom report builder | ✅ | ✅ | ❌ |
| Export analytics | ✅ | ✅ | ❌ |

**Design rationale:** Full per-person drill-down for Members risks feeling like surveillance among peers; aggregate + "your own row" strikes the right balance.

---

## 12. Team & Members Management

| Element | Owner | Admin | Member |
|---|---|---|---|
| View member list | ✅ | ✅ | ✅ (read-only list, no management actions) |
| Invite member | ✅ | ✅ | ❌ |
| Remove member | ✅ | ✅ (cannot remove Owner) | ❌ |
| Change a member's role | ✅ | ✅ (cannot promote to Owner or demote Owner) | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |

**This entire section is hidden from the nav for Members** — not shown grayed out, simply absent, since there's nothing actionable here for them beyond the read-only member list (which lives under Board Settings → Members instead, visible to all).

---

## 13. Board Settings

| Element | Owner | Admin | Member |
|---|---|---|---|
| Rename/describe board | ✅ | ✅ | ❌ |
| Archive board | ✅ | ✅ | ❌ |
| Delete board | ✅ | ❌ | ❌ |
| Manage custom fields | ✅ | ✅ | ❌ |
| Manage automations (rule builder) | ✅ | ✅ | ❌ (can view active automations read-only, to understand why something happened automatically) |

---

## 14. Workspace/Org Settings

**Visible only to Owner and Admin** — entirely absent from Member navigation.

| Element | Owner | Admin |
|---|---|---|
| Billing & subscription | ✅ | ❌ (hidden entirely, not just disabled) |
| SSO/SAML configuration | ✅ | ❌ |
| Audit log (full, exportable) | ✅ | ✅ (view + export, cannot change retention settings) |
| Workspace-wide default permissions | ✅ | ✅ |
| Delete workspace | ✅ | ❌ |

---

## 15. Search / Command Palette (Cmd/Ctrl+K)

Identical for all roles in interaction model. Results are automatically scoped by what the searching user has access to — a Member searching never sees tasks/boards they don't have visibility into. No separate design needed; this is a data-scoping concern, not a UI-variant concern.

---

## Cross-Cutting Design Principles

1. **Hide, don't disable, entire sections a role can never use** (Billing, Team Management for Members). Gray-out/disabled states are reserved for actions that are *conditionally* unavailable (e.g., "Delete board" disabled for Admin only because the Owner must confirm first in some workflow), not permanently role-gated.
2. **Within a shared working surface (Board, Timeline, Calendar), keep the layout identical across roles** and gate at the level of individual actions/fields. This avoids the product feeling fragmented or hierarchical during actual collaborative work.
3. **Never use color alone to signal "you can't edit this."** Pair any restriction with an icon (lock) or a state change (border removed → looks like text, not a broken input).
4. **Admin and Owner share ~95% of the same UI.** Only billing, ownership transfer, and workspace/team deletion are Owner-exclusive — don't design two separate "power user" experiences.
