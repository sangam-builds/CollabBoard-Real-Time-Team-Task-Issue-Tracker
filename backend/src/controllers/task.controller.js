const { z } = require('zod');
const taskService = require('../services/task.service');
const permissionService = require('../services/permission.service');

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assigneeId: z.number().int().optional(),
  dueDate: z.string().optional(),
});

const taskController = {
  // req.io is attached in app.js so controllers can broadcast without a global import
  async create(req, res, next) {
    try {
      const boardId = Number(req.params.boardId);
      const data = createTaskSchema.parse(req.body);
      const teamId = req.teamRole ? await permissionService.resolveTeamIdForRequest(req) : null;

      const task = await taskService.createTask({
        boardId,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
        createdBy: req.user.id,
        teamId,
      });

      req.io.to(`board:${boardId}`).emit('task:created', task);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const tasks = await taskService.listByBoard(Number(req.params.boardId));
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  async assign(req, res, next) {
    try {
      const taskId = Number(req.params.taskId);
      const { assigneeId } = req.body;
      const teamId = await permissionService.resolveTeamIdForRequest(req);

      const task = await taskService.assignTask({ taskId, assigneeId, teamId, actingUserId: req.user.id });

      const boardId = task.boardId ?? task.board_id;
      req.io.to(`board:${boardId}`).emit('task:updated', task);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const taskId = Number(req.params.taskId);
      const { status } = req.body;
      const task = await taskService.updateStatus(taskId, status);

      const boardId = task.boardId ?? task.board_id;
      req.io.to(`board:${boardId}`).emit('task:updated', task);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async prioritized(req, res, next) {
    try {
      const result = await taskService.getPrioritizedOrder(Number(req.params.boardId));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async search(req, res, next) {
    try {
      const results = await taskService.search(Number(req.params.boardId), req.query.q || '');
      res.json(results);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = taskController;
