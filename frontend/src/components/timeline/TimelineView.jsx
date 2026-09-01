import React, { useState } from 'react';
import TimelineTaskList from './TimelineTaskList';
import TimelineGrid from './TimelineGrid';
import { mockTimelineData } from '../../data/mockTimelineData';
import { useRole } from '../../context/RoleContext';

export default function TimelineView({ timelineData = mockTimelineData, onSelectTask }) {
  const { currentRole, isOwnerOrAdmin, isMember, canRescheduleTask } = useRole();
  const { dateHeaders, todayPosition, dependencyLines, tasks } = timelineData;
  const [showDependencyNotice, setShowDependencyNotice] = useState(false);

  function handleExportTimeline() {
    alert('Timeline export initiated: Exporting full Gantt chart to PDF...');
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
      {/* Timeline Controls Toolbar */}
      <div className="px-6 py-2 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low/30 shrink-0">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-on-surface">Timeline & Dependencies</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container text-secondary">
            Viewing as {currentRole}
          </span>
          {isMember && (
            <span className="text-[11px] text-secondary italic">
              (Own tasks reschedulable • Dependency lines view-only)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMember && (
            <button
              onClick={() => setShowDependencyNotice(true)}
              className="px-3 py-1 text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              Request Dependency Change
            </button>
          )}

          {/* Export Timeline (PDF/PNG) - All roles have access per Section 4 */}
          <button
            type="button"
            onClick={handleExportTimeline}
            className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-medium text-on-surface flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Timeline (PDF)
          </button>
        </div>
      </div>

      {showDependencyNotice && (
        <div className="bg-primary-container/20 border-b border-primary/30 px-6 py-2 text-xs flex items-center justify-between text-on-surface">
          <span>
            💡 <strong>Dependency Management:</strong> As a Member, dependency lines are view-only. Suggest changes in task comments or notify an Admin.
          </span>
          <button
            onClick={() => setShowDependencyNotice(false)}
            className="text-secondary hover:text-on-surface ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <TimelineTaskList tasks={tasks} />
        <TimelineGrid
          dateHeaders={dateHeaders}
          todayPosition={todayPosition}
          dependencyLines={dependencyLines}
          tasks={tasks}
          onSelectTask={onSelectTask}
        />
      </div>
    </div>
  );
}

