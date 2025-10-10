import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import { BsDownload, BsLock, BsUnlock, BsFiles } from 'react-icons/bs';
import { useAuth } from '@clerk/clerk-react';

const STLLibrary = () => {
  const { getToken } = useAuth();
  const [stlBundles, setStlBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSTLBundles();
  }, [filter]);

  const fetchSTLBundles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filter === 'featured') {
        queryParams.append('featured', 'true');
      } else if (filter !== 'all') {
        queryParams.append('category', filter);
      }

      const response = await fetch(`/api/stl-bundles?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setStlBundles(data);
      } else {
        throw new Error('Failed to fetch STL bundles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAccess = async (bundleId) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/stl-bundles/${bundleId}/request-access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Access granted! You can now download ${result.files_count} STL files.`);
        // Refresh the bundles to update access status
        fetchSTLBundles();
      } else {
        throw new Error('Failed to grant access');
      }
    } catch (err) {
      alert('Error granting access: ' + err.message);
    }
  };

  const categories = ['all', 'featured', 'Structural', 'Racing', 'Hardware', 'Accessories'];

  if (loading) {
    return (
      <div className="stl-library-loading">
        <div className="spinner"></div>
        <p>Loading STL Library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stl-library-error">
        <h2>Error Loading STL Library</h2>
        <p>{error}</p>
        <button onClick={fetchSTLBundles} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="stl-library">
      <div className="library-header">
        <h1>Free STL Library</h1>
        <p className="library-subtitle">
          Download high-quality 3D printable drone parts. Sign up to access all files for free!
        </p>
      </div>

      {/* Category Filter */}
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* STL Bundles Grid */}
      <div className="stl-bundles-grid">
        {stlBundles.map(bundle => (
          <STLBundleCard 
            key={bundle.id}
            bundle={bundle}
            userToken={userToken}
            onRequestAccess={requestAccess}
          />
        ))}
      </div>

      {stlBundles.length === 0 && (
        <div className="no-bundles">
          <BsFiles className="empty-icon" />
          <h3>No STL bundles found</h3>
          <p>Try adjusting your filter or check back later for new releases.</p>
        </div>
      )}

      <style jsx>{`
        .stl-library {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 80px 20px 40px;
        }

        .library-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 40px;
        }

        .library-header h1 {
          font-size: 48px;
          font-weight: bold;
          background: linear-gradient(135deg, #00f2fe, #4facfe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 16px 0;
        }

        .library-subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 0;
        }

        .category-filters {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin: 0 0 40px 0;
        }

        .filter-btn {
          padding: 12px 24px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #00f2fe;
          color: #00f2fe;
          transform: translateY(-2px);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #00f2fe, #4facfe);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
        }

        .stl-bundles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stl-library-loading, .stl-library-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #00f2fe;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-retry {
          background: linear-gradient(135deg, #00f2fe, #4facfe);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 16px;
        }

        .no-bundles {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .library-header h1 {
            font-size: 36px;
          }

          .stl-bundles-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .category-filters {
            gap: 8px;
          }

          .filter-btn {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

const STLBundleCard = ({ bundle, userToken, onRequestAccess }) => {
  const [accessStatus, setAccessStatus] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(false);

  useEffect(() => {
    if (userToken) {
      checkAccessStatus();
    }
  }, [bundle.id, userToken]);

  const checkAccessStatus = async () => {
    try {
      const response = await fetch(`/api/stl-bundles/${bundle.id}/access-status`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        const status = await response.json();
        setAccessStatus(status);
      }
    } catch (err) {
      console.error('Failed to check access status:', err);
    }
  };

  const handleRequestAccess = async () => {
    setLoadingAccess(true);
    await onRequestAccess(bundle.id);
    setLoadingAccess(false);
    if (userToken) {
      checkAccessStatus();
    }
  };

  return (
    <div className="stl-bundle-card">
      <div className="bundle-header">
        <div className="bundle-info">
          <h3 className="bundle-name">{bundle.name}</h3>
          <p className="bundle-description">{bundle.description}</p>
        </div>
        {bundle.is_featured && (
          <div className="featured-badge">⭐ Featured</div>
        )}
      </div>

      <div className="bundle-meta">
        <div className="meta-item">
          <BsFiles className="meta-icon" />
          <span>{bundle.file_count} STL Files</span>
        </div>
        <div className="meta-item">
          <span className="category-tag">{bundle.category}</span>
        </div>
      </div>

      <div className="bundle-actions">
        {!userToken ? (
          <button 
            className="access-btn signup-required"
            onClick={() => window.location.href = '/login'}
          >
            <BsLock className="btn-icon" />
            Sign Up to Download
          </button>
        ) : accessStatus?.has_access ? (
          <button 
            className="access-btn has-access"
            onClick={() => window.location.href = '/my-stl-files'}
          >
            <BsUnlock className="btn-icon" />
            Download Files
          </button>
        ) : (
          <button 
            className="access-btn request-access"
            onClick={handleRequestAccess}
            disabled={loadingAccess}
          >
            <BsDownload className="btn-icon" />
            {loadingAccess ? 'Granting Access...' : 'Get Free Access'}
          </button>
        )}
      </div>

      <style jsx>{`
        .stl-bundle-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .stl-bundle-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .bundle-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .bundle-info {
          flex: 1;
        }

        .bundle-name {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .bundle-description {
          color: #64748b;
          margin: 0;
          line-height: 1.5;
          font-size: 14px;
        }

        .featured-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .bundle-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 14px;
        }

        .meta-icon {
          color: #00f2fe;
        }

        .category-tag {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .bundle-actions {
          margin-top: auto;
        }

        .access-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .signup-required {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
        }

        .signup-required:hover {
          background: linear-gradient(135deg, #4b5563, #374151);
          transform: translateY(-2px);
        }

        .request-access {
          background: linear-gradient(135deg, #00f2fe, #4facfe);
          color: white;
        }

        .request-access:hover:not(:disabled) {
          background: linear-gradient(135deg, #00d8e6, #4a9afe);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
        }

        .request-access:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .has-access {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .has-access:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
        }

        .btn-icon {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default STLLibrary;