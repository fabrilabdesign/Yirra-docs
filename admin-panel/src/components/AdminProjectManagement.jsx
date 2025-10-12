import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
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

const AdminProjectManagement = () => {
  const { getToken } = useAuth();
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

  useEffect(() => {
    fetchTasks();
  }, [pagination.currentPage, filters, selectedProjectId]);

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  const fetchTasks = async () => {
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
      setTasks([]); // Reset tasks on error
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleTaskDetailsBack = (taskOrId) => {
    if (taskOrId) {
      if (typeof taskOrId === 'object') {
        // Navigate to sub-task details
        setSelectedTask(taskOrId);
      } else {
        // subTaskId string (legacy)
        const subTask = tasks.find(t => t.id === taskOrId);
        if (subTask) {
          setSelectedTask(subTask);
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
        body: JSON.stringify({ text: aiInput.trim() })
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
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
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
          taskId={selectedTask.id}
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
    <div className="max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded shadow text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Fixed Header (full width at the very top) */}
      <div className="fixed inset-x-0 top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-line-soft">
        <div className="max-w-7xl mx-auto h-14 px-4 flex items-center justify-between">
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
              className={`${viewMode === key ? 'bg-badge-bg text-brand' : 'text-text-secondary hover:text-text-primary hover:bg-hover'} inline-flex items-center gap-1.5 h-8 px-3 rounded-10 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,.45)]`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text-primary">Project Management</h1>
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
            <Button onClick={() => openTaskModal()} className="gap-1.5 h-10 px-4 text-sm">
              <Plus size={16} />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Push content below the fixed header (header is h-14 => 56px) */}
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

      {/* Content Area */}
      <div className="px-6 pt-8 pb-12">
        {/* Stats Bar */}
        <div className="mt-10 md:mt-12 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-elev1 rounded-xl p-4 border border-line-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">{todoCount}</div>
                <div className="text-13 text-text-secondary">To Do</div>
              </div>
              <Circle className="h-6 w-6 text-text-tertiary" />
            </div>
          </div>
          <div className="bg-elev1 rounded-xl p-4 border border-line-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">{inProgressCount}</div>
                <div className="text-13 text-text-secondary">In Progress</div>
              </div>
              <Play className="h-6 w-6 text-text-tertiary" />
            </div>
          </div>
          <div className="bg-elev1 rounded-xl p-4 border border-line-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">{doneCount}</div>
                <div className="text-13 text-text-secondary">Done</div>
              </div>
              <CheckCircle className="h-6 w-6 text-text-tertiary" />
            </div>
          </div>
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
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
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
    </div>
  );
};

export default AdminProjectManagement;
