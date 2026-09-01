import React, { useState, useRef, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import LogoutButton from '../auth/LogoutButton';

export default function TopNavBar({
  projectName = 'CollabBoard',
  subProjectName = 'Sprint 42',
  views = ['Board', 'Timeline', 'Suggested Order', 'Calendar', 'List'],
  activeView = 'Board',
  onSelectView,
  onOpenShare,
  onOpenNotifications,
  onOpenInvite,
  onOpenBoardSettings,
  onOpenTeamMembers,
  onOpenActivityFeed,
}) {
  const {
    currentRole,
    currentUser,
    switchRole,
    isOwner,
    isAdmin,
    isMember,
    isOwnerOrAdmin,
  } = useRole();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const menuRef = useRef(null);
  const roleRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleShareClick() {
    if (isOwnerOrAdmin) {
      // Full sharing modal for Owner & Admin
      if (onOpenShare) onOpenShare();
    } else {
      // Member can share view-only links only per Section 2
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  }

  function handleViewClick(view) {
    if (onSelectView) onSelectView(view);
  }

  return (
    <header className="docked full-width top-0 h-16 border-b border-outline-variant flex justify-between items-center px-6 w-full bg-surface-container-lowest shrink-0 z-30">
      {/* Left: Breadcrumb / Title Area */}
      <div className="flex items-center gap-3">
        <h1 className="font-card-title text-card-title font-semibold text-on-surface">
          {projectName}
        </h1>
        {subProjectName && (
          <>
            <span className="text-outline select-none">/</span>
            <span className="font-body-md text-body-md font-medium text-on-surface">
              {subProjectName}
            </span>
          </>
        )}

        {/* Live Role Switcher Pill in Top Bar for instantaneous review */}
        <div className="relative ml-2" ref={roleRef}>
          <button
            type="button"
            onClick={() => setShowRoleDropdown((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isOwner
                ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                : isAdmin
                ? 'bg-secondary/10 border-secondary text-on-surface hover:bg-secondary/20'
                : 'bg-surface-container border-outline-variant text-secondary hover:text-on-surface'
            }`}
            title="Click to toggle or switch role"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="uppercase tracking-wider font-mono text-[11px]">
              Role: {currentRole}
            </span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>

          {showRoleDropdown && (
            <div className="absolute left-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-2 w-48 z-50 animate-in fade-in duration-100">
              <div className="text-[10px] uppercase font-mono text-secondary px-2 py-1">
                Switch Active Role
              </div>
              <button
                type="button"
                onClick={() => {
                  switchRole('owner');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isOwner ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>Sarah (Owner)</span>
                {isOwner && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isAdmin ? 'bg-secondary/15 text-on-surface font-bold' : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>James (Admin)</span>
                {isAdmin && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('member');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isMember ? 'bg-surface-container text-on-surface font-bold' : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>Maya (Member)</span>
                {isMember && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Navigation Links (All roles see view tabs) */}
      <div className="hidden lg:flex items-end h-full gap-6">
        {views.map((view) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => handleViewClick(view)}
              className={`font-label-mono text-label-mono uppercase tracking-wider pb-4 px-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-primary border-b-2 border-primary hover:text-primary font-semibold'
                  : 'text-on-secondary-fixed-variant border-b-2 border-transparent hover:text-primary'
              }`}
            >
              {view}
            </button>
          );
        })}
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-3 relative">
        {/* Presence Avatars */}
        <div className="hidden sm:flex -space-x-2 items-center mr-1" title="Active collaborators">
          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-surface-container-lowest ring-1 ring-outline-variant">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA"
              alt="Sarah"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-surface-container-lowest ring-1 ring-outline-variant">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFtVWLjvsvFaswDKai2dzxiJ7Hz059R3IyZ7Y8_WvWNqZZAFODzEltsbVFOICQj2Hl6GM3sgSx_NfIYcmNS8ST2i0llAFYar1Eq6zWf5QnREO_xhLY7Fr1gLFSb-e6Pw0wGRtrCEmcHyVcAhWDBmeRrnLvqOrrIM7X7ML0k9nOWB19qd2_On1Ej3HsNSh1YRS-pgenNt8nZZtUPbtlyCNFHm_nLsexvnqK3BdIN1XSiE1NBrX1-TZxfw"
              alt="James"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-surface-container-lowest ring-1 ring-outline-variant">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxRClfSTZw8Xr6B12YJT_fqg0m_s4WDR0hY99udWLtk7A18MiByx7bP6dRHUheV5oacrNnYyMKzJS2LyxjywPSkHladj1XvzchKjeU_XiBRbBldG3Gq_SCsjoLCJME4WuaMD3gyp0OVmGS_IBHzN9sD6X7rCktmI7auE-3412OxdZ0njSwHCME49e6TVRlS2_EygM29ckbEhd1k_pOlW6oyfGiaiQuwpH42Bwq3jRa8ORDNZZI6YSlGg"
              alt="Maya"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Invite Member button (Section 2) */}
        <button
          onClick={onOpenInvite}
          aria-label="Invite member"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors text-xs font-medium text-on-surface cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">person_add</span>
          <span>Invite</span>
        </button>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          onClick={onOpenNotifications}
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer relative"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface-container-lowest"></span>
        </button>

        {/* Share Button (Section 2) */}
        <div className="relative">
          <button
            onClick={handleShareClick}
            className="rounded-full px-4 py-1.5 bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share</span>
          </button>

          {/* Member View-only toast notification */}
          {shareToast && (
            <div className="absolute right-0 top-full mt-2 bg-inverse-surface text-inverse-on-surface px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg animate-in fade-in duration-150 z-50">
              ✓ View-only link copied to clipboard
            </div>
          )}
        </div>

        {/* Board Settings ⋯ menu (Section 2) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            aria-label="Board options"
            className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-1.5 w-56 z-50 animate-in fade-in duration-100">
              {/* Board Settings */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  if (onOpenBoardSettings) onOpenBoardSettings();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                <span>{isMember ? 'View Board Info' : 'Board Settings & Automations'}</span>
              </button>

              {/* Team Members (hidden for Member per Section 12) */}
              {isOwnerOrAdmin && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (onOpenTeamMembers) onOpenTeamMembers();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
                  <span>Manage Team & Members</span>
                </button>
              )}

              {/* Activity Feed */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  if (onOpenActivityFeed) onOpenActivityFeed();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">history</span>
                <span>Board Activity Feed</span>
              </button>

              <div className="my-1 border-t border-outline-variant/30" />

              <div className="px-3.5 py-1 text-[10px] text-secondary font-mono">
                {isOwner
                  ? 'Full board administration'
                  : isAdmin
                  ? 'Admin permissions (archive/settings)'
                  : 'Member read-only context'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

