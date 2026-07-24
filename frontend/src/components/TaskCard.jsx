export default function TaskCard({ task }) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-slate-200 p-3 mb-2">
      <p className="text-sm font-medium text-slate-800">{task.title}</p>
      {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between mt-2">
        {task.dueDate && (
          <span className="text-[11px] text-slate-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
        {task.assigneeId && (
          <span className="text-[11px] bg-slate-100 rounded-full px-2 py-0.5">User #{task.assigneeId}</span>
        )}
      </div>
    </div>
  );
}
