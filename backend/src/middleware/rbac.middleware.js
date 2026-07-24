const permissionService = require('../services/permission.service');

// Factory: returns middleware that checks the requesting user's role on the
// team that owns the given board/task. Kept thin -- actual rule logic lives
// in permissionService so it's unit-testable without spinning up HTTP.
function requireTeamRole(minRole) {
  const order = { member: 0, admin: 1, owner: 2 };

  return async (req, res, next) => {
    try {
      const teamId = await permissionService.resolveTeamIdForRequest(req);
      const role = await permissionService.getUserRoleOnTeam(req.user.id, teamId);

      if (!role || order[role] < order[minRole]) {
        return res.status(403).json({ error: 'Insufficient permissions for this action' });
      }

      req.teamRole = role;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireTeamRole };
