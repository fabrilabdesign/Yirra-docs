import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const ActivityMonitor = ({ realTimeData }) => {
  const { getToken } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    timeRange: '1h'
  });
  const [stats, setStats] = useState({
    activeUsers: 0,
    todayLogins: 0,
    failedAttempts: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    fetchActivityLogs();
    fetchActivityStats();
  }, [filters]);

  const fetchActivityLogs = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const params = new URLSearchParams(filters);
      
      const response = await fetch(`/api/admin/activity-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }
      const response = await fetch(getApiUrl('/api/admin/activity-stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      login: '🔑',
      logout: '🚪',
      purchase: '💳',
      download: '📥',
      admin_action: '⚙️',
      security_event: '🛡️',
      error: '❌',
      api_call: '🔗'
    };
    return icons[type] || '📝';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[severity] || '#6b7280';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="activity-monitor">
      {/* Real-time Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeData.activeUsers || stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-trend positive">+12%</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔑</div>
          <div className="stat-content">
            <div className="stat-value">{stats.todayLogins}</div>
            <div className="stat-label">Today's Logins</div>
          </div>
          <div className="stat-trend positive">+8%</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.failedAttempts}</div>
            <div className="stat-label">Failed Attempts</div>
          </div>
          <div className="stat-trend negative">+3</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgResponseTime}ms</div>
            <div className="stat-label">Avg Response</div>
          </div>
          <div className="stat-trend positive">-15ms</div>
        </div>
      </div>

      {/* Activity Controls */}
      <div className="activity-controls">
        <div className="filter-group">
          <label>Activity Type:</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="all">All Activities</option>
            <option value="login">User Logins</option>
            <option value="purchase">Purchases</option>
            <option value="download">Downloads</option>
            <option value="admin_action">Admin Actions</option>
            <option value="security_event">Security Events</option>
            <option value="error">Errors</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
          >
            <option value="all">All Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time Range:</label>
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>

        <button onClick={fetchActivityLogs} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Real-time Activity Feed */}
      <div className="activity-feed">
        <div className="feed-header">
          <h3>Live Activity Feed</h3>
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            <span>Live</span>
          </div>
        </div>

        <div className="activity-list">
          {/* Show real-time activities first */}
          {realTimeData.recentActivity?.map((activity, index) => (
            <div key={`realtime-${index}`} className="activity-item realtime">
              <div className="activity-icon">{getActivityIcon(activity.type)}</div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-meta">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                  <span 
                    className="activity-severity"
                    style={{ color: getSeverityColor(activity.severity) }}
                  >
                    {activity.severity}
                  </span>
                </div>
              </div>
              <div className="activity-details">
                {activity.ip && <span className="detail-item">IP: {activity.ip}</span>}
                {activity.userAgent && <span className="detail-item">Browser: {activity.userAgent}</span>}
              </div>
            </div>
          ))}

          {/* Historical activities */}
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{getActivityIcon(activity.type)}</div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-meta">
                  <span className="activity-user">{activity.user_email}</span>
                  <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                  <span 
                    className="activity-severity"
                    style={{ color: getSeverityColor(activity.severity) }}
                  >
                    {activity.severity}
                  </span>
                </div>
              </div>
              <div className="activity-details">
                {activity.ip_address && <span className="detail-item">IP: {activity.ip_address}</span>}
                {activity.user_agent && <span className="detail-item">Browser: {activity.user_agent.substring(0, 50)}</span>}
                {activity.resource && <span className="detail-item">Resource: {activity.resource}</span>}
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-message">No activities found for the selected filters</div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .activity-monitor {
          padding: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .stat-trend {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .stat-trend.positive {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }

        .stat-trend.negative {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .activity-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .filter-group select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: #ffffff;
          font-size: 0.875rem;
          min-width: 150px;
        }

        .refresh-btn {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: rgba(16, 185, 129, 0.3);
        }

        .activity-feed {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feed-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 1.25rem;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .activity-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .activity-item.realtime {
          background: rgba(16, 185, 129, 0.1);
          border-left: 3px solid #10b981;
        }

        .activity-icon {
          font-size: 1.5rem;
          opacity: 0.8;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-message {
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .activity-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .activity-user {
          color: #60a5fa;
          font-weight: 500;
        }

        .activity-time {
          color: rgba(255, 255, 255, 0.6);
        }

        .activity-severity {
          font-weight: 600;
          text-transform: uppercase;
        }

        .activity-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          flex-shrink: 0;
        }

        .detail-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-message {
          font-size: 1rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .activity-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            width: 100%;
          }

          .activity-item {
            flex-direction: column;
            gap: 0.5rem;
          }

          .activity-details {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityMonitor;