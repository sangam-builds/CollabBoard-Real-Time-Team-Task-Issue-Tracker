import React from 'react';
import TimelineTaskList from './TimelineTaskList';
import TimelineGrid from './TimelineGrid';
import { mockTimelineData } from '../../data/mockTimelineData';

export default function TimelineView({ timelineData = mockTimelineData }) {
  const { dateHeaders, todayPosition, dependencyLines, tasks } = timelineData;

  return (
    <div className="flex-1 flex overflow-hidden bg-surface-container-lowest">
      <TimelineTaskList tasks={tasks} />
      <TimelineGrid
        dateHeaders={dateHeaders}
        todayPosition={todayPosition}
        dependencyLines={dependencyLines}
        tasks={tasks}
      />
    </div>
  );
}
