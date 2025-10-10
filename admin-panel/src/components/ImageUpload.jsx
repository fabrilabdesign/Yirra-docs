import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * Unified ImageUpload component that handles all product image upload logic
 * Uses Clerk authentication and provides consistent upload experience
 */
const ImageUpload = ({ 
  onUploadSuccess = null,
  onUploadError = null,
  onUploadProgress = null,
  productId = null,
  currentImage = null,
  className = '',
  buttonText = 'Upload Image',
  acceptedTypes = 'image/*',
  maxSizeMB = 10,
  showPreview = true,
  disabled = false
}) => {
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Auto-upload if productId is provided
      if (productId) {
        uploadImage(file);
      } else if (onUploadSuccess) {
        // Pass file to parent for manual upload
        onUploadSuccess(file, reader.result);
      }
    } catch (err) {
      setError(err.message);
      if (onUploadError) onUploadError(err);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('image', file);
      if (productId) {
        formData.append('productId', productId);
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progressPercent = Math.round((e.loaded / e.total) * 100);
            setProgress(progressPercent);
            if (onUploadProgress) onUploadProgress(progressPercent);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Image upload successful:', response);
              if (onUploadSuccess) onUploadSuccess(response.imageUrl, preview);
              resolve(response.imageUrl);
            } catch (parseError) {
              console.error('Failed to parse upload response:', parseError);
              const error = new Error('Invalid server response');
              if (onUploadError) onUploadError(error);
              reject(error);
            }
          } else {
            console.error('Upload failed with status:', xhr.status);
            const error = new Error(`Upload failed: ${xhr.status}`);
            if (onUploadError) onUploadError(error);
            reject(error);
          }
        });
        
        xhr.addEventListener('error', () => {
          console.error('Upload network error');
          const error = new Error('Network error during upload');
          if (onUploadError) onUploadError(error);
          reject(error);
        });
        
        xhr.open('POST', '/api/admin/products/upload-image');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      if (onUploadError) onUploadError(err);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={disabled || uploading}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${disabled || uploading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }
        `}
      >
        {uploading ? `Uploading... ${progress}%` : buttonText}
      </button>

      {/* Progress bar */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Image preview */}
      {showPreview && preview && (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            ×
          </button>
        </div>
      )}

      {/* Upload info */}
      <p className="text-xs text-gray-500">
        Accepted: {acceptedTypes} • Max size: {maxSizeMB}MB
      </p>
    </div>
  );
};

export default ImageUpload;
