import getApiUrl from '../utils/api.js';
import React from 'react';
import Modal from './Modal';
import STLViewer from './STLViewer';

const STLViewerModal = ({ isOpen, onClose, file, onEdit, onDownload }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEdit = () => {
    onClose();
    onEdit(file);
  };

  const handleDownload = () => {
    onDownload(file.id, file.name);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`3D STL Viewer - ${file?.name}`}
      size="large"
    >
      <div className="viewer-modal-content">
        {/* 3D Viewer */}
        <div className="viewer-container">
          <STLViewer
            stlUrl={`/api/admin/stl-files/${file?.id}/download`}
            fileId={file?.id}
            fileName={file?.name}
            width={700}
            height={500}
            showControls={true}
            autoRotate={false}
            backgroundColor="#1e293b"
          />
        </div>
        
        {/* File Information */}
        <div className="file-info">
          <div className="info-section">
            <h4>File Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{file?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Size:</span>
                <span className="info-value">{formatFileSize(file?.file_size)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Category:</span>
                <span className="info-value">{file?.category || 'None'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Version:</span>
                <span className="info-value">v{file?.version || '1.0'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Downloads:</span>
                <span className="info-value">{file?.download_count || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value status ${file?.is_active ? 'active' : 'inactive'}`}>
                  {file?.is_active ? 'Public' : 'Hidden'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {file?.created_at ? 
                    new Date(file.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'Unknown'
                  }
                </span>
              </div>
              {file?.price && (
                <div className="info-item">
                  <span className="info-label">Price:</span>
                  <span className="info-value">${parseFloat(file.price).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          {file?.description && (
            <div className="info-section">
              <h4>Description</h4>
              <p className="description-text">{file.description}</p>
            </div>
          )}
          
          {file?.build_instructions && (
            <div className="info-section">
              <h4>Build Instructions</h4>
              <p className="instructions-text">{file.build_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Actions */}
      <div className="modal-actions">
        <button 
          onClick={handleDownload}
          className="btn-download"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download STL
        </button>
        <button 
          onClick={handleEdit}
          className="btn-edit"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit File
        </button>
        <button 
          onClick={onClose}
          className="btn-close"
        >
          Close
        </button>
      </div>

      <style jsx>{`
        .viewer-modal-content {
          display: flex;
          gap: 32px;
          min-height: 500px;
        }

        .viewer-container {
          flex: 1;
          background: rgba(15, 20, 25, 0.5);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-info {
          flex: 0 0 350px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-section {
          background: rgba(15, 20, 25, 0.3);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(56, 68, 82, 0.3);
        }

        .info-section h4 {
          margin: 0 0 16px 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
          padding-bottom: 8px;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .info-label {
          color: #94a3b8;
          font-weight: 500;
          flex-shrink: 0;
        }

        .info-value {
          color: #ffffff;
          font-weight: 600;
          text-align: right;
          word-break: break-word;
        }

        .info-value.status.active {
          color: #10b981;
        }

        .info-value.status.inactive {
          color: #6b7280;
        }

        .description-text,
        .instructions-text {
          margin: 0;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(56, 68, 82, 0.2);
        }

        .btn-download,
        .btn-edit,
        .btn-close {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-download {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .btn-download:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-1px);
        }

        .btn-edit {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }

        .btn-edit:hover {
          background: rgba(245, 158, 11, 0.2);
          transform: translateY(-1px);
        }

        .btn-close {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(56, 68, 82, 0.3);
          color: #94a3b8;
        }

        .btn-close:hover {
          background: rgba(30, 41, 59, 0.8);
        }

        .btn-download svg,
        .btn-edit svg {
          width: 16px;
          height: 16px;
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .viewer-modal-content {
            flex-direction: column;
          }

          .file-info {
            flex: none;
            order: 2;
          }

          .viewer-container {
            min-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .modal-actions {
            flex-direction: column;
          }

          .btn-download,
          .btn-edit,
          .btn-close {
            justify-content: center;
          }

          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .info-value {
            text-align: left;
          }
        }
      `}</style>
    </Modal>
  );
};

export default STLViewerModal;