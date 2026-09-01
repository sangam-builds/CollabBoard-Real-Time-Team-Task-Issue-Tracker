import React from 'react';

export default function CalendarCell({ cell, onEventClick }) {
  const { day, isOutOfMonth, isToday, events = [], moreCount } = cell;

  const cellClasses = [
    'calendar-cell',
    isOutOfMonth ? 'out-of-month' : '',
    isToday ? 'today' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cellClasses}>
      <span
        className={`font-label-mono text-label-mono self-end ${
          isToday
            ? 'text-primary-container font-bold'
            : isOutOfMonth
            ? ''
            : 'text-on-surface'
        }`}
      >
        {day}
      </span>

      {events.map((ev) => (
        <div
          key={ev.id}
          onClick={() => onEventClick && onEventClick(ev)}
          className={`mt-1 px-2 py-0.5 rounded font-label-mono text-[10px] truncate cursor-pointer transition-transform hover:scale-[1.02] ${ev.className}`}
          title={ev.title}
        >
          {ev.title}
        </div>
      ))}

      {moreCount && (
        <div className="mt-1 font-body-sm text-[11px] text-secondary hover:text-primary cursor-pointer">
          +{moreCount} more
        </div>
      )}
    </div>
  );
}
