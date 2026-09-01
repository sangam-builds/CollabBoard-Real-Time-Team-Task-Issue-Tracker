import React from 'react';
import SuggestedOrderItem from './SuggestedOrderItem';

export default function SuggestedOrderList({ items, onFlagClick, onClickTask }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      {/* List Header */}
      <div className="flex items-center px-6 py-4 bg-surface-container-low border-b border-outline-variant">
        <div className="w-10 font-label-mono text-xs text-on-surface-variant uppercase tracking-wider">
          Rank
        </div>
        <div className="flex-1 font-label-mono text-xs text-on-surface-variant uppercase tracking-wider pl-3">
          Task
        </div>
        <div className="w-36 font-label-mono text-xs text-on-surface-variant uppercase tracking-wider text-center">
          Dependency Status
        </div>
        <div className="w-48 font-label-mono text-xs text-on-surface-variant uppercase tracking-wider text-right pr-4">
          Priority & Score
        </div>
        <div className="w-24 font-label-mono text-xs text-on-surface-variant uppercase tracking-wider text-right">
          Override
        </div>
      </div>

      {/* List Items */}
      <div className="flex flex-col">
        {items.map((item, idx) => (
          <SuggestedOrderItem
            key={item.id}
            item={item}
            isLast={idx === items.length - 1}
            onFlagClick={onFlagClick}
            onClickTask={onClickTask}
          />
        ))}
      </div>
    </div>
  );
}
