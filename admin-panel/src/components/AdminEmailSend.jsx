import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminEmailSend = () => {
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [composerMode, setComposerMode] = useState('paste'); // 'template' or 'paste'
  const [showPreview, setShowPreview] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    html_content: ''
  });

  const fetchTemplates = useCallback(async () => {
    try {
      console.log('[AdminEmailSend] Fetching templates list...');
      const token = await getToken();
      if (!token) {
        console.log('[AdminEmailSend] No token, skipping template fetch');
        return;
      }

      const response = await fetch('/api/admin/email-templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('[AdminEmailSend] Templates list response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AdminEmailSend] Templates loaded:', data.templates?.length || 0, 'templates');
        setTemplates(data.templates || []);
      } else {
        console.error('[AdminEmailSend] Failed to fetch templates:', response.status);
      }
    } catch (err) {
      console.error('[AdminEmailSend] Error fetching templates:', err);
    }
  }, [getToken]);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/admin/newsletter/subscribers?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data || []);
      }
    } catch (err) {
      setError('Failed to load subscribers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTemplates();
    fetchSubscribers();
  }, [fetchTemplates, fetchSubscribers]);

  const handleTemplateSelect = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (templateId) {
      setLoadingTemplate(true);
      setError('');
      console.log('[AdminEmailSend] Loading template:', templateId);
      
      try {
        const token = await getToken();
        if (!token) {
          console.error('[AdminEmailSend] No auth token available');
          setError('Authentication required. Please refresh the page.');
          setLoadingTemplate(false);
          return;
        }

        console.log('[AdminEmailSend] Fetching template from API...');
        const response = await fetch(`/api/admin/email-templates/${templateId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('[AdminEmailSend] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[AdminEmailSend] Template data received:', {
            hasTemplate: !!data.template,
            hasSubject: !!data.template?.subject_template,
            hasHtml: !!data.template?.html_content,
            htmlLength: data.template?.html_content?.length
          });
          
          const template = data.template;
          if (!template) {
            setError('Template data is empty');
            return;
          }
          
          if (!template.html_content) {
            setError('Template has no HTML content');
            return;
          }
          
          setFormData({
            subject: template.subject_template || '',
            html_content: template.html_content || ''
          });
          setShowPreview(true); // Auto-enable preview when template loads
          console.log('[AdminEmailSend] Template loaded successfully');
        } else {
          const errorText = await response.text();
          console.error('[AdminEmailSend] Failed to load template:', response.status, errorText);
          setError(`Failed to load template (${response.status}): ${errorText.substring(0, 100)}`);
        }
      } catch (err) {
        console.error('[AdminEmailSend] Error loading template:', err);
        setError(`Failed to load template: ${err.message}`);
      } finally {
        setLoadingTemplate(false);
      }
    } else {
      setFormData({ subject: '', html_content: '' });
    }
  };

  const handleModeChange = (mode) => {
    setComposerMode(mode);
    if (mode === 'paste') {
      setSelectedTemplate('');
      setFormData({ subject: '', html_content: '' });
    }
  };

  const toggleRecipient = (id) => {
    setSelectedRecipients(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecipients.length === subscribers.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(subscribers.map(s => s.id));
    }
  };

  const handleSend = async () => {
    if (!formData.subject || !formData.html_content) {
      setError('Subject and HTML content are required');
      return;
    }

    const recipientCount = sendToAll ? subscribers.length : selectedRecipients.length;
    
    if (recipientCount === 0) {
      setError('Please select at least one recipient or enable "Send to all"');
      return;
    }

    if (!window.confirm(`Send email to ${recipientCount} subscriber(s)?`)) {
      return;
    }

    try {
      setSending(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject,
          html_content: formData.html_content,
          recipient_ids: sendToAll ? null : selectedRecipients,
          send_to_all: sendToAll
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Email sent! Delivered: ${data.sent}, Failed: ${data.failed}`);
        setFormData({ subject: '', html_content: '' });
        setSelectedTemplate('');
        setSelectedRecipients([]);
        setSendToAll(false);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send emails');
      }
    } catch (err) {
      setError('Failed to send emails');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeSubscribers = subscribers.filter(s => s.is_active !== false);
  const selectedCount = sendToAll ? activeSubscribers.length : selectedRecipients.length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', background: '#0d1117', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0f6fc', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Send Email
        </h1>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>
          Send emails to your subscribers
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', border: '1px solid #f85149', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f85149' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(63, 185, 80, 0.1)', border: '1px solid #3fb950', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#3fb950' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Email Composer */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ color: '#f0f6fc', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Compose Email</h3>

          {/* Mode Selector */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', padding: '4px', background: '#0d1117', borderRadius: '8px', border: '1px solid #30363d' }}>
            <button
              onClick={() => handleModeChange('template')}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: composerMode === 'template' ? '#238636' : 'transparent',
                color: composerMode === 'template' ? '#fff' : '#8b949e',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Use Template
            </button>
            <button
              onClick={() => handleModeChange('paste')}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: composerMode === 'paste' ? '#238636' : 'transparent',
                color: composerMode === 'paste' ? '#fff' : '#8b949e',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Paste HTML
            </button>
          </div>

          {/* Template Selector - only show in template mode */}
          {composerMode === 'template' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Select Template</label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateSelect}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: '#f0f6fc' }}
              >
                <option value="">-- Choose a template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', marginBottom: '6px', fontSize: '14px' }}>Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Email subject line"
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
              value={loadingTemplate ? 'Loading template...' : formData.html_content}
              onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
              placeholder={composerMode === 'template' ? 'Select a template above to load HTML...' : 'Paste your email HTML here...'}
              rows={showPreview ? 10 : 20}
              disabled={loadingTemplate || (composerMode === 'template' && !selectedTemplate)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #30363d', 
                background: '#0d1117', 
                color: '#f0f6fc', 
                fontFamily: 'monospace', 
                fontSize: '13px', 
                resize: 'vertical',
                opacity: loadingTemplate || (composerMode === 'template' && !selectedTemplate) ? 0.5 : 1
              }}
            />
            <p style={{ color: '#8b949e', fontSize: '12px', marginTop: '8px' }}>
              {formData.html_content.length} characters • Variables: first_name, email (use double curly braces)
            </p>
          </div>
        </div>

        {/* Recipients */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ color: '#f0f6fc', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Recipients</h3>

          <div style={{ marginBottom: '20px', padding: '12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f6fc', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Send to all active subscribers ({activeSubscribers.length})
            </label>
          </div>

          {!sendToAll && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b949e', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedRecipients.length === activeSubscribers.length && activeSubscribers.length > 0}
                    onChange={toggleSelectAll}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Select all
                </label>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #30363d', borderRadius: '6px' }}>
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e' }}>Loading...</div>
                ) : activeSubscribers.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#8b949e' }}>No subscribers</div>
                ) : (
                  activeSubscribers.map(sub => (
                    <label
                      key={sub.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderBottom: '1px solid #30363d',
                        cursor: 'pointer',
                        background: selectedRecipients.includes(sub.id) ? 'rgba(88, 166, 255, 0.1)' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(sub.id)}
                        onChange={() => toggleRecipient(sub.id)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ color: '#f0f6fc', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.email}
                        </div>
                        {(sub.first_name || sub.last_name) && (
                          <div style={{ color: '#8b949e', fontSize: '12px' }}>
                            {sub.first_name} {sub.last_name}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}

          <div style={{ marginTop: '20px', padding: '16px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px' }}>
            <div style={{ color: '#8b949e', fontSize: '12px', marginBottom: '4px' }}>Selected:</div>
            <div style={{ color: '#f0f6fc', fontSize: '24px', fontWeight: '600' }}>{selectedCount}</div>
          </div>

          <button
            onClick={handleSend}
            disabled={sending || selectedCount === 0 || !formData.subject || !formData.html_content}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '14px',
              borderRadius: '6px',
              border: 'none',
              background: sending || selectedCount === 0 || !formData.subject || !formData.html_content 
                ? '#30363d' 
                : 'linear-gradient(135deg, #00f2fe 0%, #00d4aa 100%)',
              color: sending || selectedCount === 0 || !formData.subject || !formData.html_content 
                ? '#8b949e' 
                : '#0d1117',
              fontWeight: '600',
              fontSize: '16px',
              cursor: sending || selectedCount === 0 || !formData.subject || !formData.html_content 
                ? 'not-allowed' 
                : 'pointer'
            }}
          >
            {sending ? 'Sending...' : `Send to ${selectedCount} subscriber${selectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSend;
