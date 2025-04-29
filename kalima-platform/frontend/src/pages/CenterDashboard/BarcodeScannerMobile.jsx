import React, { useState, useEffect } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core'; // Import Capacitor to check platform

const BarcodeScannerAndroid = ({ centerId, centerName, translations }) => {
  const [scannedResult, setScannedResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [scanError, setScanError] = useState(null); // State for scanner-specific errors

  useEffect(() => {
    // Only check/request permissions if running on a native Android platform
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
       checkPermissions();
    }
  }, []);

  const checkPermissions = async () => {
    const status = await BarcodeScanner.checkPermissions();
    setPermissionStatus(status.camera);
  };

  const requestPermissions = async () => {
    const status = await BarcodeScanner.requestPermissions();
    setPermissionStatus(status.camera);
  };

  const startScan = async () => {
     setScanError(null); // Clear previous errors

    // Check camera permission first
    if (permissionStatus !== 'granted') {
      await requestPermissions();
      // Re-check after requesting
      const status = await BarcodeScanner.checkPermissions();
      if (status.camera !== 'granted') {
        setScanError('Camera permission is required for scanning.');
        return;
      }
    }

    setIsScanning(true);
    // --- Optional: Hide webview content ---
    // You might need to add CSS to your global styles or index.html
    // to handle hiding the webview content when the scanner is active.
    // Example: document.body.classList.add('barcode-scanner-active');
    // See: https://capacitorjs.com/docs/guides/live-updates#enabling-live-updates
    // Note: The ML Kit scanner typically opens a native full-screen view anyway.
    // -------------------------------------

    try {
      const result = await BarcodeScanner.scan();

      if (result.barcodes && result.barcodes.length > 0) {
        // Process the scanned barcode result here
        // Example: You might want to pass this back up to the parent dashboard
        const barcodeData = result.barcodes[0].displayValue;
        setScannedResult(barcodeData);
        console.log('Scanned Barcode:', barcodeData, 'Center ID:', centerId, 'Center Name:', centerName);
        // Add your logic to handle the scanned barcode (e.g., check-in)

        // Optionally stop scanning after finding the first barcode
        await BarcodeScanner.stopScan();
      } else {
         setScannedResult(translations?.noBarcodeDetected || 'No barcode detected.');
      }

    } catch (error) {
      console.error('Error during scanning:', error);
      setScanError(translations?.scanError || `Scan Error: ${error.message}`);
    } finally {
      setIsScanning(false);
       // --- Optional: Show webview content ---
      // Example: document.body.classList.remove('barcode-scanner-active');
      // -------------------------------------
    }
  };

  // Stop scan on component unmount if scanning is active
  useEffect(() => {
    return () => {
      if (isScanning) {
        BarcodeScanner.stopScan();
        // document.body.classList.remove('barcode-scanner-active'); // Example cleanup
      }
    };
  }, [isScanning]); // Depend on isScanning to ensure cleanup runs correctly

   // Don't render anything if not on Android native platform
   if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
       return null;
   }


  return (
    <div className="card bg-base-100 shadow-xl mb-8"> {/* Use DaisyUI card class */}
      <div className="card-body">
        <h3 className="card-title">{translations?.title || 'Barcode Scanner'}</h3>

        {permissionStatus !== 'granted' && permissionStatus !== null && ( // Only show warning if status is known and not granted
          <div role="alert" className="alert alert-warning mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{translations?.permissionWarning || 'Camera permission not granted.'}</span>
            <button className="btn btn-sm" onClick={requestPermissions}>{translations?.grantPermission || 'Grant Permission'}</button>
          </div>
        )}

        {scanError && ( // Display scanner-specific errors
             <div role="alert" className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span>{scanError}</span>
             </div>
        )}

        <button
          className={`btn btn-primary w-full ${isScanning ? 'btn-disabled' : ''}`}
          onClick={startScan}
          disabled={isScanning || permissionStatus !== 'granted'} // Disable if scanning or permission denied
        >
          {isScanning ? (translations?.scanning || 'Scanning...') : (translations?.startButton || 'Start Barcode Scan')}
        </button>

        {scannedResult && (
          <div className="mt-4 p-4 bg-base-200 rounded-md">
            <h4 className="text-md font-semibold">{translations?.resultLabel || 'Scanned Result:'}</h4>
            <p className="text-success break-words">{scannedResult}</p>
          </div>
        )}

         {/* Optional overlay indicator for scanning */}
         {/* Note: The native scanner view is typically full screen, this is just a UI element */}
         {isScanning && (
             <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
                 <p className="text-xl mb-4">{translations?.scanInstructions || 'Align barcode within the frame...'}</p>
                 {/* Add a visual frame overlay if desired using CSS */}
                 <div className="w-64 h-48 border-4 border-dashed border-white"></div>
             </div>
         )}
      </div>
    </div>
  );
};

export default BarcodeScannerAndroid;