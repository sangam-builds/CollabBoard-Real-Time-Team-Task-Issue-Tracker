import React, { useState } from 'react';
import ListToolbar from './ListToolbar';
import ListTable from './ListTable';
import { mockListViewData } from '../../data/mockListViewData';

export default function ListView({ data = mockListViewData, onSelectTask }) {
  const [tasks, setTasks] = useState(data.tasks);
  const [selectedIds, setSelectedIds] = useState(new Set());

  function handleToggleTask(taskId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  function handleToggleAll(checkAll) {
    if (checkAll) {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleBulkAction(action) {
    if (action === 'complete') {
      setTasks((prev) =>
        prev.map((t) =>
          selectedIds.has(t.id)
            ? { ...t, status: 'DONE', statusClass: 'bg-[#e6f4ea] text-[#137333]' }
            : t
        )
      );
      setSelectedIds(new Set());
    } else if (action === 'delete') {
      setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    }
  }

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar p-container-padding bg-background w-full max-w-[1400px] mx-auto">
      {/* Title */}
      <div className="mb-margin-md flex justify-between items-center">
        <h2 className="font-section-headline text-section-headline text-on-surface">
          {data.title}
        </h2>
      </div>

      {/* Toolbar */}
      <ListToolbar
        selectedCount={selectedIds.size}
        onBulkAction={handleBulkAction}
        onExportCsv={() => {
          const csv = 'Task Name,Assignee,Status,Priority,Due Date\n' + tasks.map((t) => `"${t.taskName}","${t.assignee?.name}","${t.status}","${t.priority}","${t.dueDate}"`).join('\n');
          const encoded = encodeURI('data:text/csv;charset=utf-8,' + csv);
          const a = document.createElement('a');
          a.href = encoded;
          a.download = 'tasks_list.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }}
      />

      {/* Data Table */}
      <ListTable
        tasks={tasks}
        selectedIds={selectedIds}
        onToggleTask={handleToggleTask}
        onToggleAll={handleToggleAll}
        onRowClick={(task) => {
          if (onSelectTask) {
            onSelectTask({
              id: task.id,
              title: task.taskName,
              category: 'List',
              dueDate: task.dueDate,
              assignees: [task.assignee],
            });
          }
        }}
      />
    </main>
  );
}
