import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SideNavBar, TopNavBar } from '../components/layout';
import { BoardToolbar, KanbanBoard } from '../components/board';
import { TimelineView } from '../components/timeline';
import { SuggestedOrderView } from '../components/suggestedOrder';
import { CalendarView } from '../components/calendar';
import { ListView } from '../components/listView';
import AnalyticsView from '../components/analytics/AnalyticsView';

// Modals
import TaskDetailModal from '../components/modals/TaskDetailModal';
import ShareModal from '../components/modals/ShareModal';
import BoardSettingsModal from '../components/modals/BoardSettingsModal';
import WorkspaceSettingsModal from '../components/modals/WorkspaceSettingsModal';
import NotificationsModal from '../components/modals/NotificationsModal';
import ActivityFeedModal from '../components/modals/ActivityFeedModal';
import TeamMembersModal from '../components/modals/TeamMembersModal';
import CommandPalette from '../components/modals/CommandPalette';
import InviteMemberModal from '../components/modals/InviteMemberModal';

import { mockBoardData } from '../data/mockBoardData';
import { mockTimelineData } from '../data/mockTimelineData';
import { mockSuggestedOrderData } from '../data/mockSuggestedOrderData';
import { mockCalendarData } from '../data/mockCalendarData';
import { mockListViewData } from '../data/mockListViewData';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import client from '../api/client';

function mapBackendTaskToCard(t) {
  const columnId = t.status === 'todo' ? 'todo' : t.status === 'in_progress' ? 'in-progress' : 'done';
  const category = t.priorityFlag === 2 ? 'Backend' : t.priorityFlag === 1 ? 'Design' : 'Frontend';

  return {
    id: t.id,
    columnId,
    category,
    categoryClass: t.priorityFlag === 2
      ? 'px-2 py-0.5 bg-purple-50 text-purple-700 font-label-mono text-[10px] rounded uppercase font-semibold'
      : 'px-2 py-0.5 bg-blue-50 text-blue-700 font-label-mono text-[10px] rounded uppercase font-semibold',
    title: t.title,
    description: t.description || '',
    status: t.status,
    dueDate: t.dueDate
      ? new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : 'No date',
    rawDueDate: t.dueDate,
    priorityFlag: t.priorityFlag || 0,
    priority: t.priorityFlag === 2 ? 'URGENT' : t.priorityFlag === 1 ? 'HIGH' : 'NORMAL',
    createdBy: t.createdBy,
    assigneeId: t.assigneeId,
    assignees: t.assignee
      ? [
          {
            name: t.assignee.displayName,
            avatar:
              t.assignee.displayName === 'Sarah Chen'
                ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA'
                : t.assignee.displayName === 'James Okafor'
                ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFtVWLjvsvFaswDKai2dzxiJ7Hz059R3IyZ7Y8_WvWNqZZAFODzEltsbVFOICQj2Hl6GM3sgSx_NfIYcmNS8ST2i0llAFYar1Eq6zWf5QnREO_xhLY7Fr1gLFSb-e6Pw0wGRtrCEmcHyVcAhWDBmeRrnLvqOrrIM7X7ML0k9nOWB19qd2_On1Ej3HsNSh1YRS-pgenNt8nZZtUPbtlyCNFHm_nLsexvnqK3BdIN1XSiE1NBrX1-TZxfw'
                : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxRClfSTZw8Xr6B12YJT_fqg0m_s4WDR0hY99udWLtk7A18MiByx7bP6dRHUheV5oacrNnYyMKzJS2LyxjywPSkHladj1XvzchKjeU_XiBRbBldG3Gq_SCsjoLCJME4WuaMD3gyp0OVmGS_IBHzN9sD6X7rCktmI7auE-3412OxdZ0njSwHCME49e6TVRlS2_EygM29ckbEhd1k_pOlW6oyfGiaiQuwpH42Bwq3jRa8ORDNZZI6YSlGg',
          },
        ]
      : [],
    isDone: t.status === 'done',
    isBlocked: false,
    comments: t.comments || [],
  };
}

