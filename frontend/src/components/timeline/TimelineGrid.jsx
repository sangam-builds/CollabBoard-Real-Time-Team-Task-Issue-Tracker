import React from 'react';

export default function TimelineGrid({
  dateHeaders,
  todayPosition = 640,
  dependencyLines = [],
  tasks = [],
}) {
  return (
    <div className="flex-1 overflow-x-auto timeline-scroll bg-surface-container-lowest relative">
      {/* SVG layer for connectors (Absolute positioned over the scrollable area) */}
      <svg className="dependency-line w-[1600px] h-full" style={{ pointerEvents: 'none', zIndex: 5 }}>
        <defs>
          <marker id="arrowhead" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
            <polygon fill="#747687" points="0 0, 6 3, 0 6" />
          </marker>
        </defs>
        {dependencyLines.map((line) => (
          <path
            key={line.id}
            d={line.d}
            fill="none"
            markerEnd="url(#arrowhead)"
            stroke="#747687"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="w-[1600px]">
        {/* Timeline Header (Dates) */}
        <div className="h-12 border-b border-outline-variant flex shrink-0 sticky top-0 bg-surface z-20">
          {dateHeaders.map((header) => (
            <div
              key={header.id}
              style={{ width: `${header.width}px` }}
              className={`h-full border-r border-outline-variant flex flex-col justify-end pb-1 pl-2 ${
                header.isCurrent ? 'bg-surface-container' : ''
              }`}
            >
              <span
                className={`font-label-mono text-[10px] uppercase leading-none ${
                  header.isCurrent ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {header.label}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline Grid Body */}
        <div className="relative grid-bg grid-bg-weeks" style={{ height: 'calc(100vh - 64px - 48px)' }}>
          {/* "Today" Marker Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-primary z-10"
            style={{ left: `${todayPosition}px` }}
          >
            <div className="absolute -top-3 -translate-x-1/2 bg-primary text-on-primary font-label-mono text-[10px] px-2 py-0.5 rounded shadow-sm">
              Today
            </div>
          </div>

          {/* Rows Background Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {tasks.map((task) => (
              <div
                key={`grid-row-${task.id}`}
                className="h-12 border-b border-outline-variant border-opacity-30"
              />
            ))}
          </div>

          {/* Timeline Bars */}
          {tasks.map((task, index) => {
            if (!task.bar) return null;
            const topOffset = index * 48; // 48px (h-12) per row

            return (
              <div
                key={`bar-${task.id}`}
                className="absolute h-12 w-full"
                style={{ top: `${topOffset}px` }}
              >
                <div
                  className={`timeline-bar-container ${task.bar.bgClass} border ${task.bar.borderClass}`}
                  style={{ left: `${task.bar.left}px`, width: `${task.bar.width}px` }}
                >
                  <div
                    className={`drag-handle ${
                      task.bar.handleDark ? 'bg-black bg-opacity-20' : ''
                    }`}
                  />
                  <span className={`font-body-sm text-[11px] truncate px-2 ${task.bar.textClass}`}>
                    {task.bar.label}
                  </span>
                  <div
                    className={`drag-handle ${
                      task.bar.handleDark ? 'bg-black bg-opacity-20' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
