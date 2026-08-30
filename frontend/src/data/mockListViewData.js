export const mockListViewData = {
  title: 'List View - Owner/Admin',
  tasks: [
    {
      id: 'list-1',
      taskName: 'Q3 Marketing Campaign Kickoff',
      assignee: {
        name: 'Sarah J.',
        type: 'image',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA-bHcUdEIJwb2V4LRD-2XQ38RZcim7EQKAG3Ot8GbPuT9r4OGFlfkvhQG4acT-rMKShVXr_QsOEJOe0zqZQHPmFgVsr_DdLWgFSQNhDsLwZ23m93KstpSRrJg09xphUnlVNYGLztJkonJP-a7yftQx--lOrW0PbBV8j7y3vQBShu0Q_bSJfMr-tdWtlxMkkTozND8zwP0yPJvwaIrp3pCXJxt7d8q3mo7CfZbQOsika1G19WKlIkFd6Q',
      },
      status: 'IN PROGRESS',
      statusClass: 'bg-[#e6f4ea] text-[#137333]',
      priority: 'HIGH',
      priorityClass: 'bg-[#fce8e6] text-[#c5221f]',
      dueDate: 'Oct 15, 2023',
      labels: ['Marketing', 'Q3'],
    },
    {
      id: 'list-2',
      taskName: 'Update Brand Guidelines',
      assignee: {
        name: 'Marcus K.',
        type: 'initials',
        initials: 'MK',
        className: 'bg-surface-tint text-on-primary',
      },
      status: 'REVIEW',
      statusClass: 'bg-[#fef7e0] text-[#b06000]',
      priority: 'MEDIUM',
      priorityClass: 'bg-[#f1f3f4] text-[#3c4043]',
      dueDate: 'Oct 18, 2023',
      labels: ['Design'],
    },
    {
      id: 'list-3',
      taskName: 'Client Onboarding Flow Redesign',
      assignee: {
        name: 'David L.',
        type: 'image',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCOWPt4Ya2GXx-VCf_drV9be2rxs8nRkwrb4aSFfoVx8TEpv6PThytiN74z-LmPb_fuKpIFYbfrd_T6x7JezQvNe-7rjJPjWFC34D0ZlJRHPCfMR-kerASf4isuriuGZM_OTqlAaWOfS3DMSvoa7ToWUqMh-bJRUP2Pw8NY7UKSn8tEuy-_tgIGQidTBP53w8tggwLpMsA36JY0VAH4ZkayuGrnv8_vOrjo9QsRzC03Mp651EpF4lAQnQ',
      },
      status: 'TO DO',
      statusClass: 'bg-[#f1f3f4] text-[#5f6368]',
      priority: 'HIGH',
      priorityClass: 'bg-[#fce8e6] text-[#c5221f]',
      dueDate: 'Oct 22, 2023',
      labels: ['UX', 'Client'],
    },
    {
      id: 'list-4',
      taskName: 'Weekly Analytics Report',
      assignee: {
        name: 'Anna L.',
        type: 'initials',
        initials: 'AL',
        className: 'bg-secondary-container text-on-secondary-container',
      },
      status: 'DONE',
      statusClass: 'bg-[#e6f4ea] text-[#137333]',
      priority: 'LOW',
      priorityClass: 'bg-[#f1f3f4] text-[#3c4043]',
      dueDate: 'Oct 12, 2023',
      labels: ['Data'],
    },
  ],
};
