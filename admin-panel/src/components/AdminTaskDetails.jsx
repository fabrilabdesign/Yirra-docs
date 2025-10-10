import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Plus, Save, Trash2, Calendar, MessageSquare } from 'lucide-react';

const AdminTaskDetails = ({ taskId, onBack }) => {
  const { getToken } = useAuth();
  const [task, setTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: ''
  });
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setEditFormData({
          title: data.task.title,
          description: data.task.description || ''
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
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTask(updatedTask);
        setIsEditing(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update task');
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
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add note');
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
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Note delete error:', err);
      setError('Failed to delete note');
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} />
          Back to Tasks
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
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
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Task Information'}
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit Task
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter task description"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditFormData({
                    title: task.title,
                    description: task.description || ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting || !editFormData.title.trim()}
              >
                <Save size={16} />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-lg font-medium text-gray-900">{task.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-gray-700">{task.description || 'No description provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                {formatDate(task.created_at)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                {formatDate(task.updated_at)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} />
            Notes ({notes.length})
          </h2>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Note
          </button>
        </div>

        {/* Add Note Form */}
        {showAddNote && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              rows={3}
              placeholder="Enter your note..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNewNoteText('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={isSubmitting || !newNoteText.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add the first note to this task.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 whitespace-pre-wrap">{note.note_text}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(note.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 p-1 ml-2"
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
    </div>
  );
};

export default AdminTaskDetails;

