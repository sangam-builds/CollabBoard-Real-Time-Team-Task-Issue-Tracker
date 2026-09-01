import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function ShareModal({ isOpen, onClose }) {
  const { currentRole, isOwnerOrAdmin, isMember } = useRole();
  const [linkPermission, setLinkPermission] = useState('view'); // 'view' | 'edit'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const boardUrl = window.location.href;

  function handleCopy() {
    navigator.clipboard.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">share</span>
            <h3 className="text-base font-semibold text-on-surface">Share Board</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={boardUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-surface-container-low border border-outline-variant rounded-lg text-secondary select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Role specific link permissions */}
          {isOwnerOrAdmin ? (
            <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">General Link Access</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {currentRole} control
                </span>
              </div>
              <p className="text-xs text-secondary">
                Anyone with this link can interact based on the permissions selected below:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLinkPermission('view')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    linkPermission === 'view'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-secondary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Can View Only
                </button>
                <button
                  type="button"
                  onClick={() => setLinkPermission('edit')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    linkPermission === 'edit'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-secondary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Can Edit
                </button>
              </div>
            </div>
          ) : (
            // Member view per spec: Can share view-only links only
            <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
                <span>View-Only Link Access</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                As a team Member, links you generate are strictly view-only. To grant edit permissions or adjust link security, please ask an Admin or Owner.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/50 flex justify-end bg-surface-container-low/30">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-medium text-on-surface transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
