import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import axios from 'axios';

const BarCodeScanner = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const requestPermissions = async () => {
    try {
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (permission.granted) {
        return true;
      } else {
        setError(isRTL ? 'تم رفض إذن الكاميرا' : 'Camera permission denied');
        return false;
      }
    } catch (err) {
      setError(isRTL ? 'فشل طلب إذن الكاميرا' : 'Failed to request camera permission');
      return false;
    }
  };

  const startNativeScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      await BarcodeScanner.hideBackground();
      document.body.classList.add('scanner-active');
      const result = await BarcodeScanner.startScan();
      document.body.classList.remove('scanner-active');

      if (result.hasContent) {
        setScannedResult(result.content);
        await sendToApi(result.content);
      } else {
        setError(isRTL ? 'لم يتم العثور على رمز' : 'No barcode found');
      }
    } catch (err) {
      setError(isRTL ? 'فشل المسح' : 'Scanning failed');
    } finally {
      setIsScanning(false);
      await BarcodeScanner.showBackground();
    }
  };

  const handleWebScan = (err, result) => {
    if (result && result.text !== scannedResult) {
      setScannedResult(result.text);
      setIsScanning(false);
      sendToApi(result.text);
    }
    if (err && err.name !== 'NotFoundError') {
      setError(isRTL ? 'فشل مسح الرمز' : 'Failed to scan barcode');
    }
  };

  const sendToApi = async (barcodeData) => {
    try {
      const response = await axios.post('/api/barcode', { barcode: barcodeData });
      console.log('API response:', response.data);
    } catch (err) {
      setError(isRTL ? 'فشل إرسال البيانات إلى الخادم' : 'Failed to send data to server');
    }
  };

  const toggleScan = async () => {
    setError(null);
    if (isScanning) {
      setIsScanning(false);
    } else {
      setScannedResult(null);
      setIsScanning(true);
      if (isNative) {
        await startNativeScan();
      }
    }
  };

  useEffect(() => {
    if (isNative && isScanning) {
      document.body.classList.add('scanner-active');
      return () => {
        BarcodeScanner.showBackground();
        document.body.classList.remove('scanner-active');
      };
    }
  }, [isNative, isScanning]);

  return (
    <motion.div
      className="bg-base-100 p-4 rounded-lg max-w-md mx-auto"
      dir={dir}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Scanner Section */}
      <div className="flex flex-col items-center mb-6">
        <motion.h2
          className="text-xl font-bold text-base-content mb-4"
          variants={itemVariants}
        >
          {isRTL ? 'مسح الباركود' : 'Scan Barcode'}
        </motion.h2>

        {error && (
          <motion.p
            className="text-error mb-4 text-sm"
            variants={itemVariants}
          >
            {error}
          </motion.p>
        )}

        {!isScanning ? (
          <motion.button
            className="btn btn-primary rounded-lg px-6 py-2 flex items-center"
            onClick={toggleScan}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'بدء المسح' : 'Start Scanning'}
          </motion.button>
        ) : !isNative ? (
          <>
            <motion.div
              className="relative w-full max-w-xs h-64 bg-base-200 rounded-lg overflow-hidden mt-4"
              variants={itemVariants}
            >
              <BarcodeScannerComponent
                width="100%"
                height="100%"
                onUpdate={handleWebScan}
              />
              <div className="absolute inset-0 border-4 border-primary/50 rounded-lg pointer-events-none"></div>
            </motion.div>
            <motion.button
              className="btn btn-ghost mt-2"
              onClick={toggleScan}
              variants={itemVariants}
            >
              {isRTL ? 'إيقاف المسح' : 'Stop Scanning'}
            </motion.button>
          </>
        ) : null}

        {/* Manual input toggle button */}
        <motion.button
          className="btn btn-secondary mt-4"
          onClick={() => setShowManualInput(!showManualInput)}
          variants={itemVariants}
        >
          {showManualInput
            ? (isRTL ? 'إخفاء الإدخال اليدوي' : 'Hide Manual Input')
            : (isRTL ? 'الإدخال اليدوي' : 'Manual Input')}
        </motion.button>

        {/* Manual input field */}
        {showManualInput && (
          <motion.div
            className="mt-4 w-full"
            variants={itemVariants}
          >
            <input
              type="text"
              className="input input-bordered w-full mb-2"
              placeholder={isRTL ? 'أدخل الرمز هنا' : 'Enter barcode here'}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              dir={dir}
            />
            <button
              className="btn btn-accent w-full"
              onClick={() => {
                if (manualInput.trim()) {
                  setScannedResult(manualInput.trim());
                  sendToApi(manualInput.trim());
                  setShowManualInput(false);
                }
              }}
            >
              {isRTL ? 'إرسال' : 'Submit'}
            </button>
          </motion.div>
        )}

        {/* Scanned result */}
        {scannedResult && (
          <motion.div
            className={`
              bg-base-100 border border-primary p-3 rounded-lg mt-4 w-full
              ${isRTL ? 'text-right' : 'text-left'}
            `}
            variants={itemVariants}
          >
            <p className="font-medium text-base-content">
              {isRTL ? 'الرمز الممسوح' : 'Scanned Code'}: {scannedResult}
            </p>
          </motion.div>
        )}
      </div>

      {/* Summary Card */}
      <motion.div
        className="bg-base-200 rounded-lg p-4 border border-base-300"
        variants={itemVariants}
      >
        <h3 className="font-bold text-base-content mb-2">
          {isRTL ? 'ملخص الإيرادات' : 'Revenue Summary'}
        </h3>
        <div className={`${isRTL ? 'text-right' : 'text-left'} space-y-1`}>
          <p className="text-base-content text-sm">
            {isRTL ? '120 طالباً' : '120 students'}
          </p>
          <p className="text-base-content text-sm">
            {isRTL ? 'إجمالي الإيرادات: 18000 جنيه' : 'Total revenue: 18000 EGP'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarCodeScanner;
