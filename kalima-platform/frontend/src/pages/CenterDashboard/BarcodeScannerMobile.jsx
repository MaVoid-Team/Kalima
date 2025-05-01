import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {ScanbotBarcodeSDK} from 'capacitor-plugin-scanbot-barcode-scanner-sdk'
import {
  startBarcodeScanner,
  BarcodeScannerConfiguration
} from 'capacitor-plugin-scanbot-barcode-scanner-sdk/ui_v2';

const BarcodeScannerAndroid = ({ translations, onScanSuccess }) => {
  const [scannedItems, setScannedItems] = useState([]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') {
      console.warn('Scanbot Barcode Scanner is disabled on non-Android platforms.');
      return;
    }

    (async () => {
      try {
        await ScanbotBarcodeSDK
        .initializeSdk({
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
      }
    })();
  }, []);

  const startScan = async () => {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
      const config = new BarcodeScannerConfiguration();
      config.useCase = new SingleScanningMode();

      const resultWrapper = await startBarcodeScanner(config);
      const items = resultWrapper?.data?.items || [];

      if (items.length > 0) {
        setScannedItems(items);
        onScanSuccess(items);
      }
    } catch (error) {
      console.warn('Barcode scanning was canceled or failed:', error);
    }
  };

  const resetScanner = () => {
    setScannedItems([]);
  };

  return (
    <div>
      {scannedItems.length > 0 ? (
        <div>
          <p>{translations['scanSuccess'] || 'Scan successful!'}</p>
          <ul>
            {scannedItems.map((item, index) => (
              <li key={index}>
                {item.text} ({item.type})
              </li>
            ))}
          </ul>
          <button onClick={resetScanner}>
            {translations['reset'] || 'Reset'}
          </button>
        </div>
      ) : (
        <button onClick={startScan}>
          {translations['startScan'] || 'Start Scan'}
        </button>
      )}
    </div>
  );
};

export default BarcodeScannerAndroid;
