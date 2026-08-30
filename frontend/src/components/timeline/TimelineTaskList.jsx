import React from 'react';

export default function TimelineTaskList({ tasks }) {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-r border-outline-variant bg-surface-container-lowest z-20">
      {/* Task List Header */}
      <div className="h-12 border-b border-outline-variant flex items-center px-4 shrink-0 bg-surface">
        <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
          Task Name
        </span>
      </div>

      {/* Task List Rows */}
      <div className="flex-1 overflow-y-auto timeline-scroll">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="h-12 border-b border-outline-variant flex items-center px-4 hover:bg-surface transition-colors cursor-pointer group"
          >
            <span
              className="material-symbols-outlined text-outline group-hover:text-primary mr-2 select-none"
              style={{ fontSize: '18px' }}
            >
              drag_indicator
            </span>
            <div
              className={`flex-1 truncate font-body-sm text-body-sm text-on-surface font-medium ${
                task.indent ? 'ml-4' : ''
              }`}
            >
              {task.title}
            </div>

            {task.avatar && (
              <>
                {task.avatar.type === 'image' ? (
                  <div className="w-6 h-6 rounded-full bg-surface-variant flex-shrink-0 border border-outline-variant overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={task.avatar.src}
                      alt={task.avatar.alt || 'User'}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full ${task.avatar.className} flex items-center justify-center font-label-mono text-[10px] flex-shrink-0 font-medium`}
                  >
                    {task.avatar.initials}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
