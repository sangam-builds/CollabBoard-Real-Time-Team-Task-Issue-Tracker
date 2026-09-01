import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function InviteMemberModal({ isOpen, onClose }) {
  const { currentRole, isOwnerOrAdmin, isMember } = useRole();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [invited, setInvited] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setInvited(true);
    setTimeout(() => {
      setInvited(false);
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
            <h3 className="text-base font-semibold text-on-surface">Invite to Board</h3>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6">
          {isMember ? (
            // Member view per spec: "sees Ask an Admin to invite if attempted"
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[24px]">lock</span>
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wide">
                    Permission Notice
                  </h4>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">
                    Team Members cannot directly invite users to this workspace or board. Please ask a workspace Owner or team Admin to invite new collaborators.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-medium text-on-surface cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          ) : (
            // Owner & Admin view: full invite capability
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@collabboard.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Assign Board Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
                >
                  <option value="member">Member (Contributor)</option>
                  <option value="admin">Admin (Board Manager)</option>
                </select>
              </div>

              {invited ? (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs font-medium text-center">
                  Invitation sent to {email}!
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
                    Send Invitation
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
