import React from 'react';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ columns, tasks }) {
  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden px-container-padding pb-container-padding">
      <div className="flex h-full space-x-6 w-max min-w-full">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.columnId === col.id);
          return <KanbanColumn key={col.id} column={col} tasks={colTasks} />;
        })}
        {/* Spacer for scrolling */}
        <div className="w-8 shrink-0"></div>
      </div>
    </main>
  );
}
