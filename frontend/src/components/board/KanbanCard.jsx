import React from 'react';

export default function KanbanCard({ task }) {
  const {
    category,
    categoryClass,
    title,
    dueDate,
    isDueDateActive,
    isBlocked,
    isDone,
    showCheckIcon,
    isDragging,
    assignees = [],
  } = task;

  if (isDragging) {
    return (
      <div className="bg-surface-container-lowest rounded-lg p-3 cursor-grabbing drag-active">
        <div className="flex items-center justify-between mb-2">
          <span className={categoryClass}>{category}</span>
          <span className="material-symbols-outlined text-[16px] text-primary">drag_indicator</span>
        </div>
        <h3 className="text-body-sm font-medium text-on-background mb-4 leading-tight">{title}</h3>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/30">
          <div className="flex items-center space-x-1 text-primary">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            <span className="font-label-mono text-[11px] font-semibold">{dueDate}</span>
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high">
            {assignees[0]?.avatar && (
              <img
                alt={assignees[0].name || 'Assignee'}
                className="w-full h-full object-cover"
                src={assignees[0].avatar}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="bg-surface-container-lowest/70 border border-outline-variant/50 rounded-lg p-3 group">
        <div className="flex items-center justify-between mb-2">
          <span className={categoryClass}>{category}</span>
          {showCheckIcon && (
            <span className="material-symbols-outlined text-[16px] text-secondary/50">check_circle</span>
          )}
        </div>
        <h3 className="text-body-sm text-secondary mb-4 leading-tight line-through">{title}</h3>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/20">
          <div className="flex items-center space-x-1 text-secondary/70">
            <span className="font-label-mono text-[11px]">{dueDate}</span>
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high opacity-70">
            {assignees[0]?.avatar ? (
              <img
                alt={assignees[0].name || 'Assignee'}
                className="w-full h-full object-cover grayscale"
                src={assignees[0].avatar}
              />
            ) : (
              <div className={assignees[0]?.className || 'w-full h-full bg-surface-container-highest text-secondary flex items-center justify-center text-[10px] font-medium'}>
                {assignees[0]?.initials}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="bg-surface-container-lowest border border-error-container rounded-lg p-3 hover:bg-[#F3F4F9] transition-colors cursor-grab active:cursor-grabbing group shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className={categoryClass}>{category}</span>
          <button className="opacity-0 group-hover:opacity-100 text-secondary hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
          </button>
        </div>
        <h3 className="text-body-sm font-medium text-on-background mb-4 leading-tight">{title}</h3>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/30">
          <div className="flex items-center space-x-1 text-error bg-error-container/30 px-1.5 py-0.5 rounded">
            <span className="material-symbols-outlined text-[14px]">block</span>
            <span className="font-label-mono text-[11px] font-semibold">Blocked</span>
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high">
            <div className={assignees[0]?.className || 'w-full h-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-[10px] font-medium'}>
              {assignees[0]?.initials}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal Card
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 hover:bg-[#F3F4F9] transition-colors cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className={categoryClass}>{category}</span>
        <button className="opacity-0 group-hover:opacity-100 text-secondary hover:text-on-surface transition-all">
          <span className="material-symbols-outlined text-[16px]">more_horiz</span>
        </button>
      </div>
      <h3 className="text-body-sm font-medium text-on-background mb-4 leading-tight">{title}</h3>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/30">
        <div className="flex items-center space-x-1 text-secondary">
          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
          <span className={`font-label-mono text-[11px] ${isDueDateActive ? 'font-semibold text-primary' : ''}`}>
            {dueDate}
          </span>
        </div>
        {assignees.length > 1 ? (
          <div className="flex -space-x-2">
            {assignees.map((assignee, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high ${
                  idx === 0 ? 'z-10' : 'z-0'
                }`}
              >
                {assignee.avatar ? (
                  <img
                    alt={assignee.name || 'Assignee'}
                    className="w-full h-full object-cover"
                    src={assignee.avatar}
                  />
                ) : (
                  <div className={assignee.className || 'w-full h-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-medium'}>
                    {assignee.initials}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high">
            {assignees[0]?.avatar ? (
              <img
                alt={assignees[0].name || 'Assignee'}
                className="w-full h-full object-cover"
                src={assignees[0].avatar}
              />
            ) : (
              <div className={assignees[0]?.className || 'w-full h-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-[10px] font-medium'}>
                {assignees[0]?.initials}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
