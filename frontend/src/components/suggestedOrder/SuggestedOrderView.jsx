import React, { useState, useEffect, useCallback } from 'react';
import SuggestedOrderList from './SuggestedOrderList';
import SuggestPriorityModal from '../modals/SuggestPriorityModal';
import { mockSuggestedOrderData } from '../../data/mockSuggestedOrderData';
import { useRole } from '../../context/RoleContext';
import client from '../../api/client';

export default function SuggestedOrderView({ boardId = 1, onSelectTask }) {
  const { currentRole, currentUser, isOwnerOrAdmin, isMember } = useRole();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [cycleError, setCycleError] = useState(null);
  const [selectedItemForFlag, setSelectedItemForFlag] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'my_tasks' | 'ready_only'

  const fetchSuggestedOrder = useCallback(async () => {
    setLoading(true);
    setCycleError(null);
    try {
      const { data } = await client.get(`/api/boards/${boardId}/suggested-order`);
      if (data?.order) {
        setTasks(
          data.order.map((t, idx) => ({
            id: t.id,
            rank: `#${idx + 1}`,
            title: t.title,
            description: t.description,
            department: t.assignee?.displayName || 'Engineering',
            assigneeId: t.assigneeId,
            status: t.status,
            statusType: t.statusType || (t.status === 'done' ? 'ready' : t.isBlocked ? 'blocked' : 'ready'),
            statusReason: t.statusReason,
            score: t.score,
            scoreBreakdown: t.scoreBreakdown,
            numDependents: t.numDependents || 0,
            isBlocked: t.isBlocked,
            blockers: t.blockers || [],
            dueDate: t.dueDate,
            priorityFlag: t.priorityFlag || 0,
            manualPriority: (t.priorityFlag || 0) > 0,
            isMutedRank: idx > 2,
          }))
        );
      }
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.hasCycle) {
        setCycleError({
          message: err.response.data.error,
          cycle: err.response.data.cycle || [],
          cyclePath: err.response.data.cyclePath || '',
          cycleTaskIds: err.response.data.cycleTaskIds || [],
        });
      } else {
        console.warn('Suggested order fetch error, fallback to mock data:', err.message);
        setTasks(mockSuggestedOrderData.items);
      }
    } finally {
      setLoading(false);
      setIsReevaluating(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchSuggestedOrder();
  }, [fetchSuggestedOrder]);

  function handleReevaluate() {
    setIsReevaluating(true);
    fetchSuggestedOrder();
  }

  // Break circular dependency (Section 2.3)
  async function handleBreakCycle() {
    if (!cycleError?.cycleTaskIds || cycleError.cycleTaskIds.length < 2) return;
    const taskA = cycleError.cycleTaskIds[0];
    const taskB = cycleError.cycleTaskIds[1];

    try {
      await client.delete(`/api/tasks/${taskA}/dependencies/${taskB}`);
      alert('Circular dependency link broken successfully. Re-evaluating graph...');
      fetchSuggestedOrder();
    } catch (err) {
      // Try reverse edge
      try {
        await client.delete(`/api/tasks/${taskB}/dependencies/${taskA}`);
        alert('Circular dependency link broken successfully. Re-evaluating graph...');
        fetchSuggestedOrder();
      } catch (e2) {
        alert('Failed to break dependency edge automatically. Open task detail to inspect.');
      }
    }
  }

  // Filter tasks per Section 2.4 (Working from the suggested order)
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'my_tasks') {
      return t.assigneeId === currentUser.id || t.department === currentUser.displayName;
    }
    if (filter === 'ready_only') {
      return !t.isBlocked && t.status !== 'done';
    }
    return true;
  });

  return (
    <main className="flex-1 overflow-y-auto p-container-padding flex justify-center bg-background">
      <div className="w-full max-w-[1050px] flex flex-col pt-margin-md">
        {/* Section Header */}
        <div className="flex items-baseline justify-between mb-margin-md flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-section-headline text-section-headline text-on-surface">
                Dependency-Aware Suggested Order
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                Kahn's DAG Engine
              </span>
            </div>
            <p className="text-xs text-secondary mt-1 max-w-xl">
              Safe execution queue: topological sort over task dependencies scored by{' '}
              <code className="text-primary font-mono text-[11px] bg-surface-container px-1 py-0.5 rounded">
                10*(1/days) + 5*(dependents) + 3*(priority_flag)
              </code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container text-secondary">
              Viewing as {currentRole}
            </span>
            <button
              onClick={handleReevaluate}
              disabled={isReevaluating}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isReevaluating ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              <span>{isReevaluating ? 'Re-evaluating...' : 'Re-evaluate'}</span>
            </button>
          </div>
        </div>

        {/* Circular Dependency Alert (Section 2.3) */}
        {cycleError && (
          <div className="mb-6 p-4 rounded-xl border border-error/40 bg-error-container/20 text-on-error-container animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-error text-[24px] shrink-0">
                error_circle_rounded
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-error">
                  Circular Dependency Detected (Deadlock)
                </h3>
                <p className="text-xs text-on-surface mt-1">
                  The topological sort cannot resolve the graph because tasks have a cyclical dependency:
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-surface-container-lowest border border-error/20 font-mono text-xs text-error font-medium">
                  {cycleError.cyclePath || 'Task A → Task B → Task C → Task A'}
                </div>
                {isOwnerOrAdmin && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleBreakCycle}
                      className="px-3 py-1.5 bg-error text-on-error rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">link_off</span>
                      Break Circular Link
                    </button>
                    <span className="text-[11px] text-secondary">
                      (Admins can remove the circular edge to unblock ordering)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter Navigation Bar (Section 2.4) */}
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:bg-surface-container'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('my_tasks')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'my_tasks'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:bg-surface-container'
              }`}
            >
              My Actionable Tasks
            </button>
            <button
              onClick={() => setFilter('ready_only')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'ready_only'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:bg-surface-container'
              }`}
            >
              Ready to Start (Unblocked)
            </button>
          </div>

          <span className="text-[11px] text-secondary">
            Showing {filteredTasks.length} tasks
          </span>
        </div>

        {/* Ranked List */}
        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2 text-secondary text-sm">
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>Running topological sort over dependency graph...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-sm text-secondary bg-surface-container-lowest rounded-xl border border-outline-variant">
            No tasks match the selected filter.
          </div>
        ) : (
          <SuggestedOrderList
            items={filteredTasks}
            onFlagClick={(item) => setSelectedItemForFlag(item)}
            onClickTask={(item) => {
              if (onSelectTask) {
                onSelectTask({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  priorityFlag: item.priorityFlag,
                  status: item.status,
                  dueDate: item.dueDate,
                });
              }
            }}
          />
        )}
      </div>

      {/* Priority Flag / Override Modal */}
      {selectedItemForFlag && (
        <SuggestPriorityModal
          isOpen={Boolean(selectedItemForFlag)}
          onClose={() => setSelectedItemForFlag(null)}
          taskItem={selectedItemForFlag}
          onPriorityUpdated={() => fetchSuggestedOrder()}
        />
      )}
    </main>
  );
}
