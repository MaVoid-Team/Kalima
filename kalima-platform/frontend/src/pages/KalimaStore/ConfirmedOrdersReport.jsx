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
  Package,
} from "lucide-react";

const ConfirmedOrdersReport = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedConfirmer, setSelectedConfirmer] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConfirmedOrdersReport();
      if (result.success) {
        setReportData(result.data.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const { summary, confirmerStats, recentConfirmedOrders } = reportData;

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
          {isRTL ? "تقرير الطلبات المؤكدة" : "Confirmed Orders Report"}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  {summary.totalConfirmedOrders}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card bg-gradient-to-br from-primary to-primary/70 text-primary-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
                </h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalConfirmedRevenue)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card bg-gradient-to-br from-info to-info/70 text-info-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {isRTL ? "متوسط وقت التأكيد" : "Avg Confirmation Time"}
                </h3>
                <p className="text-2xl font-bold">
                  {summary.averageConfirmationTimeMinutes}{" "}
                  {isRTL ? "دقيقة" : "min"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card bg-gradient-to-br from-secondary to-secondary/70 text-secondary-content shadow-lg"
        >
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {isRTL ? "عدد المؤكدين" : "Total Confirmers"}
                </h3>
                <p className="text-3xl font-bold">{summary.totalConfirmers}</p>
              </div>
            </div>
          </div>
        </motion.div>
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
                  <th className="text-center">#</th>
                  <th className="text-center">
                    {isRTL ? "الاسم" : "Name"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "الدور" : "Role"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "الطلبات المؤكدة" : "Confirmed Orders"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "أول تأكيد" : "First Confirmation"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "آخر تأكيد" : "Last Confirmation"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {confirmerStats.map((stat, index) => (
                  <tr key={stat.admin.id} className="hover">
                    <td className="text-center font-bold">{index + 1}</td>
                    <td className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{stat.admin.name}</span>
                        <span className="text-xs opacity-70">
                          {stat.admin.email}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="badge badge-primary">
                        {stat.admin.role}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="font-bold text-lg">
                          {stat.totalConfirmed}
                        </span>
                      </div>
                    </td>
                    <td className="text-center font-bold text-primary">
                      {formatCurrency(stat.totalRevenue)}
                    </td>
                    <td className="text-center text-sm">
                      {formatDate(stat.firstConfirmation)}
                    </td>
                    <td className="text-center text-sm">
                      {formatDate(stat.lastConfirmation)}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setSelectedConfirmer(stat)}
                      >
                        {isRTL ? "عرض التفاصيل" : "View Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Confirmed Orders */}
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
      </div>

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
                      <td className="text-xs">{formatDate(order.confirmedAt)}</td>
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
