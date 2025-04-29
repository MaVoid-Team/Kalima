import { useRef, useState, useEffect, useCallback } from 'react';
import ScanbotSDK from 'scanbot-web-sdk';

const BARCODE_SCANNER_CONTAINER_ID = 'barcode-scanner-view';

export default function BarcodeScanner() {
  const scannerContainerRef = useRef(null);
  const [sdk, setSdk] = useState(null);
  const [barcodeScanner, setBarcodeScanner] = useState(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        console.log('Initializing Scanbot SDK...');
        const scanbotSDK = await ScanbotSDK.initialize({
          licenseKey: import.meta.env.VITE_SCANBOT_LICENSE,
          enginePath: '/wasm/',
        });
        if (!ignore) {
          console.log('Scanbot SDK Initialized:', scanbotSDK);
          setSdk(scanbotSDK);
        }
      } catch (e) {
        console.error('SDK init error:', e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (barcodeScanner) {
        try {
          console.log('Component unmounting, disposing barcode scanner...');
          barcodeScanner.dispose();
        } catch (e) {
          console.warn('Error disposing scanner during unmount (ignored)', e);
        }
      }
    };
  }, [barcodeScanner]);

  const handleBarcodesDetected = useCallback(
    (result) => {
      if (result?.barcodes?.length > 0) {
        console.log('🎉 Barcode found!', result.barcodes[0]);
        setLastResult(result.barcodes[0]);
      }
    },
    []
  );

  const handleScannerError = useCallback((error) => {
    console.error('Barcode scanner error:', error);
    if (barcodeScanner) {
        try {
            barcodeScanner.dispose();
        } catch (e) {
            console.warn('Error disposing scanner after error (ignored)', e);
        }
    }
    setBarcodeScanner(null);
    setIsScanningActive(false);
  }, [barcodeScanner]);

  const startScanning = async () => {
    if (!sdk || barcodeScanner) {
      console.log("Start scanning prevented:", { sdk: !!sdk, hasScanner: !!barcodeScanner });
      return;
    }

    setLastResult(null);
    setIsScanningActive(true);

    try {
      console.log('Creating Barcode Scanner instance...');
      const scannerConfig = {
        containerId: BARCODE_SCANNER_CONTAINER_ID,
        onBarcodesDetected: handleBarcodesDetected,
        onError: handleScannerError,
        style: {
          window: { aspectRatio: 0.75, padding: { top: 40, left: 40, right: 40, bottom: 40 } },
          viewfinder: { borderColor: 'white', borderWidth: 2 },
        },
        videoConstraints: { facingMode: 'environment' },
        engineMode: 'NEXT_GEN',
      };

      const scanner = await sdk.createBarcodeScanner(scannerConfig);

      console.log('Barcode Scanner created:', scanner);

      await new Promise(resolve => setTimeout(resolve, 0));

      setBarcodeScanner(scanner);

    } catch (e) {
      console.error('Failed to create barcode scanner:', e);
      setIsScanningActive(false);
      setBarcodeScanner(null);
    }
  };

  const stopScanningAndReset = () => {
    if (barcodeScanner) {
      console.log('Disposing scanner and resetting...');
      try {
        barcodeScanner.dispose();
      } catch (e) {
        console.warn('Error disposing scanner (ignored)', e);
      }
    }
    setBarcodeScanner(null);
    setIsScanningActive(false);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-full max-w-md h-64 border mb-4 bg-base-300">
        <div
          id={BARCODE_SCANNER_CONTAINER_ID}
          ref={scannerContainerRef}
          className="absolute inset-0"
        />
        {!isScanningActive && !barcodeScanner && !lastResult && (
          <div className="absolute inset-0 flex items-center justify-center text-base-content opacity-60 pointer-events-none">
            Click “Start Scanning”
          </div>
        )}
      </div>

      {lastResult && (
        <div className="mb-4 p-3 border border-success bg-success bg-opacity-10 rounded w-full max-w-md text-center text-success-content">
          <p className="font-bold mb-1">Barcode Detected:</p>
          <p className="text-sm">Type: {lastResult.format || lastResult.type}</p>
          <p className="break-all">Value: {lastResult.text}</p>
        </div>
      )}

      <div className="flex gap-4">
        {!barcodeScanner && (
          <button
            onClick={startScanning}
            disabled={!sdk || isScanningActive}
            className="btn btn-primary"
          >
            {isScanningActive ? 'Starting...' : 'Start Scanning'}
          </button>
        )}

        {barcodeScanner && (
          <button
            onClick={stopScanningAndReset}
            className="btn btn-error"
          >
            Stop & Reset
          </button>
        )}
      </div>
    </div>
  );
}