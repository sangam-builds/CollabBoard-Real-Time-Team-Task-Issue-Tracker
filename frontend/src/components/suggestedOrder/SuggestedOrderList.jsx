import React from 'react';
import SuggestedOrderItem from './SuggestedOrderItem';

export default function SuggestedOrderList({ items }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      {/* List Header */}
      <div className="flex items-center px-6 py-4 bg-surface-container-low border-b border-outline-variant">
        <div className="w-12 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
          Rank
        </div>
        <div className="flex-1 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider pl-4">
          Task
        </div>
        <div className="w-32 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider text-center">
          Status
        </div>
        <div className="w-40 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider text-right">
          Reason
        </div>
      </div>

      {/* List Items */}
      <div className="flex flex-col">
        {items.map((item, idx) => (
          <SuggestedOrderItem
            key={item.id}
            item={item}
            isLast={idx === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