export default function Board() {
  const { boardId: paramBoardId } = useParams();
  const boardId = Number(paramBoardId) || 1;

  const { currentRole, currentUser, canEditTask } = useRole();
  const { token } = useAuth();

  const [boardData, setBoardData] = useState(mockBoardData);
  const [columns, setColumns] = useState(mockBoardData.columns);
  const [tasks, setTasks] = useState(mockBoardData.tasks);

  const [timelineData, setTimelineData] = useState(mockTimelineData);
  const [suggestedOrderData, setSuggestedOrderData] = useState(mockSuggestedOrderData);
  const [calendarData] = useState(mockCalendarData);
  const [listViewData, setListViewData] = useState(mockListViewData);
  const [activeView, setActiveView] = useState('Board');

  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [workspaceSettingsTab, setWorkspaceSettingsTab] = useState('general');
  const [isTeamMembersOpen, setIsTeamMembersOpen] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Load board and tasks from backend
  const loadBackendData = useCallback(async () => {
    try {
      const [boardRes, tasksRes] = await Promise.all([
        client.get(`/api/boards/${boardId}`),
        client.get(`/api/boards/${boardId}/tasks`),
      ]);

      if (boardRes.data?.name) {
        setBoardData((prev) => ({
          ...prev,
          projectName: boardRes.data.name,
        }));
      }

      if (Array.isArray(tasksRes.data) && tasksRes.data.length > 0) {
        const mapped = tasksRes.data.map(mapBackendTaskToCard);
        setTasks(mapped);

        // Update list view data with real tasks
        setListViewData({
          title: 'All Sprint Tasks',
          tasks: tasksRes.data.map((t) => ({
            id: t.id,
            taskName: t.title,
            assignee: {
              name: t.assignee?.displayName || 'Unassigned',
              type: 'avatar',
              className: 'bg-primary text-on-primary',
              initials: (t.assignee?.displayName || 'UN').slice(0, 2).toUpperCase(),
            },
            status: t.status === 'done' ? 'DONE' : t.status === 'in_progress' ? 'IN PROGRESS' : 'TODO',
            statusClass:
              t.status === 'done'
                ? 'bg-[#e6f4ea] text-[#137333]'
                : t.status === 'in_progress'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-surface-dim text-on-surface',
            priority: t.priorityFlag === 2 ? 'URGENT' : t.priorityFlag === 1 ? 'HIGH' : 'NORMAL',
            priorityClass:
              t.priorityFlag === 2
                ? 'bg-red-50 text-red-700'
                : t.priorityFlag === 1
                ? 'bg-amber-50 text-amber-800'
                : 'bg-surface-dim text-secondary',
            dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date',
            labels: [t.priorityFlag === 2 ? 'Priority' : 'Sprint'],
          })),
        });
      }
    } catch (err) {
      console.warn('Backend load error, using local state:', err.message);
    }
  }, [boardId]);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData, currentRole]);

  // Real-time live synchronization with Socket.io
  useSocket(boardId, {
    onTaskCreated: (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [mapBackendTaskToCard(newTask), ...prev];
      });
    },
    onTaskUpdated: (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? mapBackendTaskToCard(updatedTask) : t))
      );
      setSelectedTask((prev) =>
        prev && prev.id === updatedTask.id ? mapBackendTaskToCard(updatedTask) : prev
      );
    },
    onTaskDeleted: ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask((prev) => (prev && prev.id === taskId ? null : prev));
    },
  });

  // Keyboard shortcut: Cmd/Ctrl + K for Command Palette (Section 15)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Actions
  function handleSelectTask(task) {
    setSelectedTask(task);
  }

  async function handleUpdateTask(updatedTask) {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );

    try {
      const payload = {
        title: updatedTask.title,
        description: updatedTask.description,
        priorityFlag: updatedTask.priorityFlag,
        dueDate: updatedTask.rawDueDate || undefined,
        status:
          updatedTask.columnId === 'done' || updatedTask.status === 'Done'
            ? 'done'
            : updatedTask.columnId === 'in-progress' || updatedTask.status === 'In Progress'
            ? 'in_progress'
            : 'todo',
      };
      await client.patch(`/api/tasks/${updatedTask.id}`, payload);
    } catch (err) {
      console.warn('Backend update warning:', err.response?.data?.error || err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);

    try {
      await client.delete(`/api/tasks/${taskId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
      loadBackendData();
    }
  }

  async function handleAddTask(columnId = 'todo') {
    const defaultTitle = 'New collaborative task';
    const defaultDesc = 'Define requirements and assign team members to execute this feature.';

    try {
      const { data } = await client.post(`/api/boards/${boardId}/tasks`, {
        title: defaultTitle,
        description: defaultDesc,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const card = mapBackendTaskToCard(data);
      setTasks((prev) => [card, ...prev]);
      setSelectedTask(card);
    } catch (err) {
      // Fallback local task
      const fallbackTask = {
        id: `task-${Date.now()}`,
        columnId,
        category: 'Feature',
        categoryClass:
          'px-2 py-0.5 bg-primary-container/20 text-primary font-label-mono text-[10px] rounded uppercase font-semibold',
        title: defaultTitle,
        description: defaultDesc,
        dueDate: 'Next Sprint',
        createdBy: currentUser.id,
        assignees: [{ name: currentUser.displayName, avatar: currentUser.avatar }],
        isDone: false,
        isBlocked: false,
      };
      setTasks((prev) => [fallbackTask, ...prev]);
      setSelectedTask(fallbackTask);
    }
  }

  async function handleDropTask(taskId, targetColumnId) {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (!canEditTask(targetTask)) {
      alert('Permission restriction: Members can only move tasks they created or are assigned to.');
      return;
    }

    // Optimistic move
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              columnId: targetColumnId,
              isDone: targetColumnId === 'done',
              isBlocked: targetColumnId === 'blocked',
            }
          : t
      )
    );

    const mappedStatus =
      targetColumnId === 'done' ? 'done' : targetColumnId === 'in-progress' ? 'in_progress' : 'todo';

    try {
      await client.patch(`/api/tasks/${taskId}/status`, { status: mappedStatus });
    } catch (err) {
      console.warn('Status patch warning:', err.message);
    }
  }

  function handleAddColumn(columnTitle) {
    const newCol = {
      id: `col-${Date.now()}`,
      title: columnTitle,
      count: 0,
      dotClass: 'w-2 h-2 rounded-full bg-primary',
      badgeClass:
        'bg-surface-container text-secondary font-label-mono text-[10px] px-1.5 py-0.5 rounded',
      columnClass:
        'w-80 flex flex-col h-full bg-surface-bright rounded-lg border border-outline-variant/30 flex-shrink-0',
      headerClass:
        'p-3 border-b border-outline-variant/50 flex items-center justify-between sticky top-0 bg-surface-bright/95 backdrop-blur z-10 rounded-t-lg',
      titleClass: 'font-card-title text-body-md font-medium text-on-background',
      canAdd: true,
      hasMoreAction: true,
    };
    setColumns((prev) => [...prev, newCol]);
  }

  // Load real topological prioritization when opening Suggested Order view
  useEffect(() => {
    if (activeView === 'Suggested Order') {
      client
        .get(`/api/boards/${boardId}/tasks/prioritized`)
        .then(({ data }) => {
          if (data?.order?.length) {
            setSuggestedOrderData({
              title: 'Automated Suggested Order',
              subtitle: data.hasCycle ? 'Cycle Detected • Standard Sort' : 'Topological DAG Sort',
              items: data.order.map((t, idx) => ({
                id: t.id,
                rank: `#${idx + 1}`,
                title: t.title,
                department: t.assignee?.displayName || 'Engineering',
                status: t.status === 'done' ? 'Completed' : 'Ready to Start',
                statusType: t.status === 'done' ? 'ready' : 'normal',
                reason: `Priority Flag ${t.priorityFlag} • Kahn Score ${Math.round(t.score)}`,
                isWarning: false,
                isMutedRank: idx > 2,
                manualPriority: t.priorityFlag > 0,
              })),
            });
          }
        })
        .catch((e) => console.warn('Prioritized order fetch error:', e.message));
    }
  }, [activeView, boardId]);

  return (
    <div className="bg-background text-on-background font-body-sm text-body-sm h-screen flex overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Side Navigation Bar (Section 1) */}
      <SideNavBar
        activeNav={
          activeView === 'Analytics'
            ? 'analytics'
            : activeView === 'Suggested Order' || activeView === 'List'
            ? 'tasks'
            : 'boards'
        }
        onSelectNav={(navId) => {
          if (navId === 'analytics') {
            setActiveView('Analytics');
          } else if (navId === 'boards') {
            setActiveView('Board');
          } else if (navId === 'tasks') {
            setActiveView('List');
          }
        }}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenInbox={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => {
          setWorkspaceSettingsTab('general');
          setIsWorkspaceSettingsOpen(true);
        }}
        onOpenBilling={() => {
          setWorkspaceSettingsTab('billing');
          setIsWorkspaceSettingsOpen(true);
        }}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-14 min-w-0 bg-background h-screen">
        {/* Top Navigation Bar (Section 2) */}
        <TopNavBar
          projectName="CollabBoard"
          subProjectName={
            activeView === 'Timeline'
              ? timelineData.subProjectName
              : activeView === 'Suggested Order' || activeView === 'Calendar' || activeView === 'List'
              ? null
              : activeView === 'Analytics'
              ? 'Performance & Metrics'
              : boardData.projectName
          }
          views={['Board', 'Timeline', 'Suggested Order', 'Calendar', 'List', 'Analytics']}
          activeView={activeView}
          onSelectView={setActiveView}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenBoardSettings={() => setIsBoardSettingsOpen(true)}
          onOpenTeamMembers={() => setIsTeamMembersOpen(true)}
          onOpenActivityFeed={() => setIsActivityFeedOpen(true)}
        />

        {/* View Content based on active tab */}
        {activeView === 'Timeline' ? (
          <TimelineView
            timelineData={timelineData}
            onSelectTask={handleSelectTask}
          />
        ) : activeView === 'Suggested Order' ? (
          <SuggestedOrderView
            boardId={boardId}
            onSelectTask={handleSelectTask}
          />
        ) : activeView === 'Calendar' ? (
          <CalendarView
            data={calendarData}
            onSelectTask={handleSelectTask}
          />
        ) : activeView === 'List' ? (
          <ListView
            data={listViewData}
            onSelectTask={handleSelectTask}
          />
        ) : activeView === 'Analytics' ? (
          <AnalyticsView />
        ) : (
          <>
            <BoardToolbar sprint={boardData.sprint} />
            <KanbanBoard
              columns={columns}
              tasks={tasks}
              onCardClick={handleSelectTask}
              onAddTask={handleAddTask}
              onDropTask={handleDropTask}
              onAddColumn={handleAddColumn}
            />
          </>
        )}
      </div>

      {/* Modal Dialogs configured per User Role Spec */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={Boolean(selectedTask)}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}

      {isInviteOpen && (
        <InviteMemberModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      {isBoardSettingsOpen && (
        <BoardSettingsModal
          isOpen={isBoardSettingsOpen}
          onClose={() => setIsBoardSettingsOpen(false)}
          boardName={boardData.projectName}
          onRenameBoard={async (newName) => {
            setBoardData((prev) => ({ ...prev, projectName: newName }));
            try {
              await client.patch(`/api/boards/${boardId}`, { name: newName });
            } catch (err) {
              console.warn('Rename board error:', err.message);
            }
          }}
          onArchiveBoard={() => alert('Board archived successfully.')}
          onDeleteBoard={async () => {
            try {
              await client.delete(`/api/boards/${boardId}`);
              alert('Board deleted permanently.');
              setIsBoardSettingsOpen(false);
            } catch (err) {
              alert(err.response?.data?.error || 'Failed to delete board');
            }
          }}
        />
      )}

      {isWorkspaceSettingsOpen && (
        <WorkspaceSettingsModal
          isOpen={isWorkspaceSettingsOpen}
          onClose={() => setIsWorkspaceSettingsOpen(false)}
          initialTab={workspaceSettingsTab}
        />
      )}

      {isTeamMembersOpen && (
        <TeamMembersModal
          isOpen={isTeamMembersOpen}
          onClose={() => setIsTeamMembersOpen(false)}
        />
      )}

      {isActivityFeedOpen && (
        <ActivityFeedModal
          isOpen={isActivityFeedOpen}
          onClose={() => setIsActivityFeedOpen(false)}
        />
      )}

      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectTask={handleSelectTask}
          onSelectNav={(navId) => {
            if (navId === 'boards') setActiveView('Board');
            else if (navId === 'timeline') setActiveView('Timeline');
            else if (navId === 'suggested') setActiveView('Suggested Order');
            else if (navId === 'analytics') setActiveView('Analytics');
          }}
        />
      )}
    </div>
  );
}
