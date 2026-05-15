import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminSegments = () => {
  const { getToken } = useAuth();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSubscribers, setPreviewSubscribers] = useState([]);
  const [editingSegment, setEditingSegment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_dynamic: true,
    conditions: {
      operator: 'AND',
      conditions: []
    }
  });

  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/marketing/segments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSegments(data.segments || []);
      }
    } catch (err) {
      setError('Failed to load segments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        conditions: [
          ...prev.conditions.conditions,
          { field: 'source', operator: 'equals', value: '' }
        ]
      }
    }));
  };

  const updateCondition = (index, field, value) => {
    setFormData(prev => {
      const newConditions = [...prev.conditions.conditions];
      newConditions[index] = { ...newConditions[index], [field]: value };
      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          conditions: newConditions
        }
      };
    });
  };

  const removeCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        conditions: prev.conditions.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const previewSegment = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/marketing/segments/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conditions: formData.conditions })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewSubscribers(data.subscribers || []);
        setShowPreview(true);
      }
    } catch (err) {
      setError('Failed to preview segment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) return;

      const url = editingSegment 
        ? `/api/marketing/segments/${editingSegment.id}`
        : '/api/marketing/segments';
      
      const method = editingSegment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingSegment ? 'Segment updated!' : 'Segment created!');
        setShowModal(false);
        fetchSegments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save segment');
      }
    } catch (err) {
      setError('Failed to save segment');
      console.error(err);
    }
  };

  const deleteSegment = async (id) => {
    if (!window.confirm('Delete this segment?')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/marketing/segments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Segment deleted');
        fetchSegments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete segment');
    }
  };

  const recalculateSegment = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/marketing/segments/${id}/recalculate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Segment recalculated');
        fetchSegments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to recalculate segment');
    }
  };

  const openCreateModal = () => {
    setEditingSegment(null);
    setFormData({
      name: '',
      description: '',
      is_dynamic: true,
      conditions: {
        operator: 'AND',
        conditions: []
      }
    });
    setShowModal(true);
  };

  const openEditModal = (segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      is_dynamic: segment.is_dynamic !== false,
      conditions: typeof segment.conditions === 'string' 
        ? JSON.parse(segment.conditions) 
        : segment.conditions || { operator: 'AND', conditions: [] }
    });
    setShowModal(true);
  };

  const fieldOptions = [
    { value: 'source', label: 'Source', operators: ['equals', 'not_equals'] },
    { value: 'subscribed_after', label: 'Subscribed After', operators: ['after'] },
    { value: 'subscribed_before', label: 'Subscribed Before', operators: ['before'] },
    { value: 'engagement_score', label: 'Engagement Score', operators: ['greater_than', 'less_than', 'equals'] },
    { value: 'total_emails_opened', label: 'Emails Opened', operators: ['greater_than', 'equals'] },
    { value: 'last_email_opened_at', label: 'Last Opened Email', operators: ['within_days', 'never'] },
    { value: 'is_active', label: 'Status', operators: ['equals'] }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', background: '#0d1117', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0f6fc', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Subscriber Segments
        </h1>
        <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '16px' }}>
          Create targeted groups of subscribers based on behavior, source, and engagement
        </p>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ color: '#f0f6fc', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>💡 How to use segments:</h3>
          <ul style={{ color: '#8b949e', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li><strong>Target specific audiences:</strong> Create segments like "Highly Engaged Users" or "Recent Signups"</li>
            <li><strong>Set conditions:</strong> Combine filters (source, engagement score, open rates, dates)</li>
            <li><strong>Use in campaigns:</strong> When sending campaigns, select a segment to target only those subscribers</li>
            <li><strong>Dynamic updates:</strong> Dynamic segments automatically update as subscriber behavior changes</li>
          </ul>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #f85149', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f85149' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(63, 185, 80, 0.1)', border: '1px solid #3fb950', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#3fb950' }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={openCreateModal}
          style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #00f2fe 0%, #00d4aa 100%)', color: '#0d1117', fontWeight: '600', cursor: 'pointer' }}
        >
          + Create Segment
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8b949e' }}>Loading segments...</div>
      ) : segments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
          <p style={{ color: '#8b949e', marginBottom: '16px' }}>No segments created yet</p>
          <button onClick={openCreateModal} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', cursor: 'pointer' }}>
            Create your first segment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {segments.map(segment => (
            <div key={segment.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ color: '#f0f6fc', fontSize: '16px', fontWeight: '600', margin: 0 }}>{segment.name}</h3>
                    {segment.is_dynamic && (
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff' }}>
                        Dynamic
                      </span>
                    )}
                  </div>
                  {segment.description && (
                    <p style={{ color: '#8b949e', fontSize: '13px', margin: '4px 0 0 0' }}>{segment.description}</p>
                  )}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '600', color: '#00f2fe', textAlign: 'right' }}>
                  {segment.subscriber_count || 0}
                  <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: '400' }}>subscribers</div>
                </div>
              </div>

              {segment.conditions && (
                <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '6px' }}>Conditions:</div>
                  <div style={{ color: '#f0f6fc', fontSize: '13px', fontFamily: 'monospace' }}>
                    {JSON.stringify(typeof segment.conditions === 'string' ? JSON.parse(segment.conditions) : segment.conditions, null, 2)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openEditModal(segment)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', fontSize: '12px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => recalculateSegment(segment.id)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#da78ff', fontSize: '12px', cursor: 'pointer' }}
                >
                  Recalculate
                </button>
                <button
                  onClick={() => deleteSegment(segment.id)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#f85149', fontSize: '12px', cursor: 'pointer' }}
                >
                  Delete
                </button>
                {segment.last_calculated_at && (
                  <span style={{ padding: '6px 12px', color: '#8b949e', fontSize: '11px', alignSelf: 'center' }}>
                    Updated: {new Date(segment.last_calculated_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Segment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid #30363d', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#f0f6fc', margin: 0, fontSize: '18px' }}>
                {editingSegment ? 'Edit Segment' : 'Create Segment'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Segment Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Highly Engaged Users"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this segment..."
                    rows={2}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f6fc', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_dynamic}
                      onChange={(e) => setFormData({ ...formData, is_dynamic: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Dynamic segment (automatically updates)
                  </label>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ color: '#f0f6fc', fontSize: '14px', fontWeight: '600' }}>Conditions</label>
                    <select
                      value={formData.conditions.operator}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, operator: e.target.value }
                      }))}
                      style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', fontSize: '12px' }}
                    >
                      <option value="AND">Match ALL conditions</option>
                      <option value="OR">Match ANY condition</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {formData.conditions.conditions.map((condition, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', padding: '12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px' }}>
                        <select
                          value={condition.field}
                          onChange={(e) => updateCondition(index, 'field', e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #30363d', background: '#161b22', color: '#f0f6fc', fontSize: '12px' }}
                        >
                          {fieldOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>

                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #30363d', background: '#161b22', color: '#f0f6fc', fontSize: '12px' }}
                        >
                          {(fieldOptions.find(f => f.value === condition.field)?.operators || ['equals']).map(op => (
                            <option key={op} value={op}>{op.replace('_', ' ')}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value..."
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #30363d', background: '#161b22', color: '#f0f6fc', fontSize: '12px' }}
                        />

                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#f85149', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addCondition}
                    style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', fontSize: '12px', cursor: 'pointer', width: '100%' }}
                  >
                    + Add Condition
                  </button>

                  {formData.conditions.conditions.length > 0 && (
                    <button
                      type="button"
                      onClick={previewSegment}
                      style={{ marginTop: '8px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#da78ff', fontSize: '12px', cursor: 'pointer', width: '100%' }}
                    >
                      Preview Subscribers
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #30363d' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #00f2fe 0%, #00d4aa 100%)', color: '#0d1117', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingSegment ? 'Update Segment' : 'Create Segment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid #30363d', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#f0f6fc', margin: 0, fontSize: '16px' }}>Preview: {previewSubscribers.length} subscribers</h3>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            <div style={{ padding: '16px', overflow: 'auto' }}>
              {previewSubscribers.length === 0 ? (
                <p style={{ color: '#8b949e', textAlign: 'center' }}>No subscribers match these conditions</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {previewSubscribers.map(sub => (
                    <div key={sub.id} style={{ padding: '12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px' }}>
                      <div style={{ color: '#f0f6fc', fontWeight: '600', fontSize: '14px' }}>{sub.email}</div>
                      <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '4px' }}>
                        {sub.first_name} {sub.last_name} • {sub.source} • Score: {sub.engagement_score || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSegments;
