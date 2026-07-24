const taskRepository = require('../repositories/task.repository');
const prisma = require('../config/db');
const eventBus = require('../events/eventBus');

const taskService = {
  async createTask({ boardId, title, description, createdBy, assigneeId, dueDate, teamId }) {
    const task = await taskRepository.create({ boardId, title, description, createdBy, assigneeId, dueDate });

    await prisma.activityLog.create({
      data: { teamId, userId: createdBy, action: 'task_created', taskId: task.id },
    });

    if (assigneeId) {
      // Fire-and-forget: emits synchronously but the listener runs async off this call stack.
      eventBus.emit('task:assigned', { taskId: task.id, assigneeId, taskTitle: task.title });
    }

    return task;
  },

  async assignTask({ taskId, assigneeId, teamId, actingUserId }) {
    const task = await taskRepository.updateAssignee(taskId, assigneeId);

    await prisma.activityLog.create({
      data: { teamId, userId: actingUserId, action: 'task_assigned', taskId },
    });

    eventBus.emit('task:assigned', { taskId, assigneeId, taskTitle: task.title });
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

  // Feature 5: dependency-aware prioritization.
  // Kahn's algorithm (BFS-based topological sort) -- O(V + E).
  // Also naturally detects cycles: if not all nodes get processed, a cycle exists.
  async getPrioritizedOrder(boardId) {
    const { tasks, edges } = await taskRepository.getDependencyGraph(boardId);

    const inDegree = new Map(tasks.map((t) => [t.id, 0]));
    const adjacency = new Map(tasks.map((t) => [t.id, []]));

    for (const { task_id, depends_on_task_id } of edges) {
      // "task_id depends on depends_on_task_id" => edge: depends_on_task_id -> task_id
      adjacency.get(depends_on_task_id)?.push(task_id);
      inDegree.set(task_id, (inDegree.get(task_id) || 0) + 1);
    }

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

    const dependentCount = new Map(tasks.map((t) => [t.id, 0]));
    for (const { depends_on_task_id } of edges) {
      dependentCount.set(depends_on_task_id, (dependentCount.get(depends_on_task_id) || 0) + 1);
    }

    const taskById = new Map(tasks.map((t) => [t.id, t]));
    const scored = order.map((id) => {
      const t = taskById.get(id);
      const daysUntilDue = t.dueDate
        ? Math.max(1, (new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 30; // no due date -> treat as low urgency
      const score =
        (1 / daysUntilDue) * 10 +
        (dependentCount.get(id) || 0) * 5 +
        (t.priorityFlag || 0) * 3;
      return { ...t, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return { order: scored, hasCycle };
  },
};

module.exports = taskService;
