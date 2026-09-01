const prisma = require('../config/db');

const taskRepository = {
  async create({ boardId, title, description, createdBy, assigneeId, dueDate }) {
    return prisma.task.create({
      data: {
        boardId,
        title,
        description,
        createdBy,
        assigneeId: assigneeId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
  },

  async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, displayName: true, email: true } },
        creator: { select: { id: true, displayName: true, email: true } },
        comments: {
          include: { author: { select: { id: true, displayName: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        dependsOn: { select: { dependsOnTaskId: true } },
      },
    });
  },

  async findByBoard(boardId) {
    return prisma.task.findMany({
      where: { boardId },
      include: {
        assignee: { select: { id: true, displayName: true, email: true } },
        creator: { select: { id: true, displayName: true, email: true } },
        comments: {
          include: { author: { select: { id: true, displayName: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        dependsOn: { select: { dependsOnTaskId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async update(taskId, data) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        assignee: { select: { id: true, displayName: true, email: true } },
        creator: { select: { id: true, displayName: true, email: true } },
      },
    });
  },

  async delete(taskId) {
    return prisma.task.delete({
      where: { id: taskId },
    });
  },

  async updateAssignee(taskId, assigneeId) {
    return prisma.task.update({
      where: { id: taskId },
      data: { assigneeId, updatedAt: new Date() },
      include: {
        assignee: { select: { id: true, displayName: true, email: true } },
        creator: { select: { id: true, displayName: true, email: true } },
      },
    });
  },

  async updateStatus(taskId, status) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status, updatedAt: new Date() },
      include: {
        assignee: { select: { id: true, displayName: true, email: true } },
        creator: { select: { id: true, displayName: true, email: true } },
      },
    });
  },

  // Fetches tasks + dependency edges for the prioritization algorithm in two queries.
  // (Prisma doesn't do the graph traversal -- that logic stays in task.service.js exactly as before.)
  async getDependencyGraph(boardId) {
    const tasks = await prisma.task.findMany({ where: { boardId } });
    const edges = await prisma.taskDependency.findMany({
      where: { task: { boardId } },
      select: { taskId: true, dependsOnTaskId: true },
    });
    // Map back to the snake_case shape the scoring algorithm expects, so
    // task.service.js doesn't need to change at all.
    return {
      tasks,
      edges: edges.map((e) => ({ task_id: e.taskId, depends_on_task_id: e.dependsOnTaskId })),
    };
  },

  async addDependency({ taskId, dependsOnTaskId }) {
    return prisma.taskDependency.create({
      data: { taskId, dependsOnTaskId },
      include: {
        task: { select: { id: true, title: true, status: true } },
        dependsOnTask: { select: { id: true, title: true, status: true } },
      },
    });
  },

  async removeDependency({ taskId, dependsOnTaskId }) {
    return prisma.taskDependency.delete({
      where: {
        taskId_dependsOnTaskId: { taskId, dependsOnTaskId },
      },
    });
  },

  async findDependency(taskId, dependsOnTaskId) {
    return prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: { taskId, dependsOnTaskId },
      },
    });
  },

  async getTaskDependencies(taskId) {
    const [blockedBy, blocks] = await Promise.all([
      prisma.taskDependency.findMany({
        where: { taskId },
        include: {
          dependsOnTask: {
            select: { id: true, title: true, status: true, priorityFlag: true, dueDate: true, assignee: { select: { displayName: true } } },
          },
        },
      }),
      prisma.taskDependency.findMany({
        where: { dependsOnTaskId: taskId },
        include: {
          task: {
            select: { id: true, title: true, status: true, priorityFlag: true, dueDate: true, assignee: { select: { displayName: true } } },
          },
        },
      }),
    ]);

    return {
      blockedBy: blockedBy.map((b) => b.dependsOnTask),
      blocks: blocks.map((b) => b.task),
    };
  },

  async search(boardId, query) {
    return prisma.$queryRaw`
      SELECT *, ts_rank(search_vector, plainto_tsquery('english', ${query})) AS rank
      FROM tasks
      WHERE board_id = ${boardId} AND search_vector @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
    `;
  },
};

module.exports = taskRepository;
