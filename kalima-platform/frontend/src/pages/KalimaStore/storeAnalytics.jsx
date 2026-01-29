"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getAllStats,
  getProductStats,
  getResponseTimeStats,
} from "../../routes/orders";
import {
  createPaymentMethod,
  getAllPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
  changePaymentMethodStatus,
} from "../../routes/market";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Filter,
  X,
  Package,
  Target,
  Award,
  Zap,
  CreditCard,
} from "lucide-react";
import { FaDownload, FaFileExport } from "react-icons/fa";

const StoreAnalytics = () => {
  const { t, i18n } = useTranslation("kalimaStore-analytics");
  const isRTL = i18n.language === "ar";

  // Loading states
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [productStatsLoading, setProductStatsLoading] = useState(true);
  const [responseTimeLoading, setResponseTimeLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    name: "",
    phoneNumber: "",
    paymentMethodImg: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({});

  // Data states
  const [overviewStats, setOverviewStats] = useState({
    totalPurchases: 0,
    confirmedPurchases: 0,
    pendingPurchases: 0,
    totalRevenue: 0,
    confirmedRevenue: 0,
    averagePrice: 0,
  });

  // Store original overview stats to restore when clearing filters
  const [originalOverviewStats, setOriginalOverviewStats] = useState({
    totalPurchases: 0,
    confirmedPurchases: 0,
    pendingPurchases: 0,
    totalRevenue: 0,
    confirmedRevenue: 0,
    averagePrice: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [responseTimeStats, setResponseTimeStats] = useState(null);
  const [filteredProductStats, setFilteredProductStats] = useState([]);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [confirmationFilter, setConfirmationFilter] = useState("all"); // all, confirmed, pending

  // Add new state for date selection
  const [selectedDate, setSelectedDate] = useState("");
  const [dailyStats, setDailyStats] = useState({
    totalPurchases: 0,
    confirmedPurchases: 0,
    pendingPurchases: 0,
    totalRevenue: 0,
    confirmedRevenue: 0,
    averagePrice: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  // lazy import xlsx when needed to avoid bundling issues
  const exportAnalyticsXlsx = async () => {
    try {
      setExporting(true);
      const XLSX = await import("xlsx");

      const rowsOverview = [
        [t("csv.overview")],
        [t("stats.totalPurchases"), overviewStats.totalPurchases],
        [t("stats.confirmed"), overviewStats.confirmedPurchases],
        [t("stats.pending"), overviewStats.pendingPurchases],
        [t("stats.totalRevenue"), overviewStats.totalRevenue],
        [t("stats.confirmedRevenue"), overviewStats.confirmedRevenue],
        [t("stats.averagePrice"), Math.round(overviewStats.averagePrice)],
        [],
      ];

      const ws = XLSX.utils.aoa_to_sheet(rowsOverview);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Overview");

      // Monthly sheet
      const monthlyHeader = [
        [
          t("table.month"),
          t("table.totalPurchases"),
          t("table.confirmed"),
          t("table.revenue"),
          t("table.confirmedRevenue"),
        ],
      ];
      const monthlyRows = monthlyStats.map((stat) => {
        const date = new Date(stat._id.year, stat._id.month - 1, 1);
        const monthName = date.toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
        });
        return [
          monthName,
          stat.count,
          stat.confirmedCount,
          stat.revenue,
          stat.confirmedRevenue,
        ];
      });
      const wsMonthly = XLSX.utils.aoa_to_sheet(
        monthlyHeader.concat(monthlyRows)
      );
      XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly");

      // Products sheet
      const productHeader = [
        [
          t("table.rank"),
          t("table.productName"),
          t("table.totalPurchases"),
          t("table.totalValue"),
          t("table.avgValue"),
        ],
      ];
      const productRows = filteredProductStats.map((p, idx) => {
        const totalValue = Number(p.totalValue) || 0;
        const totalPurchases = Number(p.totalPurchases) || 0;
        const avgValue =
          totalPurchases > 0 ? Math.round(totalValue / totalPurchases) : 0;
        return [idx + 1, p.productName, totalPurchases, totalValue, avgValue];
      });
      const wsProducts = XLSX.utils.aoa_to_sheet(
        productHeader.concat(productRows)
      );
      XLSX.utils.book_append_sheet(wb, wsProducts, "Products");

      const filename = `kalima-analytics-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Failed to export analytics xlsx:", err);
    } finally {
      setExporting(false);
    }
  };

  // Generate month options from monthly stats
  const generateMonthOptions = useCallback(() => {
    const options = [{ value: "all", label: t("filters.allMonths") }];
    monthlyStats.forEach((stat) => {
      const date = new Date(stat._id.year, stat._id.month - 1, 1);
      const monthName = date.toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "long",
      });
      options.push({
        value: `${stat._id.year}-${stat._id.month}`,
        label: monthName,
        data: stat,
      });
    });
    return options;
  }, [monthlyStats, i18n.language, t]);

  // Fetch overview and monthly stats
  const fetchStats = useCallback(async (date = null) => {
    try {
      setOverviewLoading(true);
      setError(null);
      const response = await getAllStats(date); // Pass date to getAllStats
      if (response.success) {
        const { overview, monthlyStats, dailyStats } = response.data.data;
        setOverviewStats(overview);
        setDailyStats(dailyStats || null); // Set daily stats

        // Only update original stats and monthly stats on the initial full load
        if (!date) {
          setOriginalOverviewStats(overview);
          setMonthlyStats(monthlyStats || []);
        }
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching stats:", err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  // Update the fetchProductStats function to handle date parameter
  const fetchProductStats = useCallback(async (date = null) => {
    try {
      setProductStatsLoading(true);
      // The product stats endpoint doesn't seem to support date filtering, so we fetch all.
      const response = await getProductStats();
      if (response.success) {
        const productData = response.data.data || [];
        setProductStats(productData);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error("Error fetching product stats:", err);
    } finally {
      setProductStatsLoading(false);
    }
  }, []);

  const fetchResponseTime = useCallback(async () => {
    try {
      setResponseTimeLoading(true);
      const response = await getResponseTimeStats();
      if (response.success) {
        setResponseTimeStats(response.data.data);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error("Error fetching response time stats:", err);
      // Don't set main error, as this is a secondary stat
    } finally {
      setResponseTimeLoading(false);
    }
  }, []);

  // Filter product stats based on current filters
  const applyFilters = useCallback(() => {
    let filtered = [...productStats];
    console.log("Applying filters to product stats:", filtered); // Debug log

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Sort by total purchases (descending)
    filtered.sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0));

    console.log("Filtered product stats:", filtered); // Debug log
    setFilteredProductStats(filtered);
  }, [productStats, searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchProductStats();
    fetchResponseTime();
  }, [fetchStats, fetchProductStats, fetchResponseTime]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle month filter change
  const handleMonthFilterChange = (monthValue) => {
    setSelectedMonth(monthValue);
    if (monthValue === "all") {
      // Restore original overview stats
      setOverviewStats(originalOverviewStats);
    } else {
      // Find specific month stats
      const monthData = monthlyStats.find(
        (stat) => `${stat._id.year}-${stat._id.month}` === monthValue
      );
      if (monthData) {
        setOverviewStats({
          totalPurchases: monthData.count,
          confirmedPurchases: monthData.confirmedCount,
          pendingPurchases: monthData.count - monthData.confirmedCount,
          totalRevenue: monthData.revenue,
          confirmedRevenue: monthData.confirmedRevenue,
          averagePrice:
            monthData.count > 0 ? monthData.revenue / monthData.count : 0,
        });
      }
    }
  };

  // Add date change handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      fetchStats(date); // Fetch daily and overview stats for the selected date
    } else {
      // When clearing the date, restore the original overview stats
      setOverviewStats(originalOverviewStats);
      setDailyStats(null); // Clear daily stats
    }
  };

  // Update the clearFilters function to properly reset everything
  const clearFilters = () => {
    setSelectedMonth("all");
    setConfirmationFilter("all");
    setSearchQuery("");
    setSelectedDate("");

    // Restore original overview stats
    setOverviewStats(originalOverviewStats);

    // Refetch regular product stats
    fetchStats(); // Refetch all stats
  };

  // Update hasActiveFilters to include selectedDate
  const hasActiveFilters =
    selectedMonth !== "all" ||
    confirmationFilter !== "all" ||
    searchQuery.trim() !== "" ||
    selectedDate !== "";

  // Format currency
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return `${Math.round(numPrice)} ج`;
  };

  // Format minutes into a readable string (e.g., 1d 4h 30m)
  const formatMinutes = (minutes) => {
    if (minutes === null || isNaN(minutes)) return "N/A";
    if (minutes < 1) return "< 1m";

    const d = Math.floor(minutes / (24 * 60));
    const h = Math.floor((minutes % (24 * 60)) / 60);
    const m = Math.round(minutes % 60);

    let result = "";
    if (d > 0) result += `${d}d `;
    if (h > 0) result += `${h}h `;
    if (m > 0 || result === "") result += `${m}m`;
    return result.trim();
  };
  // CSV escape helper
  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Export analytics to CSV
  const exportAnalytics = async () => {
    try {
      setExporting(true);
      // Build rows: overview, monthlyStats, productStats (filtered)
      const rows = [];

      // Overview
      rows.push([t("csv.overview")]);
      rows.push([t("stats.totalPurchases"), overviewStats.totalPurchases]);
      rows.push([t("stats.confirmed"), overviewStats.confirmedPurchases]);
      rows.push([t("stats.pending"), overviewStats.pendingPurchases]);
      rows.push([t("stats.totalRevenue"), overviewStats.totalRevenue]);
      rows.push([t("stats.confirmedRevenue"), overviewStats.confirmedRevenue]);
      rows.push([
        t("stats.averagePrice"),
        Math.round(overviewStats.averagePrice),
      ]);
      rows.push([]);

      // Daily (if selected)
      if (selectedDate) {
        rows.push([t("csv.dailyStats"), selectedDate]);
        rows.push([t("stats.totalPurchases"), dailyStats.totalPurchases]);
        rows.push([t("stats.totalRevenue"), dailyStats.totalRevenue]);
        rows.push([t("stats.confirmedRevenue"), dailyStats.confirmedRevenue]);
        rows.push([]);
      }

      // Monthly
      rows.push([t("csv.monthlyStats")]);
      rows.push([
        t("table.month"),
        t("table.totalPurchases"),
        t("table.confirmed"),
        t("table.revenue"),
        t("table.confirmedRevenue"),
      ]);
      monthlyStats.forEach((stat) => {
        const date = new Date(stat._id.year, stat._id.month - 1, 1);
        const monthName = date.toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
        });
        rows.push([
          monthName,
          stat.count,
          stat.confirmedCount,
          stat.revenue,
          stat.confirmedRevenue,
        ]);
      });
      rows.push([]);

      // Products (filtered)
      rows.push([t("csv.productStats")]);
      rows.push([
        t("table.rank"),
        t("table.productName"),
        t("table.totalPurchases"),
        t("table.totalValue"),
        t("table.avgValue"),
      ]);
      filteredProductStats.forEach((p, idx) => {
        const totalValue = Number(p.totalValue) || 0;
        const totalPurchases = Number(p.totalPurchases) || 0;
        const avgValue =
          totalPurchases > 0 ? Math.round(totalValue / totalPurchases) : 0;
        rows.push([
          idx + 1,
          p.productName,
          totalPurchases,
          totalValue,
          avgValue,
        ]);
      });

      // Convert to CSV string
      const csvContent = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `kalima-analytics-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Optional success feedback
      setExporting(false);
    } catch (err) {
      console.error("Failed to export analytics:", err);
      setExporting(false);
    }
  };

  // Export analytics to JSON
  const exportAnalyticsJSON = async (exportAll = false) => {
    try {
      setExporting(true);
      const dataToExport = exportAll ? productStats : filteredProductStats;

      // Convert to JSON string
      const jsonContent = JSON.stringify(dataToExport, null, 2);

      // Download
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `kalima-analytics-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setExporting(false);
    } catch (err) {
      console.error("Failed to export analytics JSON:", err);
      setExporting(false);
    }
  };

  // ==================== Payment Methods Functions ====================
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const res = await getAllPaymentMethods();
      if (res?.status === "success") {
        setPaymentMethods(res.data?.paymentMethods || []);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const validatePaymentMethod = (isCreate = false) => {
    const newErrors = {};
    if (!paymentMethodForm.name?.trim()) {
      newErrors.name = isRTL ? "الاسم مطلوب" : "Name is required";
    }
    if (!paymentMethodForm.phoneNumber?.trim()) {
      newErrors.phoneNumber = isRTL
        ? "رقم الهاتف مطلوب"
        : "Phone number is required";
    } else if (!/^01[0-9]{9}$/.test(paymentMethodForm.phoneNumber)) {
      newErrors.phoneNumber = isRTL
        ? "رقم الهاتف غير صحيح"
        : "Invalid phone number";
    }
    if (isCreate && !paymentMethodForm.paymentMethodImg) {
      newErrors.paymentMethodImg = isRTL
        ? "صورة طريقة الدفع مطلوبة"
        : "Payment method image is required";
    }
    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentMethodForm((prev) => ({
        ...prev,
        paymentMethodImg: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePaymentMethod = async (e) => {
    e.preventDefault();
    if (!validatePaymentMethod(true)) return;

    try {
      setActionLoading(true);
      const res = await createPaymentMethod(paymentMethodForm);
      if (res?.status === "success") {
        setPaymentMethodForm({ name: "", phoneNumber: "", paymentMethodImg: null });
        setImagePreview(null);
        toast.success(
          isRTL
            ? "تم إنشاء طريقة الدفع بنجاح"
            : "Payment method created successfully"
        );
        fetchPaymentMethods();
      } else {
        throw new Error(res?.message || "Failed to create payment method");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || (isRTL ? "خطأ في إنشاء طريقة الدفع" : "Error creating payment method"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();
    if (!editingPaymentMethod?._id || !validatePaymentMethod(false)) return;

    try {
      setActionLoading(true);
      await updatePaymentMethod(editingPaymentMethod._id, paymentMethodForm);
      setEditingPaymentMethod(null);
      setPaymentMethodForm({ name: "", phoneNumber: "", paymentMethodImg: null });
      setImagePreview(null);
      setOpenEditPopup(false);
      toast.success(
        isRTL
          ? "تم تحديث طريقة الدفع بنجاح"
          : "Payment method updated successfully"
      );
      fetchPaymentMethods();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || (isRTL ? "خطأ في تحديث طريقة الدفع" : "Error updating payment method"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (method) => {
    if (!method?._id) return;
    const confirmed = window.confirm(
      isRTL
        ? "هل أنت متأكد من حذف طريقة الدفع؟"
        : "Are you sure you want to delete this payment method?"
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await deletePaymentMethod(method._id);
      if (res?.status === "success") {
        toast.success(isRTL ? "تم حذف طريقة الدفع بنجاح" : "Payment method deleted successfully");
        fetchPaymentMethods();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || (isRTL ? "خطأ في حذف طريقة الدفع" : "Error deleting payment method"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePaymentMethodStatus = async (method) => {
    const nextStatus = !method.status;
    try {
      setActionLoading(true);
      const res = await changePaymentMethodStatus(method._id, nextStatus);
      if (res?.status === "success") {
        fetchPaymentMethods();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || (isRTL ? "فشل في تغيير الحالة" : "Failed to change status"));
    } finally {
      setActionLoading(false);
    }
  };

  const openEditPaymentMethod = (method) => {
    setPaymentMethodForm({
      name: method.name,
      phoneNumber: method.phoneNumber,
      paymentMethodImg: null,
    });
    setEditingPaymentMethod(method);
    // Show existing image as preview
    if (method.paymentMethodImg) {
      setImagePreview(`${import.meta.env.VITE_API_URL}/${method.paymentMethodImg.replace(/\\/g, "/")}`);
    } else {
      setImagePreview(null);
    }
    setOpenEditPopup(true);
  };

  const closeEditPaymentMethod = () => {
    setOpenEditPopup(false);
    setEditingPaymentMethod(null);
    setPaymentMethodForm({ name: "", phoneNumber: "", paymentMethodImg: null });
    setImagePreview(null);
    setPaymentErrors({});
  };

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    if (productStats.length === 0)
      return { topProduct: null, totalProducts: 0, averagePerProduct: 0 };

    const topProduct = productStats.reduce((max, product) =>
      (product.totalPurchases || 0) > (max.totalPurchases || 0) ? product : max
    );

    const totalProducts = productStats.length;
    const averagePerProduct =
      productStats.reduce(
        (sum, product) => sum + (product.totalPurchases || 0),
        0
      ) / totalProducts;

    return { topProduct, totalProducts, averagePerProduct };
  };

  const performanceMetrics = getPerformanceMetrics();

  if (overviewLoading && productStatsLoading && responseTimeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-lg">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <h3 className="font-bold">{t("errorLoadingAnalytics")}</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-sm"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

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
            alt="Decorative zigzag"
            className="w-20 h-full animate-float-zigzag"
          />
        </div>
        <h1 className="text-3xl font-bold text-center flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          {t("title")}
        </h1>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img
            src="/ring.png"
            alt="Decorative circle"
            className="w-20 h-full animate-float-up-dottedball"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="card shadow-lg mb-6">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("filters.title")}</h3>
              {(overviewLoading || productStatsLoading) && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Month Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <select
                  className="select select-bordered select-sm"
                  value={selectedMonth}
                  onChange={(e) => handleMonthFilterChange(e.target.value)}
                >
                  {generateMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
              {/* Search */}
              <input
                type="text"
                placeholder={t("searchProducts")}
                className="input input-bordered input-sm flex-1 min-w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {hasActiveFilters && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                  {t("clearFilters")}
                </button>
              )}
              {/* Export Dropdown */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-outline btn-primary"
                  disabled={exporting}
                >
                  {exporting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {t("export.exporting") || "Exporting..."}
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2" />
                      {t("export.export") || "Export Data"}
                    </>
                  )}
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80"
                >
                  <li className="menu-title">
                    <span>{t("export.csvFormat") || "CSV Format"}</span>
                  </li>
                  <li>
                    <button
                      onClick={() => exportAnalytics()}
                      disabled={exporting || filteredProductStats.length === 0}
                    >
                      <FaFileExport className="mr-2" />
                      {t("export.exportPageCSV") || "Export Page (CSV)"}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => exportAnalytics(true)}
                      disabled={exporting || productStats.length === 0}
                    >
                      <FaFileExport className="mr-2" />
                      {t("export.exportAllCSV") || "Export All (CSV)"}
                    </button>
                  </li>
                  <div className="divider my-1"></div>
                  <li className="menu-title">
                    <span>{t("export.jsonFormat") || "JSON Format"}</span>
                  </li>
                  <li>
                    <button
                      onClick={() => exportAnalyticsJSON()}
                      disabled={exporting || filteredProductStats.length === 0}
                    >
                      <FaFileExport className="mr-2" />
                      {t("export.exportPageJSON") || "Export Page (JSON)"}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => exportAnalyticsJSON(true)}
                      disabled={exporting || productStats.length === 0}
                    >
                      <FaFileExport className="mr-2" />
                      {t("export.exportAllJSON") || "Export All (JSON)"}
                    </button>
                  </li>
                  <div className="divider my-1"></div>
                  <li className="menu-title">
                    <span>{t("export.xlsxFormat") || "XLSX Format"}</span>
                  </li>
                  <li>
                    <button
                      onClick={() => exportAnalyticsXlsx()}
                      disabled={exporting || filteredProductStats.length === 0}
                    >
                      <FaFileExport className="mr-2" />
                      {t("export.exportPageXLSX") || "Export Page (XLSX)"}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => exportAnalyticsXlsx(true)}
                      disabled={exporting || productStats.length === 0}
                    >
                      <FaFileExport className="mr-2" />
                      {t("export.exportAllXLSX") || "Export All (XLSX)"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="card shadow-lg mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t("activeFilters")}:</span>
              {selectedMonth !== "all" && (
                <div className="badge badge-primary gap-2">
                  {
                    generateMonthOptions().find(
                      (opt) => opt.value === selectedMonth
                    )?.label
                  }
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleMonthFilterChange("all")}
                  />
                </div>
              )}
              {searchQuery.trim() && (
                <div className="badge badge-accent gap-2">
                  Search: "{searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </div>
              )}
              {selectedDate && (
                <div className="badge badge-info gap-2">
                  Date: {selectedDate}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleDateChange("")}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Showing daily statistics for {selectedDate}</span>
          </div>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Total Purchases */}
        <div className="card bg-info text-info-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.totalPurchases")}
                </h3>
                <p className="text-2xl font-bold">
                  {overviewLoading ? "..." : overviewStats.totalPurchases}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmed Purchases */}
        <div className="card bg-success text-success-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.confirmed")}
                </h3>
                <p className="text-2xl font-bold">
                  {overviewLoading ? "..." : overviewStats.confirmedPurchases}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Purchases */}
        <div className="card bg-warning text-warning-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.pending")}
                </h3>
                <p className="text-2xl font-bold">
                  {overviewLoading ? "..." : overviewStats.pendingPurchases}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card bg-secondary text-secondary-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.totalRevenue")}
                </h3>
                <p className="text-2xl font-bold">
                  {overviewLoading
                    ? "..."
                    : formatPrice(overviewStats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmed Revenue */}
        <div className="card bg-accent text-accent-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.confirmedRevenue")}
                </h3>
                <p className="text-2xl font-bold">
                  {overviewLoading
                    ? "..."
                    : formatPrice(overviewStats.confirmedRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="card bg-neutral text-neutral-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">📊</div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.averagePrice")}
                </h3>
                <p className="text-2xl font-bold">
                  {overviewLoading
                    ? "..."
                    : formatPrice(Math.round(overviewStats.averagePrice))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Top Performing Product */}
        <div className="card bg-gradient-to-r from-primary to-primary-focus text-primary-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium opacity-90">
                  {t("insights.topProduct")}
                </h3>
                <p className="text-lg font-bold truncate">
                  {productStatsLoading
                    ? "..."
                    : performanceMetrics.topProduct?.productName || "N/A"}
                </p>
                <p className="text-xs opacity-75">
                  {productStatsLoading
                    ? ""
                    : `${performanceMetrics.topProduct?.totalPurchases || 0
                    } purchases`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="card bg-gradient-to-r from-info to-info-content text-info-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("insights.totalProducts")}
                </h3>
                <p className="text-2xl font-bold">
                  {productStatsLoading
                    ? "..."
                    : performanceMetrics.totalProducts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average per Product */}
        <div className="card bg-gradient-to-r from-secondary to-secondary-focus text-secondary-content shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("insights.avgPerProduct")}
                </h3>
                <p className="text-2xl font-bold">
                  {productStatsLoading
                    ? "..."
                    : Math.round(performanceMetrics.averagePerProduct)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Analysis */}
      {responseTimeStats && (
        <div className="card shadow-lg mb-8">
          <div className="card-header p-4 border-b border-base-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {t("insights.responseTimeTitle") || "Response Time Analysis"}
            </h2>
          </div>
          <div className="card-body p-4">
            {responseTimeLoading ? (
              <div className="flex justify-center items-center h-24">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat">
                  <div className="stat-figure text-info">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="stat-title">
                    {t("insights.avgReceiveTime") || "Avg. Receive Time"}
                  </div>
                  <div className="stat-value">
                    {responseTimeStats.receiveTime?.averageMinutes}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.receiveTime?.count || 0}{" "}
                    {t("insights.avgReceiveTimeDesc")}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.receiveTime?.maxMinutes || 0}{" "}
                    {t("insights.avgReceiveTimeMax")}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.receiveTime?.minMinutes || 0}{" "}
                    {t("insights.avgReceiveTimeMin")}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-success">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="stat-title">
                    {t("insights.avgConfirmTime") || "Avg. Confirm Time"}
                  </div>
                  <div className="stat-value">
                    {responseTimeStats.confirmTime?.averageMinutes}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.confirmTime?.count || 0}{" "}
                    {t("insights.avgConfirmTimeDesc")}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.confirmTime?.maxMinutes || 0}{" "}
                    {t("insights.avgConfirmTimeMax")}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.confirmTime?.minMinutes || 0}{" "}
                    {t("insights.avgConfirmTimeMin")}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div className="stat-title">
                    {t("insights.avgTotalTime") || "Avg. Total Time"}
                  </div>
                  <div className="stat-value">
                    {responseTimeStats.totalResponseTime?.averageMinutes}
                  </div>
                  <div className="stat-desc">
                    {t("insights.avgTotalTimeDesc")}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.totalResponseTime?.maxMinutes || 0}{" "}
                    {t("insights.avgTotalTimeMax")}
                  </div>
                  <div className="stat-desc">
                    {responseTimeStats.totalResponseTime?.minMinutes || 0}{" "}
                    {t("insights.avgTotalTimeMin")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDate && dailyStats ? (
        <div className="card shadow-lg overflow-hidden">
          <div className="card-header p-4 border-b border-base-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t("dailyStats")} - {selectedDate}
            </h2>
          </div>
          <div className="card-body p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="stat">
                <div className="stat-title">Daily Purchases</div>
                <div className="stat-value">{dailyStats.totalPurchases}</div>
                <div className="stat-desc">Total orders today</div>
              </div>
              <div className="stat">
                <div className="stat-title">Daily Revenue</div>
                <div className="stat-value">
                  {formatPrice(dailyStats.totalRevenue)}
                </div>
                <div className="stat-desc">Revenue generated today</div>
              </div>
              <div className="stat">
                <div className="stat-title">Confirmed Revenue</div>
                <div className="stat-value text-success">
                  {formatPrice(dailyStats.confirmedRevenue)}
                </div>
                <div className="stat-desc">Confirmed orders today</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Keep the existing Product Performance Table here
        <div className="card shadow-lg overflow-hidden">
          <div className="card-header p-4 border-b border-base-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t("productPerformance")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-center">{t("table.rank")}</th>
                  <th className="text-center">{t("table.productName")}</th>
                  <th className="text-center">{t("table.totalPurchases")}</th>
                  <th className="text-center">{t("table.totalValue")}</th>
                  <th className="text-center">{t("table.avgValue")}</th>
                  <th className="text-center">{t("table.performance")}</th>
                </tr>
              </thead>
              <tbody>
                {productStatsLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="loading loading-spinner loading-lg"></div>
                    </td>
                  </tr>
                ) : filteredProductStats.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold mb-2">{t('table.noData')}</h3>
                      <p className="text-base-content/50">{t('table.tryAdjustingFilters')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredProductStats.map((product, index) => {
                    const totalValue = Number(product.totalValue) || 0;
                    const totalPurchases = Number(product.totalPurchases) || 0;
                    const avgValue =
                      totalPurchases > 0 ? totalValue / totalPurchases : 0;
                    const maxPurchases = Math.max(
                      ...filteredProductStats.map(
                        (p) => Number(p.totalPurchases) || 0
                      )
                    );
                    const performancePercentage =
                      maxPurchases > 0
                        ? (totalPurchases / maxPurchases) * 100
                        : 0;

                    return (
                      <tr key={product.productId} className="hover">
                        <td className="text-center">
                          <div className="flex items-center justify-center">
                            {index === 0 && <Award className="w-4 h-4 text-warning mr-1" />}
                            <span className="font-bold">{index + 1}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="font-medium">
                            {product.productName}
                          </div>
                          <div className="text-xs opacity-50 font-mono">
                            {product.productId}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="badge badge-primary">
                            {totalPurchases}
                          </div>
                        </td>
                        <td className="text-center font-bold">
                          <span className="text-success">
                            {formatPrice(totalValue)}
                          </span>
                        </td>
                        <td className="text-center">
                          {formatPrice(Math.round(avgValue))}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-base-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${performancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {Math.round(performancePercentage)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Trends Section */}
      {monthlyStats.length > 1 && (
        <div className="card shadow-lg mt-8">
          <div className="card-header p-4 border-b border-base-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t("monthlyTrends")}
            </h2>
          </div>
          <div className="card-body p-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>{t("table.month")}</th>
                    <th className="text-center">{t("table.totalPurchases")}</th>
                    <th className="text-center">{t("table.confirmed")}</th>
                    <th className="text-center">{t("table.revenue")}</th>
                    <th className="text-center">
                      {t("table.confirmedRevenue")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map((stat) => {
                    const date = new Date(stat._id.year, stat._id.month - 1, 1);
                    const monthName = date.toLocaleDateString(i18n.language, {
                      year: "numeric",
                      month: "long",
                    });
                    return (
                      <tr
                        key={`${stat._id.year}-${stat._id.month}`}
                        className="hover"
                      >
                        <td className="font-medium">{monthName}</td>
                        <td className="text-center">
                          <div className="badge badge-outline">
                            {stat.count}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="badge badge-success">
                            {stat.confirmedCount}
                          </div>
                        </td>
                        <td className="text-center font-bold">
                          {formatPrice(stat.revenue)}
                        </td>
                        <td className="text-center font-bold text-success">
                          {formatPrice(stat.confirmedRevenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>{" "}
        </div>
      )}

      {/* ==================== Payment Methods Section ==================== */}
      <div className="mt-12">
        {/* Add Payment Method Form */}
        <div className="card shadow-lg mb-8">
          <div className="card-header p-4 border-b border-base-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {isRTL ? "إضافة طريقة دفع" : "Add New Payment Method"}
            </h2>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreatePaymentMethod}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {isRTL ? "اسم طريقة الدفع" : "Payment Method Name"} *
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${paymentErrors.name ? "input-error" : ""
                      }`}
                    value={paymentMethodForm.name}
                    onChange={(e) =>
                      setPaymentMethodForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder={
                      isRTL ? "مثال: فودافون كاش" : "e.g. Vodafone Cash"
                    }
                  />
                  {paymentErrors.name && (
                    <p className="text-error text-sm mt-1">
                      {paymentErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {isRTL ? "رقم الهاتف" : "Phone Number"} *
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${paymentErrors.phoneNumber ? "input-error" : ""
                      }`}
                    value={paymentMethodForm.phoneNumber}
                    onChange={(e) =>
                      setPaymentMethodForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="01XXXXXXXXX"
                  />
                  {paymentErrors.phoneNumber && (
                    <p className="text-error text-sm mt-1">
                      {paymentErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <label className="label">
                  <span className="label-text font-medium">
                    {isRTL ? "صورة طريقة الدفع" : "Payment Method Image"} *
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={`file-input file-input-bordered w-full ${paymentErrors.paymentMethodImg ? 'file-input-error' : ''
                    }`}
                  onChange={handleImageChange}
                />
                {paymentErrors.paymentMethodImg && (
                  <p className="text-error text-sm mt-1">
                    {paymentErrors.paymentMethodImg}
                  </p>
                )}
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : isRTL ? (
                    "حفظ"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Payment Methods List */}
        <div className="card shadow-lg">
          <div className="card-header p-4 border-b border-base-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {isRTL ? "قائمه طرق الدفع" : "Available Payment Methods"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-center">{isRTL ? "الصورة" : "Image"}</th>
                  <th className="text-center">{isRTL ? "الاسم" : "Name"}</th>
                  <th className="text-center">
                    {isRTL ? "رقم الهاتف" : "Phone Number"}
                  </th>
                  <th className="text-center">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="text-center">
                    {isRTL ? "تاريخ الإنشاء" : "Created At"}
                  </th>
                  <th className="text-center">
                    {isRTL ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-base-content/50">
                      {isRTL ? 'لا توجد طرق دفع متاحة' : 'No payment methods available'}
                    </td>
                  </tr>
                ) : (
                  paymentMethods.map((method) => (
                    <tr key={method._id}>
                      <td className="text-center">
                        <div className="flex justify-center">
                          {method.paymentMethodImg ? (
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-lg">
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/${method.paymentMethodImg.replace(/\\/g, "/")}`}
                                  alt={method.name}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-base-200 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-base-content/50" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center font-medium">
                        {method.name || "-"}
                      </td>
                      <td className="text-center">
                        {method.phoneNumber || "-"}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${method.status ? "badge-success" : "badge-error"
                            }`}
                        >
                          {method.status
                            ? isRTL
                              ? "مفعل"
                              : "Active"
                            : isRTL
                              ? "معطل"
                              : "Disabled"}
                        </span>
                      </td>
                      <td className="text-center">
                        {method.createdAt
                          ? new Date(method.createdAt).toLocaleDateString(
                            isRTL ? "ar-EG" : "en-US"
                          )
                          : "-"}
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEditPaymentMethod(method)}
                            disabled={actionLoading}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              handleTogglePaymentMethodStatus(method)
                            }
                            disabled={actionLoading}
                          >
                            🔄
                          </button>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleDeletePaymentMethod(method)}
                            disabled={actionLoading}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Payment Method Modal */}
      {openEditPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/40">
          <div className="bg-base-100 w-full max-w-md rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {isRTL ? "تعديل طريقة الدفع" : "Edit Payment Method"}
              </h3>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={closeEditPaymentMethod}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePaymentMethod} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {isRTL ? "الاسم" : "Name"}
                  </span>
                </label>
                <input
                  className={`input input-bordered w-full ${paymentErrors.name ? "input-error" : ""
                    }`}
                  value={paymentMethodForm.name}
                  onChange={(e) =>
                    setPaymentMethodForm((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                  placeholder={isRTL ? "الاسم" : "Name"}
                />
                {paymentErrors.name && (
                  <p className="text-error text-sm mt-1">
                    {paymentErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {isRTL ? "رقم الهاتف" : "Phone Number"}
                  </span>
                </label>
                <input
                  className={`input input-bordered w-full ${paymentErrors.phoneNumber ? "input-error" : ""
                    }`}
                  value={paymentMethodForm.phoneNumber}
                  onChange={(e) =>
                    setPaymentMethodForm((p) => ({
                      ...p,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder={isRTL ? "رقم الهاتف" : "Phone Number"}
                />
                {paymentErrors.phoneNumber && (
                  <p className="text-error text-sm mt-1">
                    {paymentErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Image Upload in Edit Modal */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {isRTL ? "صورة طريقة الدفع" : "Payment Method Image"}
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeEditPaymentMethod}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : isRTL ? (
                    "حفظ"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreAnalytics;
