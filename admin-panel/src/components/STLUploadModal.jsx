import getApiUrl from '../utils/api.js';
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Modal from './Modal';
import FormInput, { FormTextarea } from './FormInput';

const STLUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    version: '1.0',
    price: '',
    buildInstructions: '',
    files: []
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isSTL = file.name.toLowerCase().endsWith('.stl');
      const isUnder100MB = file.size <= 100 * 1024 * 1024;
      
      if (!isSTL) {
        alert(`${file.name} is not an STL file`);
        return false;
      }
      if (!isUnder100MB) {
        alert(`${file.name} exceeds 100MB limit`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!formData.name || formData.files.length === 0) {
      alert('Please provide a name and select at least one STL file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = await getToken();
      if (!token) {
        alert('Authentication required. Please log in again.');
        setUploading(false);
        return;
      }
      
      const uploadFormData = new FormData();

      // Add form fields
      uploadFormData.append('name', formData.name);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('version', formData.version);
      uploadFormData.append('price', formData.price);
      uploadFormData.append('build_instructions', formData.buildInstructions);

      // Add files
      formData.files.forEach((file, index) => {
        uploadFormData.append('stlFiles', file);
      });

      const response = await fetch(getApiUrl('/api/admin/stl-files/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (response.ok) {
        const result = await response.json();
        alert('Files uploaded successfully!');
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          version: '1.0',
          price: '',
          buildInstructions: '',
          files: []
        });
        
        if (onUploadComplete) {
          onUploadComplete(result);
        }
        
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload STL Files"
      size="large"
      showCloseButton={!uploading}
    >
      <div className="upload-form">
        <div className="form-row">
          <FormInput
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter STL file name"
            required
            disabled={uploading}
          />
          
          <FormInput
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Frame, Electronics, Accessories"
            disabled={uploading}
          />
        </div>

        <div className="form-row">
          <FormInput
            label="Version"
            value={formData.version}
            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            placeholder="1.0"
            disabled={uploading}
          />
          
          <FormInput
            label="Price (Optional)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            disabled={uploading}
          />
        </div>

        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe this STL file..."
          rows={3}
          disabled={uploading}
        />

        <FormTextarea
          label="Build Instructions"
          value={formData.buildInstructions}
          onChange={(e) => setFormData(prev => ({ ...prev, buildInstructions: e.target.value }))}
          placeholder="Instructions for building/printing this part..."
          rows={4}
          disabled={uploading}
        />

        {/* File Upload Area */}
        <div className="file-upload-section">
          <label className="form-label">STL Files *</label>
          <div className="file-upload-area">
            <input
              type="file"
              accept=".stl"
              multiple
              onChange={handleFileSelect}
              className="file-input"
              disabled={uploading}
            />
            <div className="file-upload-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Click to select STL files</span>
              <div className="file-hint">or drag and drop files here</div>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {formData.files.length > 0 && (
          <div className="selected-files">
            <h4>Selected Files ({formData.files.length})</h4>
            {formData.files.map((file, index) => (
              <div key={index} className="selected-file">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                {!uploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-file"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">Uploading files...</span>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button 
            onClick={handleClose}
            className="btn-cancel"
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={uploading || !formData.name || formData.files.length === 0}
            className="btn-primary"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .upload-form {
          max-width: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }

        .file-upload-section {
          margin: 24px 0;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }

        .file-upload-area {
          position: relative;
          border: 2px dashed rgba(56, 68, 82, 0.6);
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.3);
          transition: all 0.2s ease;
        }

        .file-upload-area:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px 20px;
          cursor: pointer;
          color: #94a3b8;
        }

        .file-upload-label svg {
          width: 48px;
          height: 48px;
          color: #3b82f6;
        }

        .file-upload-label span {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
        }

        .file-hint {
          font-size: 14px;
          color: #64748b;
        }

        .selected-files {
          margin: 20px 0;
        }

        .selected-files h4 {
          margin: 0 0 16px 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
        }

        .selected-file {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(56, 68, 82, 0.3);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .selected-file svg {
          width: 20px;
          height: 20px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          color: #ffffff;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          color: #64748b;
          font-size: 12px;
          flex-shrink: 0;
        }

        .remove-file {
          width: 24px;
          height: 24px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          transition: color 0.2s ease;
          border-radius: 4px;
        }

        .remove-file:hover {
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
        }

        .remove-file svg {
          width: 16px;
          height: 16px;
        }

        .upload-progress {
          margin: 20px 0;
        }

        .progress-bar {
          height: 8px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          transition: width 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
          animation: progressShimmer 1s ease-in-out infinite;
        }

        @keyframes progressShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-text {
          font-size: 14px;
          color: #94a3b8;
          text-align: center;
          display: block;
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
          border-color: rgba(56, 68, 82, 0.5);
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
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
};

export default STLUploadModal;