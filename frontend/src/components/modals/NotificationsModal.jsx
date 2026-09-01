import React, { useState, useEffect } from 'react';
import client from '../../api/client';

export default function NotificationsModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'mentions' | 'assignments' | 'due_soon' | 'ready'
  const [digest, setDigest] = useState('Daily');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function fetchNotifications() {
      setLoading(true);
      try {
        const { data } = await client.get('/api/notifications');
        if (isMounted) {
          setNotifications(
            data.map((n) => ({
              id: n.id,
              type: n.message.includes('assigned') ? 'assignments' : n.message.includes('mention') ? 'mentions' : 'ready',
              title: n.message.includes('assigned') ? 'New assignment' : 'Notification',
              body: n.message,
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: n.isRead,
            }))
          );
        }
      } catch (err) {
        console.warn('Failed to load notifications from backend:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotifications();
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await client.post('/api/notifications/mark-all-read');
    } catch (err) {
      console.warn('Backend mark-all-read warning:', err.message);
    }
  }

  async function toggleRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    try {
      await client.patch(`/api/notifications/${id}/read`);
    } catch (err) {
      console.warn('Backend mark read warning:', err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
            <h3 className="text-base font-semibold text-on-surface">Notifications Center</h3>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-primary text-on-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Mark all as read
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

        {/* Filter Bar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-outline-variant/40 bg-surface-container-low/20 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'mentions', label: 'Mentions' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'due_soon', label: 'Due Soon' },
            { id: 'ready', label: 'Blocked → Ready' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-primary text-on-primary font-medium'
                  : 'text-secondary hover:bg-surface-container'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-secondary text-xs">
              No notifications in this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleRead(item.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  item.read
                    ? 'bg-surface-container-low/20 border-outline-variant/30 text-on-surface-variant'
                    : 'bg-surface-container-low/70 border-primary/30 shadow-xs'
                }`}
              >
                <div className="pt-0.5">
                  <span className={`material-symbols-outlined text-[18px] ${item.read ? 'text-secondary' : 'text-primary'}`}>
                    {item.type === 'assignments'
                      ? 'assignment_ind'
                      : item.type === 'mentions'
                      ? 'alternate_email'
                      : item.type === 'due_soon'
                      ? 'alarm'
                      : 'check_circle'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-semibold ${item.read ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-secondary font-mono whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5 leading-snug">{item.body}</p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" title="Unread" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer with Digest Frequency */}
        <div className="px-6 py-3 border-t border-outline-variant/50 flex items-center justify-between bg-surface-container-low/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-secondary">Email Digest:</span>
            <select
              value={digest}
              onChange={(e) => setDigest(e.target.value)}
              className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface cursor-pointer"
            >
              <option value="Real-time">Real-time</option>
              <option value="Daily">Daily Digest</option>
              <option value="Weekly">Weekly Summary</option>
              <option value="Off">Off</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-medium text-on-surface cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
