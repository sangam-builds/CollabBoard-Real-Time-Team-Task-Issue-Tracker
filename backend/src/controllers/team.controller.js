const prisma = require('../config/db');
const permissionService = require('../services/permission.service');

const teamController = {
  async getBoard(req, res, next) {
    try {
      const boardId = Number(req.params.boardId);
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          team: {
            include: {
              owner: { select: { id: true, displayName: true, email: true } },
            },
          },
        },
      });
      if (!board) return res.status(404).json({ error: 'Board not found' });
      res.json(board);
    } catch (err) {
      next(err);
    }
  },

  async updateBoard(req, res, next) {
    try {
      const boardId = Number(req.params.boardId);
      const { name } = req.body;
      const teamId = await permissionService.getTeamIdForBoard(boardId);
      const role = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      if (role !== 'owner' && role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins and Owners can update board settings' });
      }

      const updated = await prisma.board.update({
        where: { id: boardId },
        data: { name },
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteBoard(req, res, next) {
    try {
      const boardId = Number(req.params.boardId);
      const teamId = await permissionService.getTeamIdForBoard(boardId);
      const role = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      // Section 13: Delete board is Owner ONLY!
      if (role !== 'owner') {
        return res.status(403).json({ error: 'Forbidden: Only Workspace Owners can delete boards' });
      }

      await prisma.board.delete({ where: { id: boardId } });
      res.json({ success: true, message: 'Board deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getMembers(req, res, next) {
    try {
      const teamId = Number(req.params.teamId);
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        include: {
          user: {
            select: { id: true, displayName: true, email: true, createdAt: true },
          },
        },
      });

      const formatted = members.map((m) => ({
        id: m.userId,
        membershipId: m.id,
        role: m.role,
        displayName: m.user.displayName,
        email: m.user.email,
      }));

      res.json(formatted);
    } catch (err) {
      next(err);
    }
  },

  async inviteMember(req, res, next) {
    try {
      const teamId = Number(req.params.teamId);
      const { email, role = 'member', displayName } = req.body;
      const actingRole = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      if (actingRole !== 'owner' && actingRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins and Owners can invite members' });
      }

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            displayName: displayName || email.split('@')[0],
            passwordHash: 'dummy_hash',
          },
        });
      }

      const membership = await prisma.teamMember.upsert({
        where: { teamId_userId: { teamId, userId: user.id } },
        update: { role },
        create: { teamId, userId: user.id, role },
      });

      res.status(201).json({ success: true, user, role: membership.role });
    } catch (err) {
      next(err);
    }
  },

  async updateMemberRole(req, res, next) {
    try {
      const teamId = Number(req.params.teamId);
      const targetUserId = Number(req.params.userId);
      const { role } = req.body;
      const actingRole = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      if (actingRole !== 'owner' && actingRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      // Check target member's existing role
      const targetExistingRole = await permissionService.getUserRoleOnTeam(targetUserId, teamId);
      if (targetExistingRole === 'owner') {
        return res.status(403).json({ error: 'Forbidden: Cannot change or demote the Owner' });
      }

      if (role === 'owner' && actingRole !== 'owner') {
        return res.status(403).json({ error: 'Forbidden: Only the Owner can transfer ownership' });
      }

      const updated = await prisma.teamMember.update({
        where: { teamId_userId: { teamId, userId: targetUserId } },
        data: { role },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async removeMember(req, res, next) {
    try {
      const teamId = Number(req.params.teamId);
      const targetUserId = Number(req.params.userId);
      const actingRole = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      if (actingRole !== 'owner' && actingRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      const targetExistingRole = await permissionService.getUserRoleOnTeam(targetUserId, teamId);
      if (targetExistingRole === 'owner') {
        return res.status(403).json({ error: 'Forbidden: Cannot remove the Owner' });
      }

      await prisma.teamMember.delete({
        where: { teamId_userId: { teamId, userId: targetUserId } },
      });

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async transferOwnership(req, res, next) {
    try {
      const teamId = Number(req.params.teamId);
      const { newOwnerId } = req.body;
      const actingRole = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      if (actingRole !== 'owner') {
        return res.status(403).json({ error: 'Forbidden: Only the Owner can transfer ownership' });
      }

      // Demote current owner to admin, promote new owner to owner
      await prisma.$transaction([
        prisma.team.update({
          where: { id: teamId },
          data: { ownerId: Number(newOwnerId) },
        }),
        prisma.teamMember.update({
          where: { teamId_userId: { teamId, userId: req.user.id } },
          data: { role: 'admin' },
        }),
        prisma.teamMember.update({
          where: { teamId_userId: { teamId, userId: Number(newOwnerId) } },
          data: { role: 'owner' },
        }),
      ]);

      res.json({ success: true, message: 'Ownership transferred successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = teamController;
