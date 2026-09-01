const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const teamController = require('../controllers/team.controller');

const router = express.Router();

router.use(authMiddleware);

// Board endpoints
router.get('/boards/:boardId', teamController.getBoard);
router.patch('/boards/:boardId', teamController.updateBoard);
router.delete('/boards/:boardId', teamController.deleteBoard);

// Team endpoints
router.get('/teams/:teamId/members', teamController.getMembers);
router.post('/teams/:teamId/invite', teamController.inviteMember);
router.patch('/teams/:teamId/members/:userId/role', teamController.updateMemberRole);
router.delete('/teams/:teamId/members/:userId', teamController.removeMember);
router.post('/teams/:teamId/transfer-ownership', teamController.transferOwnership);

module.exports = router;
