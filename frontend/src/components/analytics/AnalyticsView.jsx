import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';

export default function AnalyticsView() {
  const {
    currentRole,
    currentUser,
    isOwnerOrAdmin,
    isMember,
    canBuildCustomReports,
    canExportAnalytics,
  } = useRole();

  const [showCustomReportModal, setShowCustomReportModal] = useState(false);

  const teamVelocity = [
    { sprint: 'Sprint 39', planned: 42, completed: 38 },
    { sprint: 'Sprint 40', planned: 45, completed: 44 },
    { sprint: 'Sprint 41', planned: 48, completed: 46 },
    { sprint: 'Sprint 42 (Current)', planned: 50, completed: 32 },
  ];

  const allWorkload = [
    {
      id: 'w-1',
      name: 'Sarah Chen',
      role: 'Owner',
      tasksCount: 8,
      hoursLogged: 34,
      isSelf: currentUser.displayName === 'Sarah Chen',
    },
    {
      id: 'w-2',
      name: 'James Okafor',
      role: 'Admin',
      tasksCount: 12,
      hoursLogged: 42,
      isSelf: currentUser.displayName === 'James Okafor',
    },
    {
      id: 'w-3',
      name: 'Maya Lindqvist',
      role: 'Member',
      tasksCount: 14,
      hoursLogged: 39,
      isSelf: currentUser.displayName === 'Maya Lindqvist',
    },
    {
      id: 'w-4',
      name: 'Alex Kim',
      role: 'Member',
      tasksCount: 9,
      hoursLogged: 36,
      isSelf: currentUser.displayName === 'Alex Kim',
    },
  ];

  function handleExportAnalytics() {
    const csv = 'Sprint,Planned,Completed\n' + teamVelocity.map((v) => `${v.sprint},${v.planned},${v.completed}`).join('\n');
    const encoded = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = 'team_analytics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <main className="flex-1 overflow-y-auto p-container-padding space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Analytics & Team Performance</h2>
          <p className="text-xs text-secondary mt-0.5">
            Sprint cycle metrics, velocity trends, and aggregate capacity allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Custom Report Builder: Owner & Admin only per Section 11 */}
          {canBuildCustomReports && (
            <button
              type="button"
              onClick={() => setShowCustomReportModal(true)}
              className="px-3.5 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors text-xs font-medium text-on-surface flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">add_chart</span>
              Custom Report Builder
            </button>
          )}

          {/* Export Analytics: Owner & Admin only per Section 11 */}
          {canExportAnalytics && (
            <button
              type="button"
              onClick={handleExportAnalytics}
              className="px-3.5 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Analytics
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
          <div className="text-xs font-mono text-secondary uppercase">Average Velocity</div>
          <div className="text-2xl font-bold text-on-surface mt-1">42 pts / sprint</div>
          <div className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +8% vs last quarter
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
          <div className="text-xs font-mono text-secondary uppercase">Total Active Tasks</div>
          <div className="text-2xl font-bold text-on-surface mt-1">43 tasks</div>
          <div className="text-[11px] text-secondary mt-1">Across 4 Kanban columns</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
          <div className="text-xs font-mono text-secondary uppercase">Sprint Completion</div>
          <div className="text-2xl font-bold text-on-surface mt-1">68%</div>
          <div className="text-[11px] text-primary font-medium mt-1">4 days remaining</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
          <div className="text-xs font-mono text-secondary uppercase">Blocked Bottlenecks</div>
          <div className="text-2xl font-bold text-on-surface mt-1">2 critical</div>
          <div className="text-[11px] text-error font-medium mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Needs unblocking
          </div>
        </div>
      </div>

      {/* Section: Team Velocity Chart (All Roles View) */}
      <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-on-surface">Team Velocity Chart</h3>
            <p className="text-xs text-secondary">Planned vs Completed Story Points across sprints</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary">
            Viewable by all roles
          </span>
        </div>

        {/* Bar chart representation */}
        <div className="space-y-3 pt-2">
          {teamVelocity.map((v) => (
            <div key={v.sprint} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-on-surface">{v.sprint}</span>
                <span className="text-secondary font-mono">{v.completed} / {v.planned} pts</span>
              </div>
              <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${(v.completed / v.planned) * 100}%` }}
                  title={`Completed: ${v.completed} pts`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Individual Workload Breakdown (Role scoped per Section 11) */}
      <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-semibold text-on-surface">Individual Workload Breakdown</h3>
            <p className="text-xs text-secondary">
              {isMember
                ? 'Your individual row is highlighted below alongside aggregate team totals.'
                : 'Full per-person workload drilldown (Owner & Admin view).'
              }
            </p>
          </div>
          {isMember && (
            <span className="text-[11px] text-secondary italic">
              Peer drill-down restricted for Member role
            </span>
          )}
        </div>

        {/* Workload Table */}
        <div className="border border-outline-variant rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant text-secondary">
              <tr>
                <th className="p-3">Team Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Assigned Tasks</th>
                <th className="p-3">Hours Logged</th>
                <th className="p-3">Capacity</th>
                {isOwnerOrAdmin && <th className="p-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {allWorkload.map((w) => {
                // If Member, show aggregate totals + highlight own row; teammate rows are anonymized/limited
                const canViewFull = isOwnerOrAdmin || w.isSelf;

                return (
                  <tr
                    key={w.id}
                    className={`transition-colors ${
                      w.isSelf
                        ? 'bg-primary/5 font-semibold text-primary'
                        : 'text-on-surface hover:bg-surface-container-low/40'
                    }`}
                  >
                    <td className="p-3 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${w.isSelf ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-secondary'}`}>
                        {w.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{canViewFull ? w.name : 'Team Contributor'} {w.isSelf && '(You)'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container text-secondary">
                        {canViewFull ? w.role : 'Member'}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{canViewFull ? `${w.tasksCount} tasks` : '—'}</td>
                    <td className="p-3 font-mono">{canViewFull ? `${w.hoursLogged} hrs` : '—'}</td>
                    <td className="p-3">
                      <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${w.hoursLogged > 40 ? 'bg-error' : 'bg-green-600'}`}
                          style={{ width: `${Math.min(100, (w.hoursLogged / 40) * 100)}%` }}
                        />
                      </div>
                    </td>
                    {isOwnerOrAdmin && (
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="text-primary hover:underline text-xs font-medium cursor-pointer"
                        >
                          Drill Down →
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Report Builder Modal (Owner & Admin only) */}
      {showCustomReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <h3 className="text-sm font-semibold text-on-surface">Custom Report Builder</h3>
              <button
                onClick={() => setShowCustomReportModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-secondary mb-1">Metrics to Include</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary" /> Cycle Time & Lead Time
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary" /> Blocker Resolution Duration
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary" /> Cross-team Dependency Delays
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/40">
              <button
                onClick={() => setShowCustomReportModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Custom report generated and exported.');
                  setShowCustomReportModal(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
