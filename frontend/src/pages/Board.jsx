import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import Column from '../components/Column';
import { useSocket } from '../hooks/useSocket';

const STATUSES = ['todo', 'in_progress', 'done'];

export default function Board() {
  const { boardId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    const { data } = await client.get(`/api/boards/${boardId}/tasks`);
    setTasks(data);
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Live updates via the single-instance Socket.io server -- no polling needed.
  useSocket(boardId, {
    onTaskCreated: (task) => setTasks((prev) => [task, ...prev]),
    onTaskUpdated: (updated) =>
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t))),
  });

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading board...</p>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <h1 className="text-lg font-semibold text-slate-800 mb-4">Board #{boardId}</h1>
      <div className="flex gap-4 overflow-x-auto">
        {STATUSES.map((status) => (
          <Column key={status} status={status} tasks={tasks.filter((t) => t.status === status)} />
        ))}
      </div>
    </div>
  );
}
