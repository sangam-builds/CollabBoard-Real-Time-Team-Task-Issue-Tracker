import React, { useState } from 'react';
import { SideNavBar, TopNavBar } from '../components/layout';
import { BoardToolbar, KanbanBoard } from '../components/board';
import { TimelineView } from '../components/timeline';
import { SuggestedOrderView } from '../components/suggestedOrder';
import { CalendarView } from '../components/calendar';
import { ListView } from '../components/listView';
import { mockBoardData } from '../data/mockBoardData';
import { mockTimelineData } from '../data/mockTimelineData';
import { mockSuggestedOrderData } from '../data/mockSuggestedOrderData';
import { mockCalendarData } from '../data/mockCalendarData';
import { mockListViewData } from '../data/mockListViewData';

export default function Board() {
  const [boardData] = useState(mockBoardData);
  const [timelineData] = useState(mockTimelineData);
  const [suggestedOrderData] = useState(mockSuggestedOrderData);
  const [calendarData] = useState(mockCalendarData);
  const [listViewData] = useState(mockListViewData);
  const [activeView, setActiveView] = useState('Board');

  return (
    <div className="bg-background text-on-background font-body-sm text-body-sm h-screen flex overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Side Navigation Bar */}
      <SideNavBar activeNav={activeView === 'Suggested Order' || activeView === 'List' ? 'tasks' : 'boards'} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-14 min-w-0 bg-background h-screen">
        {/* Top Navigation Bar */}
        <TopNavBar
          projectName="CollabBoard"
          subProjectName={
            activeView === 'Timeline'
              ? timelineData.subProjectName
              : activeView === 'Suggested Order' || activeView === 'Calendar' || activeView === 'List'
              ? null
              : boardData.projectName
          }
          views={boardData.views}
          activeView={activeView}
          onSelectView={setActiveView}
        />

        {/* View Content */}
        {activeView === 'Timeline' ? (
          <TimelineView timelineData={timelineData} />
        ) : activeView === 'Suggested Order' ? (
          <SuggestedOrderView data={suggestedOrderData} />
        ) : activeView === 'Calendar' ? (
          <CalendarView data={calendarData} />
        ) : activeView === 'List' ? (
          <ListView data={listViewData} />
        ) : (
          <>
            <BoardToolbar sprint={boardData.sprint} />
            <KanbanBoard columns={boardData.columns} tasks={boardData.tasks} />
          </>
        )}
      </div>
    </div>
  );
}
