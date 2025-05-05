import { useRef, useState, useEffect, useCallback } from 'react';
import ScanbotSDK from 'scanbot-web-sdk';

const BARCODE_SCANNER_CONTAINER_ID = 'barcode-scanner-view';

// Accept centerId, centerName, and onScanSuccess as props
export default function BarcodeScanner({ centerId, centerName, onScanSuccess, translations }) {
  const scannerContainerRef = useRef(null);
  const [sdk, setSdk] = useState(null);
  const [barcodeScanner, setBarcodeScanner] = useState(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [sdkError, setSdkError] = useState(null); // State for SDK initialization errors

  // Initialize Scanbot SDK
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        console.log('Initializing Scanbot SDK...');
         setSdkError(null); // Clear previous errors
        const scanbotSDK = await ScanbotSDK.initialize({
          licenseKey: import.meta.env.VITE_SCANBOT_LICENSE,
          enginePath: '/wasm/', // Ensure this path is correct
        });
        if (!ignore) {
          console.log('Scanbot SDK Initialized:', scanbotSDK);
          setSdk(scanbotSDK);
        }
      } catch (e) {
        console.error('SDK init error:', e);
        setSdkError(`SDK Initialization Error: ${e.message}`);
      }
    })();
    return () => {
      ignore = true;
      // Dispose SDK if initialized but scanner wasn't created
      if (sdk && !barcodeScanner) {
          try {
               sdk.dispose();
          } catch (e) {
              console.warn('Error disposing SDK during unmount (ignored)', e);
          }
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Dispose Barcode Scanner on unmount
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
  }, [barcodeScanner]); // Depend on barcodeScanner instance

  // Handle detected barcodes
  const handleBarcodesDetected = useCallback(
    (result) => {
      if (result?.barcodes?.length > 0) {
        console.log('🎉 Barcode found!', result.barcodes[0]);
        const detectedBarcode = result.barcodes[0];
        setLastResult(detectedBarcode);

        // Call the onScanSuccess callback passed from the parent
        if (onScanSuccess) {
            // Pass the necessary data back to the dashboard
            onScanSuccess(detectedBarcode.text, detectedBarcode.format || detectedBarcode.type);
        }

        
        stopScanningAndReset();

      } else {
         setLastResult(translations?.noBarcodeDetected || 'No barcode detected.');
      }
    },
    [onScanSuccess, translations] // Depend on onScanSuccess and translations
  );

  // Handle scanner errors
  const handleScannerError = useCallback((error) => {
    console.error('Barcode scanner error:', error);
    setSdkError(`Scanner Error: ${error.message}`); // Set a scanner-specific error message
    if (barcodeScanner) {
        try {
            barcodeScanner.dispose();
        } catch (e) {
            console.warn('Error disposing scanner after error (ignored)', e);
        }
    }
    setBarcodeScanner(null);
    setIsScanningActive(false);
  }, [barcodeScanner, translations]); // Depend on barcodeScanner and translations

  // Start the barcode scanning process
  const startScanning = async () => {
    if (!sdk || barcodeScanner) {
      console.log("Start scanning prevented:", { sdk: !!sdk, hasScanner: !!barcodeScanner });
      return; // Prevent starting if SDK not ready or scanner already exists
    }

    setLastResult(null); // Clear previous result
     setSdkError(null); // Clear previous scanner errors
    setIsScanningActive(true);

    try {
      console.log('Creating Barcode Scanner instance...');
      const scannerConfig = {
        containerId: BARCODE_SCANNER_CONTAINER_ID,
        onBarcodesDetected: handleBarcodesDetected,
        onError: handleScannerError,
        style: { // Basic styling, adjust as needed
          window: { aspectRatio: 0.75, padding: { top: 40, left: 40, right: 40, bottom: 40 } },
          viewfinder: { borderColor: 'white', borderWidth: 2 },
        },
        videoConstraints: { facingMode: 'environment' }, // Use rear camera
        engineMode: 'NEXT_GEN', // Use the next-generation engine
        // Add other configurations as needed (e.g., barcode formats)
      };

      const scanner = await sdk.createBarcodeScanner(scannerConfig);

      console.log('Barcode Scanner created:', scanner);

       // Small delay to ensure the container is ready might sometimes be helpful
      // await new Promise(resolve => setTimeout(resolve, 100));

      setBarcodeScanner(scanner);

    } catch (e) {
      console.error('Failed to create barcode scanner:', e);
      setIsScanningActive(false);
       setSdkError(`Failed to start scanner: ${e.message}`); // Set an error if creation fails
      setBarcodeScanner(null);
    }
  };

  // Stop the scanning and clean up
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
    // Optionally clear the last result when stopping
    // setLastResult(null);
  };

  // Check if SDK is initializing or encountered an error
   if (!sdk && !sdkError) {
       return (
           <div className="flex justify-center items-center h-64 bg-base-300 rounded-md">
                <span className="loading loading-spinner loading-lg text-primary"></span>
               <p className="ml-2">{translations?.initializing || 'Initializing Scanner...'}</p>
           </div>
       );
   }

   if (sdkError) {
       return (
           <div role="alert" className="alert alert-error shadow-lg">
               <div>
                   <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <span>{sdkError}</span>
               </div>
           </div>
       );
   }


  return (
     // Use DaisyUI card classes for consistent styling
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body">
        <h3 className="card-title">{translations?.title || 'Barcode Scanner'}</h3>

        <div className="relative w-full max-w-md h-64 border mb-4 bg-base-300 mx-auto"> {/* Added mx-auto for centering */}
          <div
            id={BARCODE_SCANNER_CONTAINER_ID}
            ref={scannerContainerRef}
            className="absolute inset-0"
          />
          {/* Message shown when scanner is not active and no result is present */}
          {!isScanningActive && !barcodeScanner && !lastResult && (
            <div className="absolute inset-0 flex items-center justify-center text-base-content opacity-60 pointer-events-none">
              {translations?.clickStart || 'Click “Start Scanning”'}
            </div>
          )}
           {/* Message shown when scanner is created but camera stream is not yet visible */}
           {isScanningActive && !lastResult && (
               <div className="absolute inset-0 flex items-center justify-center text-base-content opacity-60 pointer-events-none">
                  {translations?.scanningInstructions || 'Align barcode in the frame...'}
               </div>
           )}
        </div>

         {/* Displaying the result */}
        {lastResult && typeof lastResult !== 'string' && ( // Check if lastResult is an object with barcode data
          <div className="mb-4 p-3 border border-success bg-success bg-opacity-10 rounded w-full max-w-md text-center text-success-content mx-auto"> {/* Added mx-auto */}
            <p className="font-bold mb-1">{translations?.resultLabel || 'Barcode Detected:'}</p>
            <p className="text-sm">Type: {lastResult.format || lastResult.type}</p>
            <p className="break-all">Value: {lastResult.text}</p>
          </div>
        )}
         {/* Displaying the 'No barcode detected' message */}
        {lastResult && typeof lastResult === 'string' && (
            <div className="mb-4 p-3 border border-info bg-info bg-opacity-10 rounded w-full max-w-md text-center text-info-content mx-auto"> {/* Added mx-auto */}
                 {lastResult} {/* Display the message */}
            </div>
        )}


        <div className="card-actions justify-center"> {/* Use card-actions for button alignment */}
          {!barcodeScanner ? (
            <button
              onClick={startScanning}
              disabled={!sdk || isScanningActive} // Disable if SDK not ready or already starting
              className="btn btn-primary"
            >
              {isScanningActive ? (translations?.starting || 'Starting...') : (translations?.startButton || 'Start Scanning')}
            </button>
          ) : (
            <button
              onClick={stopScanningAndReset}
              className="btn btn-error"
            >
              {translations?.stopButton || 'Stop & Reset'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}