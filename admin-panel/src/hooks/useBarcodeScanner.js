import { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

export const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
  const readerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  const startScanning = useCallback(async (onResult) => {
    try {
      setError(null);
      setIsScanning(true);

      if (!readerRef.current) {
        throw new Error('Barcode reader not initialized');
      }

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      // Prefer back camera for scanning
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      ) || videoInputDevices[0];

      if (!backCamera) {
        throw new Error('No camera available for scanning');
      }

      await readerRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedData = {
              text: result.getText(),
              format: result.getBarcodeFormat(),
              timestamp: new Date().toISOString()
            };
            
            setLastScan(scannedData);
            if (onResult) {
              onResult(scannedData);
            }
          }
          
          if (error && !(error.name === 'NotFoundException')) {
            console.error('Scan error:', error);
          }
        }
      );

    } catch (err) {
      console.error('Scanner start error:', err);
      setError(err.message);
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
  }, []);

  const scanSingleFrame = useCallback(async (imageData) => {
    try {
      if (!readerRef.current) {
        throw new Error('Barcode reader not initialized');
      }

      const result = await readerRef.current.decodeFromImageUrl(imageData);
      const scannedData = {
        text: result.getText(),
        format: result.getBarcodeFormat(),
        timestamp: new Date().toISOString()
      };
      
      setLastScan(scannedData);
      return scannedData;
    } catch (err) {
      console.error('Single frame scan error:', err);
      throw err;
    }
  }, []);

  return {
    isScanning,
    lastScan,
    error,
    videoRef,
    startScanning,
    stopScanning,
    scanSingleFrame
  };
};

export default useBarcodeScanner;