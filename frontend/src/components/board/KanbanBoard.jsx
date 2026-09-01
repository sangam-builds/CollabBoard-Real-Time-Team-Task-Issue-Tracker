import React from 'react';
import KanbanColumn from './KanbanColumn';
import { useRole } from '../../context/RoleContext';

export default function KanbanBoard({
  columns,
  tasks,
  onCardClick,
  onAddTask,
  onDropTask,
  onAddColumn,
}) {
  const { canManageColumns, isMember } = useRole();

  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden px-container-padding pb-container-padding">
      <div className="flex h-full space-x-6 w-max min-w-full">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.columnId === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={colTasks}
              onCardClick={onCardClick}
              onAddTask={onAddTask}
              onDropTask={onDropTask}
            />
          );
        })}

        {/* Add Column button: Owner & Admin only per Section 3 (Hidden for Member) */}
        {canManageColumns && (
          <div className="w-72 shrink-0 flex items-start pt-2">
            <button
              onClick={() => {
                const title = prompt('Enter new column title:');
                if (title && onAddColumn) onAddColumn(title);
              }}
              className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer bg-surface-container-lowest/50"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Column</span>
            </button>
          </div>
        )}

        {/* Spacer for scrolling */}
        <div className="w-8 shrink-0"></div>
      </div>
    </main>
  );
}
