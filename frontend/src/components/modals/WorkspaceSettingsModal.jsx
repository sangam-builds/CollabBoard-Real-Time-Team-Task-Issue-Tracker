import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function WorkspaceSettingsModal({ isOpen, onClose, initialTab = 'general' }) {
  const {
    currentRole,
    isOwner,
    isAdmin,
    canAccessBilling,
    canAccessSSO,
    canDeleteWorkspace,
  } = useRole();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [workspaceName, setWorkspaceName] = useState('Acme Global Engineering');
  const [defaultRole, setDefaultRole] = useState('member');
  const [plan, setPlan] = useState('Enterprise Tier (Annual)');

  if (!isOpen) return null;

  function handleExportAuditLog() {
    const csvContent = 'data:text/csv;charset=utf-8,Timestamp,User,Action,Target,Status\n2026-09-01 10:20:00,Sarah Chen,UPDATE_BOARD_PERMISSIONS,Sprint 42,SUCCESS\n2026-09-01 09:15:00,James Okafor,REASSIGN_TASK,TASK-4,SUCCESS\n2026-09-01 08:00:00,System,AUTH_TOKEN_ROTATION,Workspace,SUCCESS';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'audit_log_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
            <h3 className="text-base font-semibold text-on-surface">Workspace Settings</h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              {currentRole}
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
        <div className="flex border-b border-outline-variant/50 px-6 gap-6 text-xs font-medium uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            General & Permissions
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Audit Log
          </button>

          {/* Owner Only Tabs per spec (Hidden entirely for Admin) */}
          {canAccessBilling && (
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'billing'
                  ? 'text-primary border-primary font-semibold'
                  : 'text-secondary border-transparent hover:text-on-surface'
              }`}
            >
              <span>Billing & Plan</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary font-mono">Owner</span>
            </button>
          )}

          {canAccessSSO && (
            <button
              onClick={() => setActiveTab('sso')}
              className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'sso'
                  ? 'text-primary border-primary font-semibold'
                  : 'text-secondary border-transparent hover:text-on-surface'
              }`}
            >
              <span>SSO & SAML</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary font-mono">Owner</span>
            </button>
          )}

          {canDeleteWorkspace && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'danger'
                  ? 'text-error border-error font-semibold'
                  : 'text-secondary border-transparent hover:text-error'
              }`}
            >
              Danger Zone
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Default Member Role
                </label>
                <select
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
                >
                  <option value="member">Member (Standard contributor)</option>
                  <option value="admin">Admin (Team management)</option>
                </select>
                <p className="text-xs text-secondary mt-1">
                  Newly invited members to this team default to this access level.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Workspace Audit Trail</h4>
                  <p className="text-xs text-secondary">
                    Compliance log of all permission updates, logins, and board modifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAuditLog}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Export Audit Log (CSV)
                </button>
              </div>

              <div className="border border-outline-variant rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-secondary">
                    <tr>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Actor</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 text-secondary">Today 10:20</td>
                      <td className="p-2.5 text-on-surface">Sarah Chen</td>
                      <td className="p-2.5">UPDATE_BOARD_PERMISSIONS</td>
                      <td className="p-2.5 text-green-600">200 OK</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-secondary">Today 09:15</td>
                      <td className="p-2.5 text-on-surface">James Okafor</td>
                      <td className="p-2.5">REASSIGN_TASK [TASK-4]</td>
                      <td className="p-2.5 text-green-600">200 OK</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-secondary">Yesterday 18:40</td>
                      <td className="p-2.5 text-on-surface">Maya Lindqvist</td>
                      <td className="p-2.5">POST_COMMENT [TASK-2]</td>
                      <td className="p-2.5 text-green-600">200 OK</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'billing' && canAccessBilling && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono text-primary font-semibold">Active Plan</span>
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-mono text-xs font-semibold">
                    Subscribed
                  </span>
                </div>
                <div className="text-lg font-bold text-on-surface">{plan}</div>
                <p className="text-xs text-secondary">
                  Includes unlimited boards, real-time sync, audit logs, and priority compute. Next invoice on Oct 1, 2026.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  className="px-3.5 py-2 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors text-on-surface cursor-pointer text-center"
                >
                  Manage Payment Methods
                </button>
                <button
                  type="button"
                  className="px-3.5 py-2 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors text-on-surface cursor-pointer text-center"
                >
                  View Invoices & Receipts
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sso' && canAccessSSO && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-on-surface">SAML 2.0 Single Sign-On</h4>
                <p className="text-xs text-secondary">
                  Enforce identity provider authentication (Okta, Google Workspace, Azure AD) for all members.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">IdP Metadata URL</label>
                  <input
                    type="text"
                    defaultValue="https://login.okta.com/app/exk482710/sso/saml"
                    className="w-full px-3 py-2 text-xs font-mono bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="enforceSso" defaultChecked className="rounded text-primary" />
                  <label htmlFor="enforceSso" className="text-xs text-on-surface">
                    Enforce SSO for all non-owner accounts
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && canDeleteWorkspace && (
            <div className="space-y-4 p-4 rounded-xl bg-error-container/20 border border-error/30">
              <div>
                <h4 className="text-sm font-semibold text-error">Delete Workspace</h4>
                <p className="text-xs text-on-surface-variant mt-1">
                  Permanently destroys this workspace and removes all teams, boards, and billing subscriptions. This action requires Owner authentication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this workspace? All data will be permanently wiped.')) {
                    alert('Workspace marked for scheduled purge.');
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-error text-on-error rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                Permanently Delete Entire Workspace (Owner Only)
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
