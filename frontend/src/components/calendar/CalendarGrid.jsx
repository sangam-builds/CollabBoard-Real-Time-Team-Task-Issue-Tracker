import React from 'react';
import CalendarCell from './CalendarCell';

export default function CalendarGrid({
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  cells = [],
  onEventClick,
}) {
  return (
    <div className="max-w-[1400px] mx-auto bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-lowest">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="py-2 text-center font-label-mono text-label-mono uppercase text-secondary select-none"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="calendar-grid flex-1">
        {cells.map((cell) => (
          <CalendarCell key={cell.id} cell={cell} onEventClick={onEventClick} />
        ))}
      </div>
    </div>
  );
}
