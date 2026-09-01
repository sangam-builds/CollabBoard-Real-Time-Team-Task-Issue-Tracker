import React from 'react';
import { useRole } from '../../context/RoleContext';

export default function KanbanCard({ task, onClick }) {
  const { isMember, canEditTask } = useRole();
  const editable = canEditTask(task);

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

  return (
    <div
      onClick={() => onClick && onClick(task)}
      draggable={editable}
      className={`bg-surface-container-lowest border rounded-lg p-3 transition-all relative group select-none shadow-xs hover:shadow-md ${
        isBlocked
          ? 'border-error-container hover:bg-[#FDF6F6]'
          : isDone
          ? 'border-outline-variant/40 bg-surface-container-lowest/70 opacity-80'
          : 'border-outline-variant hover:bg-[#F3F4F9]'
      } ${
        editable ? 'cursor-pointer' : 'cursor-default'
      } ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      }`}
    >
      {/* Corner subtle lock icon on hover for Member when task is not editable per Section 3 spec */}
      {isMember && !editable && (
        <div
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-secondary flex items-center gap-1 bg-surface-container-lowest/90 px-1.5 py-0.5 rounded shadow-xs"
          title="View only: You can edit tasks you created or are assigned to"
        >
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span className="text-[10px] font-mono">View only</span>
        </div>
      )}

      {/* Header: Category & Action */}
      <div className="flex items-center justify-between mb-2">
        <span className={categoryClass || 'px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-label-mono text-[10px] rounded uppercase font-semibold'}>
          {category}
        </span>
        {editable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(task);
            }}
            className="opacity-0 group-hover:opacity-100 text-secondary hover:text-on-surface transition-opacity p-0.5 cursor-pointer"
            title="Edit task"
          >
            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-body-sm font-medium mb-3 leading-snug ${isDone ? 'text-secondary line-through' : 'text-on-background'}`}>
        {title}
      </h3>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/30">
        {/* Status / Due Date */}
        {isBlocked ? (
          <div className="flex items-center space-x-1 text-error bg-error-container/30 px-1.5 py-0.5 rounded">
            <span className="material-symbols-outlined text-[13px]">block</span>
            <span className="font-label-mono text-[10px] font-semibold">Blocked</span>
          </div>
        ) : isDone ? (
          <div className="flex items-center space-x-1 text-secondary/70">
            {showCheckIcon && (
              <span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span>
            )}
            <span className="font-label-mono text-[11px]">{dueDate || 'Completed'}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-secondary">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            <span className={`font-label-mono text-[11px] ${isDueDateActive ? 'font-semibold text-primary' : ''}`}>
              {dueDate || 'In backlog'}
            </span>
          </div>
        )}

        {/* Assignees */}
        {assignees.length > 1 ? (
          <div className="flex -space-x-2">
            {assignees.map((assignee, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high"
                title={assignee.name}
              >
                {assignee.avatar ? (
                  <img alt={assignee.name || 'Assignee'} className="w-full h-full object-cover" src={assignee.avatar} />
                ) : (
                  <div className="w-full h-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-medium">
                    {assignee.initials || 'CB'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full overflow-hidden border border-surface-container-lowest bg-surface-container-high"
            title={assignees[0]?.name || 'Assignee'}
          >
            {assignees[0]?.avatar ? (
              <img alt={assignees[0]?.name || 'Assignee'} className="w-full h-full object-cover" src={assignees[0].avatar} />
            ) : (
              <div className="w-full h-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-[10px] font-medium">
                {assignees[0]?.initials || 'MK'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

