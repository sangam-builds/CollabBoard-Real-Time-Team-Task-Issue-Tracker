import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';
import client from '../../api/client';

export default function SuggestPriorityModal({ isOpen, onClose, taskItem, onPriorityUpdated }) {
  const { currentRole, currentUser, isOwnerOrAdmin } = useRole();
  const [commentText, setCommentText] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('High');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !taskItem) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    try {
      if (isOwnerOrAdmin) {
        const flagVal = priorityLevel === 'Critical' ? 2 : priorityLevel === 'High' ? 1 : 0;
        await client.patch(`/api/tasks/${taskItem.id}`, { priorityFlag: flagVal });
        if (commentText.trim()) {
          await client.post(`/api/tasks/${taskItem.id}/comments`, {
            body: `[Priority Override to ${priorityLevel}]: ${commentText.trim()}`,
          });
        }
      } else {
        await client.post(`/api/tasks/${taskItem.id}/comments`, {
          body: `[Priority Suggestion for Admins]: Requesting ${priorityLevel} priority override. Reason: ${commentText.trim()}`,
        });
      }

      if (onPriorityUpdated) onPriorityUpdated();
    } catch (err) {
      console.warn('Priority update error:', err.message);
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">flag</span>
            <h3 className="text-sm font-semibold text-on-surface">
              {isOwnerOrAdmin ? 'Set Manual Priority Flag' : 'Suggest Priority Override'}
            </h3>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Target Task</div>
            <div className="text-sm font-medium text-on-surface bg-surface-container-low p-2.5 rounded-lg">
              {taskItem.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
            >
              <option value="Critical">Critical (Immediate Blocker)</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              {isOwnerOrAdmin ? 'Override Justification' : 'Suggestion Note to Admins'}
            </label>
            <textarea
              rows={3}
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                isOwnerOrAdmin
                  ? 'Explain why this algorithm priority is being manually overridden...'
                  : 'Explain to team Admins why this task needs a higher execution priority...'
              }
              className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface"
            />
          </div>

          {submitted ? (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium text-center">
              {isOwnerOrAdmin
                ? 'Manual priority flag applied successfully!'
                : 'Suggestion posted to task comment thread for Admin review!'}
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed cursor-pointer"
              >
                {isOwnerOrAdmin ? 'Apply Override' : 'Submit Suggestion'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
