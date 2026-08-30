import React from 'react';
import LogoutButton from '../auth/LogoutButton';

export default function TopNavBar({
  projectName = 'CollabBoard',
  subProjectName = 'Q3 Marketing Launch',
  views = ['Board', 'Timeline', 'Suggested Order', 'Calendar', 'List'],
  activeView = 'Board',
  onSelectView,
}) {
  function handleViewClick(view) {
    if (onSelectView) onSelectView(view);
  }

  return (
    <header className="docked full-width top-0 h-16 border-b border-outline-variant flex justify-between items-center px-6 w-full bg-surface-container-lowest shrink-0 z-40">
      {/* Breadcrumb / Title Area */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Center Navigation Links */}
      <div className="hidden md:flex items-end h-full gap-6">
        {views.map((view) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => handleViewClick(view)}
              className={`font-label-mono text-label-mono uppercase tracking-wider pb-4 px-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-primary border-b-2 border-primary hover:text-primary'
                  : 'text-on-secondary-fixed-variant border-b-2 border-transparent hover:text-primary'
              }`}
            >
              {view}
            </button>
          );
        })}
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="rounded-full px-6 py-2 bg-primary text-on-primary font-body-sm text-body-sm font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer">
          Share
        </button>
        <LogoutButton variant="outline" className="hidden sm:inline-flex" />
      </div>
    </header>
  );
}
