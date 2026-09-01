import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const DEMO_USERS = {
  owner: {
    id: 1,
    displayName: 'Sarah Chen',
    email: 'sarah.chen@collabboard.dev',
    role: 'owner',
    title: 'Product Director (Workspace Owner)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA',
  },
  admin: {
    id: 2,
    displayName: 'James Okafor',
    email: 'james.okafor@collabboard.dev',
    role: 'admin',
    title: 'Engineering Lead (Admin)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFtVWLjvsvFaswDKai2dzxiJ7Hz059R3IyZ7Y8_WvWNqZZAFODzEltsbVFOICQj2Hl6GM3sgSx_NfIYcmNS8ST2i0llAFYar1Eq6zWf5QnREO_xhLY7Fr1gLFSb-e6Pw0wGRtrCEmcHyVcAhWDBmeRrnLvqOrrIM7X7ML0k9nOWB19qd2_On1Ej3HsNSh1YRS-pgenNt8nZZtUPbtlyCNFHm_nLsexvnqK3BdIN1XSiE1NBrX1-TZxfw',
  },
  member: {
    id: 4,
    displayName: 'Maya Lindqvist',
    email: 'maya.lindqvist@collabboard.dev',
    role: 'member',
    title: 'Senior Frontend Engineer (Member)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxRClfSTZw8Xr6B12YJT_fqg0m_s4WDR0hY99udWLtk7A18MiByx7bP6dRHUheV5oacrNnYyMKzJS2LyxjywPSkHladj1XvzchKjeU_XiBRbBldG3Gq_SCsjoLCJME4WuaMD3gyp0OVmGS_IBHzN9sD6X7rCktmI7auE-3412OxdZ0njSwHCME49e6TVRlS2_EygM29ckbEhd1k_pOlW6oyfGiaiQuwpH42Bwq3jRa8ORDNZZI6YSlGg',
  },
};

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const { user: authUser, login } = useAuth() || {};
  
  // Determine initial role from storage or authUser
  const [currentRole, setCurrentRole] = useState(() => {
    const savedRole = localStorage.getItem('cb_active_role');
    if (savedRole && ['owner', 'admin', 'member'].includes(savedRole)) {
      return savedRole;
    }
    if (authUser?.roles?.[0]?.role) {
      return authUser.roles[0].role.toLowerCase();
    }
    return 'owner'; // Default to owner so full features are explorable out of the box
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return DEMO_USERS[currentRole] || DEMO_USERS.owner;
  });

  const switchRole = useCallback(async (newRole) => {
    const roleKey = newRole.toLowerCase();
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      setCurrentRole(roleKey);
      setCurrentUser(demo);
      localStorage.setItem('cb_active_role', roleKey);

      // Authenticate with the backend for the switched role to get a real JWT
      try {
        if (login) {
          await login(demo.email, 'Password123!');
        }
      } catch (err) {
        console.warn('Backend login for role switch deferred:', err.message);
      }
    }
  }, [login]);

  useEffect(() => {
    if (DEMO_USERS[currentRole]) {
      setCurrentUser(DEMO_USERS[currentRole]);
      localStorage.setItem('cb_active_role', currentRole);
    }
  }, [currentRole]);

  // Permission helpers according to collaboard-dashboard-design-by-role.md
  const isOwner = currentRole === 'owner';
  const isAdmin = currentRole === 'admin';
  const isMember = currentRole === 'member';
  const isOwnerOrAdmin = isOwner || isAdmin;

  // 1. Task permissions
  const canEditTask = useCallback((task) => {
    if (!task) return false;
    if (isOwnerOrAdmin) return true;
    // Member: only tasks they created or are assigned to
    const isCreator = task.createdBy === currentUser.id || task.creatorId === currentUser.id;
    const isDirectAssignee = task.assigneeId === currentUser.id;
    const isNamedAssignee = task.assignees?.some(
      (a) => a.id === currentUser.id || a.name === currentUser.displayName || a.initials === 'MK' || a.name === 'Maya Lindqvist'
    );
    return Boolean(isCreator || isDirectAssignee || isNamedAssignee);
  }, [isOwnerOrAdmin, currentUser]);

  const canDeleteTask = useCallback((task) => {
    if (!task) return false;
    if (isOwnerOrAdmin) return true;
    // Member: only their own, and only if unassigned to others
    const isCreator = task.createdBy === currentUser.id || task.creatorId === currentUser.id;
    const hasOtherAssignees = task.assignees && task.assignees.some(
      (a) => a.id !== currentUser.id && a.name !== currentUser.displayName && a.name !== 'Maya Lindqvist'
    );
    return isCreator && !hasOtherAssignees;
  }, [isOwnerOrAdmin, currentUser]);

  const canReassignTask = useCallback((task) => {
    if (isOwnerOrAdmin) return 'all'; // can reassign to anyone
    if (canEditTask(task)) return 'self_only'; // member: can only assign to self or unassign
    return false;
  }, [isOwnerOrAdmin, canEditTask]);

  const canDragTask = useCallback((task) => {
    return canEditTask(task);
  }, [canEditTask]);

  // 2. Column permissions
  const canManageColumns = isOwnerOrAdmin;

  // 3. Board settings permissions
  const canDeleteBoard = isOwner;
  const canTransferOwnership = isOwner;
  const canRenameArchiveBoard = isOwnerOrAdmin;
  const canManageCustomFields = isOwnerOrAdmin;
  const canManageAutomations = isOwnerOrAdmin; // Member can view read-only

  // 4. Workspace / Org settings permissions
  const canAccessWorkspaceSettings = isOwnerOrAdmin;
  const canAccessBilling = isOwner;
  const canAccessSSO = isOwner;
  const canDeleteWorkspace = isOwner;

  // 5. Team / Member management
  const canAccessTeamManagement = isOwnerOrAdmin; // Hidden for Member
  const canInviteMembers = isOwnerOrAdmin;
  const canRemoveMember = useCallback((targetMemberRole) => {
    if (targetMemberRole === 'owner') return false; // Cannot remove owner
    return isOwnerOrAdmin;
  }, [isOwnerOrAdmin]);
  const canChangeMemberRole = useCallback((targetMemberRole) => {
    if (targetMemberRole === 'owner') return false; // Cannot demote owner
    return isOwnerOrAdmin;
  }, [isOwnerOrAdmin]);

  // 6. Timeline permissions
  const canRescheduleTask = useCallback((task) => {
    if (isOwnerOrAdmin) return true;
    return canEditTask(task);
  }, [isOwnerOrAdmin, canEditTask]);
  const canEditDependencies = isOwnerOrAdmin;

  // 7. Suggested order permissions
  const canSetManualPriorityFlag = isOwnerOrAdmin;

  // 8. List view permissions
  const canBulkEdit = isOwnerOrAdmin; // Disabled entirely for members

  // 9. Analytics permissions
  const canBuildCustomReports = isOwnerOrAdmin;
  const canExportAnalytics = isOwnerOrAdmin;
  const canViewTeammateWorkloadDrilldown = isOwnerOrAdmin;

  // 10. Audit export
  const canExportActivity = isOwnerOrAdmin;

  // 11. Sharing permissions
  const canManageSharePermissions = isOwnerOrAdmin; // Member: view-only link only

  const value = {
    currentRole,
    currentUser,
    switchRole,
    isOwner,
    isAdmin,
    isMember,
    isOwnerOrAdmin,
    // Detailed permission checkers
    canEditTask,
    canDeleteTask,
    canReassignTask,
    canDragTask,
    canManageColumns,
    canDeleteBoard,
    canTransferOwnership,
    canRenameArchiveBoard,
    canManageCustomFields,
    canManageAutomations,
    canAccessWorkspaceSettings,
    canAccessBilling,
    canAccessSSO,
    canDeleteWorkspace,
    canAccessTeamManagement,
    canInviteMembers,
    canRemoveMember,
    canChangeMemberRole,
    canRescheduleTask,
    canEditDependencies,
    canSetManualPriorityFlag,
    canBulkEdit,
    canBuildCustomReports,
    canExportAnalytics,
    canViewTeammateWorkloadDrilldown,
    canExportActivity,
    canManageSharePermissions,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
