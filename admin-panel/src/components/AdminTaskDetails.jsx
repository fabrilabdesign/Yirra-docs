import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Plus, Save, Trash2, Calendar, MessageSquare } from 'lucide-react';

const AdminTaskDetails = ({ taskId, onBack }) => {
  const { getToken } = useAuth();
  const [task, setTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assigneeId: ''
  });
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [subTaskForm, setSubTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assigneeId: ''
  });
  const [timeEntries, setTimeEntries] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [timeForm, setTimeForm] = useState({
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type, message }

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'todo': return 'bg-[rgba(255,255,255,.06)] text-text-secondary';
      case 'in_progress': return 'bg-[rgba(99,102,241,.12)] text-brand';
      case 'done': return 'bg-[rgba(34,197,94,.12)] text-success';
      default: return 'bg-[rgba(255,255,255,.06)] text-text-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low': return 'bg-[rgba(34,197,94,.12)] text-success';
      case 'medium': return 'bg-[rgba(245,158,11,.12)] text-warning';
      case 'high': return 'bg-[rgba(239,68,68,.12)] text-danger';
      default: return 'bg-[rgba(255,255,255,.06)] text-text-secondary';
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`/api/admin/projects/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTask(data.task);
        setNotes(data.notes);
        setSubTasks(data.children || []);
        setTimeEntries(data.timeEntries || []);
        setTotalHours(data.totalHours || 0);

        // Fetch AI suggestions for this task
        fetchAISuggestions();
        setEditFormData({
          title: data.task.title,
          description: data.task.description || '',
          status: data.task.status || 'todo',
          priority: data.task.priority || 'medium',
          dueDate: data.task.due_date ? new Date(data.task.due_date).toISOString().slice(0,10) : '',
          assigneeId: data.task.assignee_id || ''
        });
        setError(null);
      } else if (response.status === 404) {
        setError('Task not found');
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        throw new Error('Failed to fetch task details');
      }
    } catch (err) {
      console.error('Task details fetch error:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async () => {
    if (!editFormData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description || null,
          status: editFormData.status || 'todo',
          priority: editFormData.priority || 'medium',
          dueDate: editFormData.dueDate || null,
          assigneeId: editFormData.assigneeId || null
        })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTask(updatedTask);
        setIsEditing(false);
        setError(null);
        showToast('success', 'Task updated');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update task');
        showToast('error', errorData.error || 'Failed to update task');
      }
    } catch (err) {
      console.error('Task update error:', err);
      setError('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${taskId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note_text: newNoteText.trim() })
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [newNote, ...prev]); // Add to beginning since notes are ordered newest first
        setNewNoteText('');
        setShowAddNote(false);
        setError(null);
        showToast('success', 'Note added');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add note');
        showToast('error', errorData.error || 'Failed to add note');
      }
    } catch (err) {
      console.error('Note add error:', err);
      setError('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        setError(null);
        showToast('success', 'Note deleted');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete note');
        showToast('error', errorData.error || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Note delete error:', err);
      setError('Failed to delete note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTimeEntry = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${task.id}/time-entries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(timeForm)
      });

      if (response.ok) {
        const newEntry = await response.json();
        setTimeEntries(prev => [newEntry, ...prev]);
        setTotalHours(prev => prev + parseFloat(timeForm.hours));
        setShowAddTimeModal(false);
        setTimeForm({
          hours: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        setError(null);
        showToast('success', 'Time logged successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to log time');
        showToast('error', errorData.error || 'Failed to log time');
      }
    } catch (err) {
      console.error('Time entry error:', err);
      setError('Failed to log time');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTimeEntry = async (entryId) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/time-entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const deletedEntry = timeEntries.find(e => e.id === entryId);
        setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
        if (deletedEntry) {
          setTotalHours(prev => prev - deletedEntry.hours);
        }
        setError(null);
        showToast('success', 'Time entry deleted');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete time entry');
        showToast('error', errorData.error || 'Failed to delete time entry');
      }
    } catch (err) {
      console.error('Time entry delete error:', err);
      setError('Failed to delete time entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/projects/ai/suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter suggestions for this task
        const taskSuggestions = data.suggestions.filter(s => s.taskId === task.id);
        setAiSuggestions(taskSuggestions);
      }
    } catch (error) {
      console.error('AI suggestions fetch error:', error);
    }
  };

  const handleAISmartBreakdown = async () => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${task.id}/ai/breakdown`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast('success', 'AI suggested task breakdown! Check suggestions below.');
        fetchAISuggestions(); // Refresh suggestions
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to generate breakdown');
      }
    } catch (error) {
      console.error('AI breakdown error:', error);
      showToast('error', 'Failed to generate task breakdown');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIPriorityScore = async () => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${task.id}/ai/priority`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast('success', 'AI analyzed priority! Check suggestions below.');
        fetchAISuggestions(); // Refresh suggestions
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to analyze priority');
      }
    } catch (error) {
      console.error('AI priority error:', error);
      showToast('error', 'Failed to analyze task priority');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAITimelineEstimate = async () => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/tasks/${task.id}/ai/timeline`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast('success', 'AI estimated timeline! Check suggestions below.');
        fetchAISuggestions(); // Refresh suggestions
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to estimate timeline');
      }
    } catch (error) {
      console.error('AI timeline error:', error);
      showToast('error', 'Failed to estimate task timeline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/ai/suggestions/${suggestionId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('success', 'AI suggestion accepted!');
        fetchAISuggestions(); // Refresh suggestions
        // Refresh task data to show changes
        fetchTaskDetails();
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to accept suggestion');
      }
    } catch (error) {
      console.error('Accept suggestion error:', error);
      showToast('error', 'Failed to accept AI suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissSuggestion = async (suggestionId) => {
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch(`/api/admin/projects/ai/suggestions/${suggestionId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('success', 'AI suggestion dismissed');
        fetchAISuggestions(); // Refresh suggestions
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to dismiss suggestion');
      }
    } catch (error) {
      console.error('Dismiss suggestion error:', error);
      showToast('error', 'Failed to dismiss AI suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubTask = async (e) => {
    e.preventDefault();
    if (!subTaskForm.title.trim()) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await fetch('/api/admin/projects/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: subTaskForm.title,
          description: subTaskForm.description,
          parentId: taskId,
          status: subTaskForm.status,
          priority: subTaskForm.priority,
          dueDate: subTaskForm.dueDate,
          assigneeId: subTaskForm.assigneeId
        })
      });

      if (response.ok) {
        const newSubTask = await response.json();
        setSubTasks(prev => [...prev, {
          id: newSubTask.id,
          title: newSubTask.title,
          status: newSubTask.status,
          priority: newSubTask.priority,
          due_date: newSubTask.due_date,
          assignee_id: newSubTask.assignee_id
        }]);
        setSubTaskForm({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          assigneeId: ''
        });
        setShowAddSubTaskModal(false);
        showToast('success', 'Sub-task created');
      } else {
        const errorData = await response.json();
        showToast('error', errorData.error || 'Failed to create sub-task');
      }
    } catch (err) {
      console.error('Sub-task create error:', err);
      showToast('error', 'Failed to create sub-task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Tasks
        </button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-12 shadow-elev2 border ${toast.type === 'success' ? 'bg-success text-text-inverse border-success' : 'bg-danger text-text-inverse border-danger'}`}>
          {toast.message}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand hover:opacity-90"
        >
          <ArrowLeft size={20} />
          Back to Tasks
        </button>
        <div className="flex-1">
          <h1 className="text-[18px] leading-6 font-semibold text-text-primary">Task Details</h1>
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

      {/* Task Details */}
      <div className="bg-surface rounded-12 shadow-elev1 p-6 mb-6 border border-line-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] leading-6 font-semibold text-text-primary">
            {isEditing ? 'Edit Task' : 'Task Information'}
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="h-9 px-4 rounded-10 bg-brand text-text-inverse font-semibold hover:bg-brand-600 active:bg-brand-700 transition"
            >
              Edit Task
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                rows={4}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">Priority</label>
                <select
                  value={editFormData.priority}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">Due date</label>
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">Assignee ID</label>
                <input
                  type="text"
                  value={editFormData.assigneeId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  placeholder="optional"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditFormData({
                    title: task.title,
                    description: task.description || '',
                    status: task.status || 'todo',
                    priority: task.priority || 'medium',
                    dueDate: task.due_date ? new Date(task.due_date).toISOString().slice(0,10) : '',
                    assigneeId: task.assignee_id || ''
                  });
                }}
                className="h-9 px-4 border border-line-strong rounded-10 text-text-secondary hover:bg-hover"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="flex items-center gap-2 h-9 px-4 bg-brand text-text-inverse rounded-10 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50"
                disabled={isSubmitting || !editFormData.title.trim()}
              >
                <Save size={16} />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[12px] font-medium text-text-tertiary mb-1">Title</h3>
                <p className="text-[16px] leading-6 font-semibold text-text-primary">{task.title}</p>
              </div>
              <div>
                <h3 className="text-[12px] font-medium text-text-tertiary mb-1">Description</h3>
                <p className="text-text-secondary bg-elev1 border border-line-soft rounded-10 p-3">{task.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-[12px] font-medium text-text-tertiary mb-2">Status & Priority</h3>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(task.status)}`}>
                    {task.status === 'in_progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : task.status || 'To Do'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority || 'medium'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-[12px] font-medium text-text-tertiary mb-1">Created</h3>
                <div className="flex items-center text-[13px] text-text-tertiary">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(task.created_at)}
                </div>
              </div>
              <div>
                <h3 className="text-[12px] font-medium text-text-tertiary mb-1">Last Updated</h3>
                <div className="flex items-center text-[13px] text-text-tertiary">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(task.updated_at)}
                </div>
              </div>
              {task.due_date && (
                <div>
                  <h3 className="text-[12px] font-medium text-text-tertiary mb-1">Due Date</h3>
                  <div className="flex items-center text-[13px] text-text-tertiary">
                    <Calendar size={16} className="mr-2" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="bg-surface rounded-12 shadow-elev1 p-6 border border-line-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare size={20} />
            Notes ({notes.length})
          </h2>
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="flex items-center gap-2 h-9 px-4 bg-success text-text-inverse rounded-10 hover:opacity-90 text-[13px]"
          >
            <Plus size={16} />
            Add Note
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-text-tertiary" />
              <h3 className="mt-2 text-[12px] font-medium text-text-primary">No notes yet</h3>
              <p className="mt-1 text-[13px] text-text-tertiary">
                Add the first note to this task.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border border-line-soft rounded-12 p-4 bg-elev1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-text-primary whitespace-pre-wrap">{note.note_text}</p>
                    <div className="flex items-center mt-2 text-[13px] text-text-tertiary">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(note.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-danger hover:opacity-90 p-1 ml-2"
                    title="Delete note"
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sub-tasks Section */}
      <div className="bg-surface rounded-12 shadow-elev1 p-6 mt-6 border border-line-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
            <MessageSquare size={20} />
            Sub-tasks ({subTasks.length})
          </h2>
          <button
            onClick={() => setShowAddSubTaskModal(true)}
            className="flex items-center gap-2 h-9 px-4 bg-brand text-text-inverse rounded-10 hover:bg-brand-600"
          >
            <Plus size={16} />
            Add Sub-task
          </button>
        </div>

        {/* Sub-tasks List */}
        <div className="space-y-3">
          {subTasks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-text-tertiary" />
              <h3 className="mt-2 text-[12px] font-medium text-text-primary">No sub-tasks yet</h3>
              <p className="mt-1 text-[13px] text-text-tertiary">
                Break this task into smaller steps.
              </p>
            </div>
          ) : (
            subTasks.map((subTask) => (
              <div key={subTask.id} className="bg-elev1 rounded-12 p-4 border border-line-soft">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary">{subTask.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(subTask.status)}`}>
                        {subTask.status === 'in_progress' ? 'In Progress' : subTask.status === 'todo' ? 'To Do' : subTask.status || 'To Do'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(subTask.priority)}`}>
                        {subTask.priority || 'medium'}
                      </span>
                      {subTask.due_date && (
                        <span className="text-[12px] text-text-tertiary">
                          Due: {new Date(subTask.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onBack && onBack(subTask)} // Navigate to sub-task details
                    className="text-brand hover:opacity-90 p-1"
                    title="View sub-task"
                  >
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-scrim flex items-center justify-center p-4 z-50">
          <div className="bg-elev1 rounded-16 shadow-elev2 max-w-md w-full border border-line-soft">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="text-[16px] font-semibold text-text-primary">Add Note</h2>
              <button
                onClick={() => {
                  setShowAddNoteModal(false);
                  setNewNoteText('');
                }}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddNote(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Note Text
                </label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full px-3 py-3 border border-line-soft rounded-10 focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand bg-elev1 text-text-primary placeholder:text-text-tertiary transition-colors"
                  rows={4}
                  placeholder="Enter your note..."
                  required
                />
                {!newNoteText.trim() && (
                  <p className="mt-1 text-[12px] text-danger">Note text is required</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setNewNoteText('');
                  }}
                  className="flex-1 h-9 px-3 border border-line-strong rounded-10 text-text-secondary hover:bg-hover transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 px-3 bg-success text-text-inverse rounded-10 hover:opacity-90 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting || !newNoteText.trim()}
                >
                  {isSubmitting ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Planning Section */}
      <div className="bg-surface rounded-12 shadow-elev1 p-6 mt-6 border border-line-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
            🤖 AI Planning
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleAISmartBreakdown()}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-10 bg-brand text-text-inverse font-medium hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Processing...' : 'Smart Breakdown'}
            </button>
            <button
              onClick={() => handleAIPriorityScore()}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-10 bg-accent-secondary text-text-inverse font-medium hover:opacity-80 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Analyzing...' : 'Priority Analysis'}
            </button>
          </div>

          <div>
            <button
              onClick={() => handleAITimelineEstimate()}
              disabled={isSubmitting}
              className="w-full h-10 px-4 rounded-10 bg-success text-text-inverse font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Estimating...' : 'Timeline Estimate'}
            </button>
          </div>
        </div>

        {/* AI Suggestions Display */}
        {aiSuggestions.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-[14px] font-medium text-text-primary">AI Suggestions</h3>
            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 bg-elev1 border border-line-soft rounded-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px] font-medium text-text-primary capitalize">
                        {suggestion.type} Suggestion
                      </span>
                      <span className={`px-2 py-1 rounded text-[11px] font-medium ${
                        suggestion.confidence > 0.8 ? 'bg-success/20 text-success' :
                        suggestion.confidence > 0.6 ? 'bg-warning/20 text-warning' :
                        'bg-danger/20 text-danger'
                      }`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-[13px] text-text-secondary mb-3">{suggestion.rationale}</p>

                    {suggestion.type === 'priority' && suggestion.data?.suggestedPriority && (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-text-secondary">Suggested Priority:</span>
                        <span className={`px-2 py-1 rounded text-[11px] font-medium ${
                          suggestion.data.suggestedPriority === 'high' ? 'bg-danger/20 text-danger' :
                          suggestion.data.suggestedPriority === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          {suggestion.data.suggestedPriority}
                        </span>
                      </div>
                    )}

                    {suggestion.type === 'timeline' && suggestion.data && (
                      <div className="text-[13px] text-text-secondary">
                        Estimated: {suggestion.data.estimatedHours}h ({suggestion.data.confidence} confidence)
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      className="px-3 py-1.5 bg-success text-text-inverse text-[12px] rounded-10 hover:opacity-90 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDismissSuggestion(suggestion.id)}
                      className="px-3 py-1.5 bg-text-tertiary text-text-inverse text-[12px] rounded-10 hover:opacity-80 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Tracking Section */}
      <div className="bg-surface rounded-12 shadow-elev1 p-6 mt-6 border border-line-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
            <Clock size={20} />
            Time Tracking ({totalHours.toFixed(1)} hours)
          </h2>
          <button
            onClick={() => setShowAddTimeModal(true)}
            className="flex items-center gap-2 h-9 px-4 bg-brand text-text-inverse rounded-10 hover:bg-brand-600"
          >
            <Plus size={16} />
            Log Time
          </button>
        </div>

        {/* Time Entries List */}
        <div className="space-y-3">
          {timeEntries.length === 0 ? (
            <p className="text-text-tertiary text-center py-4">No time logged yet</p>
          ) : (
            timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-elev1 border border-line-soft rounded-12">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-text-primary">{entry.hours}h</span>
                    <span className="text-[13px] text-text-tertiary">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  {entry.description && (
                    <p className="text-[13px] text-text-secondary">{entry.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // TODO: Edit time entry
                    }}
                    className="text-brand hover:opacity-90 p-1"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTimeEntry(entry.id)}
                    className="text-danger hover:opacity-90 p-1"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Time Entry Modal */}
      {showAddTimeModal && (
        <div className="fixed inset-0 bg-scrim flex items-center justify-center p-4 z-50">
          <div className="bg-elev1 rounded-16 shadow-elev2 max-w-md w-full max-h-[90vh] overflow-y-auto border border-line-soft">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="text-[16px] font-semibold text-text-primary">Log Time</h2>
              <button
                onClick={() => {
                  setShowAddTimeModal(false);
                  setTimeForm({
                    hours: '',
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                }}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form onSubmit={handleAddTimeEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Hours *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={timeForm.hours}
                  onChange={(e) => setTimeForm(prev => ({ ...prev, hours: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  placeholder="2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={timeForm.date}
                  onChange={(e) => setTimeForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={timeForm.description}
                  onChange={(e) => setTimeForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  rows={3}
                  placeholder="What did you work on?"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTimeModal(false);
                    setTimeForm({
                      hours: '',
                      date: new Date().toISOString().split('T')[0],
                      description: ''
                    });
                  }}
                className="flex-1 h-9 px-3 border border-line-strong rounded-10 text-text-secondary hover:bg-hover transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                className="flex-1 h-9 px-3 bg-brand text-text-inverse rounded-10 hover:bg-brand-600 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting || !timeForm.hours || !timeForm.date}
                >
                  {isSubmitting ? 'Logging...' : 'Log Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sub-task Modal */}
      {showAddSubTaskModal && (
        <div className="fixed inset-0 bg-scrim flex items-center justify-center p-4 z-50">
          <div className="bg-elev1 rounded-16 shadow-elev2 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-line-soft">
            <div className="flex items-center justify-between p-6 border-b border-line-soft">
              <h2 className="text-[16px] font-semibold text-text-primary">Add Sub-task</h2>
              <button
                onClick={() => {
                  setShowAddSubTaskModal(false);
                  setSubTaskForm({
                    title: '',
                    description: '',
                    status: 'todo',
                    priority: 'medium',
                    dueDate: '',
                    assigneeId: ''
                  });
                }}
                className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-hover rounded-10"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <form onSubmit={handleCreateSubTask} className="p-6 space-y-6">
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Sub-task Title *
                </label>
                <input
                  type="text"
                  value={subTaskForm.title}
                  onChange={(e) => setSubTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  placeholder="Enter sub-task title"
                  required
                />
                {!subTaskForm.title.trim() && (
                  <p className="mt-2 text-[12px] text-danger flex items-center">
                    <span className="mr-1">⚠️</span> Title is required
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={subTaskForm.description}
                  onChange={(e) => setSubTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-3 border border-line-soft rounded-10 focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand transition-all duration-200 bg-elev1 text-text-primary placeholder:text-text-tertiary resize-none"
                  rows={3}
                  placeholder="Describe this sub-task (optional)"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Status</label>
                  <select
                    value={subTaskForm.status}
                    onChange={(e) => setSubTaskForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Priority</label>
                  <select
                    value={subTaskForm.priority}
                    onChange={(e) => setSubTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Due Date</label>
                  <input
                    type="date"
                    value={subTaskForm.dueDate}
                    onChange={(e) => setSubTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-2">Assignee</label>
                  <input
                    type="text"
                    value={subTaskForm.assigneeId}
                    onChange={(e) => setSubTaskForm(prev => ({ ...prev, assigneeId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-[rgba(99,102,241,.45)] focus:border-brand"
                    placeholder="Assign to team member (optional)"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubTaskModal(false);
                    setSubTaskForm({
                      title: '',
                      description: '',
                      status: 'todo',
                      priority: 'medium',
                      dueDate: '',
                      assigneeId: ''
                    });
                  }}
                  className="flex-1 h-9 px-4 border border-line-strong rounded-10 text-text-secondary hover:bg-hover transition-all duration-200 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 px-4 bg-brand text-text-inverse rounded-10 hover:bg-brand-600 disabled:opacity-50 transition-all duration-200 font-semibold shadow-elev1 hover:shadow-elev2"
                  disabled={isSubmitting || !subTaskForm.title.trim()}
                >
                  {isSubmitting ? '💾 Creating...' : '✨ Create Sub-task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskDetails;

