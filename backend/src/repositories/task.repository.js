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
    return prisma.task.findUnique({ where: { id } });
  },

  async findByBoard(boardId) {
    return prisma.task.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateAssignee(taskId, assigneeId) {
    return prisma.task.update({
      where: { id: taskId },
      data: { assigneeId, updatedAt: new Date() },
    });
  },

  async updateStatus(taskId, status) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status, updatedAt: new Date() },
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

  // tsvector isn't queryable through Prisma's normal API (it's an Unsupported type),
  // so full-text search stays a raw query -- everything else in this file uses
  // normal Prisma calls.
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
