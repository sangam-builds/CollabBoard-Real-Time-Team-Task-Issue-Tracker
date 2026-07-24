const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireTeamRole } = require('../middleware/rbac.middleware');
const taskController = require('../controllers/task.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/boards/:boardId/tasks', taskController.list);
router.get('/boards/:boardId/tasks/prioritized', taskController.prioritized);
router.get('/boards/:boardId/tasks/search', taskController.search);
router.post('/boards/:boardId/tasks', requireTeamRole('member'), taskController.create);
router.patch('/tasks/:taskId/assign', requireTeamRole('member'), taskController.assign);
router.patch('/tasks/:taskId/status', requireTeamRole('member'), taskController.updateStatus);

module.exports = router;
