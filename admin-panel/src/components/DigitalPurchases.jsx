import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Download, Clock, CheckCircle, AlertCircle, FileText, Gift } from 'lucide-react';

const DigitalPurchases = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseAccepted, setLicenseAccepted] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchPurchases();
      setLicenseAccepted(user.publicMetadata?.licenseAccepted || false);
    }
  }, [isLoaded, user]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/digital/purchases', {
        headers: { 'Authorization': `Bearer ${await getToken()}` },
      });
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const data = await response.json();
      setPurchases(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseAccept = async () => {
    try {
      const response = await fetch('/api/digital/license/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to accept license');
      setLicenseAccepted(true);
      setShowLicenseModal(false);
      await user.reload();
    } catch (err) {
      setError(err.message);
      console.error('License acceptance error:', err);
    }
  };

  const handleDownload = async (purchaseId, productName) => {
    if (!licenseAccepted) {
      setShowLicenseModal(true);
      return;
    }
    setDownloadingId(purchaseId);
    try {
      const tokenResponse = await fetch(`/api/digital/generate-token/${purchaseId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${await getToken()}` },
      });
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to generate download token');
      }
      const { token } = await tokenResponse.json();
      const downloadUrl = `/api/digital/download/secure/${token}`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${productName.replace(/[^a-z0-9]/gi, '_')}_STL_Files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => fetchPurchases(), 1000);
    } catch (err) {
      setError(err.message);
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBulkDownload = async () => {
    if (!licenseAccepted) {
      setShowLicenseModal(true);
      return;
    }
    if (selectedForBulk.length === 0) {
      setError('Please select items to download');
      return;
    }
    setBulkDownloading(true);
    try {
      for (let i = 0; i < selectedForBulk.length; i++) {
        const purchaseId = selectedForBulk[i];
        const purchase = purchases.find(p => p.id === purchaseId);
        if (purchase) {
          await handleDownload(purchaseId, purchase.name);
          if (i < selectedForBulk.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      setSelectedForBulk([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkDownloading(false);
    }
  };

  const toggleBulkSelection = (purchaseId) => {
    setSelectedForBulk(prev => prev.includes(purchaseId)
      ? prev.filter(id => id !== purchaseId)
      : [...prev, purchaseId]
    );
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatFileSize = (sizeInMB) => {
    if (!sizeInMB) return 'Unknown size';
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    if (sizeInMB > 1024) return `${(sizeInMB / 1024).toFixed(1)} GB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your digital purchases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => { setError(null); fetchPurchases(); }}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Digital Purchases</h3>
        <p className="text-gray-600 mb-6">You haven't purchased any STL files or digital products yet.</p>
        <a href="/products" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Browse Digital Products
        </a>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Digital Purchases & Rewards</h2>
        <div className="flex items-center space-x-4">
          {selectedForBulk.length > 0 && (
            <button
              onClick={handleBulkDownload}
              disabled={bulkDownloading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {bulkDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading {selectedForBulk.length} items...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected ({selectedForBulk.length})
                </>
              )}
            </button>
          )}
          <p className="text-sm text-gray-600">{purchases.length} product{purchases.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {purchases.map((purchase) => (
          <motion.div
            key={purchase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border rounded-lg p-6 shadow-sm ${
              purchase.is_kickstarter ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-white' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedForBulk.includes(purchase.id)}
                  onChange={() => toggleBulkSelection(purchase.id)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{purchase.name}</h3>
                    {purchase.is_kickstarter && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Gift className="h-3 w-3 mr-1" />
                        Kickstarter Reward
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{purchase.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">{purchase.is_kickstarter ? 'Reward Granted:' : 'Purchased:'}</span>
                      <p className="font-medium">{formatDate(purchase.purchased_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-medium">
                        {purchase.is_kickstarter ? (
                          <span className="text-orange-600">Kickstarter Reward</span>
                        ) : (
                          `$${purchase.amount_paid} ${purchase.currency?.toUpperCase()}`
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">File Size:</span>
                      <p className="font-medium">{formatFileSize(purchase.file_size_mb)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Downloads:</span>
                      <p className="font-medium">{purchase.total_downloads} total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-6 flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">{purchase.is_kickstarter ? 'Reward Ready' : 'Completed'}</span>
                </div>
                <button
                  onClick={() => handleDownload(purchase.id, purchase.name)}
                  disabled={!purchase.can_download || downloadingId === purchase.id}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    purchase.can_download && downloadingId !== purchase.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {downloadingId === purchase.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download STLs
                    </>
                  )}
                </button>
                {!purchase.can_download && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {purchase.downloads_remaining} of {purchase.download_limit} remaining today
                  </div>
                )}
                {purchase.can_download && (
                  <div className="text-xs text-gray-500">{purchase.downloads_remaining} downloads remaining today</div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                By downloading these files, you agree to the{' '}
                <a href="/license" className="text-blue-600 hover:underline">STL File License Agreement</a>.
                Files are for personal, educational, and commercial use only.
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {showLicenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">STL File License Agreement</h3>
                <button onClick={() => setShowLicenseModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700">By downloading and using these STL files, you agree to the following terms:</p>
                <ul className="text-gray-700 space-y-2 mt-4">
                  <li>• Files are licensed for personal, educational, and commercial use</li>
                  <li>• You may modify and adapt the files for your projects</li>
                  <li>• Redistribution or resale of original files is prohibited</li>
                  <li>• Attribution to Yirra Systems is appreciated but not required</li>
                  <li>• Files are provided "as-is" without warranty</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  For complete terms, please see our{' '}
                  <a href="/license-agreement" className="text-blue-600 hover:underline" target="_blank">full license agreement</a>.
                </p>
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button onClick={() => setShowLicenseModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={handleLicenseAccept} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">I Accept & Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalPurchases;


