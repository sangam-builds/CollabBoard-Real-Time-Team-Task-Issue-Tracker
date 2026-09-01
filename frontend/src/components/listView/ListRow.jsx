import React from 'react';
import { useRole } from '../../context/RoleContext';

export default function ListRow({ task, isSelected, onToggle, onRowClick, isLast }) {
  const { canBulkEdit } = useRole();
  const { taskName, assignee, status, statusClass, priority, priorityClass, dueDate, labels } = task;

  return (
    <tr
      onClick={() => onRowClick && onRowClick(task)}
      className={`${
        isLast ? '' : 'border-b border-outline-variant'
      } table-row-hover group transition-colors cursor-pointer ${
        isSelected ? 'bg-surface-container-high/60' : ''
      }`}
    >
      {/* Checkbox (Owner & Admin only per Section 7) */}
      {canBulkEdit && (
        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(task.id)}
            className="row-checkbox rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
        </td>
      )}

      {/* Task Name */}
      <td className="py-3 px-4 text-on-surface font-medium">{taskName}</td>

      {/* Assignee */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          {assignee.type === 'image' ? (
            <img
              alt={assignee.name}
              className="w-6 h-6 rounded-full object-cover"
              src={assignee.avatar}
            />
          ) : (
            <div
              className={`w-6 h-6 rounded-full ${assignee.className} flex items-center justify-center text-xs font-medium`}
            >
              {assignee.initials}
            </div>
          )}
          <span className="text-on-surface-variant text-sm">{assignee.name}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded font-label-mono text-[11px] font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </td>

      {/* Priority */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded font-label-mono text-[11px] font-semibold ${priorityClass}`}
        >
          {priority}
        </span>
      </td>

      {/* Due Date */}
      <td className="py-3 px-4 text-on-surface-variant text-sm">{dueDate}</td>

      {/* Labels */}
      <td className="py-3 px-4">
        <div className="flex space-x-1">
          {labels.map((lbl) => (
            <span
              key={lbl}
              className="inline-flex items-center px-2 py-0.5 rounded border border-outline-variant text-secondary text-xs"
            >
              {lbl}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}
