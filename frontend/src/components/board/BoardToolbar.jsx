import React from 'react';

export default function BoardToolbar({ sprint = 'Sprint 42' }) {
  return (
    <div className="px-container-padding py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
            search
          </span>
          <input
            className="pl-9 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 text-sm w-64 placeholder:text-secondary"
            placeholder="Filter tasks..."
            type="text"
          />
        </div>
        <button className="flex items-center space-x-1 px-3 py-1.5 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">filter_list</span>
          <span>Filter</span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-secondary font-label-mono text-label-mono">{sprint}</span>
        <button
          className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container-high transition-colors cursor-pointer"
          title="More options"
        >
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>
    </div>
  );
}
