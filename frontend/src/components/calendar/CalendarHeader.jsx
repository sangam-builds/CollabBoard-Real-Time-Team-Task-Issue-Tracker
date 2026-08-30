import React from 'react';

export default function CalendarHeader({
  currentMonth = 'October 2023',
  onPrevMonth,
  onNextMonth,
  onToday,
}) {
  return (
    <div className="px-container-padding py-4 flex justify-between items-center border-b border-outline-variant bg-surface-container-lowest shrink-0">
      <div className="flex items-center space-x-4">
        <h1 className="font-section-headline text-section-headline text-on-surface">
          {currentMonth}
        </h1>
        <div className="flex space-x-1">
          <button
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors text-on-surface-variant border border-outline-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            onClick={onNextMonth}
            aria-label="Next month"
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors text-on-surface-variant border border-outline-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
      <div>
        <button
          onClick={onToday}
          className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm px-4 py-1.5 rounded hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>
    </div>
  );
}
