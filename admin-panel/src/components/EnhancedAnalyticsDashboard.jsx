import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const EnhancedAnalyticsDashboard = () => {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState({
    suspiciousActivity: [],
    contentAccess: [],
    userBehavior: [],
    performance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    fetchEnhancedAnalytics();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchEnhancedAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchEnhancedAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Starting enhanced analytics fetch...');
      const token = await getToken();
      console.log('Token retrieved:', token ? 'present' : 'null');

      if (!token) {
        console.error('No authentication token available');
        setError('Authentication required');
        return;
      }

      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        console.log('Making fetch request to /api/enhanced-analytics...');
        // Fetch from enhanced analytics backend endpoint
        const response = await fetch(`/api/enhanced-analytics?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        console.log('Fetch response received:', response.status);

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
          setError(null);
        } else if (response.status === 401) {
          setError('Authentication failed. Please refresh the page and try again.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Enhanced analytics fetch error:', err);
      setError(err.message || 'Failed to load enhanced analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-analytics-panel">
      {/* Header */}
      <div className="analytics-header">
        <div className="flex gap-4">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button 
            onClick={fetchEnhancedAnalytics}
            className="refresh-button"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Suspicious Activity</h3>
          <p className="text-3xl font-bold text-red-600">{analytics.suspiciousActivity?.length || 0}</p>
          <p className="text-sm text-gray-500">Potential threats detected</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Access</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.contentAccess?.length || 0}</p>
          <p className="text-sm text-gray-500">Sensitive page views</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Copy Attempts</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {analytics.userBehavior?.filter(b => b.type === 'contentCopy')?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Content copy events</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Score</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics.performance?.averageLoadTime ? 
              Math.round(analytics.performance.averageLoadTime) + 'ms' : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">Average load time</p>
        </div>
      </div>

      {/* Suspicious Activity Table */}
      <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Suspicious Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.suspiciousActivity?.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(activity.severity)}`}>
                        {activity.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {JSON.stringify(activity.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Real-time Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Real-time Events</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics.userBehavior?.slice(0, 20).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{event.type}</span>
                  <span className="text-gray-500 ml-2">{event.page}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .enhanced-analytics-panel {
          padding: 0;
          color: #ffffff;
        }

        .analytics-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
        }

        .timeframe-select {
          padding: 8px 12px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(56, 68, 82, 0.4);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
        }

        .timeframe-select option {
          background: #1e293b;
          color: #ffffff;
        }

        .refresh-button {
          padding: 8px 16px;
          background: linear-gradient(135deg, #00f2fe, #4facfe);
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
        }

        .enhanced-analytics-panel .bg-white {
          background: rgba(30, 41, 59, 0.4) !important;
          border: 1px solid rgba(56, 68, 82, 0.3);
          backdrop-filter: blur(10px);
        }

        .enhanced-analytics-panel .text-gray-900 {
          color: #ffffff !important;
        }

        .enhanced-analytics-panel .text-gray-500 {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .enhanced-analytics-panel .bg-gray-50 {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(56, 68, 82, 0.2);
        }

        .enhanced-analytics-panel .border-gray-200 {
          border-color: rgba(56, 68, 82, 0.3) !important;
        }

        .enhanced-analytics-panel .divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
          border-color: rgba(56, 68, 82, 0.3) !important;
        }

        .enhanced-analytics-panel .bg-red-100 {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }

        .enhanced-analytics-panel .text-red-700 {
          color: #fca5a5 !important;
        }
      `}</style>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
