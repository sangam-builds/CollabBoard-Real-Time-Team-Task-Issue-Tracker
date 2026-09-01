const { z } = require('zod');
const taskService = require('../services/task.service');
const permissionService = require('../services/permission.service');

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assigneeId: z.number().int().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  priorityFlag: z.number().int().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assigneeId: z.number().int().nullable().optional(),
  priorityFlag: z.number().int().optional(),
  dueDate: z.string().nullable().optional(),
});

const taskController = {
  async create(req, res, next) {
    try {
      const boardId = Number(req.params.boardId);
      const data = createTaskSchema.parse(req.body);
      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);

      const task = await taskService.createTask({
        boardId,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
        createdBy: req.user.id,
        teamId,
      });

      if (req.io) req.io.to(`board:${boardId}`).emit('task:created', task);
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

  async update(req, res, next) {
    try {
      const taskId = Number(req.params.taskId);
      const data = updateTaskSchema.parse(req.body);
      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);
      const role = req.teamRole || (await permissionService.getUserRoleOnTeam(req.user.id, teamId));

      const task = await taskService.updateTask({
        taskId,
        data,
        role: role || 'member',
        userId: req.user.id,
        teamId,
      });

      const boardId = task.boardId ?? task.board_id;
      if (req.io) req.io.to(`board:${boardId}`).emit('task:updated', task);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const taskId = Number(req.params.taskId);
      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);
      const role = req.teamRole || (await permissionService.getUserRoleOnTeam(req.user.id, teamId));

      const result = await taskService.deleteTask({
        taskId,
        role: role || 'member',
        userId: req.user.id,
      });

      if (req.io && teamId) req.io.emit('task:deleted', { taskId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async assign(req, res, next) {
    try {
      const taskId = Number(req.params.taskId);
      const { assigneeId } = req.body;
      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);
      const role = req.teamRole || (await permissionService.getUserRoleOnTeam(req.user.id, teamId));

      const task = await taskService.assignTask({
        taskId,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        teamId,
        actingUserId: req.user.id,
        role: role || 'member',
      });

      const boardId = task.boardId ?? task.board_id;
      if (req.io) req.io.to(`board:${boardId}`).emit('task:updated', task);
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
      if (req.io) req.io.to(`board:${boardId}`).emit('task:updated', task);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async prioritized(req, res, next) {
    try {
      const boardId = Number(req.params.boardId || req.params.id);
      const result = await taskService.getPrioritizedOrder(boardId);
      res.json(result);
    } catch (err) {
      if (err.status === 422 && err.hasCycle) {
        return res.status(422).json({
          error: err.message,
          hasCycle: true,
          cycle: err.cycle,
          cyclePath: err.cyclePath,
          cycleTaskIds: err.cycleTaskIds,
        });
      }
      next(err);
    }
  },

  // Dependencies endpoints (Section 2.1 & 2.3)
  async getDependencies(req, res, next) {
    try {
      const taskId = Number(req.params.id || req.params.taskId);
      const dependencies = await taskService.getTaskDependencies(taskId);
      res.json(dependencies);
    } catch (err) {
      next(err);
    }
  },

  async addDependency(req, res, next) {
    try {
      const taskId = Number(req.params.id || req.params.taskId);
      const dependsOnTaskId = Number(req.body.dependsOnTaskId);
      if (!dependsOnTaskId) {
        return res.status(400).json({ error: 'dependsOnTaskId is required' });
      }

      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);
      const dependency = await taskService.addDependency({
        taskId,
        dependsOnTaskId,
        actingUserId: req.user.id,
        teamId,
      });

      if (req.io) {
        req.io.emit('task:dependency_added', { taskId, dependsOnTaskId });
      }

      res.status(201).json(dependency);
    } catch (err) {
      if (err.status === 422) {
        return res.status(422).json({
          error: err.message,
          circularWarning: true,
        });
      }
      next(err);
    }
  },

  async removeDependency(req, res, next) {
    try {
      const taskId = Number(req.params.id || req.params.taskId);
      const dependsOnTaskId = Number(req.params.dependsOnTaskId);
      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);

      const result = await taskService.removeDependency({
        taskId,
        dependsOnTaskId,
        actingUserId: req.user.id,
        teamId,
      });

      if (req.io) {
        req.io.emit('task:dependency_removed', { taskId, dependsOnTaskId });
      }

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

  // Comments
  async addComment(req, res, next) {
    try {
      const taskId = Number(req.params.taskId);
      const { body } = req.body;
      if (!body || !body.trim()) {
        return res.status(400).json({ error: 'Comment body is required' });
      }

      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);
      const comment = await taskService.addComment({
        taskId,
        body: body.trim(),
        authorId: req.user.id,
        teamId,
      });

      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },

  async deleteComment(req, res, next) {
    try {
      const commentId = Number(req.params.commentId);
      const role = req.user.roles?.[0]?.role || 'member';
      const result = await taskService.deleteComment({
        commentId,
        role,
        userId: req.user.id,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  // Activity
  async activity(req, res, next) {
    try {
      const teamId = await permissionService.resolveTeamIdForRequest(req).catch(() => null);
      const logs = await taskService.getActivityLogs(teamId);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },

  // Notifications
  async getNotifications(req, res, next) {
    try {
      const notifications = await taskService.getNotifications(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  },

  async markNotificationRead(req, res, next) {
    try {
      await taskService.markNotificationRead(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async markAllNotificationsRead(req, res, next) {
    try {
      await taskService.markAllNotificationsRead(req.user.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = taskController;
