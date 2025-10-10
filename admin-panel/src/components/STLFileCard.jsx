import getApiUrl from '../utils/api.js';
import React from 'react';
import STLViewer from './STLViewer';

const STLFileCard = ({ 
  file, 
  onEdit, 
  onView, 
  onDelete, 
  onToggleVisibility, 
  onDownload 
}) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      onDelete(file.id);
    }
  };

  return (
    <div className="stl-file-card">
      {/* 3D Preview */}
      <div className="card-preview">
        <STLViewer
          stlUrl={`/api/admin/stl-files/${file.id}/download`}
          fileId={file.id}
          fileName={file.name}
          width={300}
          height={200}
          showControls={false}
          autoRotate={true}
          backgroundColor="#1e293b"
        />
        
        {/* Overlay Actions */}
        <div className="card-overlay">
          <button 
            onClick={() => onView(file)}
            className="overlay-btn view"
            title="View in 3D"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          <button 
            onClick={() => onEdit(file)}
            className="overlay-btn edit"
            title="Edit STL"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          <button 
            onClick={() => onToggleVisibility(file.id, file.is_active)}
            className={`overlay-btn visibility ${file.is_active ? 'active' : 'inactive'}`}
            title={file.is_active ? 'Hide from public' : 'Make public'}
          >
            {file.is_active ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={handleDelete}
            className="overlay-btn delete"
            title="Delete STL"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* File Information */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="file-name">{file.name}</h3>
          <span className={`status-badge ${file.is_active ? 'active' : 'inactive'}`}>
            {file.is_active ? 'Public' : 'Hidden'}
          </span>
        </div>

        {file.category && (
          <div className="file-category">{file.category}</div>
        )}

        {file.description && (
          <p className="file-description">{file.description}</p>
        )}

        <div className="file-meta">
          <div className="meta-item">
            <span className="meta-label">Version:</span>
            <span className="meta-value">v{file.version || '1.0'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Size:</span>
            <span className="meta-value">{formatFileSize(file.file_size)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Downloads:</span>
            <span className="meta-value">{file.download_count || 0}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created:</span>
            <span className="meta-value">{formatDate(file.created_at)}</span>
          </div>
        </div>

        <div className="card-actions">
          <button 
            onClick={() => onDownload(file.id, file.name)}
            className="action-btn download"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      <style jsx>{`
        .stl-file-card {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .stl-file-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .card-preview {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-overlay {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .stl-file-card:hover .card-overlay {
          opacity: 1;
        }

        .overlay-btn {
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ffffff;
          backdrop-filter: blur(4px);
        }

        .overlay-btn:hover {
          transform: scale(1.1);
        }

        .overlay-btn.view:hover {
          background: rgba(59, 130, 246, 0.8);
        }

        .overlay-btn.edit:hover {
          background: rgba(245, 158, 11, 0.8);
        }

        .overlay-btn.visibility.active:hover {
          background: rgba(16, 185, 129, 0.8);
        }

        .overlay-btn.visibility.inactive:hover {
          background: rgba(107, 114, 128, 0.8);
        }

        .overlay-btn.delete:hover {
          background: rgba(248, 113, 113, 0.8);
        }

        .overlay-btn svg {
          width: 18px;
          height: 18px;
        }

        .card-content {
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .file-name {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.3;
          flex: 1;
          margin-right: 12px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.inactive {
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.3);
        }

        .file-category {
          color: #3b82f6;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .file-description {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .file-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .meta-label {
          color: #6b7280;
          font-weight: 500;
        }

        .meta-value {
          color: #ffffff;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.download {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .action-btn.download:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-1px);
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .card-content {
            padding: 16px;
          }

          .file-meta {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default STLFileCard;