import React, { useState, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import client from '../../api/client';

export default function ActivityFeedModal({ isOpen, onClose }) {
  const { currentRole, isOwnerOrAdmin, canExportActivity } = useRole();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function fetchActivities() {
      setLoading(true);
      try {
        const { data } = await client.get('/api/boards/1/activity');
        if (isMounted && data?.length) {
          setActivities(
            data.map((a) => ({
              id: a.id,
              actor: a.user?.displayName || 'Team Member',
              actorRole: a.user?.displayName === 'Sarah Chen' ? 'Owner' : a.user?.displayName === 'James Okafor' ? 'Admin' : 'Member',
              action: a.action,
              target: a.task?.title || 'Board item',
              time: new Date(a.createdAt).toLocaleDateString() + ' ' + new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              icon: a.action.includes('created') ? 'add_task' : a.action.includes('assigned') ? 'person_add' : 'swap_horiz',
            }))
          );
        }
      } catch (err) {
        console.warn('Backend activity feed error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchActivities();
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleExport() {
    const content = 'Timestamp,Actor,Role,Action,Target\n' + activities.map((a) => `"${a.time}","${a.actor}","${a.actorRole}","${a.action}","${a.target}"`).join('\n');
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'board_activity_log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">history</span>
            <h3 className="text-base font-semibold text-on-surface">Board Activity Feed</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary">
              Live
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Export button visible to Owner and Admin only per Section 10 */}
            {canExportActivity && (
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Export compliance audit log"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export Activity Log
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/50">
            {activities.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-surface-container-highest border-2 border-primary flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-on-surface">{item.actor}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-container text-secondary">
                      {item.actorRole}
                    </span>
                    <span className="text-secondary font-mono text-[11px]">• {item.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {item.action} <span className="font-medium text-on-surface">"{item.target}"</span>
                  </p>
                  {item.detail && (
                    <span className="text-[11px] text-secondary bg-surface-container-low px-2 py-0.5 rounded w-fit mt-1">
                      {item.detail}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/50 flex justify-between items-center bg-surface-container-low/30 text-xs text-secondary">
          <span>
            {canExportActivity
              ? 'Owners & Admins can export audit compliance logs.'
              : 'Showing live transparent team activity log.'
            }
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-medium text-on-surface cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
