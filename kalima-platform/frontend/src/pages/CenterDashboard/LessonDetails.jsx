import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ActivityTracker from "./ActivityTracker";
import Reports from "./Reports";
import { getCenterDataByType, recordAttendance } from "../../routes/center";
import BarcodeScanner from "./QrScannerCard";
import BarcodeScannerAndroid from "./BarcodeScannerMobile";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export default function LessonDetailsSection() {
  const { id } = useParams(); // Extract lesson ID from URL
  const { state } = useLocation(); // Access lesson data from navigation state
  const lesson = state?.lesson || {};
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceResult, setAttendanceResult] = useState(null); // State for attendance result
  const [paymentType, setPaymentType] = useState('daily'); // State for payment type
  const [studentSequencedId, setStudentSequencedId] = useState(''); // State for student sequential ID
  const [amountPaid, setAmountPaid] = useState(200); // State for payment amount
  const [attendanceDate, setAttendanceDate] = useState(''); // State for attendance date (optional)
  const [isBookletPurchased, setIsBookletPurchased] = useState(true); // State for booklet purchased
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await getCenterDataByType(lesson.center?._id, "students");
        if (response.status === "success") {
          setStudents(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch students");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lesson.center?._id) {
      fetchStudents();
    }
  }, [lesson.center?._id]);

  // Handler for when a barcode is scanned successfully
  const handleBarcodeScanned = async (barcodeText, barcodeFormat) => {
    try {
      const apiPaymentType = paymentType === 'multi-session' ? 'multi-session' : paymentType;
      const effectiveAmountPaid = (paymentType === 'unpaid' || paymentType === 'multi-session') ? 0 : amountPaid;

      const attendanceData = {
        studentSequencedId: barcodeText,
        lessonId: id,
        paymentType: apiPaymentType,
        amountPaid: effectiveAmountPaid,
        isBookletPurchased,
        ...(attendanceDate && { attendanceDate }),
      };

      const result = await recordAttendance(attendanceData);

      setAttendanceResult({
        success: result.success,
        message: result.success
          ? t('attendance.success', 'Attendance recorded successfully')
          : result.error || t('attendance.error', 'Failed to record attendance'),
      });
    } catch (err) {
      setAttendanceResult({
        success: false,
        message: err.message || t('attendance.error', 'Failed to record attendance'),
      });
    }
  };

  // Handler for form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiPaymentType = paymentType === 'multi-session' ? 'multi-session' : paymentType;
      const effectiveAmountPaid = (paymentType === 'unpaid' || paymentType === 'multi-session') ? 0 : amountPaid;

      const attendanceData = {
        studentSequencedId,
        lessonId: id,
        paymentType: apiPaymentType,
        amountPaid: effectiveAmountPaid,
        isBookletPurchased,
        ...(attendanceDate && { attendanceDate }),
      };

      const result = await recordAttendance(attendanceData);

      setAttendanceResult({
        success: result.success,
        message: result.success
          ? t('attendance.success', 'Attendance recorded successfully')
          : result.error || t('attendance.error', 'Failed to record attendance'),
      });
    } catch (err) {
      setAttendanceResult({
        success: false,
        message: err.message || t('attendance.error', 'Failed to record attendance'),
      });
    }
  };

  // Handler for payment type change
  const handlePaymentTypeChange = (e) => {
    const newPaymentType = e.target.value;
    setPaymentType(newPaymentType);
    if (newPaymentType === 'unpaid' || newPaymentType === 'multi-session') {
      setAmountPaid(0);
    } else {
      setAmountPaid(200);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="loading loading-spinner loading-md"></div></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="space-y-8 p-4">
      <ActivityTracker lessonId={id} students={students} />
      <Reports selectedCenter={lesson.center} lessonId={id} />
      
       {/* Display attendance result if available */}
      {attendanceResult && (
        <div className={`alert ${attendanceResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
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
                d={attendanceResult.success
                  ? "M5 13l4 4L19 7"
                  : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"}
              />
            </svg>
            <span>{attendanceResult.message}</span>
          </div>
        </div>
      )}

      {/* Attendance Form */}
      <form onSubmit={handleFormSubmit} className="mb-8 px-12">
        <div className="flex flex-col gap-4">
          {/* Student Sequential ID */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('attendance.studentIdLabel', 'Student Sequential ID')}</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={studentSequencedId}
              onChange={(e) => setStudentSequencedId(e.target.value)}
              placeholder={t('attendance.studentIdPlaceholder', 'Enter student ID')}
              required
            />
          </div>

          {/* Payment Type Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('attendance.paymentTypeLabel', 'Select Payment Type')}</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={paymentType}
              onChange={handlePaymentTypeChange}
            >
              <option value="daily">{t('attendance.paymentType.daily', 'Daily')}</option>
              <option value="lesson">{t('attendance.paymentType.lesson', 'Lesson')}</option>
              <option value="month">{t('attendance.paymentType.month', 'Month')}</option>
              <option value="year">{t('attendance.paymentType.year', 'Year')}</option>
              <option value="multi-session">{t('attendance.paymentType.multiSession', 'Multi Session')}</option>
              <option value="unpaid">{t('attendance.paymentType.unpaid', 'Unpaid')}</option>
            </select>
          </div>

          {/* Payment Amount */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('attendance.amountPaidLabel', 'Amount Paid')}</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              disabled={paymentType === 'unpaid' || paymentType === 'multi-session'}
              placeholder={t('attendance.amountPaidPlaceholder', 'Enter amount')}
              min="0"
            />
          </div>

          {/* Attendance Date (Optional) */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('attendance.dateLabel', 'Attendance Date (Optional)')}</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full max-w-xs"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          {/* Is Booklet Purchased */}
          <div className="flex flex-col gap-2">
            <label className="label">
              <span className="label-text">{t('attendance.bookletLabel', 'Booklet Purchased')}</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isBookletPurchased"
                  value="true"
                  checked={isBookletPurchased === true}
                  onChange={() => setIsBookletPurchased(true)}
                  className="radio radio-primary"
                />
                <span>{t('attendance.bookletYes', 'Yes')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="isBookletPurchased"
                  value="false"
                  checked={isBookletPurchased === false}
                  onChange={() => setIsBookletPurchased(false)}
                  className="radio radio-primary"
                />
                <span>{t('attendance.bookletNo', 'No')}</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full max-w-xs">
            {t('attendance.submitButton', 'Record Attendance')}
          </button>
        </div>
      </form>

      {/* Conditional Rendering for Barcode Scanner */}
      {/* <div className="mb-8">
        {isAndroidNative ? (
          <BarcodeScannerAndroid
            lessonId={id}
            students={students}
            translations={{
              title: t('barCodeScanner.title'),
              startButton: t('barCodeScanner.startButton'),
              scanning: t('barCodeScanner.scanning'),
              resultLabel: t('barCodeScanner.resultLabel'),
              noBarcodeDetected: t('barCodeScanner.noBarcodeDetected'),
              permissionWarning: t('barCodeScanner.permissionWarning'),
              grantPermission: t('barCodeScanner.grantPermission'),
              scanError: t('barCodeScanner.scanError'),
              scanInstructions: t('barCodeScanner.scanInstructions'),
            }}
            onScanSuccess={handleBarcodeScanned}
          />
        ) : (
          <BarcodeScanner
            lessonId={id}
            students={students}
            translations={{
              title: t('barCodeScanner.title'),
              startButton: t('barCodeScanner.startButton'),
              scanning: t('barCodeScanner.scanning'),
              resultLabel: t('barCodeScanner.resultLabel'),
              noBarcodeDetected: t('barCodeScanner.noBarcodeDetected'),
              permissionWarning: t('barCodeScanner.permissionWarning'),
              grantPermission: t('barCodeScanner.grantPermission'),
              scanError: t('barCodeScanner.scanError'),
              scanInstructions: t('barCodeScanner.scanInstructions'),
            }}
            onScanSuccess={handleBarcodeScanned}
          />
        )}
      </div> */}
    </div>
  );
}