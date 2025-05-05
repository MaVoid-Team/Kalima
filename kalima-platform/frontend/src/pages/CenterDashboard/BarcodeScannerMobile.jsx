import React, { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { ScanbotBarcodeSDK } from 'capacitor-plugin-scanbot-barcode-scanner-sdk';
import {
  startBarcodeScanner,
  BarcodeScannerConfiguration,
  SingleScanningMode,
} from 'capacitor-plugin-scanbot-barcode-scanner-sdk/ui_v2';

const BarcodeScannerAndroid = ({ translations, onScanSuccess }) => {
  const [scannedResult, setScannedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (Capacitor.getPlatform() !== 'android') {
      console.warn('Scanbot Barcode Scanner is disabled on non-Android platforms.');
      return;
    }

    (async () => {
      try {
        await ScanbotBarcodeSDK.initializeSdk({
          licenseKey: import.meta.env.VITE_SCANBOTANDROID_LICENSE,
          loggingEnabled: true,
          enableNativeLogging: true,
          useCameraX: true,
        });
        if (!ignore) {
          console.log('Scanbot SDK initialized successfully.');
        }
      } catch (error) {
        console.error('Failed to initialize Scanbot SDK:', error);
        if (!ignore) {
          setError(translations?.scanError || 'Failed to initialize scanner.');
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [translations]);

  const startScan = async () => {
    if (Capacitor.getPlatform() !== 'android') return;

    setLoading(true);
    setError(null);
    setScannedResult(null);

    try {
      const config = new BarcodeScannerConfiguration();
      config.useCase = new SingleScanningMode();

      const resultWrapper = await startBarcodeScanner(config);
      const items = resultWrapper?.data?.items || [];

      if (items.length > 0) {
        const detectedBarcode = items[0]; // Take the first detected barcode
        console.log('🎉 Barcode found on Android!', detectedBarcode);
        setScannedResult(detectedBarcode);
        if (onScanSuccess) {
          onScanSuccess(detectedBarcode.text, detectedBarcode.type); // Pass text and type to parent
        }
      } else {
        setScannedResult({ text: translations?.noBarcodeDetected || 'No barcode detected.', type: null });
      }
    } catch (error) {
      console.warn('Barcode scanning was canceled or failed:', error);
      setError(translations?.scanError || 'Scanning failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedResult(null);
    setError(null);
  };

  if (error) {
    return (
      <div role="alert" className="alert alert-error shadow-lg">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body">
        <h3 className="card-title">{translations?.title || 'Barcode Scanner'}</h3>
        <div className="relative w-full max-w-md h-64 border mb-4 bg-base-300 mx-auto">
          {!scannedResult && !loading && (
            <div className="absolute inset-0 flex items-center justify-center text-base-content opacity-60 pointer-events-none">
              {translations?.clickStart || 'Click “Start Scanning”'}
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-base-content opacity-60 pointer-events-none">
              <span className="loading loading-spinner loading-md"></span>
              {translations?.scanning || 'Scanning...'}
            </div>
          )}
          {scannedResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-base-content">
              <div className="mb-4 p-3 border border-success bg-success bg-opacity-10 rounded w-full max-w-md text-center text-success-content mx-auto">
                <p className="font-bold mb-1">{translations?.resultLabel || 'Barcode Detected:'}</p>
                <p className="text-sm">Type: {scannedResult.type}</p>
                <p className="break-all">Value: {scannedResult.text}</p>
              </div>
            </div>
          )}
        </div>
        <div className="card-actions justify-center">
          {!scannedResult ? (
            <button
              onClick={startScan}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (translations?.starting || 'Starting...') : (translations?.startButton || 'Start Scanning')}
            </button>
          ) : (
            <button
              onClick={resetScanner}
              className="btn btn-error"
            >
              {translations?.stopButton || 'Reset'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerAndroid;