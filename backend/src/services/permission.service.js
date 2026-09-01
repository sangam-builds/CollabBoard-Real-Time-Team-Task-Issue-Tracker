const teamRepository = require('../repositories/team.repository');

// All authorization RULES live here, not in middleware or controllers,
// so they can be unit tested directly (see tests/permission.test.js).
const permissionService = {
  async getUserRoleOnTeam(userId, teamId) {
    return teamRepository.getUserRole(userId, teamId);
  },

  async getTeamIdForBoard(boardId) {
    return teamRepository.getTeamIdForBoard(boardId);
  },

  // Resolves which team a request is "about", based on whichever param is present.
  async resolveTeamIdForRequest(req) {
    if (req.params.teamId) return Number(req.params.teamId);
    if (req.params.boardId) return teamRepository.getTeamIdForBoard(Number(req.params.boardId));
    if (req.params.taskId) return teamRepository.getTeamIdForTask(Number(req.params.taskId));
    if (req.params.id) return teamRepository.getTeamIdForTask(Number(req.params.id));
    throw Object.assign(new Error('Cannot resolve team for this request'), { status: 400 });
  },

  canEditTask({ role, task, userId }) {
    if (role === 'owner' || role === 'admin') return true;
    const createdBy = task.createdBy ?? task.created_by;
    const assigneeId = task.assigneeId ?? task.assignee_id;
    return createdBy === userId || assigneeId === userId;
  },
};

module.exports = permissionService;
