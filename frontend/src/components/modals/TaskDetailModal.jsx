import React, { useState, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import client from '../../api/client';

export default function TaskDetailModal({ task, isOpen, onClose, onUpdateTask, onDeleteTask }) {
  const {
    currentRole,
    currentUser,
    isOwnerOrAdmin,
    isMember,
    canEditTask,
    canDeleteTask,
    canReassignTask,
  } = useRole();

  if (!isOpen || !task) return null;

  const editable = canEditTask(task);
  const deletable = canDeleteTask(task);
  const reassignPermission = canReassignTask(task);

  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(
    task.description || 'Coordinate cross-functional implementation details, track blockers, and ensure deliverables meet the team specification.'
  );
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'comments' | 'dependencies' | 'activity'
  const [dependencies, setDependencies] = useState({ blockedBy: [], blocks: [] });
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedBlockerId, setSelectedBlockerId] = useState('');
  const [dependencyError, setDependencyError] = useState('');
  const [comments, setComments] = useState(
    task.comments || [
      {
        id: 'c-1',
        author: 'Sarah Chen',
        authorRole: 'owner',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA',
        timestamp: '2 hours ago',
        text: 'Prioritizing this for our next deployment. Please verify dependencies with the backend schema.',
      },
      {
        id: 'c-2',
        author: 'Maya Lindqvist',
        authorRole: 'member',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxRClfSTZw8Xr6B12YJT_fqg0m_s4WDR0hY99udWLtk7A18MiByx7bP6dRHUheV5oacrNnYyMKzJS2LyxjywPSkHladj1XvzchKjeU_XiBRbBldG3Gq_SCsjoLCJME4WuaMD3gyp0OVmGS_IBHzN9sD6X7rCktmI7auE-3412OxdZ0njSwHCME49e6TVRlS2_EygM29ckbEhd1k_pOlW6oyfGiaiQuwpH42Bwq3jRa8ORDNZZI6YSlGg',
        timestamp: '45 mins ago',
        text: 'Frontend components are structured according to the role spec and ready for testing.',
      },
    ]
  );
  const [newCommentText, setNewCommentText] = useState('');
  const [assignedMember, setAssignedMember] = useState(
    task.assignees?.[0]?.name || 'Maya Lindqvist'
  );
  const [status, setStatus] = useState(task.isDone ? 'Done' : task.isBlocked ? 'Blocked' : 'In Progress');

  function handleSave() {
    if (onUpdateTask) {
      onUpdateTask({
        ...task,
        title,
        description,
        status,
        assignees: [
          {
            name: assignedMember,
            avatar: assignedMember === 'Sarah Chen'
              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA'
              : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxRClfSTZw8Xr6B12YJT_fqg0m_s4WDR0hY99udWLtk7A18MiByx7bP6dRHUheV5oacrNnYyMKzJS2LyxjywPSkHladj1XvzchKjeU_XiBRbBldG3Gq_SCsjoLCJME4WuaMD3gyp0OVmGS_IBHzN9sD6X7rCktmI7auE-3412OxdZ0njSwHCME49e6TVRlS2_EygM29ckbEhd1k_pOlW6oyfGiaiQuwpH42Bwq3jRa8ORDNZZI6YSlGg',
          },
        ],
      });
    }
    onClose();
  }

  // Fetch real comments from backend when modal opens
  useEffect(() => {
    let isMounted = true;
    async function loadBackendComments() {
      if (!task.id) return;
      try {
        const { data } = await client.get(`/api/tasks/${task.id}`);
        if (isMounted && data?.comments?.length) {
          setComments(
            data.comments.map((c) => ({
              id: c.id,
              author: c.author?.displayName || 'User',
              authorRole: 'member',
              avatar: c.author?.displayName === 'Sarah Chen'
                ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsb5YBKlq5AvrcJL6qGJ-Ts7owcc0PIMZt4H-syVf0fGdLGk3xsVyGDvc8o2TGy7hXM3Vd-jfjn9jyHr8n7J7EdFDIaNXlRBCSoNyHpaO3K04nK7dfxVR1nHM-4CFyYxNfpb17MAsucuRuGKlCTNPCxZPEa_QXmjZxKbKrS0_mn1O7eplCenzZ-ig6yFGm-3DOiMAvx5iVn_TT-znvre-Mv8p4BvdIGeQ4LHp7-HLASAvkWyWhhO3pQA'
                : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxRClfSTZw8Xr6B12YJT_fqg0m_s4WDR0hY99udWLtk7A18MiByx7bP6dRHUheV5oacrNnYyMKzJS2LyxjywPSkHladj1XvzchKjeU_XiBRbBldG3Gq_SCsjoLCJME4WuaMD3gyp0OVmGS_IBHzN9sD6X7rCktmI7auE-3412OxdZ0njSwHCME49e6TVRlS2_EygM29ckbEhd1k_pOlW6oyfGiaiQuwpH42Bwq3jRa8ORDNZZI6YSlGg',
              timestamp: new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: c.body,
            }))
          );
        }
      } catch (err) {
        // use default state if not found
      }
    }
    loadBackendComments();
    return () => { isMounted = false; };
  }, [task.id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const body = newCommentText.trim();
    setNewCommentText('');

    try {
      const { data } = await client.post(`/api/tasks/${task.id}/comments`, { body });
      const newC = {
        id: data.id,
        author: data.author?.displayName || currentUser.displayName,
        authorRole: currentRole,
        avatar: currentUser.avatar,
        timestamp: 'Just now',
        text: data.body,
      };
      setComments((prev) => [...prev, newC]);
    } catch (err) {
      // Fallback local addition
      const newC = {
        id: `c-${Date.now()}`,
        author: currentUser.displayName,
        authorRole: currentRole,
        avatar: currentUser.avatar,
        timestamp: 'Just now',
        text: body,
      };
      setComments((prev) => [...prev, newC]);
    }
  }

  async function handleDeleteComment(commentId, author) {
    const isOwnComment = author === currentUser.displayName;
    if (!isOwnerOrAdmin && !isOwnComment) return;

    try {
      if (typeof commentId === 'number') {
        await client.delete(`/api/comments/${commentId}`);
      }
    } catch (err) {
      console.warn('Backend comment delete warning:', err.message);
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  // Load dependencies and available tasks for dependency graph
  useEffect(() => {
    let isMounted = true;
    async function loadDependenciesData() {
      if (!task.id) return;
      try {
        const [depsRes, boardRes] = await Promise.all([
          client.get(`/api/tasks/${task.id}/dependencies`),
          client.get(`/api/boards/1/tasks`),
        ]);
        if (isMounted) {
          if (depsRes.data) {
            setDependencies(depsRes.data);
          }
          if (Array.isArray(boardRes.data)) {
            setAvailableTasks(boardRes.data.filter((t) => t.id !== task.id));
          }
        }
      } catch (err) {
        console.warn('Load dependencies warning:', err.message);
      }
    }
    loadDependenciesData();
    return () => { isMounted = false; };
  }, [task.id]);

  async function handleAddDependency(e) {
    e.preventDefault();
    if (!selectedBlockerId) return;
    setDependencyError('');

    try {
      await client.post(`/api/tasks/${task.id}/dependencies`, {
        dependsOnTaskId: Number(selectedBlockerId),
      });
      const { data } = await client.get(`/api/tasks/${task.id}/dependencies`);
      setDependencies(data);
      setSelectedBlockerId('');
    } catch (err) {
      setDependencyError(err.response?.data?.error || 'Failed to add dependency');
    }
  }

  async function handleRemoveDependency(dependsOnTaskId) {
    setDependencyError('');
    try {
      await client.delete(`/api/tasks/${task.id}/dependencies/${dependsOnTaskId}`);
      setDependencies((prev) => ({
        ...prev,
        blockedBy: prev.blockedBy.filter((b) => b.id !== dependsOnTaskId),
      }));
    } catch (err) {
      setDependencyError(err.response?.data?.error || 'Failed to remove dependency');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container-high text-secondary uppercase font-semibold">
              {task.category || 'TASK'}
            </span>
            <span className="text-xs text-secondary font-mono">ID: {task.id}</span>
            {/* Role permission status badge */}
            {editable ? (
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Full edit rights ({currentRole})
              </span>
            ) : (
              <span className="text-[11px] font-medium text-secondary bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                View only (Member - not assignee/creator)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/50 px-6 gap-6 text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Task Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            <span>Comments</span>
            <span className="w-5 h-5 rounded-full bg-surface-container-high text-[11px] flex items-center justify-center">
              {comments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dependencies'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            <span>Dependencies</span>
            {(dependencies.blockedBy?.length > 0 || dependencies.blocks?.length > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-semibold">
                {(dependencies.blockedBy?.length || 0) + (dependencies.blocks?.length || 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'activity'
                ? 'text-primary border-primary font-semibold'
                : 'text-secondary border-transparent hover:text-on-surface'
            }`}
          >
            Activity Log
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'details' && (
            <>
              {/* Title: Editable vs Plain Text per spec */}
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                  Title
                </label>
                {editable ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface font-medium"
                  />
                ) : (
                  // Spec: Render as plain text (no input border) for Members without edit rights
                  <div className="py-2 text-base font-semibold text-on-surface leading-snug">
                    {title}
                  </div>
                )}
              </div>

              {/* Description: Editable vs Plain Text per spec */}
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                {editable ? (
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
                  />
                ) : (
                  <div className="py-2 text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/30 rounded-lg p-3">
                    {description}
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline-variant/40">
                {/* Assignee Control */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                    Assignee
                  </label>
                  {isOwnerOrAdmin ? (
                    // Owner/Admin: Can reassign to anyone
                    <select
                      value={assignedMember}
                      onChange={(e) => setAssignedMember(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
                    >
                      <option value="Sarah Chen">Sarah Chen (Owner)</option>
                      <option value="James Okafor">James Okafor (Admin)</option>
                      <option value="Maya Lindqvist">Maya Lindqvist (Member)</option>
                      <option value="Alex Kim">Alex Kim (Member)</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  ) : editable ? (
                    // Member (assignee/creator): can reassign to self or unassign only
                    <select
                      value={assignedMember}
                      onChange={(e) => setAssignedMember(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
                    >
                      <option value={currentUser.displayName}>{currentUser.displayName} (Self)</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  ) : (
                    // Member (other): view only plain text
                    <div className="py-2 text-sm font-medium text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary">person</span>
                      <span>{assignedMember}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  {editable ? (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
                    >
                      <option value="To do">To do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Done">Done</option>
                    </select>
                  ) : (
                    <div className="py-2 text-sm font-medium text-on-surface">
                      <span className="inline-block px-2 py-0.5 rounded bg-surface-container text-xs font-mono">
                        {status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                    Due Date
                  </label>
                  <div className="py-2 text-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                    <span>{task.dueDate || 'Nov 15, 2026'}</span>
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                    Dependencies
                  </label>
                  {isOwnerOrAdmin || editable ? (
                    <div className="flex items-center gap-2 text-xs text-secondary py-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">account_tree</span>
                      <span>Blocks: TASK-4, TASK-6</span>
                    </div>
                  ) : (
                    <div className="text-xs text-secondary py-1 italic">
                      View only (Member cannot edit dependency graph)
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Comment List */}
              <div className="space-y-3">
                {comments.map((c) => {
                  const isOwn = c.author === currentUser.displayName;
                  const canDelete = isOwnerOrAdmin || isOwn;

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/40 space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.avatar}
                            alt={c.author}
                            className="w-6 h-6 rounded-full object-cover border border-outline-variant"
                          />
                          <span className="text-xs font-semibold text-on-surface">{c.author}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-secondary uppercase font-mono">
                            {c.authorRole}
                          </span>
                          <span className="text-[11px] text-secondary">{c.timestamp}</span>
                        </div>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(c.id, c.author)}
                            className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                            title={isOwn ? 'Delete your comment' : 'Delete comment (Admin/Owner rights)'}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant pl-8">{c.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Add Comment Form (Allowed for all roles) */}
              <form onSubmit={handleAddComment} className="pt-3 border-t border-outline-variant/40">
                <label className="block text-xs font-medium text-secondary mb-1.5 uppercase tracking-wide">
                  Add a comment
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a comment or suggest a change..."
                    className="flex-1 px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-on-surface"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              {/* Dependency Error / Cycle Warning */}
              {dependencyError && (
                <div className="p-3.5 rounded-lg border border-error/40 bg-error-container/20 text-on-error-container text-xs flex items-start gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-error text-[18px] shrink-0">
                    warning
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold">Dependency Error:</span> {dependencyError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDependencyError('')}
                    className="text-secondary hover:text-on-surface"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 1. Blocked By (Prerequisites) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">lock_clock</span>
                    Blocked By (Prerequisites)
                  </h4>
                  <span className="text-[11px] text-secondary">
                    {dependencies.blockedBy?.length || 0} prerequisite {dependencies.blockedBy?.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {dependencies.blockedBy?.length === 0 ? (
                  <div className="p-3 rounded-lg bg-surface-container-low/30 border border-outline-variant/30 text-xs text-secondary italic">
                    No blockers. This task is ready to start immediately.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dependencies.blockedBy.map((blocker) => (
                      <div
                        key={blocker.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            subdirectory_arrow_right
                          </span>
                          <span className="text-xs font-medium text-on-surface truncate">
                            {blocker.title}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                              blocker.status === 'done'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {blocker.status === 'done' ? 'Resolved' : 'Blocking'}
                          </span>
                        </div>

                        {editable && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDependency(blocker.id)}
                            className="text-secondary hover:text-error transition-colors p-1 cursor-pointer"
                            title="Remove dependency"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Dependency Selector (Section 2.1) */}
              {editable && (
                <form onSubmit={handleAddDependency} className="p-3.5 rounded-lg bg-surface-container-low/30 border border-outline-variant/40 space-y-2">
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                    Add Pre-requisite Blocker
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedBlockerId}
                      onChange={(e) => setSelectedBlockerId(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface cursor-pointer"
                    >
                      <option value="">Select a task that must complete before this one...</option>
                      {availableTasks
                        .filter((t) => !dependencies.blockedBy?.some((b) => b.id === t.id))
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            #{t.id} — {t.title} ({t.status})
                          </option>
                        ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!selectedBlockerId}
                      className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_link</span>
                      Add Blocker
                    </button>
                  </div>
                  <p className="text-[11px] text-secondary">
                    Lightweight cycle detection validates the edge automatically before committing.
                  </p>
                </form>
              )}

              {/* 2. Blocks (Downstream Work) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-purple-600">account_tree</span>
                    Blocks (Downstream Work Waiting on This Task)
                  </h4>
                  <span className="text-[11px] text-secondary">
                    {dependencies.blocks?.length || 0} dependent {dependencies.blocks?.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {dependencies.blocks?.length === 0 ? (
                  <div className="p-3 rounded-lg bg-surface-container-low/30 border border-outline-variant/30 text-xs text-secondary italic">
                    No downstream tasks are blocked by this task.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dependencies.blocks.map((dep) => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low/40 border border-outline-variant/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            arrow_right_alt
                          </span>
                          <span className="text-xs font-medium text-on-surface truncate">
                            {dep.title}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-container-high text-secondary">
                          {dep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs text-secondary py-2 border-b border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
                <div>
                  <span className="font-semibold text-on-surface">Sarah Chen (Owner)</span> created this task
                  <div className="text-[11px] text-secondary">3 days ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-secondary py-2 border-b border-outline-variant/30">
                <span className="material-symbols-outlined text-[16px] text-secondary">person_add</span>
                <div>
                  <span className="font-semibold text-on-surface">James Okafor (Admin)</span> assigned task to Maya Lindqvist
                  <div className="text-[11px] text-secondary">Yesterday at 4:15 PM</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-secondary py-2">
                <span className="material-symbols-outlined text-[16px] text-green-600">sync</span>
                <div>
                  <span className="font-semibold text-on-surface">Maya Lindqvist (Member)</span> moved status to In Progress
                  <div className="text-[11px] text-secondary">Today at 10:20 AM</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-outline-variant/50 flex items-center justify-between bg-surface-container-low/40">
          <div>
            {deletable ? (
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTask) onDeleteTask(task.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete Task
              </button>
            ) : isMember ? (
              <span className="text-[11px] text-secondary italic flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Members can only delete their own unassigned tasks
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              {editable ? 'Cancel' : 'Close'}
            </button>
            {editable && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
