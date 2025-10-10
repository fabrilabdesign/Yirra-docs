import getApiUrl from '../utils/api.js';
import React, { useState, useEffect } from 'react';

export function STLFilesPage() {
  const [stlFiles, setStlFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(getApiUrl('/api/stl/public'))
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch STL files');
        }
        return response.json();
      })
      .then(data => {
        setStlFiles(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching STL files:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#00f2fe' }} />
            <p className="mt-6 text-gray-600 text-lg">Loading STL files...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Error loading STL files: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">STL Files Library</h2>
          <p className="text-lg text-gray-600">Browse and download 3D printable files for your drone projects</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stlFiles.map(file => (
            <div key={file.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
              <p className="text-gray-600 mb-4">{file.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{file.file_size}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 