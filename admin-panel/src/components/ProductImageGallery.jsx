import getApiUrl from '../utils/api.js';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Cache busting utility with multiple strategies
const addCacheBuster = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${url}${separator}v=${timestamp}&cb=${random}`;
};

const ProductImageGallery = ({ productId, isOpen, onClose, onImagesUpdated }) => {
  const { getToken } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [reordering, setReordering] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchImages();
    }
  }, [isOpen, productId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/admin/products/${productId}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        throw new Error('Failed to fetch images');
      }
    } catch (err) {
      console.error('Images fetch error:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped (invalid type or too large)');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setUploading(false);
        return;
      }
      
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      formData.append('category', 'gallery');
      formData.append('setPrimary', images.length === 0); // Set first image as primary if no images exist

      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFiles([]);
        await fetchImages();
        onImagesUpdated && onImagesUpdated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const response = await fetch(`/api/admin/products/images/${imageId}?permanent=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Success - refresh the image list
        await fetchImages();
        onImagesUpdated && onImagesUpdated();
      } else if (response.status === 404) {
        // Image already deleted - just refresh the list
        console.log('Image was already deleted, refreshing list');
        await fetchImages();
        onImagesUpdated && onImagesUpdated();
      } else {
        // Other error - show error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Delete failed: ${err.message}`);
      // Always refresh the list to ensure we have current data
      await fetchImages();
      // Always notify parent to refresh, even on error
      onImagesUpdated && onImagesUpdated();
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchImages();
        onImagesUpdated && onImagesUpdated();
      } else {
        throw new Error('Failed to set primary image');
      }
    } catch (err) {
      console.error('Set primary error:', err);
      setError(`Failed to set primary: ${err.message}`);
    }
  };

  const updateImageMetadata = async (imageId, metadata) => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (response.ok) {
        await fetchImages();
      } else {
        throw new Error('Failed to update image');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(`Update failed: ${err.message}`);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDragEnter = (e) => {
    e.preventDefault();
  };

  const handleImageDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    reorderImages(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const reorderImages = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    try {
      setReordering(true);
      
      // Optimistically update the UI
      const newImages = [...images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      setImages(newImages);
      
      // Create the new order array with image IDs
      const imageOrder = newImages.map(img => img.id);
      
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setReordering(false);
        return;
      }
      const response = await fetch(`/api/admin/products/${productId}/images/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageOrder })
      });

      if (response.ok) {
        // Refresh to get the updated order from server
        await fetchImages();
        onImagesUpdated && onImagesUpdated();
      } else {
        // Revert the optimistic update on failure
        await fetchImages();
        throw new Error('Failed to reorder images');
      }
    } catch (err) {
      console.error('Reorder error:', err);
      setError(`Failed to reorder images: ${err.message}`);
      // Revert optimistic update
      await fetchImages();
    } finally {
      setReordering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="image-gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Product Image Gallery</h3>
          <button onClick={onClose} className="close-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-banner">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button onClick={() => setError(null)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload Area */}
          <div className="upload-section">
            <div 
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-zone-content">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h4>Drop images here or click to browse</h4>
                <p>Supports JPG, PNG, WebP, GIF • Max 10MB each</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="file-input"
              />
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <div className="selected-files-header">
                  <h4>Selected Files ({selectedFiles.length})</h4>
                  <div className="file-actions">
                    <button 
                      onClick={() => setSelectedFiles([])} 
                      className="btn-clear"
                      disabled={uploading}
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={uploadImages} 
                      className="btn-upload"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
                    </button>
                  </div>
                </div>
                <div className="file-previews">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-preview">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      />
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button 
                        onClick={() => removeSelectedFile(index)}
                        className="remove-file"
                        disabled={uploading}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Images */}
          <div className="current-images">
            <h4>Current Images ({images.length})</h4>
            {loading ? (
              <div className="loading-state">
                <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Loading images...
              </div>
            ) : images.length === 0 ? (
              <div className="empty-images">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No images uploaded yet</p>
              </div>
            ) : (
              <div className={`images-grid ${reordering ? 'reordering' : ''}`}>
                {images.map((image, index) => (
                  <div 
                    key={image.id} 
                    className={`image-card ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleImageDragOver}
                    onDragEnter={handleImageDragEnter}
                    onDrop={(e) => handleImageDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="image-container">
                      <div className="drag-handle" title="Drag to reorder">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <img 
                        src={addCacheBuster(image.thumbnail_url || image.file_url)} 
                        alt={image.alt_text || image.file_name}
                        onError={(e) => {
                          console.error('Image load error:', e.target.src);
                          e.target.src = '/images/products/default.webp';
                        }}
                      />
                      {image.is_primary && (
                        <div className="primary-badge">Primary</div>
                      )}
                      <div className="image-overlay">
                        <div className="image-actions">
                          {!image.is_primary && (
                            <button 
                              onClick={() => setPrimaryImage(image.id)}
                              className="action-btn primary"
                              title="Set as primary"
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          )}
                          <button 
                            onClick={() => deleteImage(image.id)}
                            className="action-btn delete"
                            title="Delete image"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="image-info">
                      <input 
                        type="text"
                        placeholder="Alt text"
                        defaultValue={image.alt_text || ''}
                        onBlur={(e) => updateImageMetadata(image.id, { altText: e.target.value })}
                        className="alt-text-input"
                      />
                      <div className="image-details">
                        <span className="file-name">{image.file_name}</span>
                        <span className="file-size">{(image.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        {image.width && image.height && (
                          <span className="dimensions">{image.width} × {image.height}px</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .image-gallery-modal {
            background: linear-gradient(135deg, #0f1419 0%, #0a0e1a 100%);
            border-radius: 16px;
            max-width: 1000px;
            width: 95%;
            max-height: 90vh;
            overflow: hidden;
            border: 1px solid rgba(56, 68, 82, 0.3);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            border-bottom: 1px solid rgba(56, 68, 82, 0.2);
          }

          .modal-header h3 {
            margin: 0;
            color: #ffffff;
            font-size: 20px;
            font-weight: 600;
          }

          .close-btn {
            width: 32px;
            height: 32px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(56, 68, 82, 0.3);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #94a3b8;
          }

          .close-btn:hover {
            background: rgba(248, 113, 113, 0.1);
            border-color: rgba(248, 113, 113, 0.3);
            color: #f87171;
          }

          .close-btn svg {
            width: 16px;
            height: 16px;
          }

          .modal-body {
            flex: 1;
            padding: 32px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 32px;
          }

          .error-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.2);
            border-radius: 8px;
            color: #f87171;
            font-size: 14px;
          }

          .error-banner svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }

          .error-banner button {
            margin-left: auto;
            background: none;
            border: none;
            color: #f87171;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s ease;
          }

          .error-banner button:hover {
            background: rgba(248, 113, 113, 0.1);
          }

          .error-banner button svg {
            width: 16px;
            height: 16px;
          }

          .upload-section {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .drop-zone {
            border: 2px dashed rgba(56, 68, 82, 0.5);
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }

          .drop-zone:hover,
          .drop-zone.drag-over {
            border-color: rgba(59, 130, 246, 0.5);
            background: rgba(59, 130, 246, 0.05);
          }

          .drop-zone-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .upload-icon {
            width: 48px;
            height: 48px;
            color: #3b82f6;
          }

          .drop-zone h4 {
            margin: 0;
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
          }

          .drop-zone p {
            margin: 0;
            color: #94a3b8;
            font-size: 14px;
          }

          .file-input {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }

          .selected-files {
            border: 1px solid rgba(56, 68, 82, 0.3);
            border-radius: 12px;
            overflow: hidden;
          }

          .selected-files-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: rgba(30, 41, 59, 0.3);
            border-bottom: 1px solid rgba(56, 68, 82, 0.3);
          }

          .selected-files-header h4 {
            margin: 0;
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
          }

          .file-actions {
            display: flex;
            gap: 12px;
          }

          .btn-clear,
          .btn-upload {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-clear {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(56, 68, 82, 0.3);
            color: #94a3b8;
          }

          .btn-clear:hover:not(:disabled) {
            background: rgba(30, 41, 59, 0.8);
          }

          .btn-upload {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: none;
            color: white;
          }

          .btn-upload:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-clear:disabled,
          .btn-upload:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .file-previews {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
            padding: 20px;
          }

          .file-preview {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .file-preview img {
            width: 100%;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid rgba(56, 68, 82, 0.3);
          }

          .file-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .file-name {
            font-size: 12px;
            color: #ffffff;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .file-size {
            font-size: 11px;
            color: #94a3b8;
          }

          .remove-file {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 20px;
            height: 20px;
            background: rgba(248, 113, 113, 0.9);
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: white;
          }

          .remove-file:hover {
            background: #f87171;
            transform: scale(1.1);
          }

          .remove-file svg {
            width: 12px;
            height: 12px;
          }

          .current-images h4 {
            margin: 0 0 20px 0;
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
          }

          .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 40px;
            color: #94a3b8;
            font-size: 16px;
          }

          .loading-state svg {
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .empty-images {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 40px;
            color: #94a3b8;
            text-align: center;
          }

          .empty-images svg {
            width: 48px;
            height: 48px;
          }

          .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }

          .images-grid.reordering {
            pointer-events: none;
          }

          .images-grid.reordering .image-card {
            opacity: 0.7;
          }

          .image-card {
            background: rgba(30, 41, 59, 0.3);
            border: 1px solid rgba(56, 68, 82, 0.3);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.2s ease;
            cursor: grab;
            position: relative;
          }

          .image-card:active {
            cursor: grabbing;
          }

          .image-card.dragging {
            opacity: 0.5;
            transform: rotate(5deg);
            z-index: 1000;
          }

          .image-card:hover {
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
          }

          .image-container {
            position: relative;
            height: 160px;
            overflow: hidden;
          }

          .drag-handle {
            position: absolute;
            top: 8px;
            left: 8px;
            width: 24px;
            height: 24px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 10;
            cursor: grab;
          }

          .image-card:hover .drag-handle {
            opacity: 1;
          }

          .drag-handle:active {
            cursor: grabbing;
          }

          .drag-handle svg {
            width: 14px;
            height: 14px;
          }

          .image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .primary-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(251, 191, 36, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .image-card:hover .image-overlay {
            opacity: 1;
          }

          .image-actions {
            display: flex;
            gap: 8px;
          }

          .action-btn {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .action-btn.primary {
            background: rgba(251, 191, 36, 0.9);
            color: white;
          }

          .action-btn.primary:hover {
            background: #fbbf24;
            transform: scale(1.1);
          }

          .action-btn.delete {
            background: rgba(248, 113, 113, 0.9);
            color: white;
          }

          .action-btn.delete:hover {
            background: #f87171;
            transform: scale(1.1);
          }

          .action-btn svg {
            width: 16px;
            height: 16px;
          }

          .image-info {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .alt-text-input {
            width: 100%;
            padding: 8px 12px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            color: #1f2937;
            font-size: 13px;
            transition: all 0.2s ease;
          }

          .alt-text-input::placeholder {
            color: #6b7280;
          }

          .alt-text-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            background: #ffffff;
          }

          .image-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .image-details span {
            font-size: 11px;
            color: #94a3b8;
          }

          .dimensions {
            color: #64748b;
          }

          @media (max-width: 768px) {
            .image-gallery-modal {
              width: 100%;
              height: 100%;
              max-height: 100vh;
              border-radius: 0;
            }

            .modal-body {
              padding: 20px;
            }

            .file-previews {
              grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
              gap: 12px;
              padding: 16px;
            }

            .images-grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
              gap: 16px;
            }

            .selected-files-header {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }

            .file-actions {
              width: 100%;
            }

            .btn-clear,
            .btn-upload {
              flex: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProductImageGallery;