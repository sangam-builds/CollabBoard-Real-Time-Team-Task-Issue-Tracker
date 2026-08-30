import React, { useRef, useEffect } from 'react';
import ListRow from './ListRow';

export default function ListTable({
  tasks = [],
  selectedIds = new Set(),
  onToggleTask,
  onToggleAll,
}) {
  const selectAllRef = useRef(null);

  const allSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));
  const someSelected = tasks.some((t) => selectedIds.has(t.id)) && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="bg-surface-container-lowest border-x border-b border-outline-variant rounded-b-lg overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-bright">
            <th className="py-3 px-4 w-12">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                id="select-all"
                title="Select all"
              />
            </th>
            <th className="py-3 px-4 font-label-mono text-label-mono tracking-[0.05em] uppercase text-secondary">
              Task name
            </th>
            <th className="py-3 px-4 font-label-mono text-label-mono tracking-[0.05em] uppercase text-secondary w-48">
              Assignee
            </th>
            <th className="py-3 px-4 font-label-mono text-label-mono tracking-[0.05em] uppercase text-secondary w-32">
              Status
            </th>
            <th className="py-3 px-4 font-label-mono text-label-mono tracking-[0.05em] uppercase text-secondary w-32">
              Priority
            </th>
            <th className="py-3 px-4 font-label-mono text-label-mono tracking-[0.05em] uppercase text-secondary w-32">
              Due date
            </th>
            <th className="py-3 px-4 font-label-mono text-label-mono tracking-[0.05em] uppercase text-secondary min-w-[200px]">
              Labels
            </th>
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md">
          {tasks.map((task, idx) => (
            <ListRow
              key={task.id}
              task={task}
              isSelected={selectedIds.has(task.id)}
              onToggle={onToggleTask}
              isLast={idx === tasks.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
