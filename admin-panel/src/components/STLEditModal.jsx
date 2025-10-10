import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormInput, { FormTextarea } from './FormInput';
import STLViewer from './STLViewer';
import STLOrientationControls from './STLOrientationControls';

const STLEditModal = ({ isOpen, onClose, file, onUpdate }) => {
    const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState({});

  useEffect(() => {
    if (isOpen && file) {
      setFormData({
        name: file.name || '',
        description: file.description || '',
        category: file.category || '',
        version: file.version || '1.0',
        price: file.price || '',
        build_instructions: file.build_instructions || '',
        is_active: file.is_active ?? true,
      });
      setCurrentOrientation(file.orientation || { x: 0, y: 0, z: 0 });
    } else {
      // Reset state when modal is closed
      setFormData({});
      setCurrentOrientation({});
    }
  }, [isOpen, file]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Combine form data and orientation data for a single update
      const updatePayload = {
        ...formData,
        orientation_x: currentOrientation.x,
        orientation_y: currentOrientation.y,
        orientation_z: currentOrientation.z,
      };

      const result = await onUpdate(file.id, updatePayload);
      if (result.success) {
        alert('File updated successfully!');
        onClose();
      } else {
        alert(result.error || 'Failed to update file');
      }
    } catch (error) {
      console.error('Failed to update file:', error);
      alert('An error occurred while updating the file.');
    } finally {
      setSaving(false);
    }
  };

  const handleOrientationChange = (orientation) => {
    setCurrentOrientation(prev => {
      const newOrientation = { ...(prev || {}) };

      if (typeof orientation === 'object' && orientation !== null) {
        // Handle direct orientation object from viewer (in radians)
        return {
          x: (orientation.x * (180 / Math.PI)) % 360,
          y: (orientation.y * (180 / Math.PI)) % 360,
          z: (orientation.z * (180 / Math.PI)) % 360,
        };
      } 

      // Handle action strings from controls
      switch (orientation) {
        case 'flipX':
          newOrientation.x = (newOrientation.x + 180) % 360;
          break;
        case 'flipY':
          newOrientation.y = (newOrientation.y + 180) % 360;
          break;
        case 'rotate90':
          newOrientation.z = (newOrientation.z + 90) % 360;
          break;
        case 'reset':
          return { x: 0, y: 0, z: 0 };
        default:
          return newOrientation; // No change for unknown actions
      }
      return newOrientation;
    });
  };

  

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit STL - ${file?.name}`}
      size="xlarge"
      showCloseButton={!saving}
    >
      <div className="edit-modal-content">
        {/* 3D Viewer Section */}
        <div className="viewer-section">
          <div className="viewer-header">
            <h4>3D Preview</h4>
            <div className="viewer-controls">
              <button className="control-btn" title="Reset View">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="control-btn" title="Wireframe">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </button>
              <button className="control-btn" title="Fullscreen">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="viewer-container">
            <STLViewer
              stlUrl={`/api/admin/stl-files/${file?.id}/download`}
              fileId={file?.id}
              fileName={file?.name}
              width={500}
              height={400}
              showControls={true}
              autoRotate={false}
              backgroundColor="#1e293b"
              initialOrientation={file?.orientation || { x: 0, y: 0, z: 0 }}
              onOrientationChange={handleOrientationChange}
            />
          </div>

          {/* Orientation Controls */}
          <STLOrientationControls onOrientationChange={handleOrientationChange} />

          <div className="save-orientation-info">
            <p>Orientation changes are saved with the rest of the file properties.</p>
          </div>
        </div>

        {/* Properties Section */}
        <div className="properties-section">
          <h4>File Properties</h4>
          
          <div className="form-grid">
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter STL file name"
              required
              disabled={saving}
            />
            
            <FormInput
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Frame, Electronics"
              disabled={saving}
            />
            
            <FormInput
              label="Version"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              placeholder="1.0"
              disabled={saving}
            />
            
            <FormInput
              label="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              disabled={saving}
            />
          </div>

          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this STL file..."
            rows={3}
            disabled={saving}
          />

          <FormTextarea
            label="Build Instructions"
            value={formData.build_instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, build_instructions: e.target.value }))}
            placeholder="Instructions for building/printing this part..."
            rows={4}
            disabled={saving}
          />

          {/* Visibility Toggle */}
          <div className="visibility-section">
            <label className="visibility-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                disabled={saving}
                className="visibility-checkbox"
              />
              <span className="checkmark"></span>
              <span className="label-text">Make this file publicly visible</span>
            </label>
          </div>

          {/* File Info */}
          <div className="file-info">
            <div className="info-item">
              <span className="info-label">File Size:</span>
              <span className="info-value">
                {file?.file_size ? 
                  `${(file.file_size / (1024 * 1024)).toFixed(2)} MB` : 
                  'Unknown'
                }
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Downloads:</span>
              <span className="info-value">{file?.download_count || 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {file?.created_at ? 
                  new Date(file.created_at).toLocaleDateString() : 
                  'Unknown'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="modal-actions">
        <button 
          onClick={onClose}
          className="btn-cancel"
          disabled={saving}
        >
          Cancel
        </button>
        <button 

          disabled={saving}
          className="btn-warning"
          title="Save the current 3D orientation"
        >
          {saving ? 'Saving...' : 'Save Orientation'}
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <style jsx>{`
        .edit-modal-content {
          display: flex;
          gap: 32px;
          min-height: 500px;
        }

        .viewer-section {
          flex: 1;
          min-width: 500px;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .viewer-header h4 {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
        }

        .viewer-controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          width: 36px;
          height: 36px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #60a5fa;
        }

        .control-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .control-btn svg {
          width: 20px;
          height: 20px;
        }

        .viewer-container {
          background: rgba(15, 20, 25, 0.5);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          margin-bottom: 16px;
        }

        .properties-section {
          flex: 0 0 400px;
          background: rgba(15, 20, 25, 0.3);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(56, 68, 82, 0.3);
          overflow-y: auto;
          max-height: 600px;
        }

        .properties-section h4 {
          margin: 0 0 24px 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 1px solid rgba(56, 68, 82, 0.3);
          padding-bottom: 12px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .visibility-section {
          margin: 24px 0;
          padding: 16px;
          background: rgba(30, 41, 59, 0.3);
          border-radius: 8px;
          border: 1px solid rgba(56, 68, 82, 0.3);
        }

        .visibility-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .visibility-checkbox {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(56, 68, 82, 0.6);
          border-radius: 4px;
          position: relative;
          transition: all 0.2s ease;
        }

        .visibility-checkbox:checked + .checkmark {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .visibility-checkbox:checked + .checkmark::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .file-info {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(56, 68, 82, 0.3);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .info-label {
          color: #94a3b8;
          font-weight: 500;
        }

        .info-value {
          color: #ffffff;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(56, 68, 82, 0.2);
        }

        .btn-cancel,
        .btn-primary {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-cancel {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(56, 68, 82, 0.3);
          color: #94a3b8;
        }

        .btn-cancel:hover:not(:disabled) {
          background: rgba(30, 41, 59, 0.8);
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .edit-modal-content {
            flex-direction: column;
          }

          .viewer-section {
            min-width: auto;
          }

          .properties-section {
            flex: none;
            max-height: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};

export default STLEditModal;