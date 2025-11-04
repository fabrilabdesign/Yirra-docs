import React, { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ClipboardList, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

// LLM Planning UI with project selection
// Props:
// - availableProjects: [{id, name}] list
// - selectedProjectId: preselected project id (string)
// - onProjectChange: (id) => void
// - onTasksCreated: () => Promise<void>
// - onNotify: (type, message) => void
const PlanReview = ({
  availableProjects = [],
  selectedProjectId,
  onProjectChange,
  onTasksCreated,
  onNotify,
}) => {
  const { getToken } = useAuth();

  // Project selection state (initialized from parent)
  const [projectId, setProjectId] = useState(selectedProjectId || '');

  // Prompt for proposing plan
  const [userPrompt, setUserPrompt] = useState('');
  const [isProposing, setIsProposing] = useState(false);
  const [error, setError] = useState(null);

  // Suggestions state
  const [conversationId, setConversationId] = useState('');
  const [suggestions, setSuggestions] = useState([]); // [{id,title,description,priority,...}]
  const plannedCount = suggestions.length;

  const selectedProject = useMemo(() => (
    availableProjects.find(p => String(p.id) === String(projectId))
  ), [availableProjects, projectId]);

  const handleProposePlan = useCallback(async () => {
    const prompt = userPrompt.trim();
    if (!prompt) {
      setError('Please enter a short planning prompt.');
      onNotify?.('error', 'Please enter a short planning prompt.');
      return;
    }

    try {
      setIsProposing(true);
      setError(null);
      setSuggestions([]);

      const token = await getToken();
      const proposePayload = { userPrompt: prompt };
      if (projectId) proposePayload.projectId = projectId;
      const res = await fetch('/api/admin/projects/ai/plan', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposePayload),
      });

      if (!res.ok) {
        const msg = await res.json().then(d => d.error || 'Failed to propose plan').catch(() => 'Failed to propose plan');
        throw new Error(msg);
      }

      const data = await res.json();
      const convId = data.conversation_id || '';
      const list = Array.isArray(data.suggestions) ? data.suggestions : [];
      setConversationId(convId);
      setSuggestions(list);
      onNotify?.('success', `Proposed ${list.length} items${projectId ? ` for project ${selectedProject?.name || projectId}` : ''}.`);
    } catch (e) {
      setError(e?.message || 'Failed to propose plan');
      onNotify?.('error', e?.message || 'Failed to propose plan');
    } finally {
      setIsProposing(false);
    }
  }, [userPrompt, projectId, getToken, onNotify, selectedProject]);

  const computeIdempotencyKey = useCallback(async (convId, selectionList) => {
    const base = `${convId || 'no-conv'}:${selectionList.map(s => s.suggestionId).join(',')}`;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(base);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `${convId || 'no-conv'}:${hashHex.slice(0, 24)}`;
    } catch (e) {
      const fallback = `${convId || 'no-conv'}:${selectionList.length}:${selectionList[0]?.suggestionId || ''}:${selectionList[selectionList.length - 1]?.suggestionId || ''}`;
      return fallback.slice(0, 100);
    }
  }, []);

  const handleCommit = useCallback(async (selectionList) => {
    try {
      setIsProposing(true);
      const token = await getToken();
      const idempotencyKey = await computeIdempotencyKey(conversationId, selectionList);
      const commitPayload = { idempotencyKey, selections: selectionList };
      if (projectId) commitPayload.projectId = projectId;
      if (conversationId) commitPayload.conversationId = conversationId;
      const res = await fetch('/api/admin/projects/ai/commit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitPayload),
      });
      if (!res.ok) {
        const msg = await res.json().then(d => d.error || 'Failed to create tasks').catch(() => 'Failed to create tasks');
        throw new Error(msg);
      }
      const out = await res.json();
      const createdCount = Array.isArray(out.created) ? out.created.length : 0;
      const failedCount = Array.isArray(out.errors) ? out.errors.length : 0;
      onNotify?.('success', `Created ${createdCount} task(s)${failedCount ? `, ${failedCount} failed` : ''}.`);
      // Refresh
      await onTasksCreated?.();
    } catch (e) {
      setError(e?.message || 'Failed to create tasks from plan');
      onNotify?.('error', e?.message || 'Failed to create tasks from plan');
    } finally {
      setIsProposing(false);
    }
  }, [conversationId, projectId, getToken, onNotify, onTasksCreated, computeIdempotencyKey]);

  const handleAcceptAll = useCallback(async () => {
    if (plannedCount === 0) return;
    const selections = suggestions.map(s => ({ suggestionId: s.id, override: {} }));
    await handleCommit(selections);
    // Reset UI
    setUserPrompt('');
    setSuggestions([]);
    setConversationId('');
  }, [plannedCount, suggestions, handleCommit]);

  const handleAcceptOne = useCallback(async (id) => {
    await handleCommit([{ suggestionId: id, override: {} }]);
    // Remove accepted from the local list
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, [handleCommit]);

  return (
    <section className="bg-elev1 border border-line-soft rounded-16 shadow-elev1 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 text-text-primary">
          <ClipboardList size={24} className="text-brand" />
          <div>
            <h2 className="text-[18px] font-semibold leading-6">Project Planning (AI)</h2>
            <p className="text-[13px] text-text-secondary">Propose a plan and commit generated tasks to a project.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-text-secondary">
          <CheckCircle2 size={18} className="text-success" />
          {plannedCount} item{plannedCount === 1 ? '' : 's'} proposed
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="block text-[12px] font-semibold text-text-secondary mb-2">Assign to project</label>
          <Select
            value={projectId || ''}
            onChange={(e) => {
              const val = e.target.value;
              setProjectId(val);
              onProjectChange?.(val);
            }}
          >
            <option value="">📂 No project (personal tasks)</option>
            {availableProjects.map(p => (
              <option key={p.id} value={p.id}>📁 {p.name}</option>
            ))}
          </Select>
          {selectedProject && (
            <p className="mt-2 text-[12px] text-text-tertiary">
              Tasks will be created under <span className="font-medium text-text-secondary">{selectedProject.name}</span>.
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-[12px] font-semibold text-text-secondary mb-2">Planning prompt</label>
          <Textarea
            rows={3}
            value={userPrompt}
            onChange={(e) => {
              if (error) setError(null);
              setUserPrompt(e.target.value);
            }}
            placeholder={'e.g.\nLaunch prep for next week: docs, QA sweep, marketing checklist, site updates'}
          />
          <div className="mt-3 flex gap-2">
            <Button onClick={handleProposePlan} disabled={isProposing || !userPrompt.trim()}>
              {isProposing ? (<><Loader2 size={16} className="animate-spin" /> Proposing...</>) : 'Propose Plan'}
            </Button>
            <Button onClick={handleAcceptAll} disabled={isProposing || plannedCount === 0}>
              Commit {plannedCount > 0 ? plannedCount : ''} task{plannedCount === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-12 border border-danger/40 bg-danger/10 p-3 text-[13px] text-danger">
          <AlertTriangle size={16} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {plannedCount > 0 && (
        <div className="mt-6 space-y-3">
          {suggestions.map(s => (
            <div key={s.id} className="border border-line-soft rounded-12 p-4 bg-surface">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-primary mb-1 truncate">{s.title || 'Untitled task'}</div>
                  {s.description && (
                    <div className="text-[13px] text-text-secondary mb-2 whitespace-pre-wrap break-words">{s.description}</div>
                  )}
                  <div className="text-[12px] text-text-tertiary">Priority: {s.priority || 'medium'}</div>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <Button onClick={() => handleAcceptOne(s.id)} disabled={isProposing}>
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlanReview;

