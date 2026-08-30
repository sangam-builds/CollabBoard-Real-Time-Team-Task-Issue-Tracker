import React from 'react';

export default function SuggestedOrderItem({ item, isLast = false }) {
  const { rank, title, department, status, statusType, reason, isWarning, isMutedRank } = item;

  return (
    <div
      className={`flex items-center px-6 py-5 ${
        isLast ? '' : 'border-b border-outline-variant'
      } hover:bg-surface-container transition-colors group cursor-pointer`}
    >
      {/* Rank */}
      <div
        className={`w-12 font-label-mono text-label-mono font-semibold ${
          isMutedRank ? 'text-secondary' : 'text-on-surface'
        }`}
      >
        {rank}
      </div>

      {/* Task Details */}
      <div className="flex-1 pl-4">
        <h3 className="font-body-md text-body-md text-on-surface font-medium">{title}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{department}</p>
      </div>

      {/* Status Badge */}
      <div className="w-32 flex justify-center">
        {statusType === 'ready' ? (
          <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 font-label-mono text-label-mono border border-green-200">
            {status}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded bg-surface-dim text-on-surface font-label-mono text-label-mono border border-outline-variant">
            {status}
          </span>
        )}
      </div>

      {/* Reason */}
      <div className="w-40 text-right">
        {isWarning ? (
          <span className="font-label-mono text-label-mono flex items-center justify-end gap-2 text-error">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            {reason}
          </span>
        ) : (
          <span className="font-label-mono text-label-mono text-on-surface-variant">{reason}</span>
        )}
      </div>
    </div>
  );
}
