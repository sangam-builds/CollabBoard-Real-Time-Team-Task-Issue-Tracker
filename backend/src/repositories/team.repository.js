const prisma = require('../config/db');

const teamRepository = {
  async getUserRole(userId, teamId) {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    return membership?.role || null;
  },

  async getTeamIdForBoard(boardId) {
    const board = await prisma.board.findUnique({ where: { id: boardId }, select: { teamId: true } });
    return board?.teamId || null;
  },

  async getTeamIdForTask(taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { board: { select: { teamId: true } } },
    });
    return task?.board?.teamId || null;
  },
};

module.exports = teamRepository;
