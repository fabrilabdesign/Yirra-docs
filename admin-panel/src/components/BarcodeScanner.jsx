import React, { useState, useEffect } from 'react';
import useBarcodeScanner from '../hooks/useBarcodeScanner';

const BarcodeScanner = ({ onScan, onClose, mode = 'component' }) => {
  const { isScanning, lastScan, error, videoRef, startScanning, stopScanning } = useBarcodeScanner();
  const [scanning, setScanning] = useState(false);
  const [foundComponent, setFoundComponent] = useState(null);

  useEffect(() => {
    if (scanning) {
      startScanning(handleScanResult);
    } else {
      stopScanning();
    }

    return () => stopScanning();
  }, [scanning, startScanning, stopScanning]);

  const handleScanResult = async (scannedData) => {
    console.log('Scanned:', scannedData);
    
    try {
      // Try to lookup component from database
      const component = await lookupComponent(scannedData.text, mode);
      
      if (component) {
        setFoundComponent(component);
        if (onScan) {
          onScan(component, scannedData);
        }
      } else {
        // Show manual entry option
        setFoundComponent({
          id: null,
          name: `Unknown ${mode}`,
          barcode: scannedData.text,
          needsManualEntry: true
        });
      }
    } catch (err) {
      console.error('Component lookup error:', err);
    }
  };

  const lookupComponent = async (barcode, type) => {
    // Simulate API call - replace with actual API
    const mockComponents = {
      'component': [
        { id: 'comp_001', name: 'Resistor 10k Ohm', barcode: '123456789', unit_cost: 0.05, category: 'passive' },
        { id: 'comp_002', name: 'Capacitor 100uF', barcode: '987654321', unit_cost: 0.15, category: 'passive' },
        { id: 'comp_003', name: 'Arduino Nano', barcode: '555666777', unit_cost: 12.50, category: 'microcontroller' }
      ],
      'product': [
        { id: 'prod_001', name: 'Drone Frame Kit', barcode: '111222333', price: 45.00, category: 'mechanical' },
        { id: 'prod_002', name: 'Motor ESC 30A', barcode: '444555666', price: 25.00, category: 'electronic' }
      ]
    };

    const items = mockComponents[type] || mockComponents.component;
    return items.find(item => item.barcode === barcode);
  };

  const handleManualEntry = () => {
    if (foundComponent && foundComponent.needsManualEntry) {
      const manualComponent = {
        ...foundComponent,
        id: `manual_${Date.now()}`,
        needsManualEntry: false,
        isManual: true
      };
      
      if (onScan) {
        onScan(manualComponent, { text: foundComponent.barcode });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            Scan {mode === 'component' ? 'Component' : 'Product'} Barcode
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          {!scanning ? (
            <div className="text-center space-y-4">
              <div className="bg-gray-700 rounded-xl p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5l2 2h6l2-2h5v16H4V4z" />
                </svg>
                <p className="text-gray-300 mb-4">Position the barcode in the camera frame</p>
                <button
                  onClick={() => setScanning(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Scanning
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video */}
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-400 w-48 h-32 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                {error ? (
                  <p className="text-red-400">{error}</p>
                ) : (
                  <p className="text-gray-300">
                    {isScanning ? 'Scanning for barcodes...' : 'Initializing camera...'}
                  </p>
                )}
              </div>

              {/* Stop button */}
              <button
                onClick={() => setScanning(false)}
                className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Stop Scanning
              </button>
            </div>
          )}

          {/* Found Component */}
          {foundComponent && (
            <div className="mt-4 p-4 bg-gray-700 rounded-xl">
              <h4 className="text-white font-medium mb-2">
                {foundComponent.needsManualEntry ? 'Unknown Item Found' : 'Component Found!'}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{foundComponent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Barcode:</span>
                  <span className="text-white">{foundComponent.barcode}</span>
                </div>
                {foundComponent.unit_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <span className="text-white">${foundComponent.unit_cost}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                {foundComponent.needsManualEntry ? (
                  <>
                    <button
                      onClick={handleManualEntry}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add Manually
                    </button>
                    <button
                      onClick={() => setFoundComponent(null)}
                      className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ✓ Added to BOM
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;