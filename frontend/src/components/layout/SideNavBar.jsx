import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import LogoutButton from '../auth/LogoutButton';

export default function SideNavBar({
  activeNav = 'boards',
  onSelectNav,
  onOpenSettings,
  onOpenBilling,
  onOpenSearch,
  onOpenInbox,
}) {
  const [active, setActive] = useState(activeNav);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuth();
  const {
    currentRole,
    currentUser,
    switchRole,
    isOwner,
    isAdmin,
    isMember,
    isOwnerOrAdmin,
    canAccessBilling,
  } = useRole();

  useEffect(() => {
    setActive(activeNav);
  }, [activeNav]);

  const navItems = [
    { id: 'search', label: 'Search (Ctrl+K)', icon: 'search', action: onOpenSearch },
    { id: 'inbox', label: 'Inbox', icon: 'inbox', hasBadge: true, action: onOpenInbox },
    { id: 'tasks', label: 'My Tasks', icon: 'task_alt' },
    { id: 'boards', label: 'Boards', icon: 'dashboard', fillIcon: true },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  ];

  function handleNavClick(item) {
    if (item.action) {
      item.action();
      return;
    }
    setActive(item.id);
    if (onSelectNav) onSelectNav(item.id);
  }

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-surface-container-lowest fixed left-0 top-0 h-full w-14 border-r border-outline-variant flex flex-col items-center py-4 space-y-4 z-20">
      {/* Brand Logo Area */}
      <div className="mb-4 group cursor-pointer relative" title="CollabBoard Enterprise">
        <div className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
          C
        </div>
        <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
          CollabBoard Enterprise
        </div>
      </div>

      {/* Main Nav Items (All roles see: Search, Inbox, My Tasks, Boards, Analytics) */}
      <div className="flex flex-col space-y-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              aria-label={item.label}
              onClick={() => handleNavClick(item)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center relative group cursor-pointer transition-colors duration-150 ${
                isActive
                  ? 'text-primary bg-surface-container scale-95'
                  : 'text-secondary hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive && item.fillIcon ? 'icon-fill-1' : ''}`}>
                {item.icon}
              </span>
              {item.hasBadge && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full border border-surface-container-lowest"></span>
              )}
              <span className="absolute left-14 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Nav Items */}
      <div className="mt-auto flex flex-col space-y-2 w-full px-2 mb-4 relative" ref={menuRef}>
        {/* Billing Icon (Owner ONLY per Section 1: Visible for Owner, Hidden for Admin & Member) */}
        {canAccessBilling && (
          <button
            aria-label="Billing & Subscription"
            onClick={onOpenBilling}
            className="w-10 h-10 rounded-lg text-secondary hover:bg-surface-container-high transition-colors flex items-center justify-center group relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
            <span className="absolute left-14 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
              Billing (Owner)
            </span>
          </button>
        )}

        {/* Settings Icon (Owner & Admin Visible, HIDDEN for Member per Section 1) */}
        {!isMember && (
          <button
            aria-label="Settings"
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-lg text-secondary hover:bg-surface-container-high transition-colors flex items-center justify-center group relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="absolute left-14 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
              {isOwner ? 'Workspace Settings' : 'Team Settings'}
            </span>
          </button>
        )}

        {/* User Avatar with Role Badge per Section 1 ("Admin" or "Owner" badge shown, Member not shown) */}
        <div className="relative mt-2 flex justify-center">
          <button
            aria-label="User Profile"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none cursor-pointer relative group"
          >
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src={currentUser.avatar}
            />
          </button>

          {/* Role badge overlay on avatar (Shown for Owner & Admin, Not shown for Member) */}
          {isOwnerOrAdmin && (
            <span
              className={`absolute -bottom-1 -right-0.5 text-[8px] font-bold font-mono px-1 py-0.2 rounded-full border border-surface-container-lowest uppercase shadow-xs ${
                isOwner
                  ? 'bg-primary text-on-primary'
                  : 'bg-secondary text-surface-container-lowest'
              }`}
              title={`Role: ${currentRole.toUpperCase()}`}
            >
              {isOwner ? 'OWN' : 'ADM'}
            </span>
          )}
        </div>

        {/* Profile Popover Menu with Live Role Switcher */}
        {showProfileMenu && (
          <div className="absolute left-14 bottom-0 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-3.5 w-64 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-outline-variant/30">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant shrink-0">
                <img
                  alt="User"
                  className="w-full h-full object-cover"
                  src={currentUser.avatar}
                />
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-on-surface truncate">
                    {currentUser.displayName}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1 rounded ${
                      isOwner
                        ? 'bg-primary/15 text-primary'
                        : isAdmin
                        ? 'bg-secondary/15 text-on-surface'
                        : 'bg-surface-container-high text-secondary'
                    }`}
                  >
                    {currentRole}
                  </span>
                </div>
                <span className="text-[11px] text-secondary truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>

            {/* Quick Role Switcher for instant testing */}
            <div className="pb-2.5 mb-2.5 border-b border-outline-variant/30">
              <p className="text-[10px] uppercase font-semibold text-secondary tracking-wider mb-1.5">
                Switch Role (Demo Mode):
              </p>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => switchRole('owner')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    isOwner
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container text-secondary hover:text-on-surface'
                  }`}
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('admin')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    isAdmin
                      ? 'bg-secondary text-surface-container-lowest font-bold'
                      : 'bg-surface-container text-secondary hover:text-on-surface'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('member')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer text-center ${
                    isMember
                      ? 'bg-surface-dim text-on-surface font-bold border border-outline-variant'
                      : 'bg-surface-container text-secondary hover:text-on-surface'
                  }`}
                >
                  Member
                </button>
              </div>
            </div>

            {/* Personal settings for Member (spec Section 1) */}
            {isMember && (
              <button
                type="button"
                onClick={() => {
                  alert('Personal Preferences:\n• Notification digests: Daily\n• Timezone: UTC+5:30\n• Theme: Light / System');
                }}
                className="w-full text-left px-2 py-1.5 text-xs text-secondary hover:text-on-surface hover:bg-surface-container rounded-lg mb-1 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                Personal Settings
              </button>
            )}

            <LogoutButton variant="ghost" className="w-full justify-start text-xs" />
          </div>
        )}
      </div>
    </nav>
  );
}

