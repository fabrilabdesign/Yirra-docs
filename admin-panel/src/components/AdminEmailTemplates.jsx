import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminEmailTemplates = () => {
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject_template: '',
    html_content: ''
  });

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/admin/email-templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject_template: '',
      html_content: ''
    });
    setShowModal(true);
  };

  const openEditModal = async (template) => {
    try {
      // Fetch full template data including HTML content
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/admin/email-templates/${template.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const fullTemplate = data.template;
        
        setEditingTemplate(fullTemplate);
        setFormData({
          name: fullTemplate.name,
          subject_template: fullTemplate.subject_template || '',
          html_content: fullTemplate.html_content || ''
        });
        setShowModal(true);
      } else {
        setError('Failed to load template details');
      }
    } catch (err) {
      console.error('Failed to load template for editing:', err);
      setError('Failed to load template details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) return;

      const url = editingTemplate 
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : '/api/admin/email-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: 'marketing',
          is_active: true
        })
      });

      if (response.ok) {
        setSuccess(editingTemplate ? 'Template updated!' : 'Template created!');
        setShowModal(false);
        fetchTemplates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save template');
      }
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Template deleted');
        fetchTemplates();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', background: '#0d1117', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0f6fc', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Email Templates
        </h1>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>
          Create and save email templates for reuse
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
          + Create Template
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8b949e' }}>Loading templates...</div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
          <p style={{ color: '#8b949e', marginBottom: '16px' }}>No templates yet</p>
          <button onClick={openCreateModal} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #30363d', background: '#21262d', color: '#f0f6fc', cursor: 'pointer' }}>
            Create your first template
          </button>
        </div>
      ) : (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#21262d', borderBottom: '1px solid #30363d' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>NAME</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>SUBJECT</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id} style={{ borderBottom: '1px solid #30363d' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ color: '#f0f6fc', fontWeight: '600' }}>{template.name}</div>
                  </td>
                  <td style={{ padding: '12px', color: '#8b949e' }}>{template.subject_template}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(template)}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
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

      {/* Template Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid #30363d', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#f0f6fc', margin: 0, fontSize: '18px' }}>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '24px', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Template Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Product Launch Announcement"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject_template}
                    onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                    placeholder="e.g., Introducing {{first_name}} - Our New Product"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ color: '#f0f6fc', fontSize: '14px' }}>HTML Content *</label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      disabled={!formData.html_content}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid #30363d',
                        background: '#21262d',
                        color: formData.html_content ? '#58a6ff' : '#6e7681',
                        fontSize: '12px',
                        cursor: formData.html_content ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                  
                  {showPreview && formData.html_content ? (
                    <div style={{ marginBottom: '12px', border: '1px solid #30363d', borderRadius: '6px', background: '#fff', padding: '20px', maxHeight: '400px', overflow: 'auto' }}>
                      <div dangerouslySetInnerHTML={{ __html: formData.html_content }} />
                    </div>
                  ) : null}
                  
                  <textarea
                    required
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    placeholder="Paste your email HTML here..."
                    rows={showPreview ? 10 : 20}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc', fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }}
                  />
                  <p style={{ color: '#8b949e', fontSize: '12px', marginTop: '8px' }}>
                    Variables: first_name, email, product_name, hero_image_url, cta_url, unsubscribe_url, docs_url, company_name (wrap in double curly braces)
                  </p>
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
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplates;
