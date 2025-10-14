import React, { useState, useEffect, useMemo, useRef, Suspense, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileText, Calendar, ChevronLeft, ChevronRight, Eye, List, Kanban, Circle, Play, CheckCircle, BarChart3, BarChart, Folder } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import AdminTaskDetails from './AdminTaskDetails';
import KanbanBoard from './KanbanBoard';
import ProjectReports from './ProjectReports';
import ProjectSidebar from './ProjectSidebar';
import ProjectModal from './ProjectModal';

import ProjectsAssistantChat from './ProjectsAssistantChat';
import PlanReview from './PlanReview';

const AdminProjectManagement = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalTasks: 0,
    limit: 20
  });
  // Declare selectedProjectId first to avoid temporal dead zone
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    status: '',
    priority: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    projectId: selectedProjectId || '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assigneeId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', or 'reports'
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPlanReview, setShowPlanReview] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [showProjectSidebar, setShowProjectSidebar] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectRefreshTrigger, setProjectRefreshTrigger] = useState(0);
  const [availableProjects, setAvailableProjects] = useState([]);

  // Memoized counter calculations for performance
  const { todoCount, inProgressCount, doneCount, totalCount } = useMemo(() => {
    const t = tasks || [];
    return {
      todoCount: t.filter(task => task.status === 'todo').length,
      inProgressCount: t.filter(task => task.status === 'in_progress').length,
      doneCount: t.filter(task => task.status === 'done').length,
      totalCount: t.length
    };
  }, [tasks]);

  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  };

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Body scroll lock when modals are open
  useEffect(() => {
    const open = showTaskModal || showDeleteModal || showProjectModal;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTaskModal, showDeleteModal, showProjectModal]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentTab = useMemo(() => {
    if (location.pathname !== '/mobile') return null;
    try {
      return new URLSearchParams(location.search).get('tab') || 'overview';
    } catch {
      return null;
    }
  }, [location.pathname, location.search]);

  const pathToTab = useMemo(() => ({
    '/overview': 'overview',
    '/projects': 'projects',
    '/products': 'products',
    '/orders': 'orders',
    '/customers': 'customers',
    '/inventory': 'inventory',
    '/fulfillment': 'fulfillment',
    '/stl-files': 'stl-files',
    '/analytics': 'reports',
    '/users': 'users',
    '/settings': 'settings'
  }), []);

  const isPathActive = (path) => {
    if (location.pathname === path) return true;
    if (location.pathname === '/mobile') {
      const mapped = pathToTab[path];
      if (!mapped) return false;
      return currentTab === mapped;
    }
    return false;
  };

  const navItemClass = (path) => (
    `flex items-center gap-3 w-full h-9 px-3 rounded-10 text-left transition relative ` +
    (isPathActive(path)
      ? 'text-brand bg-[rgba(99,102,241,.12)] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-brand before:rounded'
      : 'text-text-secondary hover:bg-hover hover:text-text-primary')
  );

  const navItemAriaCurrent = (path) => (isPathActive(path) ? 'page' : undefined);

  const getTaskId = useCallback((task) => {
    if (!task) return null;
    return task.id ?? task.task_id ?? task.taskId ?? null;
  }, []);

  const handleTasksCreated = useCallback(() => {
    // Defer to ensure latest fetchTasks is used at call time
    Promise.resolve().then(() => fetchTasks());
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        setError('Authentication required');
        return;
      }

      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
        ...(selectedProjectId && { projectId: selectedProjectId })
      });

      const response = await fetch(`/api/admin/projects/tasks?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination?.totalPages || 0,
          totalTasks: data.pagination?.totalTasks || 0
        }));
        setError(null);
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setError('Failed to load tasks data');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filters, getToken, pagination.currentPage, pagination.limit, selectedProjectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  // Persist right ProjectSidebar open/closed state
  useEffect(() => {
    const saved = localStorage.getItem('projectsSidebarOpen');
    if (saved !== null) {
      try {
        setShowProjectSidebar(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('projectsSidebarOpen', JSON.stringify(showProjectSidebar));
    } catch {}
  }, [showProjectSidebar]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setTaskFormData({
        title: task.title,
        description: task.description || '',
        projectId: task.project_id || selectedProjectId || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
        assigneeId: task.assignee_id || ''
      });
      setIsEditing(true);
      setSelectedTask(task);
    } else {
      setTaskFormData({
        title: '',
        description: '',
        projectId: selectedProjectId || '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeId: ''
      });
      setIsEditing(false);
      setSelectedTask(null);
    }
    setShowTaskModal(true);
  };

  const viewTaskDetails = (task) => {
    const normalizedId = getTaskId(task);
    if (!normalizedId) {
      showToast('error', 'Unable to open task details. The task is missing an identifier.');
      return;
    }

    setSelectedTask({ ...task, id: normalizedId });
    setShowTaskDetails(true);
  };

  const handleTaskDetailsBack = (taskOrId) => {
    if (taskOrId) {
      if (typeof taskOrId === 'object') {
        // Navigate to sub-task details
        const normalizedId = getTaskId(taskOrId);
        setSelectedTask(normalizedId ? { ...taskOrId, id: normalizedId } : taskOrId);
      } else {
        // subTaskId string (legacy)
        const subTask = tasks.find(t => getTaskId(t) === taskOrId);
        if (subTask) {
          setSelectedTask({ ...subTask, id: getTaskId(subTask) });
        }
      }
    } else {
      // Back to list
      setShowTaskDetails(false);
      setSelectedTask(null);
    }
  };

  const handleAICreateTask = async () => {
    if (!aiInput.trim()) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch('/api/admin/projects/ai/create-task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: aiInput.trim(),
          projectId: selectedProjectId || null,
        })
      });

      if (response.ok) {
        const data = await response.json();
        await fetchTasks(); // Refresh the list
        setAiInput('');
        setShowAIPanel(false);
        showToast('success', 'AI created task successfully!');
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to create task with AI');
      }
    } catch (error) {
      console.error('AI task creation error:', error);
      showToast('error', 'Failed to create task with AI');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    // Reset to first page when changing projects
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (project) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // If the deleted project was selected, switch to "All Tasks"
        if (selectedProjectId === project.id) {
          setSelectedProjectId(null);
        }
        setProjectRefreshTrigger(prev => prev + 1);
        fetchAvailableProjects();
        fetchTasks(); // Refresh tasks after project deletion
        showToast('success', `Project "${project.name}" deleted successfully!`);
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Project deletion error:', error);
      showToast('error', 'Failed to delete project');
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableProjects(Array.isArray(data.projects) ? data.projects : []);
      }
    } catch (error) {
      console.error('Failed to fetch projects for dropdown:', error);
    }
  };

  const handleProjectModalSuccess = (project) => {
    // Trigger sidebar refresh
    setProjectRefreshTrigger(prev => prev + 1);
    fetchAvailableProjects(); // Refresh project dropdown
    fetchTasks(); // Also refresh tasks, in case project filters are active
    showToast('success', `Project "${project.name}" ${editingProject ? 'updated' : 'created'} successfully!`);
    setEditingProject(null);
  };

  const handleBackToList = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
    // Refresh tasks list in case something was updated
    fetchTasks();
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setTaskFormData({ title: '', description: '', projectId: selectedProjectId || '', status: 'todo', priority: 'medium', dueDate: '', assigneeId: '' });
    setIsEditing(false);
  };

  const handleUpdateTask = (updatedTask) => {
    const updatedId = getTaskId(updatedTask);
    setTasks(prev => prev.map(task => (getTaskId(task) === updatedId ? { ...task, ...updatedTask } : task)));
    setSelectedTask(prev => {
      if (!prev) return prev;
      return getTaskId(prev) === updatedId ? { ...prev, ...updatedTask, id: updatedId } : prev;
    });
  };

  const handleAddTaskForStatus = (status) => {
    setTaskFormData(prev => ({ ...prev, status }));
    openTaskModal();
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    if (!taskFormData.title.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const url = isEditing
        ? `/api/admin/projects/tasks/${selectedTask.id}`
        : '/api/admin/projects/tasks';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: taskFormData.title,
          description: taskFormData.description || null,
          projectId: taskFormData.projectId || null,
          status: taskFormData.status || 'todo',
          priority: taskFormData.priority || 'medium',
          dueDate: taskFormData.dueDate || null,
          assigneeId: taskFormData.assigneeId || null
        })
      });

      if (response.ok) {
        await fetchTasks(); // Refresh the list
        closeTaskModal();
        showToast('success', isEditing ? 'Task updated' : 'Task created');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save task');
        showToast('error', errorData.error || 'Failed to save task');
      }
    } catch (err) {
      console.error('Task save error:', err);
      setError('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true })
      });

      if (response.ok) {
        await fetchTasks(); // Refresh the list
        closeDeleteModal();
        showToast('success', 'Task deleted');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete task');
        showToast('error', errorData.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Task delete error:', err);
      setError('Failed to delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Decide what goes in the main content area
  const mainContent = (() => {
    if (loading && (!tasks || tasks.length === 0)) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent"></div>
        </div>
      );
    }

    if (showTaskDetails && selectedTask) {
      return (
        <AdminTaskDetails
          taskId={getTaskId(selectedTask)}
          onBack={handleTaskDetailsBack}
        />
      );
    }

    // otherwise your list/kanban/reports switch
    return viewMode === 'kanban' ? (
      <KanbanBoard
        tasks={tasks}
        onEdit={openTaskModal}
        onDelete={openDeleteModal}
        onViewDetails={viewTaskDetails}
        onAddTask={handleAddTaskForStatus}
        onUpdateTask={handleUpdateTask}
        onError={(msg) => showToast('error', msg)}
      />
    ) : viewMode === 'reports' ? (
      <ProjectReports />
    ) : (
      <div className="bg-surface rounded-12 shadow-elev1 border border-line-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-elev2">
              <tr>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Task Title
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-4 text-right text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-line-soft">
              {(tasks || []).map((task) => (
                <tr key={task.id} className="hover:bg-hover transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[14px] font-semibold text-text-primary">{task.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] text-text-secondary max-w-xs line-clamp-2">
                      {task.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : task.status || 'To Do'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority || 'medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-[13px] text-text-tertiary">
                      <Calendar size={16} className="mr-2" />
                      {formatDate(task.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-[13px] text-text-tertiary">
                      <FileText size={16} className="mr-2" />
                      {task.notes_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewTaskDetails(task)}
                        className="text-text-secondary hover:text-text-primary p-1 hover:bg-hover rounded"
                        title="View task details"
                        aria-label="View task details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openTaskModal(task)}
                        className="text-text-secondary hover:text-text-primary p-1 hover:bg-hover rounded"
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(task)}
                        className="text-danger hover:opacity-90 p-1 hover:bg-hover rounded"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!tasks || tasks.length === 0) && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-text-tertiary" />
            <h3 className="mt-2 text-sm font-medium text-text-primary">No tasks found</h3>
            <p className="mt-1 text-sm text-text-secondary">
              {filters.search ? 'Try adjusting your search terms.' : 'Get started by creating your first task.'}
            </p>
          </div>
        )}
      </div>
    );
  })();

  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded shadow text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Fixed Header (full width at the very top) */}
      <div className="fixed inset-x-0 top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-line-soft">
        <div className="max-w-7xl mx-auto h-14 px-4 flex items-center justify-between">
          {/* Menu button and brand */}
          <div className="flex items-center gap-3">
            <button
              className="bg-brand/10 border border-brand/20 rounded-10 p-1.5 text-brand hover:bg-brand/20 active:scale-95 transition-all"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/mobile?tab=overview')} className="text-[13px] leading-[18px] font-semibold text-text-primary hover:text-text-primary/90">
                Yirra
              </button>
              <button onClick={() => navigate('/mobile?tab=overview')} className="text-[13px] leading-[18px] font-semibold text-brand hover:text-brand/90">
                Systems
              </button>
              <span className="hidden sm:inline text-text-tertiary">•</span>
              <button onClick={() => navigate('/mobile?tab=projects')} className="hidden sm:inline h-6 px-2.5 rounded-10 text-[12px] font-semibold bg-badge-bg text-brand">
                Projects
              </button>
            </div>
          </div>

          {/* List/Kanban/Reports tabs */}
          <div className="inline-flex items-center rounded-10 p-0.5 bg-elev1 h-9 ring-1 ring-line-soft gap-0.5" role="tablist" aria-label="View mode">
            {(
              [
                { key: 'list', label: 'List', Icon: List },
                { key: 'kanban', label: 'Kanban', Icon: Kanban },
                { key: 'reports', label: 'Reports', Icon: BarChart },
              ]
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={viewMode === key}
                onClick={() => setViewMode(key)}
                className={`inline-flex items-center gap-1 h-6 px-2 rounded-10 text-[12px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,.45)] ${
                  viewMode === key
                    ? 'bg-badge-bg text-brand'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover'
                }`}
              >
                <Icon size={14} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              aria-pressed={showAIPanel}
              aria-label="Toggle AI panel"
              className={`h-10 px-4 rounded-10 text-sm font-medium transition ${
                showAIPanel ? 'bg-brand text-text-inverse' : 'bg-elev1 text-text-secondary hover:text-text-primary border border-line-soft'
              }`}
            >
              🤖 AI
            </button>
            <button
              onClick={() => {
                setShowAIChat(!showAIChat);
                // If closing chat, refresh tasks in case any were created via chat
                if (showAIChat) {
                  fetchTasks();
                }
              }}
              aria-pressed={showAIChat}
              aria-label="Toggle Projects Assistant chat"
              className={`h-10 px-4 rounded-10 text-sm font-medium transition ${
                showAIChat ? 'bg-brand text-text-inverse' : 'bg-elev1 text-text-secondary hover:text-text-primary border border-line-soft'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setShowPlanReview(!showPlanReview)}
              aria-pressed={showPlanReview}
              aria-label="Toggle Plan Review"
              className={`h-10 px-4 rounded-10 text-sm font-medium transition ${
                showPlanReview ? 'bg-brand text-text-inverse' : 'bg-elev1 text-text-secondary hover:text-text-primary border border-line-soft'
              }`}
            >
              🗂️ Plan
            </button>
            <Button onClick={() => openTaskModal()} className="gap-1.5 h-10 px-4 text-sm">
            <Plus size={16} />
            New Task
          </Button>
          </div>
        </div>
      </div>

      {/* Push content below the fixed header */}
      <div className="h-14" />

      {/* AI Panel */}
      {showAIPanel && (
        <div className="mb-12 bg-elev1 rounded-xl p-6 border border-line-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-18 font-semibold text-text-primary">AI Assistant</h2>
            <button
              onClick={() => setShowAIPanel(false)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-13 font-medium text-text-secondary mb-2">
                Create task from natural language
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g., 'Create a marketing campaign for product launch next Friday'"
                  className="flex-1 h-9 px-3 rounded-10 bg-surface border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-brand focus:border-transparent transition"
                />
                <button
                  onClick={() => handleAICreateTask()}
                  disabled={!aiInput.trim() || isSubmitting}
                  className="h-9 px-4 rounded-10 bg-brand text-text-inverse font-medium hover:bg-brand-600 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
              <p className="text-12 text-text-tertiary mt-1">
                AI will parse your description and create a structured task with appropriate fields.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Projects Assistant Chat */}
      {showAIChat && (
        <div className="mb-12">
          <ProjectsAssistantChat
            onTasksCreated={handleTasksCreated}
            onNotify={showToast}
            selectedProjectId={selectedProjectId}
          />
        </div>
      )}

      {/* Plan Review */}
      {showPlanReview && (
        <div className="mb-12">
          <PlanReview
            availableProjects={availableProjects}
            selectedProjectId={selectedProjectId}
            onProjectChange={(value) => {
              if (!value) {
                handleProjectSelect(null);
                return;
              }

              const matchingProject = availableProjects.find(project => String(project.id) === String(value));
              handleProjectSelect(matchingProject ? matchingProject.id : value);
            }}
            onTasksCreated={fetchTasks}
            onNotify={showToast}
          />
        </div>
      )}

      {/* Content Area */}
      <div className={`pt-6 pb-8 ${showProjectSidebar ? 'lg:pr-80 xl:pr-[21rem]' : ''}`}>
      {/* Stats Bar */}
        <div className="mt-4 md:mt-6 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => handleFilterChange('status', 'todo')} className="bg-elev1 rounded-xl p-4 border border-line-soft hover:border-brand/40 hover:bg-elev2 transition cursor-pointer text-left" aria-pressed={filters.status === 'todo'} title="Filter: To Do">
          <div className="flex items-center justify-between">
            <div>
                <div className="text-2xl font-bold text-text-primary">{todoCount}</div>
              <div className="text-13 text-text-secondary">To Do</div>
            </div>
            <Circle className="h-6 w-6 text-text-tertiary" />
          </div>
        </button>
        <button onClick={() => handleFilterChange('status', 'in_progress')} className="bg-elev1 rounded-xl p-4 border border-line-soft hover:border-brand/40 hover:bg-elev2 transition cursor-pointer text-left" aria-pressed={filters.status === 'in_progress'} title="Filter: In Progress">
          <div className="flex items-center justify-between">
            <div>
                <div className="text-2xl font-bold text-text-primary">{inProgressCount}</div>
              <div className="text-13 text-text-secondary">In Progress</div>
            </div>
            <Play className="h-6 w-6 text-text-tertiary" />
          </div>
        </button>
        <button onClick={() => handleFilterChange('status', 'done')} className="bg-elev1 rounded-xl p-4 border border-line-soft hover:border-brand/40 hover:bg-elev2 transition cursor-pointer text-left" aria-pressed={filters.status === 'done'} title="Filter: Done">
          <div className="flex items-center justify-between">
            <div>
                <div className="text-2xl font-bold text-text-primary">{doneCount}</div>
              <div className="text-13 text-text-secondary">Done</div>
            </div>
            <CheckCircle className="h-6 w-6 text-text-tertiary" />
          </div>
        </button>
        <div className="bg-elev1 rounded-xl p-4 border border-line-soft">
          <div className="flex items-center justify-between">
            <div>
                <div className="text-2xl font-bold text-text-primary">{totalCount}</div>
              <div className="text-13 text-text-secondary">Total</div>
            </div>
            <BarChart3 className="h-6 w-6 text-text-tertiary" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 sticky top-14 z-40 bg-app/95 backdrop-blur-sm border-b border-line-soft py-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
        <Select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <div className="flex gap-2">
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="created_at">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </Select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      {mainContent}
      {viewMode === 'list' && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing page {pagination.currentPage} of {pagination.totalPages}
            ({pagination.totalTasks} total tasks)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 border border-line-soft rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover text-text-primary"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center gap-1 px-3 py-1 border border-line-soft rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover text-text-primary"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Content Area End */}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-scrim flex items-center justify-center p-4 z-[70]">
          <div className="bg-elev1 rounded-16 shadow-elev2 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-line-soft">
            <div className="flex items-center justify-between p-6 border-b border-line-soft bg-surface rounded-t-16">
              <h2 className="text-[16px] leading-6 font-semibold text-text-primary">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={closeTaskModal}
                className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-hover rounded-10"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Task Title *
                </label>
                <Input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive task title"
                  required
                />
                {!taskFormData.title.trim() && (
                  <p className="mt-2 text-[12px] text-danger flex items-center">
                    <span className="mr-1">⚠️</span> Title is required
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Description
                </label>
                <Textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Add details about this task (optional)"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Project
                </label>
                <Select
                  value={taskFormData.projectId}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, projectId: e.target.value }))}
                >
                  <option value="">📂 No Project (Personal Task)</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      📁 {project.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Status</label>
                  <Select
                    value={taskFormData.status}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Priority</label>
                  <Select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Assignee</label>
                  <Input
                    type="text"
                    value={taskFormData.assigneeId}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                    placeholder="Assign to team member (optional)"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeTaskModal}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !taskFormData.title.trim()}
                >
                  {isSubmitting ? '💾 Saving...' : (isEditing ? '✏️ Update Task' : '✨ Create Task')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 bg-scrim flex items-center justify-center p-4 z-[70]">
          <div className="bg-elev1 rounded-16 shadow-elev2 max-w-md w-full border border-line-soft">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="text-[16px] font-semibold text-text-primary">Delete Task</h2>
              <button
                onClick={closeDeleteModal}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 hover:bg-hover rounded-10"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-6">
                <div className="flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-[14px] font-medium text-text-primary">Delete Task</h3>
                  <p className="text-[13px] text-text-secondary mt-1">
                    Are you sure you want to delete <strong>"{taskToDelete.title}"</strong>?
                    This will also delete all associated notes and cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 h-9 px-3 border border-line-strong rounded-10 text-text-secondary hover:bg-hover transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="flex-1 h-9 px-3 bg-danger text-text-inverse rounded-10 hover:opacity-90 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSuccess={handleProjectModalSuccess}
      />

      {/* Admin Navigation Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-scrim backdrop-blur-sm z-40 transition-all duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Admin Navigation Sidebar */}
      <div className={`fixed top-0 left-0 w-[280px] h-full bg-surface z-50 border-r border-line-soft transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4 p-3 pb-3 border-b border-line-soft">
          <div className="text-[18px] leading-6 font-semibold text-text-primary">Yirra Admin</div>
          <button
            className="bg-danger/10 border border-danger/20 rounded-10 p-2 text-danger hover:bg-danger/20 active:scale-95 transition-all"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto p-3 pt-0 space-y-6">
          <div>
            <div className="h-9 rounded-10 bg-elev1 border border-line-soft flex items-center px-3 gap-2">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary text-[13px]" placeholder="Search…" />
            </div>
          </div>

          <div>
            <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Dashboard</div>
            <button
              className={navItemClass('/overview')}
              aria-current={navItemAriaCurrent('/overview')}
              onClick={() => { navigate('/mobile?tab=overview'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Overview
            </button>
            <button
              className={navItemClass('/projects')}
              aria-current={navItemAriaCurrent('/projects')}
              onClick={() => { navigate('/mobile?tab=projects'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
              </svg>
              Projects
            </button>
            <button
              className={navItemClass('/products')}
              aria-current={navItemAriaCurrent('/products')}
              onClick={() => { navigate('/mobile?tab=products'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Products
            </button>
            <button
              className={navItemClass('/orders')}
              aria-current={navItemAriaCurrent('/orders')}
              onClick={() => { navigate('/mobile?tab=orders'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Orders
            </button>
            <button
              className={navItemClass('/customers')}
              aria-current={navItemAriaCurrent('/customers')}
              onClick={() => { navigate('/mobile?tab=customers'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Customers
            </button>
            <button
              className={navItemClass('/inventory')}
              aria-current={navItemAriaCurrent('/inventory')}
              onClick={() => { navigate('/mobile?tab=inventory'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Inventory
            </button>
            <button
              className={navItemClass('/fulfillment')}
              aria-current={navItemAriaCurrent('/fulfillment')}
              onClick={() => { navigate('/mobile?tab=fulfillment'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Fulfillment
            </button>
            <button
              className={navItemClass('/stl-files')}
              aria-current={navItemAriaCurrent('/stl-files')}
              onClick={() => { navigate('/mobile?tab=stl-files'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0H8l.5 16h7L16 4z" />
              </svg>
              STL Files
            </button>
            <button
              className={navItemClass('/analytics')}
              aria-current={navItemAriaCurrent('/analytics')}
              onClick={() => { navigate('/mobile?tab=reports'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>

          <div>
            <div className="text-[12px] leading-[18px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-1">Management</div>
            <button
              className={navItemClass('/users')}
              aria-current={navItemAriaCurrent('/users')}
              onClick={() => { navigate('/mobile?tab=users'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Users
            </button>
            <button
              className={navItemClass('/settings')}
              aria-current={navItemAriaCurrent('/settings')}
              onClick={() => { navigate('/mobile?tab=settings'); setSidebarOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Project Sidebar */}
      <ProjectSidebar
        isOpen={showProjectSidebar}
        onToggle={() => setShowProjectSidebar(!showProjectSidebar)}
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        refreshTrigger={projectRefreshTrigger}
      />
    </div>
  );
};

export default AdminProjectManagement;
