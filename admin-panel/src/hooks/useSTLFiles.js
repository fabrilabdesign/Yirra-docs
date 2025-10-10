import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getApiUrl from '../utils/api.js';

const useSTLFiles = () => {
  const { getToken } = useAuth();
  const [stlFiles, setStlFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSTLFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      
      const response = await fetch(getApiUrl('/api/admin/stl-files'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        redirect: 'manual' // Don't follow redirects automatically
      });

      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        console.log('Authentication required - user not logged in or token expired');
        setError('Please log in to access STL files');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStlFiles(data);
      } else {
        throw new Error('Failed to fetch STL files');
      }
    } catch (err) {
      console.error('STL files fetch error:', err);
      setError('Failed to load STL files');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    try {
      const token = await getToken();
      const response = await fetch(getApiUrl(`/api/admin/stl-files/${fileId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        redirect: 'manual'
      });

      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        return { success: false, error: 'Authentication required' };
      }

      if (response.ok) {
        setStlFiles(prev => prev.filter(file => file.id !== fileId));
        return { success: true };
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (err) {
      console.error('Delete error:', err);
      return { success: false, error: 'Failed to delete file' };
    }
  }, []);

  const toggleFileVisibility = useCallback(async (fileId, isActive) => {
    try {
      const token = await getToken();
      const newStatus = !isActive;
      
      const response = await fetch(getApiUrl(`/api/admin/stl-files/${fileId}/toggle`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newStatus }),
        redirect: 'manual'
      });

      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        return { success: false, error: 'Authentication required' };
      }

      if (response.ok) {
        const result = await response.json();
        setStlFiles(prev => prev.map(file => 
          file.id == fileId ? { ...file, is_active: newStatus } : file
        ));
        return { 
          success: true, 
          message: result.message,
          newStatus: newStatus
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Toggle visibility error:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to toggle file visibility' 
      };
    }
  }, []);

  const updateFile = useCallback(async (fileId, updates) => {
    try {
      const token = await getToken();
      
      // Validate inputs
      if (!fileId) {
        throw new Error('File ID is required');
      }
      
      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('Updates object cannot be empty');
      }

      const response = await fetch(getApiUrl(`/api/admin/stl-files/${fileId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
        redirect: 'manual'
      });

      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        return { success: false, error: 'Authentication required' };
      }

      if (response.ok) {
        const result = await response.json();
        const updatedFile = result.file || result;
        
        setStlFiles(prev => prev.map(file => 
          file.id == fileId ? { ...file, ...updatedFile } : file
        ));
        return { success: true, data: updatedFile, message: result.message };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to update file',
        status: err.status
      };
    }
  }, []);

  const downloadFile = useCallback(async (fileId, fileName) => {
    try {
      const token = await getToken();
      const response = await fetch(getApiUrl(`/api/admin/stl-files/${fileId}/download`), {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        redirect: 'manual'
      });

      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        return { success: false, error: 'Authentication required' };
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        return { success: true };
      } else {
        throw new Error('Failed to download file');
      }
    } catch (err) {
      console.error('Download error:', err);
      return { success: false, error: 'Failed to download file' };
    }
  }, []);

  const updateOrientation = useCallback(async (fileId, orientation) => {
    try {
      const token = await getToken();
      
      // Validate inputs
      if (!fileId) {
        throw new Error('File ID is required');
      }
      
      if (!orientation || typeof orientation !== 'object') {
        throw new Error('Orientation object is required');
      }

      // Debug: Log the data being sent
      console.log('Sending orientation update for file:', fileId);
      console.log('Orientation data being sent:', orientation);
      
      const response = await fetch(getApiUrl(`/api/admin/stl-files/${fileId}/orientation`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orientation),
        redirect: 'manual'
      });

      // Handle redirects as authentication errors
      if (response.type === 'opaqueredirect' || response.status === 302) {
        return { success: false, error: 'Authentication required' };
      }

      if (response.ok) {
        const result = await response.json();
        const updatedFile = result.file || result;
        
        setStlFiles(prev => prev.map(file => 
          file.id == fileId ? { ...file, ...updatedFile } : file
        ));
        return { success: true, data: updatedFile, message: result.message };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Update orientation error:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to update orientation',
        status: err.status
      };
    }
  }, []);

  useEffect(() => {
    fetchSTLFiles();
  }, [fetchSTLFiles]);

  return {
    stlFiles,
    loading,
    error,
    refetch: fetchSTLFiles,
    deleteFile,
    toggleFileVisibility,
    updateFile,
    downloadFile,
    updateOrientation
  };
};

export default useSTLFiles;