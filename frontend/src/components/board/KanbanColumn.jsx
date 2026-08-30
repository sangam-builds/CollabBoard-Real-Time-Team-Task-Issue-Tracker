import React from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ column, tasks }) {
  const {
    title,
    count,
    dotClass,
    badgeClass,
    columnClass,
    headerClass,
    titleClass,
    canAdd,
    hasMoreAction,
  } = column;

  return (
    <div className={columnClass}>
      <div className={headerClass}>
        <div className="flex items-center space-x-2">
          <span className={dotClass}></span>
          <h2 className={titleClass}>{title}</h2>
          <span className={badgeClass}>{count}</span>
        </div>
        {canAdd && (
          <button className="text-secondary hover:text-on-surface transition-colors" title="Add item">
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        )}
        {hasMoreAction && (
          <button className="text-secondary hover:text-on-surface transition-colors" title="More options">
            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 kanban-col pb-10">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>

      {canAdd && (
        <button className="flex items-center space-x-2 p-3 text-secondary hover:text-on-surface hover:bg-surface-container-lowest transition-colors mt-auto border-t border-outline-variant/30 rounded-b-lg">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="text-sm font-medium">Add task</span>
        </button>
      )}
    </div>
  );
}
