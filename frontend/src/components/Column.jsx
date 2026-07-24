import TaskCard from './TaskCard';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function Column({ status, tasks }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 w-72 flex-shrink-0">
      <h2 className="text-sm font-semibold text-slate-600 mb-3">{STATUS_LABELS[status]}</h2>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
      {tasks.length === 0 && <p className="text-xs text-slate-400">No tasks here yet.</p>}
    </div>
  );
}
