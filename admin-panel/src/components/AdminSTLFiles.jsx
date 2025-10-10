import React, { useState, useMemo } from 'react';
import useSTLFiles from '../hooks/useSTLFiles';
import STLFileCard from './STLFileCard';
import STLUploadModal from './STLUploadModal';
import STLEditModal from './STLEditModal';
import STLViewerModal from './STLViewerModal';
import FormInput from './FormInput';

const AdminSTLFiles = () => {
  const { 
    stlFiles, 
    loading, 
    error, 
    refetch,
    deleteFile,
    toggleFileVisibility,
    updateFile,
    updateOrientation,
    downloadFile 
  } = useSTLFiles();

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter and search logic
  const filteredFiles = useMemo(() => {
    return stlFiles.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
                             (file.category && file.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [stlFiles, searchTerm, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(stlFiles
      .map(file => file.category)
      .filter(Boolean)
      .map(cat => cat.toLowerCase()))];
    return uniqueCategories.sort();
  }, [stlFiles]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalFiles = stlFiles.length;
    const activeFiles = stlFiles.filter(file => file.is_active).length;
    const totalSize = stlFiles.reduce((sum, file) => sum + (file.file_size || 0), 0);
    const totalDownloads = stlFiles.reduce((sum, file) => sum + (file.download_count || 0), 0);

    return { totalFiles, activeFiles, totalSize, totalDownloads };
  }, [stlFiles]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Event handlers
  const handleUploadComplete = () => {
    refetch();
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    setShowEditModal(true);
  };

  const handleView = (file) => {
    setViewingFile(file);
    setShowViewerModal(true);
  };

  const handleDelete = async (fileId) => {
    const result = await deleteFile(fileId);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleToggleVisibility = async (fileId, isActive) => {
    const result = await toggleFileVisibility(fileId, isActive);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    const result = await downloadFile(fileId, fileName);
    if (!result.success) {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="admin-stl-files">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading STL files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stl-files">
      {/* Header */}
      <div className="stl-header">
        <div className="header-content">
          <h2>STL File Management</h2>
          <p>Manage your 3D printable files and downloads</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload STL Files
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon files">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalFiles}</div>
            <div className="stat-label">Total Files</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeFiles}</div>
            <div className="stat-label">Public Files</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon size">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatFileSize(stats.totalSize)}</div>
            <div className="stat-label">Total Size</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <FormInput
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-results">
          {filteredFiles.length} of {stlFiles.length} files
        </div>
      </div>

      {/* Files Grid */}
      <div className="files-grid">
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <STLFileCard
              key={file.id}
              file={file}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              onDownload={handleDownload}
            />
          ))
        ) : (
          <div className="empty-state">
            {error ? (
              <div className="error-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3>Error Loading Files</h3>
                <p>{error}</p>
                <button onClick={refetch} className="btn-retry">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="no-files">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3>No STL files found</h3>
                <p>
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'No files match your current filters'
                    : 'Upload your first STL file to get started'
                  }
                </p>
                {(!searchTerm && categoryFilter === 'all') && (
                  <button 
                    onClick={() => setShowUploadModal(true)} 
                    className="btn-primary"
                  >
                    Upload STL File
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <STLUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />

      {editingFile && (
        <STLEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingFile(null);
          }}
          file={editingFile}
          onUpdate={(updates) => updateFile(editingFile.id, updates)}
          onUpdateOrientation={(fileId, orientation) => updateOrientation(fileId, orientation)}
        />
      )}

      {viewingFile && (
        <STLViewerModal
          isOpen={showViewerModal}
          onClose={() => {
            setShowViewerModal(false);
            setViewingFile(null);
          }}
          file={viewingFile}
          onEdit={handleEdit}
          onDownload={handleDownload}
        />
      )}

      <style jsx>{`
        .admin-stl-files {
          padding: 0;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #94a3b8;
          gap: 16px;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(59, 130, 246, 0.3);
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stl-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(56, 68, 82, 0.2);
        }

        .header-content h2 {
          margin: 0 0 8px 0;
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-content h2::before {
          content: '';
          width: 4px;
          height: 28px;
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 2px;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
        }

        .header-content p {
          margin: 0;
          color: #94a3b8;
          font-size: 16px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-primary svg {
          width: 20px;
          height: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.files {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .stat-icon.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .stat-icon.categories {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .stat-icon.size {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .stat-icon svg {
          width: 24px;
          height: 24px;
        }

        .stat-value {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
        }

        .filters-section {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          padding: 20px;
          background: rgba(15, 20, 25, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(56, 68, 82, 0.2);
        }

        .filter-group {
          flex: 1;
          max-width: 300px;
        }

        .search-input {
          margin-bottom: 0;
        }

        .category-filter {
          width: 100%;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(56, 68, 82, 0.6);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
        }

        .filter-results {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          padding: 60px 20px;
        }

        .no-files,
        .error-state {
          text-align: center;
          color: #94a3b8;
          max-width: 400px;
        }

        .no-files svg,
        .error-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 20px;
          color: #64748b;
        }

        .no-files h3,
        .error-state h3 {
          margin: 0 0 12px 0;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
        }

        .no-files p,
        .error-state p {
          margin: 0 0 24px 0;
          font-size: 16px;
          line-height: 1.5;
        }

        .btn-retry {
          padding: 10px 20px;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 8px;
          color: #f87171;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-retry:hover {
          background: rgba(248, 113, 113, 0.2);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .stl-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            max-width: none;
          }

          .files-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSTLFiles;