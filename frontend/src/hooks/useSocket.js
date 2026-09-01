import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// One socket connection per mounted board view, cleaned up on unmount.
// Single-instance server (no Redis adapter) means this connects directly
// to the one Node process handling all real-time traffic.
export function useSocket(boardId, { onTaskCreated, onTaskUpdated, onTaskDeleted } = {}) {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !boardId) return undefined;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit('board:join', boardId);
    if (onTaskCreated) socket.on('task:created', onTaskCreated);
    if (onTaskUpdated) socket.on('task:updated', onTaskUpdated);
    if (onTaskDeleted) socket.on('task:deleted', onTaskDeleted);

    return () => {
      socket.emit('board:leave', boardId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, boardId]);

  return socketRef;
}
