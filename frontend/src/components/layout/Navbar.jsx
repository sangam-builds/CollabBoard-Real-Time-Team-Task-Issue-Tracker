import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../auth/LogoutButton';

export default function Navbar({ boardId }) {
  const { user } = useAuth();

  return (
    <header className="w-full bg-white border-b border-outline-variant/30 px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-sm shadow-xs">
            CB
          </div>
          <span className="font-semibold text-base text-on-surface tracking-tight">CollabBoard</span>
        </div>

        {boardId && (
          <div className="hidden sm:flex items-center text-xs text-on-surface-variant gap-2 pl-3 border-l border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px] text-outline">dashboard</span>
            <span className="font-medium text-on-surface">Board #{boardId}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1 bg-surface-container/60 rounded-full border border-outline-variant/20">
            <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-[11px] font-semibold text-on-primary-fixed">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-on-surface leading-tight">
                {user.displayName || 'User'}
              </span>
              <span className="text-[10px] text-on-surface-variant leading-tight">
                {user.email}
              </span>
            </div>
          </div>
        )}

        <LogoutButton variant="outline" />
      </div>
    </header>
  );
}
