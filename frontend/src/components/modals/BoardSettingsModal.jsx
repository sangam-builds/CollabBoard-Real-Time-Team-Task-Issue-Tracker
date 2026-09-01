import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function BoardSettingsModal({
  isOpen,
  onClose,
  boardName = 'Sprint 42',
  onRenameBoard,
  onArchiveBoard,
  onDeleteBoard,
}) {
  const {
    currentRole,
    isOwner,
    isAdmin,
    isOwnerOrAdmin,
    isMember,
    canDeleteBoard,
    canRenameArchiveBoard,
  } = useRole();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'fields' | 'automations' | 'danger'
  const [name, setName] = useState(boardName);
  const [description, setDescription] = useState('Cross-functional engineering sprint board for Q3 release deliverables.');
  const [customFields, setCustomFields] = useState([
    { id: 'f-1', name: 'Story Points', type: 'Number' },
    { id: 'f-2', name: 'Component', type: 'Dropdown' },
    { id: 'f-3', name: 'QA Signoff', type: 'Checkbox' },
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [automations, setAutomations] = useState([
    { id: 'a-1', trigger: 'When status changes to Done', action: 'Notify assignee & archive after 14 days', active: true },
    { id: 'a-2', trigger: 'When task is marked Blocked', action: 'Ping team in Slack & flag in suggested order', active: true },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <h3 className="text-base font-semibold text-on-surface">
              {isMember ? 'Board Information' : 'Board Settings'}
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary">
              Viewing as {currentRole}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/50 px-6 gap-6 text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            {isMember ? 'Overview' : 'General'}
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'fields'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Custom Fields
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'automations'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Automations {isMember && '(Read-Only)'}
          </button>
          {isOwner && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'danger'
                  ? 'text-error border-error font-semibold'
                  : 'text-secondary border-transparent hover:text-error'
              }`}
            >
              Danger Zone
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Board Name
                </label>
                {canRenameArchiveBoard ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                ) : (
                  <div className="py-2 text-sm font-semibold text-on-surface">{name}</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Description
                </label>
                {canRenameArchiveBoard ? (
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                ) : (
                  <div className="py-2 text-sm text-on-surface-variant bg-surface-container-low/40 rounded-lg p-3">
                    {description}
                  </div>
                )}
              </div>

              {canRenameArchiveBoard && (
                <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-on-surface">Archive Board</h4>
                    <p className="text-xs text-secondary">
                      Hide this board from regular navigation without permanently deleting tasks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onArchiveBoard) onArchiveBoard();
                      onClose();
                    }}
                    className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Archive Board
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary">
                  {canRenameArchiveBoard
                    ? 'Manage custom fields configured on this board.'
                    : 'Custom fields configured for tasks on this board (view-only).'
                  }
                </p>
              </div>

              <div className="space-y-2">
                {customFields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/50 text-xs"
                  >
                    <span className="font-medium text-on-surface">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-secondary px-2 py-0.5 rounded bg-surface-container text-[11px]">
                        {f.type}
                      </span>
                      {canRenameArchiveBoard && (
                        <button
                          onClick={() => setCustomFields((prev) => prev.filter((item) => item.id !== f.id))}
                          className="text-secondary hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {canRenameArchiveBoard && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="New field name..."
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFieldName.trim()) {
                        setCustomFields((prev) => [
                          ...prev,
                          { id: `f-${Date.now()}`, name: newFieldName.trim(), type: 'Text' },
                        ]);
                        setNewFieldName('');
                      }
                    }}
                    className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed cursor-pointer"
                  >
                    Add Field
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'automations' && (
            <div className="space-y-3">
              <p className="text-xs text-secondary">
                {isMember
                  ? 'Active automations are shown here so you understand why cards or notifications trigger automatically.'
                  : 'Automations execute actions based on board events and rule triggers.'
                }
              </p>

              <div className="space-y-2">
                {automations.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg bg-surface-container-low/50 border border-outline-variant/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                        {a.trigger}
                      </span>
                      {isOwnerOrAdmin ? (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-mono text-[10px] font-semibold border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-mono text-[10px]">
                          Rule Active (Read-only)
                        </span>
                      )}
                    </div>
                    <p className="text-secondary pl-5">{a.action}</p>
                  </div>
                ))}
              </div>

              {isOwnerOrAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    setAutomations((prev) => [
                      ...prev,
                      {
                        id: `a-${Date.now()}`,
                        trigger: 'When priority is Critical',
                        action: 'Send immediate alert to all board members',
                        active: true,
                      },
                    ])
                  }
                  className="mt-2 text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Automation Rule
                </button>
              )}
            </div>
          )}

          {activeTab === 'danger' && isOwner && (
            <div className="space-y-4 p-4 rounded-xl bg-error-container/20 border border-error/30">
              <div>
                <h4 className="text-sm font-semibold text-error">Delete Board</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Permanently deletes this board, all task cards, comments, and historical activity logs. This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this board? This action is permanent.')) {
                    if (onDeleteBoard) onDeleteBoard();
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-error text-on-error rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                Permanently Delete Board (Owner Only)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/50 flex justify-end gap-2 bg-surface-container-low/30">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            {isMember ? 'Close' : 'Cancel'}
          </button>
          {canRenameArchiveBoard && (
            <button
              onClick={() => {
                if (onRenameBoard) onRenameBoard(name);
                onClose();
              }}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
