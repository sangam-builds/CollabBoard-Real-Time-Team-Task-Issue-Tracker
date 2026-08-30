import React, { useState } from 'react';
import SuggestedOrderList from './SuggestedOrderList';
import { mockSuggestedOrderData } from '../../data/mockSuggestedOrderData';

export default function SuggestedOrderView({ data = mockSuggestedOrderData }) {
  const [isReevaluating, setIsReevaluating] = useState(false);

  function handleReevaluate() {
    setIsReevaluating(true);
    setTimeout(() => {
      setIsReevaluating(false);
    }, 600);
  }

  return (
    <main className="flex-1 overflow-y-auto p-container-padding flex justify-center">
      {/* Fixed Width Container for List */}
      <div className="w-full max-w-[1000px] flex flex-col pt-margin-md">
        {/* Section Header */}
        <div className="flex items-baseline justify-between mb-margin-md">
          <h2 className="font-section-headline text-section-headline text-on-surface">
            {data.title}
          </h2>
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wide">
            {data.subtitle}
          </span>
        </div>

        {/* Ranked List */}
        <SuggestedOrderList items={data.items} />

        {/* Footer Action */}
        <div className="mt-8 flex justify-center pb-margin-lg">
          <button
            onClick={handleReevaluate}
            disabled={isReevaluating}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isReevaluating ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span>{isReevaluating ? 'Re-evaluating...' : 'Re-evaluate Order'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
