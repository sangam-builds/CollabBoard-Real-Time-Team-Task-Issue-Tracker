const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireTeamRole } = require('../middleware/rbac.middleware');
const taskController = require('../controllers/task.controller');

const router = express.Router();

router.use(authMiddleware);

// Tasks CRUD + Search
router.get('/boards/:boardId/tasks', taskController.list);
router.get('/boards/:boardId/tasks/search', taskController.search);
router.post('/boards/:boardId/tasks', requireTeamRole('member'), taskController.create);
router.patch('/tasks/:taskId', requireTeamRole('member'), taskController.update);
router.delete('/tasks/:taskId', requireTeamRole('member'), taskController.delete);
router.patch('/tasks/:taskId/assign', requireTeamRole('member'), taskController.assign);
router.patch('/tasks/:taskId/status', requireTeamRole('member'), taskController.updateStatus);

// Prioritization Engine (CollabBoard-Prioritization-Feature.md)
router.get('/boards/:id/suggested-order', taskController.prioritized);
router.get('/boards/:boardId/tasks/prioritized', taskController.prioritized);

// Dependencies Management (Section 2.1)
router.get('/tasks/:id/dependencies', taskController.getDependencies);
router.get('/tasks/:taskId/dependencies', taskController.getDependencies);
router.post('/tasks/:id/dependencies', requireTeamRole('member'), taskController.addDependency);
router.post('/tasks/:taskId/dependencies', requireTeamRole('member'), taskController.addDependency);
router.delete('/tasks/:id/dependencies/:dependsOnTaskId', requireTeamRole('member'), taskController.removeDependency);
router.delete('/tasks/:taskId/dependencies/:dependsOnTaskId', requireTeamRole('member'), taskController.removeDependency);

// Comments
router.post('/tasks/:taskId/comments', requireTeamRole('member'), taskController.addComment);
router.delete('/comments/:commentId', taskController.deleteComment);

// Activity Logs
router.get('/boards/:boardId/activity', taskController.activity);

// Notifications
router.get('/notifications', taskController.getNotifications);
router.patch('/notifications/:id/read', taskController.markNotificationRead);
router.post('/notifications/mark-all-read', taskController.markAllNotificationsRead);

module.exports = router;
