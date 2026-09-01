import React from 'react';
import KanbanCard from './KanbanCard';
import { useRole } from '../../context/RoleContext';

export default function KanbanColumn({
  column,
  tasks,
  onCardClick,
  onAddTask,
  onDropTask,
}) {
  const { canManageColumns, canDragTask } = useRole();

  const {
    id,
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

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTask) {
      onDropTask(taskId, id);
    }
  }

  return (
    <div
      className={columnClass}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={headerClass}>
        <div className="flex items-center space-x-2">
          <span className={dotClass}></span>
          <h2 className={titleClass}>{title}</h2>
          <span className={badgeClass}>{tasks.length || count}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Add item directly in header */}
          <button
            onClick={() => onAddTask && onAddTask(id)}
            className="text-secondary hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container cursor-pointer"
            title="Create new task"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>

          {/* Column options: Owner & Admin only per Section 3 (Add/edit columns: Owner ✅ Admin ✅ Member ❌) */}
          {canManageColumns && hasMoreAction && (
            <button
              onClick={() => alert(`Column settings for "${title}" (Admin/Owner only)`)}
              className="text-secondary hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container cursor-pointer"
              title="Column options"
            >
              <span className="material-symbols-outlined text-[18px]">more_horiz</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 kanban-col pb-10">
        {tasks.map((task) => (
          <div
            key={task.id}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', task.id);
            }}
          >
            <KanbanCard task={task} onClick={onCardClick} />
          </div>
        ))}
      </div>

      {/* Add task button at bottom of column (All roles can create task per Section 3) */}
      <button
        onClick={() => onAddTask && onAddTask(id)}
        className="flex items-center space-x-2 p-3 text-secondary hover:text-on-surface hover:bg-surface-container-lowest transition-colors mt-auto border-t border-outline-variant/30 rounded-b-lg cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span className="text-sm font-medium">Add task</span>
      </button>
    </div>
  );
}

