import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Calendar, Folder } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: '',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        startDate: '',
        dueDate: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (due < start) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();

      const method = project ? 'PUT' : 'POST';
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description,
          status: formData.status,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess && onSuccess(result);
        onClose();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to save project' });
      }
    } catch (error) {
      console.error('Project save error:', error);
      setErrors({ submit: 'Failed to save project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-scrim backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-16 shadow-elev2 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-line-soft">
        <div className="flex items-center justify-between p-6 border-b border-line-soft bg-gradient-to-r from-elev1 to-elev2 rounded-t-16">
          <h2 className="text-[18px] font-semibold text-text-primary flex items-center gap-2">
            <Folder size={20} />
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 hover:bg-hover rounded-10"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-[14px] font-medium text-text-primary mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full h-10 px-3 rounded-10 bg-elev1 border ${
                errors.name ? 'border-danger' : 'border-line-soft'
              } text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-brand focus:border-transparent transition`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-[12px] text-danger">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[14px] font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-20 px-3 py-2 rounded-10 bg-elev1 border border-line-soft text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-brand focus:border-transparent transition resize-none"
              placeholder="Describe the project..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[14px] font-medium text-text-primary mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full h-10 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-brand focus:border-transparent transition"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-2 flex items-center gap-1">
                <Calendar size={14} />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-10 bg-elev1 border border-line-soft text-text-primary focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-2 flex items-center gap-1">
                <Calendar size={14} />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className={`w-full h-10 px-3 rounded-10 bg-elev1 border ${
                  errors.dueDate ? 'border-danger' : 'border-line-soft'
                } text-text-primary focus:ring-2 focus:ring-brand focus:border-transparent transition`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-[12px] text-danger">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-10">
              <p className="text-[13px] text-danger">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 px-4 rounded-10 border border-line-soft text-text-secondary hover:bg-hover transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 px-4 rounded-10 bg-brand text-text-inverse font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
