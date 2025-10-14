import React, { useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { CheckCircle2, ClipboardList, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

const PlanReview = ({
  availableProjects = [],
  selectedProjectId,
  onProjectChange,
  onTasksCreated,
  onNotify,
}) => {
  const { getToken } = useAuth();
  const [planText, setPlanText] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const plannedTasks = useMemo(() => {
    return planText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }, [planText]);

  const handleCreateTasks = async () => {
    if (plannedTasks.length === 0) {
      setError('Add at least one task description before creating tasks.');
      onNotify?.('error', 'Add at least one task description before creating tasks.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required to create tasks.');
      }

      const createdTasks = [];
      for (const title of plannedTasks) {
        const response = await fetch('/api/admin/projects/tasks', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description: null,
            projectId: selectedProjectId || null,
            status,
            priority,
            dueDate: null,
            assigneeId: null,
          }),
        });

        if (!response.ok) {
          const message = await response
            .json()
            .then(data => data.error || 'Failed to create task')
            .catch(() => 'Failed to create task');
          throw new Error(message);
        }

        const createdTask = await response.json();
        createdTasks.push(createdTask);
      }

      onNotify?.('success', `${createdTasks.length} planned task${createdTasks.length > 1 ? 's' : ''} created successfully.`);
      setPlanText('');
      if (onTasksCreated) {
        await onTasksCreated();
      }
    } catch (err) {
      console.error('Plan creation error:', err);
      const message = err?.message || 'Failed to create planned tasks.';
      setError(message);
      onNotify?.('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProject = availableProjects.find(project => String(project.id) === String(selectedProjectId));

  return (
    <section className="bg-elev1 border border-line-soft rounded-16 shadow-elev1 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 text-text-primary">
          <ClipboardList size={24} className="text-brand" />
          <div>
            <h2 className="text-[18px] font-semibold leading-6">Project Planning</h2>
            <p className="text-[13px] text-text-secondary">
              Paste or type one task per line and create them in bulk with a single click.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-text-secondary">
          <CheckCircle2 size={18} className="text-success" />
          {plannedTasks.length} task{plannedTasks.length === 1 ? '' : 's'} ready
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)]">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="block text-[12px] font-semibold text-text-secondary mb-2">Assign to project</label>
            <Select
              value={selectedProjectId || ''}
              onChange={(event) => onProjectChange?.(event.target.value)}
            >
              <option value="">📂 No project (personal tasks)</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  📁 {project.name}
                </option>
              ))}
            </Select>
            {selectedProject && (
              <p className="mt-2 text-[12px] text-text-tertiary">
                Tasks will be created under <span className="font-medium text-text-secondary">{selectedProject.name}</span>.
              </p>
            )}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-2">Default status</label>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="todo">📋 To do</option>
              <option value="in_progress">⚡ In progress</option>
              <option value="done">✅ Done</option>
            </Select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-secondary mb-2">Default priority</label>
            <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-secondary mb-2">
            Plan tasks (one per line)
          </label>
          <Textarea
            value={planText}
            onChange={(event) => {
              if (error) {
                setError(null);
              }
              setPlanText(event.target.value);
            }}
            placeholder={'e.g.\nDefine project scope\nDraft initial requirements\nSchedule kickoff meeting'}
            rows={8}
          />
          <p className="mt-2 text-[12px] text-text-tertiary">
            Tip: include due dates or owners in parentheses to remind yourself (e.g. "Book venue (due Friday)").
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-12 border border-danger/40 bg-danger/10 p-3 text-[13px] text-danger">
          <AlertTriangle size={16} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[12px] text-text-tertiary">
          {selectedProjectId ? 'Tasks will automatically inherit the selected project.' : 'Tasks will be created without a project.'}
        </span>
        <Button
          type="button"
          className="flex items-center gap-2"
          onClick={handleCreateTasks}
          disabled={isSubmitting || plannedTasks.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Create {plannedTasks.length > 0 ? `${plannedTasks.length} ` : ''}task{plannedTasks.length === 1 ? '' : 's'}
            </>
          )}
        </Button>
      </footer>
    </section>
  );
};

export default PlanReview;
