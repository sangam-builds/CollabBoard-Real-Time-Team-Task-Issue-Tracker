const taskRepository = require('../repositories/task.repository');
const prisma = require('../config/db');
const eventBus = require('../events/eventBus');

function findCyclePath(remainingNodeIds, adjacency) {
  const visited = new Set();
  const recStack = new Map();
  const path = [];

  const dfs = (nodeId) => {
    visited.add(nodeId);
    recStack.set(nodeId, path.length);
    path.push(nodeId);

    for (const neighbor of adjacency.get(nodeId) || []) {
      if (!remainingNodeIds.has(neighbor)) continue;
      if (!visited.has(neighbor)) {
        const found = dfs(neighbor);
        if (found) return found;
      } else if (recStack.has(neighbor)) {
        const startIndex = recStack.get(neighbor);
        const cycle = path.slice(startIndex);
        cycle.push(neighbor);
        return cycle;
      }
    }

    path.pop();
    recStack.delete(nodeId);
    return null;
  };

  for (const id of remainingNodeIds) {
    if (!visited.has(id)) {
      const cycleIds = dfs(id);
      if (cycleIds) return cycleIds;
    }
  }
  return null;
}

function hasPath(from, target, adj, visited = new Set()) {
  if (from === target) return true;
  visited.add(from);
  for (const neighbor of adj.get(from) || []) {
    if (!visited.has(neighbor) && hasPath(neighbor, target, adj, visited)) return true;
  }
  return false;
}

