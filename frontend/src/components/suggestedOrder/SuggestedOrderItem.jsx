import React from 'react';
import { useRole } from '../../context/RoleContext';

export default function SuggestedOrderItem({ item, isLast = false, onFlagClick, onClickTask }) {
  const { isOwnerOrAdmin, isMember } = useRole();
  const {
    rank,
    title,
    department,
    status,
    statusType,
    statusReason,
    reason,
    isWarning,
    isMutedRank,
    manualPriority,
    score,
    scoreBreakdown,
    numDependents,
    isBlocked,
    blockers,
  } = item;

  const displayReason = statusReason || reason || (isBlocked ? 'Waiting on blockers' : 'Ready for execution');

  return (
    <div
      onClick={() => onClickTask && onClickTask(item)}
      className={`flex items-center px-6 py-4 ${
        isLast ? '' : 'border-b border-outline-variant'
      } hover:bg-surface-container transition-colors group cursor-pointer`}
    >
      {/* Rank */}
      <div
        className={`w-10 font-label-mono text-sm font-bold ${
          isMutedRank ? 'text-secondary' : 'text-primary'
        }`}
      >
        {rank}
      </div>

      {/* Task Details */}
      <div className="flex-1 pl-3 min-w-0 pr-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-body-md text-sm text-on-surface font-medium truncate max-w-md">{title}</h3>
          {manualPriority && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300">
              Manual Override
            </span>
          )}
          {numDependents > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Unlocks {numDependents} {numDependents === 1 ? 'task' : 'tasks'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
          <span>{department}</span>
          {blockers?.length > 0 && (
            <span className="text-secondary truncate text-[11px]">
              • Blocked by: {blockers.map((b) => b.title).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Dependency Status Badge (Section 2.2) */}
      <div className="w-36 flex justify-center shrink-0">
        {status === 'done' || statusType === 'ready' && !isBlocked ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 font-label-mono text-[11px] border border-green-200">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            {status === 'done' ? 'Completed' : 'Ready to start'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-label-mono text-[11px] border border-amber-300">
            <span className="material-symbols-outlined text-[13px]">lock_clock</span>
            Blocked
          </span>
        )}
      </div>

      {/* Score & Formula Reasoning */}
      <div className="w-48 text-right pr-4 shrink-0">
        <div className="flex items-center justify-end gap-1.5">
          <span
            className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-surface"
            title={scoreBreakdown ? `Urgency: +${scoreBreakdown.urgencyScore} | Dependents: +${scoreBreakdown.dependencyScore} | Priority: +${scoreBreakdown.manualScore}` : ''}
          >
            Score {typeof score === 'number' ? score.toFixed(1) : score || '10.0'}
          </span>
        </div>
        <p className="font-label-mono text-[11px] text-on-surface-variant mt-0.5 truncate max-w-[190px]">
          {displayReason}
        </p>
      </div>

      {/* Priority Override Button (Section 2.5: Admin sets override; Member suggests via comment) */}
      <div className="w-24 text-right shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onFlagClick) onFlagClick(item);
          }}
          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ml-auto cursor-pointer transition-colors ${
            isOwnerOrAdmin
              ? 'text-primary hover:bg-primary/10'
              : 'text-secondary hover:bg-surface-container-high'
          }`}
          title={isOwnerOrAdmin ? 'Set manual priority override' : 'Suggest priority override via comment'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isOwnerOrAdmin ? 'flag' : 'chat_bubble_outline'}
          </span>
          <span className="text-[11px]">{isOwnerOrAdmin ? 'Override' : 'Suggest'}</span>
        </button>
      </div>
    </div>
  );
}
