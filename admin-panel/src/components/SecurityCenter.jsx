import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const SecurityCenter = ({ alerts }) => {
  const { getToken } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState({
    threatLevel: 'low',
    blockedIPs: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
    activeBlacklist: []
  });
  const [securityPolicies, setSecurityPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [newRule, setNewRule] = useState({
    type: 'ip_block',
    value: '',
    reason: '',
    duration: '24h'
  });

  useEffect(() => {
    fetchSecurityMetrics();
    fetchSecurityPolicies();
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const response = await fetch(getApiUrl('/api/admin/security/metrics'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch security metrics:', error);
    }
  };

  const fetchSecurityPolicies = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const response = await fetch(getApiUrl('/api/admin/security/policies'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityPolicies(data.policies);
      }
    } catch (error) {
      console.error('Failed to fetch security policies:', error);
    }
  };

  const addSecurityRule = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      await fetch(getApiUrl('/api/admin/security/rules'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      });
      
      setNewRule({ type: 'ip_block', value: '', reason: '', duration: '24h' });
      fetchSecurityMetrics();
      fetchSecurityPolicies();
    } catch (error) {
      console.error('Failed to add security rule:', error);
    }
  };

  const removeSecurityRule = async (ruleId) => {
    if (!window.confirm('Remove this security rule?')) return;
    
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      await fetch(`/api/admin/security/rules/${ruleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchSecurityMetrics();
      fetchSecurityPolicies();
    } catch (error) {
      console.error('Failed to remove security rule:', error);
    }
  };

  const getThreatLevelColor = (level) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[level] || '#6b7280';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderOverview = () => (
    <div className="security-overview">
      {/* Threat Level Indicator */}
      <div className="threat-indicator">
        <div className="threat-level-display">
          <div 
            className="threat-circle"
            style={{ 
              borderColor: getThreatLevelColor(securityMetrics.threatLevel),
              color: getThreatLevelColor(securityMetrics.threatLevel)
            }}
          >
            <div className="threat-icon">🛡️</div>
            <div className="threat-text">
              <div className="threat-level">{securityMetrics.threatLevel.toUpperCase()}</div>
              <div className="threat-label">Threat Level</div>
            </div>
          </div>
        </div>
        <div className="threat-description">
          {securityMetrics.threatLevel === 'low' && 'System security is optimal. No immediate threats detected.'}
          {securityMetrics.threatLevel === 'medium' && 'Moderate security activity detected. Monitoring enhanced.'}
          {securityMetrics.threatLevel === 'high' && 'Elevated threat level. Enhanced security measures active.'}
          {securityMetrics.threatLevel === 'critical' && 'Critical security alert. Emergency protocols engaged.'}
        </div>
      </div>

      {/* Security Metrics */}
      <div className="security-metrics">
        <div className="metric-card">
          <div className="metric-icon">🚫</div>
          <div className="metric-content">
            <div className="metric-value">{securityMetrics.blockedIPs}</div>
            <div className="metric-label">Blocked IPs</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🔒</div>
          <div className="metric-content">
            <div className="metric-value">{securityMetrics.failedLogins}</div>
            <div className="metric-label">Failed Logins (24h)</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value">{securityMetrics.suspiciousActivity}</div>
            <div className="metric-label">Suspicious Events</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <div className="metric-value">{securityPolicies.length}</div>
            <div className="metric-label">Active Rules</div>
          </div>
        </div>
      </div>

      {/* Recent Security Alerts */}
      <div className="recent-alerts">
        <h3>Recent Security Alerts</h3>
        <div className="alerts-list">
          {alerts && alerts.length > 0 ? alerts.map((alert, index) => (
            <div key={index} className="alert-item">
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  <span className="alert-time">{formatTimestamp(alert.timestamp)}</span>
                  <span 
                    className="alert-severity"
                    style={{ color: getThreatLevelColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
              <div className="alert-actions">
                <button className="action-btn investigate">Investigate</button>
                <button className="action-btn dismiss">Dismiss</button>
              </div>
            </div>
          )) : (
            <div className="no-alerts">
              <div className="no-alerts-icon">✅</div>
              <div className="no-alerts-text">No security alerts - system is secure</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="security-policies">
      {/* Add New Rule */}
      <div className="add-rule-section">
        <h3>Add Security Rule</h3>
        <form onSubmit={addSecurityRule} className="rule-form">
          <div className="form-row">
            <select
              value={newRule.type}
              onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="ip_block">IP Block</option>
              <option value="email_block">Email Block</option>
              <option value="rate_limit">Rate Limit</option>
              <option value="geo_block">Geographic Block</option>
            </select>
            
            <input
              type="text"
              placeholder="Enter value (IP, email, etc.)"
              value={newRule.value}
              onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
              required
            />
            
            <select
              value={newRule.duration}
              onChange={(e) => setNewRule(prev => ({ ...prev, duration: e.target.value }))}
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          
          <input
            type="text"
            placeholder="Reason for this rule"
            value={newRule.reason}
            onChange={(e) => setNewRule(prev => ({ ...prev, reason: e.target.value }))}
            className="reason-input"
            required
          />
          
          <button type="submit" className="add-rule-btn">Add Security Rule</button>
        </form>
      </div>

      {/* Current Policies */}
      <div className="current-policies">
        <h3>Active Security Policies</h3>
        <div className="policies-list">
          {securityPolicies.map((policy) => (
            <div key={policy.id} className="policy-item">
              <div className="policy-icon">
                {policy.type === 'ip_block' && '🚫'}
                {policy.type === 'email_block' && '📧'}
                {policy.type === 'rate_limit' && '⏱️'}
                {policy.type === 'geo_block' && '🌍'}
              </div>
              <div className="policy-content">
                <div className="policy-title">{policy.type.replace('_', ' ').toUpperCase()}</div>
                <div className="policy-value">{policy.value}</div>
                <div className="policy-reason">{policy.reason}</div>
              </div>
              <div className="policy-meta">
                <div className="policy-duration">
                  {policy.duration === 'permanent' ? 'Permanent' : `Expires in ${policy.remaining}`}
                </div>
                <div className="policy-created">Created: {formatTimestamp(policy.created_at)}</div>
              </div>
              <div className="policy-actions">
                <button 
                  onClick={() => removeSecurityRule(policy.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          {securityPolicies.length === 0 && (
            <div className="no-policies">
              <div className="no-policies-icon">📝</div>
              <div className="no-policies-text">No security policies configured</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="security-center">
      {/* Tab Navigation */}
      <div className="security-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🔍 Security Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          📋 Security Policies
        </button>
        <button 
          className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          📊 Threat Monitoring
        </button>
      </div>

      {/* Tab Content */}
      <div className="security-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'monitoring' && (
          <div className="monitoring-placeholder">
            <h3>Advanced Threat Monitoring</h3>
            <p>Real-time threat intelligence and behavioral analysis coming soon...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .security-center {
          padding: 0;
        }

        .security-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tab-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px 8px 0 0;
          padding: 1rem 1.5rem;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border-bottom: 2px solid #10b981;
        }

        .security-content {
          min-height: 400px;
        }

        .threat-indicator {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
          text-align: center;
        }

        .threat-level-display {
          margin-bottom: 1rem;
        }

        .threat-circle {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border: 3px solid;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.1);
        }

        .threat-icon {
          font-size: 2rem;
        }

        .threat-level {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .threat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .threat-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto;
        }

        .security-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .metric-content {
          flex: 1;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .recent-alerts {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .recent-alerts h3 {
          margin: 0 0 1rem 0;
          color: #ffffff;
        }

        .alerts-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .alert-icon {
          font-size: 1.5rem;
          color: #ef4444;
        }

        .alert-content {
          flex: 1;
        }

        .alert-message {
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .alert-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .alert-severity {
          font-weight: 600;
          text-transform: uppercase;
        }

        .alert-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: #ffffff;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .action-btn.investigate {
          border-color: #60a5fa;
          color: #60a5fa;
        }

        .action-btn.dismiss {
          border-color: #6b7280;
          color: #d1d5db;
        }

        .no-alerts {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .no-alerts-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .add-rule-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 2rem;
        }

        .add-rule-section h3 {
          margin: 0 0 1rem 0;
          color: #ffffff;
        }

        .rule-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem;
        }

        .form-row select, .form-row input, .reason-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .reason-input {
          grid-column: 1 / -1;
        }

        .add-rule-btn {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          color: #ffffff;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          align-self: flex-start;
        }

        .add-rule-btn:hover {
          background: rgba(16, 185, 129, 0.3);
        }

        .current-policies {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .current-policies h3 {
          margin: 0 0 1rem 0;
          color: #ffffff;
        }

        .policies-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .policy-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .policy-icon {
          font-size: 1.5rem;
        }

        .policy-content {
          flex: 1;
        }

        .policy-title {
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .policy-value {
          color: #60a5fa;
          font-family: monospace;
          margin-bottom: 0.25rem;
        }

        .policy-reason {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .policy-meta {
          text-align: right;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .policy-duration {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .remove-btn {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid #ef4444;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: #ffffff;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .no-policies {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .no-policies-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .monitoring-placeholder {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .security-tabs {
            flex-direction: column;
          }

          .security-metrics {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .alert-item, .policy-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .alert-actions, .policy-actions {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default SecurityCenter;