const taskService = {
  async createTask({ boardId, title, description, createdBy, assigneeId, dueDate, teamId }) {
    const task = await taskRepository.create({ boardId, title, description, createdBy, assigneeId, dueDate });

    if (teamId) {
      await prisma.activityLog.create({
        data: { teamId, userId: createdBy, action: 'task_created', taskId: task.id },
      });
    }

    if (assigneeId) {
      eventBus.emit('task:assigned', { taskId: task.id, assigneeId, taskTitle: task.title });
    }

    return taskRepository.findById(task.id);
  },

  async updateTask({ taskId, data, role, userId, teamId }) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw Object.assign(new Error('Task not found'), { status: 404 });
    }

    // Role-based check: Owner/Admin can edit any task; Member can edit only own/assigned
    if (role !== 'owner' && role !== 'admin') {
      const isCreator = existing.createdBy === userId;
      const isAssignee = existing.assigneeId === userId;
      if (!isCreator && !isAssignee) {
        throw Object.assign(new Error('Forbidden: You can only edit tasks you created or are assigned to'), { status: 403 });
      }
    }

    const updated = await taskRepository.update(taskId, data);

    if (teamId) {
      await prisma.activityLog.create({
        data: { teamId, userId, action: `updated task "${updated.title}"`, taskId },
      });
    }

    return updated;
  },

  async deleteTask({ taskId, role, userId }) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw Object.assign(new Error('Task not found'), { status: 404 });
    }

    // Role-based check per spec:
    // Owner/Admin can delete any task; Member can only delete their own task if unassigned to others
    if (role !== 'owner' && role !== 'admin') {
      const isCreator = existing.createdBy === userId;
      const unassignedOrSelf = !existing.assigneeId || existing.assigneeId === userId;
      if (!isCreator || !unassignedOrSelf) {
        throw Object.assign(new Error('Forbidden: Members can only delete their own unassigned tasks'), { status: 403 });
      }
    }

    await taskRepository.delete(taskId);
    return { success: true, deletedTaskId: taskId };
  },

  async assignTask({ taskId, assigneeId, teamId, actingUserId, role }) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw Object.assign(new Error('Task not found'), { status: 404 });
    }

    // Role-based check: Member can only assign to self or unassign
    if (role !== 'owner' && role !== 'admin') {
      if (assigneeId && assigneeId !== actingUserId) {
        throw Object.assign(new Error('Forbidden: Members can only assign tasks to themselves or unassign'), { status: 403 });
      }
    }

    const task = await taskRepository.updateAssignee(taskId, assigneeId);

    if (teamId) {
      await prisma.activityLog.create({
        data: { teamId, userId: actingUserId, action: 'task_assigned', taskId },
      });
    }

    if (assigneeId) {
      eventBus.emit('task:assigned', { taskId, assigneeId, taskTitle: task.title });
    }
    return task;
  },

  async updateStatus(taskId, status) {
    return taskRepository.updateStatus(taskId, status);
  },

  async listByBoard(boardId) {
    return taskRepository.findByBoard(boardId);
  },

  async search(boardId, query) {
    return taskRepository.search(boardId, query);
  },

  // Comments
  async addComment({ taskId, body, authorId, teamId }) {
    const comment = await prisma.comment.create({
      data: { taskId, body, authorId },
      include: {
        author: { select: { id: true, displayName: true, email: true } },
      },
    });

    if (teamId) {
      await prisma.activityLog.create({
        data: { teamId, userId: authorId, action: 'added a comment', taskId },
      });
    }

    return comment;
  },

  async deleteComment({ commentId, role, userId }) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw Object.assign(new Error('Comment not found'), { status: 404 });
    }

    // Owner and Admin can delete any comment. Member can only delete own comment.
    if (role !== 'owner' && role !== 'admin' && comment.authorId !== userId) {
      throw Object.assign(new Error('Forbidden: You can only delete your own comments'), { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  },

  // Activity Logs
  async getActivityLogs(teamId) {
    return prisma.activityLog.findMany({
      where: teamId ? { teamId } : {},
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  // Notifications
  async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async markNotificationRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id: Number(id), userId },
      data: { isRead: true },
    });
  },

  async markAllNotificationsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  },

  // Dependency-aware prioritization per CollabBoard-Prioritization-Feature.md
  // Algorithm: Kahn's topological sort (O(V + E)) with priority scoring formula
  // Score = w1 * (1 / days_until_due) + w2 * (number_of_dependent_tasks) + w3 * (manual_priority_flag)
  async getPrioritizedOrder(boardId) {
    const { tasks, edges } = await taskRepository.getDependencyGraph(boardId);

    const inDegree = new Map(tasks.map((t) => [t.id, 0]));
    const adjacency = new Map(tasks.map((t) => [t.id, []])); // depends_on_task_id -> [tasks that depend on it]
    const blockersMap = new Map(tasks.map((t) => [t.id, []])); // task_id -> [tasks it depends on]

    for (const { task_id, depends_on_task_id } of edges) {
      adjacency.get(depends_on_task_id)?.push(task_id);
      blockersMap.get(task_id)?.push(depends_on_task_id);
      inDegree.set(task_id, (inDegree.get(task_id) || 0) + 1);
    }

    // Kahn's algorithm: find nodes with inDegree 0
    const queue = tasks.filter((t) => inDegree.get(t.id) === 0).map((t) => t.id);
    const order = [];

    while (queue.length) {
      const current = queue.shift();
      order.push(current);
      for (const neighbor of adjacency.get(current) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) queue.push(neighbor);
      }
    }

    const hasCycle = order.length !== tasks.length;

    // If a cycle is detected, trace the circular path to return clear, actionable info
    if (hasCycle) {
      const remainingNodeIds = new Set(tasks.map((t) => t.id).filter((id) => !order.includes(id)));
      const taskById = new Map(tasks.map((t) => [t.id, t]));

      // DFS to find the cycle within remaining nodes using top-level helper
      const cycleIds = findCyclePath(remainingNodeIds, adjacency);

      const cycleTasks = (cycleIds || Array.from(remainingNodeIds)).map((id) => ({
        id,
        title: taskById.get(id)?.title || `Task #${id}`,
      }));

      const cyclePath = cycleTasks.map((t) => `"${t.title}"`).join(' → ');

      const cycleError = new Error(`Circular dependency detected: ${cyclePath}`);
      cycleError.status = 422;
      cycleError.hasCycle = true;
      cycleError.cycle = cycleTasks;
      cycleError.cyclePath = cyclePath;
      cycleError.cycleTaskIds = cycleTasks.map((t) => t.id);
      throw cycleError;
    }

    // Number of downstream tasks depending on each task (w2 factor)
    const dependentCount = new Map(tasks.map((t) => [t.id, 0]));
    for (const { depends_on_task_id } of edges) {
      dependentCount.set(depends_on_task_id, (dependentCount.get(depends_on_task_id) || 0) + 1);
    }

    const taskById = new Map(tasks.map((t) => [t.id, t]));

    const scored = order.map((id) => {
      const t = taskById.get(id);

      // Urgency factor (w1 = 10)
      const now = new Date();
      const daysUntilDue = t.dueDate
        ? Math.max(0.5, (new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24))
        : 30; // default 30 days if no due date
      const urgencyScore = (1 / daysUntilDue) * 10;

      // Downstream impact factor (w2 = 5)
      const numDependents = dependentCount.get(id) || 0;
      const dependencyScore = numDependents * 5;

      // Manual priority override factor (w3 = 3)
      const manualPriorityFlag = t.priorityFlag || 0;
      const manualScore = manualPriorityFlag * 3;

      // Total formula score
      const totalScore = Number((urgencyScore + dependencyScore + manualScore).toFixed(2));

      // Determine blocker details
      const blockerIds = blockersMap.get(id) || [];
      const blockerTasks = blockerIds.map((bid) => taskById.get(bid)).filter(Boolean);
      const incompleteBlockers = blockerTasks.filter((b) => b.status !== 'done');
      const isBlocked = incompleteBlockers.length > 0;

      let reason = '';
      if (numDependents > 0 && t.dueDate) {
        reason = `Blocks ${numDependents} tasks • Due in ${Math.round(daysUntilDue)}d`;
      } else if (numDependents > 0) {
        reason = `Blocks ${numDependents} downstream tasks`;
      } else if (manualPriorityFlag > 0) {
        reason = `Manual Priority Override (${manualPriorityFlag}) • Score ${totalScore}`;
      } else if (t.status === 'done') {
        reason = 'Completed task';
      } else if (isBlocked) {
        reason = `Blocked by: ${incompleteBlockers.map((b) => b.title).slice(0, 2).join(', ')}`;
      } else {
        reason = `Ready to start • Score ${totalScore}`;
      }

      return {
        ...t,
        score: totalScore,
        scoreBreakdown: {
          urgencyScore: Number(urgencyScore.toFixed(2)),
          dependencyScore: Number(dependencyScore.toFixed(2)),
          manualScore: Number(manualScore.toFixed(2)),
        },
        numDependents,
        blockers: blockerTasks.map((b) => ({ id: b.id, title: b.title, status: b.status })),
        isBlocked,
        statusType: t.status === 'done' ? 'ready' : isBlocked ? 'blocked' : 'ready',
        statusReason: reason,
      };
    });

    // Sort primarily by score descending, respecting topological validity
    scored.sort((a, b) => b.score - a.score);
    return { order: scored, hasCycle: false };
  },

  // Task Dependencies Management (Section 2.1)
  async addDependency({ taskId, dependsOnTaskId, actingUserId, teamId }) {
    if (taskId === dependsOnTaskId) {
      throw Object.assign(new Error('A task cannot depend on itself'), { status: 400 });
    }

    const [task, blockerTask] = await Promise.all([
      taskRepository.findById(taskId),
      taskRepository.findById(dependsOnTaskId),
    ]);

    if (!task || !blockerTask) {
      throw Object.assign(new Error('One or both tasks not found'), { status: 404 });
    }

    if (task.boardId !== blockerTask.boardId) {
      throw Object.assign(new Error('Tasks must belong to the same board'), { status: 400 });
    }

    const existing = await taskRepository.findDependency(taskId, dependsOnTaskId);
    if (existing) {
      throw Object.assign(new Error('Dependency already exists'), { status: 409 });
    }

    // Lightweight cycle check before writing to DB
    const { tasks, edges } = await taskRepository.getDependencyGraph(task.boardId);
    const hypotheticalEdges = [...edges, { task_id: taskId, depends_on_task_id: dependsOnTaskId }];

    const adj = new Map(tasks.map((t) => [t.id, []]));
    for (const { task_id, depends_on_task_id } of hypotheticalEdges) {
      adj.get(depends_on_task_id)?.push(task_id);
    }

    // Check if path exists from taskId to dependsOnTaskId using top-level helper

    if (hasPath(taskId, dependsOnTaskId)) {
      throw Object.assign(
        new Error(`Cannot add dependency: creating this link would cause a circular dependency ("${blockerTask.title}" → "${task.title}")`),
        { status: 422, circularWarning: true }
      );
    }

    const dependency = await taskRepository.addDependency({ taskId, dependsOnTaskId });

    if (teamId) {
      await prisma.activityLog.create({
        data: {
          teamId,
          userId: actingUserId,
          action: `added dependency: "${task.title}" is now blocked by "${blockerTask.title}"`,
          taskId,
        },
      });
    }

    return dependency;
  },

  async removeDependency({ taskId, dependsOnTaskId, actingUserId, teamId }) {
    const dependency = await taskRepository.removeDependency({ taskId, dependsOnTaskId });

    if (teamId) {
      await prisma.activityLog.create({
        data: {
          teamId,
          userId: actingUserId,
          action: `removed dependency link for task #${taskId}`,
          taskId,
        },
      });
    }

    return { success: true, removed: dependency };
  },

  async getTaskDependencies(taskId) {
    return taskRepository.getTaskDependencies(taskId);
  },
};

module.exports = taskService;
