import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminMarketing = () => {
  const { getToken } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    template_type: 'welcome',
    target_audience: 'all',
    scheduled_date: ''
  });
  const [sendVariables, setSendVariables] = useState({
    kickstarter_url: '',
    milestone: '',
    amount_raised: '',
    backer_count: '',
    days_remaining: '',
    update_message: ''
  });

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'kickstarter_launch', label: 'Kickstarter Launch' },
    { value: 'campaign_update', label: 'Campaign Update' },
    { value: 'final_hours', label: 'Final Hours' }
  ];

  const targetAudiences = [
    { value: 'all', label: 'All Subscribers' },
    { value: 'new_subscribers', label: 'New Subscribers (Last 7 days)' },
    { value: 'long_term_subscribers', label: 'Long-term Subscribers (30+ days)' }
  ];

  useEffect(() => {
    fetchCampaigns();
    fetchAnalytics();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/newsletter/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.subscribers || data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/newsletter/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const createCampaign = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCampaign)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setNewCampaign({
          name: '',
          description: '',
          template_type: 'welcome',
          target_audience: 'all',
          scheduled_date: ''
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const sendCampaign = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_type: newCampaign.template_type,
          target_audience: newCampaign.target_audience,
          variables: sendVariables
        })
      });
      if (response.ok) {
        setShowSendModal(false);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
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
    return <div className="loading">Loading marketing data...</div>;
  }

  return (
    <div className="admin-marketing">
      <div className="marketing-header">
        <h2>Marketing Automation</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="create-campaign-btn"
        >
          Create Campaign
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Subscribers</h3>
            <div className="metric">{analytics.subscribers.total_subscribers}</div>
            <div className="sub-metric">
              {analytics.subscribers.active_subscribers} active
            </div>
          </div>
          <div className="analytics-card">
            <h3>Campaigns Sent</h3>
            <div className="metric">{analytics.campaigns.sent_campaigns}</div>
            <div className="sub-metric">
              {analytics.campaigns.draft_campaigns} drafts
            </div>
          </div>
          <div className="analytics-card">
            <h3>Emails Sent</h3>
            <div className="metric">{analytics.campaigns.total_emails_sent || 0}</div>
            <div className="sub-metric">
              {(analytics.campaigns.avg_open_rate || 0).toFixed(1)}% avg open rate
            </div>
          </div>
          <div className="analytics-card">
            <h3>New This Week</h3>
            <div className="metric">{analytics.subscribers.new_this_week}</div>
            <div className="sub-metric">
              {analytics.subscribers.new_this_month} this month
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="campaigns-section">
        <h3>Email Campaigns</h3>
        <div className="campaigns-table">
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Template</th>
                <th>Target Audience</th>
                <th>Status</th>
                <th>Sent Count</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <div className="campaign-name">
                      {campaign.name}
                      {campaign.description && (
                        <div className="campaign-description">{campaign.description}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="template-badge">
                      {templateTypes.find(t => t.value === campaign.template_type)?.label || campaign.template_type}
                    </span>
                  </td>
                  <td>{targetAudiences.find(a => a.value === campaign.target_audience)?.label || campaign.target_audience}</td>
                  <td>
                    <span className={`status-badge ${campaign.status}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td>{campaign.sent_count || 0}</td>
                  <td>{formatDate(campaign.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowSendModal(true);
                          }}
                          className="send-btn"
                        >
                          Send
                        </button>
                      )}
                      {campaign.status === 'sent' && (
                        <span className="sent-indicator">✓ Sent</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Campaign description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Email Template</label>
                <select
                  value={newCampaign.template_type}
                  onChange={(e) => setNewCampaign({...newCampaign, template_type: e.target.value})}
                >
                  {templateTypes.map(template => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <select
                  value={newCampaign.target_audience}
                  onChange={(e) => setNewCampaign({...newCampaign, target_audience: e.target.value})}
                >
                  {targetAudiences.map(audience => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Scheduled Date (optional)</label>
                <input
                  type="datetime-local"
                  value={newCampaign.scheduled_date}
                  onChange={(e) => setNewCampaign({...newCampaign, scheduled_date: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={createCampaign} className="create-btn">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Campaign Modal */}
      {showSendModal && selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>Send Campaign: {selectedCampaign.name}</h3>
              <button onClick={() => setShowSendModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="campaign-info">
                <p><strong>Template:</strong> {templateTypes.find(t => t.value === selectedCampaign.template_type)?.label}</p>
                <p><strong>Target:</strong> {targetAudiences.find(a => a.value === selectedCampaign.target_audience)?.label}</p>
              </div>
              
              {selectedCampaign.template_type !== 'welcome' && (
                <div className="variables-section">
                  <h4>Campaign Variables</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Kickstarter URL</label>
                      <input
                        type="url"
                        value={sendVariables.kickstarter_url}
                        onChange={(e) => setSendVariables({...sendVariables, kickstarter_url: e.target.value})}
                        placeholder="https://kickstarter.com/projects/..."
                      />
                    </div>
                    
                    {selectedCampaign.template_type === 'campaign_update' && (
                      <>
                        <div className="form-group">
                          <label>Milestone</label>
                          <input
                            type="text"
                            value={sendVariables.milestone}
                            onChange={(e) => setSendVariables({...sendVariables, milestone: e.target.value})}
                            placeholder="e.g., 50% Funded, 1000 Backers"
                          />
                        </div>
                        <div className="form-group">
                          <label>Amount Raised</label>
                          <input
                            type="text"
                            value={sendVariables.amount_raised}
                            onChange={(e) => setSendVariables({...sendVariables, amount_raised: e.target.value})}
                            placeholder="e.g., 25,000"
                          />
                        </div>
                        <div className="form-group">
                          <label>Backer Count</label>
                          <input
                            type="text"
                            value={sendVariables.backer_count}
                            onChange={(e) => setSendVariables({...sendVariables, backer_count: e.target.value})}
                            placeholder="e.g., 150"
                          />
                        </div>
                        <div className="form-group">
                          <label>Days Remaining</label>
                          <input
                            type="text"
                            value={sendVariables.days_remaining}
                            onChange={(e) => setSendVariables({...sendVariables, days_remaining: e.target.value})}
                            placeholder="e.g., 15"
                          />
                        </div>
                        <div className="form-group full-width">
                          <label>Update Message</label>
                          <textarea
                            value={sendVariables.update_message}
                            onChange={(e) => setSendVariables({...sendVariables, update_message: e.target.value})}
                            placeholder="Additional update message for backers"
                            rows="3"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowSendModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={sendCampaign} className="send-btn">
                Send Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-marketing {
          padding: 20px;
        }

        .marketing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .marketing-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .create-campaign-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .create-campaign-btn:hover {
          background: #1d4ed8;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .analytics-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .analytics-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .sub-metric {
          font-size: 14px;
          color: #6b7280;
        }

        .campaigns-section {
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .campaigns-section h3 {
          margin: 0;
          padding: 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }

        .campaigns-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .campaign-name {
          font-weight: 500;
          color: #1f2937;
        }

        .campaign-description {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .template-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.draft {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.sent {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.scheduled {
          background: #bfdbfe;
          color: #1e3a8a;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .send-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .send-btn:hover {
          background: #059669;
        }

        .sent-indicator {
          color: #10b981;
          font-size: 12px;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .large-modal {
          max-width: 700px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }

        .modal-body {
          padding: 20px;
        }

        .campaign-info {
          background: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .campaign-info p {
          margin: 5px 0;
          font-size: 14px;
        }

        .variables-section h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .create-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .create-btn:hover {
          background: #1d4ed8;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminMarketing;
