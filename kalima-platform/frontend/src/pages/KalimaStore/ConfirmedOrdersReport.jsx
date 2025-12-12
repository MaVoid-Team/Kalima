"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getConfirmedOrdersReport } from "../../routes/cart";
import { motion } from "framer-motion";
import {
  CheckCircle,
  User,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  Calendar,
  RotateCcw,
  Package,
} from "lucide-react";

const ConfirmedOrdersReport = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedConfirmer, setSelectedConfirmer] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startPeriod, setStartPeriod] = useState("AM");

  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endPeriod, setEndPeriod] = useState("PM");

  const [filtersApplied, setFiltersApplied] = useState(false);

  function convertTo12Hour(time24) {
    if (!time24) return "";

    let [hours, minutes] = time24.split(":");
    hours = parseInt(hours, 10);

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;

    return {
      time: `${hours12}:${minutes}`,
      period,
    };
  }

  const startConverted = convertTo12Hour(startTime);
  const endConverted = convertTo12Hour(endTime);

  useEffect(() => {
    fetchReport();
  }, [filtersApplied]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate,
        startTime: startConverted.time,
        startPeriod: startConverted.period,
        endDate,
        endTime: endConverted.time,
        endPeriod: endConverted.period,
      };

      const result = await getConfirmedOrdersReport(params);

      if (result.success) {
        setReportData(result.data.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // ← VERY IMPORTANT
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `${amount?.toFixed(2) || 0} ${isRTL ? "ج" : "EGP"}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-lg">
            {isRTL ? "جاري تحميل التقرير..." : "Loading report..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
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
          <div>
            <h3 className="font-bold">{isRTL ? "خطأ" : "Error"}</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button onClick={fetchReport} className="btn btn-sm">
            {isRTL ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  const { platformSummary, staffReport, recentConfirmedOrders } = reportData;

  return (
    <div
      className={`min-h-screen p-6 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center justify-center relative mb-8">
        <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
          <img
            src="/waves.png"
            alt="Decorative"
            className="w-20 h-full animate-float-zigzag"
          />
        </div>
        <h1 className="text-3xl font-bold text-center flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-success" />
          {isRTL ? "تقرير الاداء" : "Confirmed Orders Report"}
        </h1>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img
            src="/ring.png"
            alt="Decorative"
            className="w-20 h-full animate-float-up-dottedball"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* 1 — إجمالي الطلبات المؤكدة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card bg-gradient-to-br from-success to-success/70 text-success-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {isRTL ? "إجمالي الطلبات المؤكدة" : "Total Confirmed Orders"}
                </h3>
                <p className="text-3xl font-bold">
                  {platformSummary.totalConfirmedOrders}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2 — إجمالي المنتجات المؤكدة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card bg-gradient-to-br from-primary to-primary/70 text-primary-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {isRTL ? "إجمالي المنتجات المؤكدة" : "Total Confirmed Items"}
                </h3>
                <p className="text-3xl font-bold">
                  {platformSummary.totalConfirmedItems}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3 — إجمالي الطلبات المسترجعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card bg-gradient-to-br from-warning to-warning/70 text-warning-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm whitespace-nowrap font-medium opacity-90">
                  {isRTL ? "إجمالي الطلبات المسترجعة" : "Total Returned Orders"}
                </h3>
                <p className="text-3xl font-bold">
                  {platformSummary.totalReturnedOrders}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 — إجمالي المنتجات المسترجعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card bg-gradient-to-br from-error to-error/70 text-error-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm whitespace-nowrap font-medium opacity-90">
                  {isRTL ? "إجمالي المنتجات المسترجعة" : "Total Returned Items"}
                </h3>
                <p className="text-3xl font-bold">
                  {platformSummary.totalReturnedItems}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5 — عدد الأفراد العاملين */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="card bg-gradient-to-br from-secondary to-secondary/70 text-secondary-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {isRTL ? "عدد الأفراد العاملين" : "Total Staff"}
                </h3>
                <p className="text-3xl font-bold">
                  {platformSummary.totalStaff}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Filters Card */}
      <div className="card shadow-lg mb-3">
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Start Date */}
            <div className="w-full">
              <label className="label font-medium">
                {isRTL ? "تاريخ البداية" : "Start Date"}
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Start Time */}
            <div className="w-full">
              <label className="label font-medium">
                {isRTL ? "وقت البداية" : "Start Time"}
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <select
                  className="select select-bordered w-20"
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* End Date */}
            <div className="w-full">
              <label className="label font-medium">
                {isRTL ? "تاريخ النهاية" : "End Date"}
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* End Time */}
            <div className="w-full">
              <label className="label font-medium">
                {isRTL ? "وقت النهاية" : "End Time"}
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />

                <select
                  className="select select-bordered w-20"
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Apply */}
            <div className="w-full flex items-end">
              <button
                className="btn btn-primary w-full"
                onClick={() => setFiltersApplied((prev) => !prev)}
              >
                {isRTL ? "تطبيق" : "Apply"}
              </button>
            </div>

            {/* Clear */}
            <div className="w-full flex items-end">
              <button
                className="btn btn-ghost w-full"
                onClick={() => {
                  setStartDate("");
                  setStartTime("");
                  setStartPeriod("AM");
                  setEndDate("");
                  setEndTime("");
                  setEndPeriod("PM");
                  setFiltersApplied((prev) => !prev);
                }}
              >
                {isRTL ? "مسح" : "Clear"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmer Statistics */}
      <div className="card shadow-lg mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-warning" />
            {isRTL ? "إحصائيات المؤكدين" : "Confirmer Statistics"}
          </h2>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-center">{isRTL ? "الاسم" : "Name"}</th>

                  <th className="text-center">
                    {isRTL ? "الطلبات المستلمة" : "Received Orders"}
                  </th>

                  <th className="text-center">
                    {isRTL ? "الطلبات المؤكدة" : "Confirmed Orders"}
                  </th>

                  <th className="text-center">
                    {isRTL ? "المنتجات المؤكدة" : "Confirmed Items"}
                  </th>

                  <th className="text-center">
                    {isRTL ? "الطلبات المسترجعة" : "Returned Orders"}
                  </th>

                  <th className="text-center">
                    {isRTL ? "المنتجات المسترجعة" : "Returned Items"}
                  </th>

                  <th className="text-center">
                    {isRTL ? "متوسط وقت الاستلام" : "Avg Response Time"}
                  </th>

                  <th className="text-center">
                    {isRTL ? "متوسط وقت التأكيد" : "Avg Confirmation Time"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {staffReport.map((stat, index) => (
                  <tr key={stat.staff.id} className="hover">
                    {/* Name + Email */}
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{stat.staff.name}</span>
                        <span className="text-xs opacity-70">
                          {stat.staff.email}
                        </span>
                      </div>
                    </td>

                    {/* Received Orders */}
                    <td className="text-center font-bold">
                      {stat.totalReceivedOrders}
                    </td>

                    {/* Confirmed Orders */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="font-bold text-lg">
                          {stat.totalConfirmedOrders}
                        </span>
                      </div>
                    </td>

                    {/* Confirmed Items */}
                    <td className="text-center font-bold text-primary">
                      {stat.totalConfirmedItems}
                    </td>

                    {/* Returned Orders */}
                    <td className="text-center text-warning font-bold">
                      {stat.totalReturnedOrders}
                    </td>

                    {/* Returned Items */}
                    <td className="text-center text-error font-bold">
                      {stat.totalReturnedItems}
                    </td>

                    {/* Avg Response Time */}
                    <td className="text-center text-sm">
                      {stat.averageResponseTime}
                    </td>

                    {/* Avg Confirmation Time */}
                    <td className="text-center text-sm">
                      {stat.averageConfirmationTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Recent Confirmed Orders
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-info" />
            {isRTL
              ? "آخر الطلبات المؤكدة (50)"
              : "Recent Confirmed Orders (50)"}
          </h2>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-center">
                    {isRTL ? "رقم الطلب" : "Order Serial"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "العميل" : "Customer"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "العناصر" : "Items"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "الإجمالي" : "Total"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "تم التأكيد بواسطة" : "Confirmed By"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "وقت التأكيد" : "Confirmed At"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentConfirmedOrders.map((order) => (
                  <tr key={order._id} className="hover">
                    <td className="text-center font-mono text-sm">
                      {order.purchaseSerial}
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{order.userName}</span>
                        <span className="text-xs opacity-70">
                          {order.createdBy?.email}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="badge badge-info">
                        {order.items?.length || 0} {isRTL ? "عنصر" : "items"}
                      </div>
                    </td>
                    <td className="text-center font-bold text-primary">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">
                          {order.confirmedBy?.name || "N/A"}
                        </span>
                        <span className="text-xs opacity-70">
                          {order.confirmedBy?.role || ""}
                        </span>
                      </div>
                    </td>
                    <td className="text-center text-sm">
                      {formatDate(order.confirmedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
      {/* Confirmer Details Modal */}
      {selectedConfirmer && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {isRTL ? "تفاصيل المؤكد" : "Confirmer Details"} -{" "}
              {selectedConfirmer.admin.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">
                  {isRTL ? "إجمالي الطلبات" : "Total Orders"}
                </div>
                <div className="stat-value text-primary">
                  {selectedConfirmer.totalConfirmed}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">
                  {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
                </div>
                <div className="stat-value text-success text-2xl">
                  {formatCurrency(selectedConfirmer.totalRevenue)}
                </div>
              </div>
            </div>

            <h4 className="font-semibold mb-2">
              {isRTL ? "الطلبات المؤكدة" : "Confirmed Orders"}
            </h4>
            <div className="overflow-x-auto max-h-96">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>{isRTL ? "رقم الطلب" : "Serial"}</th>
                    <th>{isRTL ? "العميل" : "Customer"}</th>
                    <th>{isRTL ? "العناصر" : "Items"}</th>
                    <th>{isRTL ? "الإجمالي" : "Total"}</th>
                    <th>{isRTL ? "التاريخ" : "Date"}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedConfirmer.orders.map((order) => (
                    <tr key={order.purchaseId}>
                      <td className="font-mono text-xs">
                        {order.purchaseSerial}
                      </td>
                      <td>{order.customerName}</td>
                      <td>{order.itemCount}</td>
                      <td className="font-bold">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="text-xs">
                        {formatDate(order.confirmedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setSelectedConfirmer(null)}
              >
                {isRTL ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmedOrdersReport;
