import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminMarketing = () => {
  const { getToken } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    template_type: 'custom',
    scheduled_date: '',
    target_audience: 'all'
  });

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/marketing/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      setError('Failed to load campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Fetch templates for dropdown
  const fetchTemplates = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/marketing/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, [getToken]);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [fetchCampaigns, fetchTemplates]);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      template_id: '',
      template_type: 'custom',
      scheduled_date: '',
      target_audience: 'all'
    });
    setShowModal(true);
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      template_id: campaign.template_id || '',
      template_type: campaign.template_type || 'custom',
      scheduled_date: campaign.scheduled_date ? new Date(campaign.scheduled_date).toISOString().slice(0, 16) : '',
      target_audience: campaign.target_audience || 'all'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) return;

      const url = editingCampaign 
        ? `/api/marketing/campaigns/${editingCampaign.id}`
        : '/api/marketing/campaigns';
      
      const method = editingCampaign ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          template_id: formData.template_id ? parseInt(formData.template_id) : null
        })
      });

      if (response.ok) {
        setSuccess(editingCampaign ? 'Campaign updated!' : 'Campaign created!');
        setShowModal(false);
        fetchCampaigns();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save campaign');
      }
    } catch (err) {
      setError('Failed to save campaign');
      console.error(err);
    }
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/marketing/campaigns/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Campaign deleted');
        fetchCampaigns();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  const sendCampaign = async (id) => {
    if (!window.confirm('Send this campaign to all subscribers?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/marketing/campaigns/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ variables: {} })
      });

      if (response.ok) {
        setSuccess('Campaign sent successfully!');
        fetchCampaigns();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send campaign');
      }
    } catch (err) {
      setError('Failed to send campaign');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', background: '#0d1117', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0f6fc', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Email Campaigns
        </h1>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>
          Create and manage email marketing campaigns
        </p>
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
          + Create Campaign
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8b949e' }}>Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
          <p style={{ color: '#8b949e', marginBottom: '16px' }}>No campaigns yet</p>
          <button onClick={openCreateModal} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', cursor: 'pointer' }}>
            Create your first campaign
          </button>
        </div>
      ) : (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#21262d', borderBottom: '1px solid #30363d' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>CAMPAIGN</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>TEMPLATE</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>STATUS</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>SCHEDULED</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(campaign => (
                <tr key={campaign.id} style={{ borderBottom: '1px solid #30363d' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ color: '#f0f6fc', fontWeight: '600' }}>{campaign.name}</div>
                    <div style={{ color: '#8b949e', fontSize: '12px' }}>{campaign.description}</div>
                  </td>
                  <td style={{ padding: '12px', color: '#8b949e' }}>
                    {campaign.template_id ? (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(88, 166, 255, 0.1)', color: '#58a6ff', fontSize: '11px' }}>
                        Template #{campaign.template_id}
                      </span>
                    ) : (
                      <span style={{ color: '#8b949e' }}>{campaign.template_type || 'None'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px',
                      background: campaign.status === 'sent' ? 'rgba(63, 185, 80, 0.1)' : 
                                campaign.status === 'scheduled' ? 'rgba(245, 158, 11, 0.1)' : 
                                'rgba(139, 148, 158, 0.1)',
                      color: campaign.status === 'sent' ? '#3fb950' : 
                            campaign.status === 'scheduled' ? '#f59e0b' : 
                            '#8b949e'
                    }}>
                      {campaign.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#8b949e', fontSize: '12px' }}>
                    {campaign.scheduled_date ? new Date(campaign.scheduled_date).toLocaleString() : 'Not scheduled'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(campaign)}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => sendCampaign(campaign.id)}
                          style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#3fb950', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Send
                        </button>
                      )}
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#f85149', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaign Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid #30363d', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#f0f6fc', margin: 0, fontSize: '18px' }}>
                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., June Product Launch"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Campaign description..."
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>
                    Email Template {templates.length > 0 && '*'}
                  </label>
                  {templates.length > 0 ? (
                    <select
                      value={formData.template_id}
                      onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                    >
                      <option value="">Select a template...</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} {template.category && `(${template.category})`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '6px', color: '#f59e0b', fontSize: '13px' }}>
                      No templates available. Create a template first in Email Templates.
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Target Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                  >
                    <option value="all">All Subscribers</option>
                    <option value="active">Active Subscribers</option>
                    <option value="customers">Customers Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Schedule Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                  />
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
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
