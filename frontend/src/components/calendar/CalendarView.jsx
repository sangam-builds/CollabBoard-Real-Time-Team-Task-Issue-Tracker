import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { mockCalendarData } from '../../data/mockCalendarData';

export default function CalendarView({ data = mockCalendarData, onSelectTask }) {
  const [currentMonth, setCurrentMonth] = useState(data.currentMonth);

  function handlePrev() {
    setCurrentMonth('September 2023');
  }

  function handleNext() {
    setCurrentMonth('November 2023');
  }

  function handleToday() {
    setCurrentMonth('October 2023');
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sub-Header / Calendar Controls */}
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        onToday={handleToday}
      />

      {/* Calendar Canvas */}
      <main className="flex-1 overflow-auto bg-background p-container-padding cal-scroll">
        <CalendarGrid
          daysOfWeek={data.daysOfWeek}
          cells={data.cells}
          onEventClick={(ev) => {
            if (onSelectTask) {
              onSelectTask({
                id: ev.id,
                title: ev.title,
                category: 'Calendar Event',
                dueDate: currentMonth,
                isDone: ev.className?.includes('green'),
              });
            }
          }}
        />
      </main>
    </div>
  );
}
