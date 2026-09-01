import React, { useState, useEffect, useRef } from 'react';
import { useRole } from '../../context/RoleContext';
import client from '../../api/client';

export default function CommandPalette({ isOpen, onClose, onSelectTask, onSelectNav }) {
  const { currentRole, isMember } = useRole();
  const [query, setQuery] = useState('');
  const [backendTasks, setBackendTasks] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function searchTasks() {
      try {
        const url = query.trim()
          ? `/api/boards/1/tasks/search?q=${encodeURIComponent(query.trim())}`
          : '/api/boards/1/tasks';
        const { data } = await client.get(url);
        if (isMounted && Array.isArray(data)) {
          setBackendTasks(
            data.map((t) => ({
              type: 'task',
              id: t.id,
              title: t.title,
              category: t.status?.toUpperCase() || 'TASK',
              assignee: t.assignee?.displayName || 'Unassigned',
            }))
          );
        }
      } catch (err) {
        console.warn('Backend search error:', err.message);
      }
    }
    const timer = setTimeout(searchTasks, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { type: 'nav', id: 'boards', title: 'Go to Kanban Board View', icon: 'dashboard' },
    { type: 'nav', id: 'timeline', title: 'Go to Timeline / Gantt View', icon: 'timeline' },
    { type: 'nav', id: 'suggested', title: 'Go to Suggested Order View', icon: 'format_list_numbered' },
    { type: 'nav', id: 'analytics', title: 'Go to Analytics Dashboard', icon: 'analytics' },
  ].filter((n) => !query || n.title.toLowerCase().includes(query.toLowerCase()));

  const filtered = [...backendTasks, ...navItems];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-outline-variant/50 flex items-center gap-3 bg-surface-container-low/50">
          <span className="material-symbols-outlined text-secondary text-[22px]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, boards, or navigation (Ctrl+K)..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-secondary"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary">
            ESC to close
          </span>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-secondary">
              No results matching "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'task' && onSelectTask) {
                      onSelectTask(item);
                    } else if (item.type === 'nav' && onSelectNav) {
                      onSelectNav(item.id);
                    }
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-primary">
                      {item.icon || 'assignment'}
                    </span>
                    <span className="text-xs text-on-surface font-medium truncate">{item.title}</span>
                  </div>
                  {item.category && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-surface-container-high text-secondary shrink-0">
                      {item.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-outline-variant/40 bg-surface-container-low/30 flex items-center justify-between text-[11px] text-secondary">
          <span>Role-scoped search: Viewing as {currentRole}</span>
          <div className="flex gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
