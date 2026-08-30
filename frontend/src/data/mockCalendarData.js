export const mockCalendarData = {
  currentMonth: 'October 2023',
  daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  cells: [
    // Row 1 (September out-of-month)
    { id: 'c-1', day: 24, isOutOfMonth: true },
    { id: 'c-2', day: 25, isOutOfMonth: true },
    { id: 'c-3', day: 26, isOutOfMonth: true },
    { id: 'c-4', day: 27, isOutOfMonth: true },
    { id: 'c-5', day: 28, isOutOfMonth: true },
    {
      id: 'c-6',
      day: 29,
      isOutOfMonth: true,
      events: [
        {
          id: 'ev-1',
          title: 'Q3 Planning',
          className:
            'bg-surface-container text-on-surface-variant border border-outline-variant',
        },
      ],
    },
    { id: 'c-7', day: 30, isOutOfMonth: true },

    // Row 2 (October 1 - 7)
    { id: 'c-8', day: 1 },
    {
      id: 'c-9',
      day: 2,
      events: [
        {
          id: 'ev-2',
          title: 'Design Review',
          className: 'bg-[#e0f2fe] text-[#0369a1]',
        },
      ],
    },
    { id: 'c-10', day: 3 },
    {
      id: 'c-11',
      day: 4,
      events: [
        {
          id: 'ev-3',
          title: 'Client Sync',
          className: 'bg-[#fef3c7] text-[#b45309]',
        },
        {
          id: 'ev-4',
          title: 'UX Audit',
          className: 'bg-[#fce7f3] text-[#be185d]',
        },
      ],
    },
    { id: 'c-12', day: 5 },
    { id: 'c-13', day: 6 },
    { id: 'c-14', day: 7 },

    // Row 3 (October 8 - 14)
    { id: 'c-15', day: 8 },
    { id: 'c-16', day: 9 },
    {
      id: 'c-17',
      day: 10,
      events: [
        {
          id: 'ev-5',
          title: 'Dev Huddle',
          className: 'bg-[#dcfce7] text-[#15803d]',
        },
      ],
    },
    { id: 'c-18', day: 11 },
    {
      id: 'c-19',
      day: 12,
      isToday: true,
      events: [
        {
          id: 'ev-6',
          title: 'All-Hands',
          className: 'bg-[#e0f2fe] text-[#0369a1]',
        },
        {
          id: 'ev-7',
          title: 'Brand Guidelines',
          className: 'bg-[#f3e8ff] text-[#7e22ce]',
        },
      ],
      moreCount: 2,
    },
    { id: 'c-20', day: 13 },
    { id: 'c-21', day: 14 },

    // Row 4 (October 15 - 21)
    { id: 'c-22', day: 15 },
    {
      id: 'c-23',
      day: 16,
      events: [
        {
          id: 'ev-8',
          title: 'Stakeholder Mtg',
          className: 'bg-[#fef3c7] text-[#b45309]',
        },
      ],
    },
    { id: 'c-24', day: 17 },
    { id: 'c-25', day: 18 },
    { id: 'c-26', day: 19 },
    { id: 'c-27', day: 20 },
    { id: 'c-28', day: 21 },

    // Row 5 (October 22 - 28)
    { id: 'c-29', day: 22 },
    { id: 'c-30', day: 23 },
    {
      id: 'c-31',
      day: 24,
      events: [
        {
          id: 'ev-9',
          title: 'Final Polish',
          className: 'bg-[#fce7f3] text-[#be185d]',
        },
      ],
    },
    { id: 'c-32', day: 25 },
    { id: 'c-33', day: 26 },
    { id: 'c-34', day: 27 },
    { id: 'c-35', day: 28 },

    // Row 6 (October 29 - November 4)
    { id: 'c-36', day: 29 },
    { id: 'c-37', day: 30 },
    {
      id: 'c-38',
      day: 31,
      events: [
        {
          id: 'ev-10',
          title: 'Release v2.0',
          className: 'bg-[#dcfce7] text-[#15803d]',
        },
      ],
    },
    { id: 'c-39', day: 1, isOutOfMonth: true },
    { id: 'c-40', day: 2, isOutOfMonth: true },
    { id: 'c-41', day: 3, isOutOfMonth: true },
    { id: 'c-42', day: 4, isOutOfMonth: true },
  ],
};
