import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AdminReturns = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  
  // Mock data for demonstration
  const [returns, setReturns] = useState([]);
  
  const [rmaNumbers, setRmaNumbers] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const [reqRes, rmaRes, refRes] = await Promise.all([
          fetch('/api/admin/returns/requests', { headers }),
          fetch('/api/admin/returns/rmas', { headers }),
          fetch('/api/admin/returns/refunds', { headers })
        ]);
        const reqJson = reqRes.ok ? await reqRes.json() : { requests: [] };
        const rmaJson = rmaRes.ok ? await rmaRes.json() : { rmas: [] };
        const refJson = refRes.ok ? await refRes.json() : { refunds: [] };
        setReturns((reqJson.requests || []).map(r => ({
          id: r.id,
          order: r.order || `#${r.id}`,
          customer: r.customer || r.user_email || 'Unknown',
          date: r.date || r.created_at,
          status: r.status || 'Pending',
          reason: r.reason || 'N/A',
          amount: r.amount || r.order_total || 0
        })));
        setRmaNumbers(rmaJson.rmas || []);
        setRefunds(refJson.refunds || []);
        setError(null);
      } catch (e) {
        console.error('Returns load error', e);
        setError('Failed to load returns data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Approved': return 'status-approved';
      case 'Completed': return 'status-completed';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };
  
  return (
    <div className="admin-returns">
      <div className="page-header">
        <h2>Returns Management</h2>
      </div>
      
      <div className="returns-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Return Requests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rma' ? 'active' : ''}`}
          onClick={() => setActiveTab('rma')}
        >
          RMA Numbers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'refunds' ? 'active' : ''}`}
          onClick={() => setActiveTab('refunds')}
        >
          Refunds
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      <div className="returns-content">
        {activeTab === 'requests' && (
          <div className="requests-tab">
            <div className="tab-header">
              <h3>Return Requests</h3>
              <button className="btn-primary">
                Process Returns
              </button>
            </div>
            <div className="returns-table">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map(ret => (
                    <tr key={ret.id}>
                      <td>{ret.order}</td>
                      <td>{ret.customer}</td>
                      <td>{ret.date}</td>
                      <td>{ret.reason}</td>
                      <td>${ret.amount}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(ret.status)}`}>
                          {ret.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon">View</button>
                        <button className="btn-icon">Process</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'rma' && (
          <div className="rma-tab">
            <div className="tab-header">
              <h3>RMA Numbers</h3>
              <button className="btn-primary">
                Generate RMA
              </button>
            </div>
            <div className="rma-table">
              <table>
                <thead>
                  <tr>
                    <th>RMA Number</th>
                    <th>Order</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rmaNumbers.map(rma => (
                    <tr key={rma.id}>
                      <td>{rma.rma}</td>
                      <td>{rma.order}</td>
                      <td>{rma.created}</td>
                      <td>
                        <span className={`status-badge ${rma.status === 'Active' ? 'status-approved' : 'status-completed'}`}>
                          {rma.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon">View</button>
                        <button className="btn-icon">Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'refunds' && (
          <div className="refunds-tab">
            <div className="tab-header">
              <h3>Refund Processing</h3>
              <button className="btn-primary" disabled>
                Process Refunds
              </button>
            </div>
            <div className="refunds-placeholder">
              <div className="placeholder-icon">💰</div>
              <h3>Refund Processing</h3>
              <p>Process and track customer refunds for returned items.</p>
              <p className="coming-soon">Coming soon...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="tab-header">
              <h3>Return Analytics</h3>
              <button className="btn-primary" disabled>
                Export Report
              </button>
            </div>
            <div className="analytics-placeholder">
              <div className="placeholder-icon">📊</div>
              <h3>Return Analytics Dashboard</h3>
              <p>Track return rates, reasons, and trends to improve product quality and customer satisfaction.</p>
              <p className="coming-soon">Coming soon...</p>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .admin-returns {
          padding: 0;
          color: #f0f6fc;
        }
        
        .page-header h2 {
          margin: 0 0 24px 0;
          color: #f0f6fc;
          font-size: 24px;
        }
        
        .returns-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          border-bottom: 1px solid #30363d;
        }
        
        .tab-btn {
          background: none;
          border: none;
          color: #8b949e;
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          color: #f0f6fc;
        }
        
        .tab-btn.active {
          color: #58a6ff;
          border-bottom-color: #58a6ff;
        }
        
        .returns-content {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 24px;
        }
        
        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .tab-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
        }
        
        /* Tables */
        .returns-table, .rma-table {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #30363d;
        }
        
        th {
          background: #0d1117;
          color: #8b949e;
          font-weight: 500;
          font-size: 14px;
        }
        
        td {
          font-size: 14px;
        }
        
        .status-badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .status-pending {
          background: rgba(242, 211, 91, 0.1);
          color: #e3b341;
        }
        
        .status-approved {
          background: rgba(46, 160, 67, 0.1);
          color: #3fb950;
        }
        
        .status-completed {
          background: rgba(88, 166, 255, 0.1);
          color: #58a6ff;
        }
        
        .status-rejected {
          background: rgba(248, 81, 73, 0.1);
          color: #f85149;
        }
        
        /* Placeholders */
        .refunds-placeholder, .analytics-placeholder {
          text-align: center;
          padding: 60px 20px;
          color: #8b949e;
        }
        
        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .refunds-placeholder h3, .analytics-placeholder h3 {
          margin: 0 0 12px 0;
          color: #f0f6fc;
          font-size: 20px;
        }
        
        .refunds-placeholder p, .analytics-placeholder p {
          margin: 8px 0;
          font-size: 16px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .coming-soon {
          font-style: italic;
          color: #58a6ff;
        }
        
        /* Buttons */
        .btn-primary {
          background: #238636;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #2ea043;
        }
        
        .btn-primary:disabled {
          background: #30363d;
          cursor: not-allowed;
        }
        
        .btn-icon {
          background: none;
          border: none;
          color: #8b949e;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-icon:hover {
          background: #30363d;
          color: #f0f6fc;
        }
      `}</style>
    </div>
  );
};

export default AdminReturns; 