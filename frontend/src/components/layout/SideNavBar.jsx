import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../auth/LogoutButton';

export default function SideNavBar({ activeNav = 'boards', onSelectNav }) {
  const [active, setActive] = useState(activeNav);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuth();

  const navItems = [
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'inbox', label: 'Inbox', icon: 'inbox', hasBadge: true },
    { id: 'tasks', label: 'My Tasks', icon: 'task_alt' },
    { id: 'boards', label: 'Boards', icon: 'dashboard', fillIcon: true },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  ];

  function handleNavClick(id) {
    setActive(id);
    if (onSelectNav) onSelectNav(id);
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

      {/* Main Nav Items */}
      <div className="flex flex-col space-y-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              aria-label={item.label}
              onClick={() => handleNavClick(item.id)}
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
        {/* Settings */}
        <button
          aria-label="Settings"
          className="w-10 h-10 rounded-lg text-secondary hover:bg-surface-container-high transition-colors flex items-center justify-center group relative cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="absolute left-14 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
            Settings
          </span>
        </button>

        {/* User Avatar */}
        <button
          aria-label="User Profile"
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden mt-2 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none cursor-pointer relative group"
        >
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA"
          />
        </button>

        {/* Profile Popover Menu */}
        {showProfileMenu && (
          <div className="absolute left-14 bottom-0 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-3 w-56 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-outline-variant/30">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                <img
                  alt="User"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA"
                />
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {user?.displayName || 'Sarah Chen'}
                </span>
                <span className="text-[11px] text-secondary truncate">
                  {user?.email || 'sarah.chen@collabboard.dev'}
                </span>
              </div>
            </div>
            <LogoutButton variant="ghost" className="w-full justify-start text-xs" />
          </div>
        )}
      </div>
    </nav>
  );
}
