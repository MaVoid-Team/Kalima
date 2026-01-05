"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getAllProductPurchases,
  confirmProductPurchase,
  receiveProductPurchase,
  updatePurchase,
  deleteProductPurchase,
  ReturnProductPurchase,
} from "../../../routes/orders";
import { FaWhatsapp } from "react-icons/fa";
import {
  Check,
  Eye,
  ImageIcon,
  Notebook,
  Edit3,
  MessageSquare,
  Save,
  X,
  Calendar,
  Filter,
  RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";

// Helper function to format price (as it was undeclared)
const formatPrice = (price) => {
  return `${price || 0} ج`; // Assuming 'ج' is the currency symbol
};

// Helper function to calculate cart total (as it was undeclared)
const calculateCartTotal = (order) => {
  if (!order || !order.items) return 0;
  return order.items.reduce(
    (total, item) =>
      total + (item.priceAtPurchase * item.quantity || item.priceAtPurchase),
    0
  );
};

const Orders = () => {
  const { t, i18n } = useTranslation("kalimaStore-orders");
  const isRTL = i18n.language === "ar";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(""); // Add date filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    products: 0,
    books: 0,
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const [allOrders, setAllOrders] = useState([]);

  // Inline notes editing state for details modal
  const [detailsNotes, setDetailsNotes] = useState({
    value: "",
    isEditing: false,
    loading: false,
    hasChanges: false,
  });

  // Enhanced notes modal state
  const [notesModal, setNotesModal] = useState({
    isOpen: false,
    orderId: null,
    notes: "",
    originalNotes: "",
    loading: false,
    hasChanges: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      if (searchQuery.trim() !== debouncedSearchQuery && currentPage !== 1) {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery, currentPage]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = {
        page: currentPage,
      };
      if (debouncedSearchQuery.trim()) {
        queryParams.search = debouncedSearchQuery.trim();
      }
      if (statusFilter !== "all") {
        if (statusFilter === "confirmed") {
          queryParams.status = "confirmed";
        } else if (statusFilter === "received") {
          queryParams.status = "received";
        } else if (statusFilter === "pending") {
          queryParams.status = "pending";
        } else if (statusFilter === "returned") {
          queryParams.status = "returned"; 
        }
      }

      // Add date filter to query params
      if (selectedDate) {
        queryParams.date = selectedDate;
      }

      const response = await getAllProductPurchases(queryParams);
      if (response.success) {
        let purchases = response.data.cartPurchases || [];

        if (typeFilter !== "all") {
          purchases = purchases.filter((purchase) => {
            const itemTypes =
              purchase.items?.map((item) => item.productType) || [];
            if (typeFilter === "book") {
              return itemTypes.some((type) => type === "ECBook");
            } else if (typeFilter === "product") {
              return itemTypes.some((type) => type === "ECProduct");
            }
            return true;
          });
        }

        setOrders(purchases);
        setTotalPages(response.data.totalPages || 1);
        setTotalPurchases(response.data.totalPurchases || purchases.length);

        const allPurchases = purchases;
        const confirmed = allPurchases.filter(
          (order) => order.status === "confirmed"
        ).length;
        const pending = allPurchases.filter(
          (order) => order.status !== "confirmed"
        ).length;

        let products = 0;
        let books = 0;
        allPurchases.forEach((purchase) => {
          if (purchase.items) {
            purchase.items.forEach((item) => {
              if (item.productType === "ECBook") {
                books++;
              } else if (item.productType === "ECProduct") {
                products++;
              }
            });
          }
        });

        setStats({
          total: response.data.totalPurchases || purchases.length,
          confirmed: confirmed,
          pending: pending,
          products: products,
          books: books,
        });
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [
    currentPage,
    statusFilter,
    typeFilter,
    debouncedSearchQuery,
    selectedDate,
  ]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await getAllProductPurchases({ all: true });
      if (response.success) {
        setAllOrders(response.data.data.purchases);
      }
    } catch (err) {
      // handle error
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchAllOrders();
  }, [fetchOrders, fetchAllOrders]);

  // Add handleRefresh to fix missing reference
  const handleRefresh = useCallback(() => {
    fetchOrders();
    fetchAllOrders();
  }, [fetchOrders, fetchAllOrders]);

  // Add date change handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (currentPage !== 1) {
      setCurrentPage(1); // Reset to first page when date changes
    }
  };

  // Add clear filters function
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSelectedDate("");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    selectedDate !== "";

  const handleReturnOrder = async (order) => {
    try {
      setConfirmLoading((prev) => ({ ...prev, [order._id]: true }));

      const response = await ReturnProductPurchase(order._id);

      if (response.success) {
        // Update UI state
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id ? { ...o, status: "returned" } : o
          )
        );

        toast.success(t("alerts.orderReturnSuccess"));
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error(t("alerts.orderReturnFailed") + ": " + err.message);
    } finally {
      setConfirmLoading((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  const handleReConfirmOrder = async (order) => {
    try {
      setConfirmLoading((prev) => ({ ...prev, [order._id]: true }));

      // نفس API بتاع confirm (مش receive)
      const response = await confirmProductPurchase(order._id);

      if (response.success) {
        // Update UI
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id
              ? { ...o, status: "confirmed", confirmed: true }
              : o
          )
        );

        toast.success(t("alerts.orderReconfirmed"));
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      toast.error(t("alerts.orderReconfirmFailed") + ": " + err.message);
    } finally {
      setConfirmLoading((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      setConfirmLoading({ ...confirmLoading, [order._id]: true });

      let response;
      if (order.status === "pending") {
        // First step: pending → received
        response = await receiveProductPurchase(order._id);
      } else if (order.status === "received") {
        // Second step: received → confirmed
        response = await confirmProductPurchase(order._id);
      } else {
        // If already confirmed or in an unexpected state, do nothing or handle as error
        toast.warning(t("alerts.orderAlreadyConfirmedOrInvalidState"));
        return;
      }

      if (response.success) {
        setOrders((prevOrders) =>
          prevOrders.map((o) => {
            if (o._id === order._id) {
              if (order.status === "pending") {
                return { ...o, status: "received" };
              } else if (order.status === "received") {
                return { ...o, status: "confirmed", confirmed: true }; // 'confirmed' flag for backward compatibility/UI use
              }
            }
            return o;
          })
        );

        setStats((prevStats) => {
          const updates = { ...prevStats };
          if (order.status === "pending") {
            // Moving from pending to received - pending count decreases, received count could increase if tracked
            updates.pending = Math.max(0, prevStats.pending - 1);
            // Assuming 'received' is not a direct stat tracked, but pending decreases.
            // If you want to track received, you'd need to add it to the stats state and increment here.
          } else if (order.status === "received") {
            // Moving from received to confirmed
            updates.confirmed = prevStats.confirmed + 1;
            // Assuming 'received' count is not a main stat, pending count remains unchanged as it was already moved out of 'pending'
          }
          return updates;
        });

        const successMessage =
          order.status === "pending" ? "orderReceived" : "orderConfirmed";
        toast.success(t(`alerts.${successMessage}`));
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error("Error confirming order:", err);
      toast.error(t("alerts.failedToConfirm") + (err?.message || ""));
    } finally {
      setConfirmLoading({ ...confirmLoading, [order._id]: false });
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleViewPaymentScreenshot = (screenshotPath) => {
    if (!screenshotPath) return;
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") || "";
    const normalizedPath = screenshotPath.startsWith("uploads/")
      ? `${baseURL}/${screenshotPath}`
      : `${baseURL}/${screenshotPath}`;
    window.open(normalizedPath, "_blank");
  };

  const handleWhatsAppContact = (order) => {
    const phoneNumber = order.createdBy?.phoneNumber;

    // Build product list
    const productList =
      order.items && order.items.length > 0
        ? order.items
            .map((item, index) => {
              const price = item.priceAtPurchase || 0;
              const priceText =
                price > 0 ? `${price.toFixed(2)} جنيه` : "مجاني";
              return `${index + 1}. ${
                item.productSnapshot?.title || "منتج"
              } - ${priceText}`;
            })
            .join("\n")
        : "لا توجد منتجات";

    // Calculate totals
    const subtotal = order.subtotal || calculateCartTotal(order);
    const discount = order.discount || 0;
    const total = order.total || subtotal;

    const discountText =
      discount > 0 ? `\n- الخصم: ${discount.toFixed(2)} جنيه` : "";
    const totalText = total > 0 ? `${total.toFixed(2)} جنيه` : "مجاني";

    // Build complete message with product list
    const message = encodeURIComponent(
      `أهلاً بك أ/ ${
        order.userName
      } 👋\n\nتم استلام طلبك بنجاح، وجارٍ تجهيزه الآن.\n\n*رقم الطلب:* ${
        order.purchaseSerial || order._id
      }\n\n*المنتجات:*\n${productList}${discountText}\n*الإجمالي: ${totalText}*\n\nلو عندك أي استفسار بخصوص الطلب، تقدر تتواصل معانا في أي وقت على نفس الرقم.\n\nنتمنى تعجبك تجربتك معانا، ومبسوطين إنك اخترتنا! 💙\n\nمع تحيات فريق عمل\nمنصة كلمة`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const getProductNames = (order) => {
    if (!order.items || order.items.length === 0) {
      return "N/A";
    }
    return order.items
      .map((item) => item.productSnapshot?.title || "Unknown")
      .join(", ");
  };

  const getOrderType = (order) => {
    if (!order.items || order.items.length === 0) {
      return "Product";
    }
    const hasBooks = order.items.some((item) => item.productType === "ECBook");
    const hasProducts = order.items.some(
      (item) => item.productType === "ECProduct"
    );
    if (hasBooks && hasProducts) {
      return "Mixed";
    }
    return hasBooks ? "Book" : "Product";
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Enhanced notes functionality
  const openNotesModal = (order) => {
    const currentNotes = order.adminNotes || "";
    setNotesModal({
      isOpen: true,
      orderId: order._id,
      notes: currentNotes,
      originalNotes: currentNotes,
      loading: false,
      hasChanges: false,
    });
  };

  const handleNotesChange = (newNotes) => {
    setNotesModal((prev) => ({
      ...prev,
      notes: newNotes,
      hasChanges: newNotes !== prev.originalNotes,
    }));
  };

  const handleSaveNotes = async () => {
    if (!notesModal.hasChanges) {
      setNotesModal({
        isOpen: false,
        orderId: null,
        notes: "",
        originalNotes: "",
        loading: false,
        hasChanges: false,
      });
      return;
    }

    try {
      setNotesModal((prev) => ({ ...prev, loading: true }));
      const response = await updatePurchase(notesModal.orderId, {
        adminNotes: notesModal.notes,
      });

      if (response.success) {
        // Update the orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === notesModal.orderId
              ? { ...order, adminNotes: notesModal.notes }
              : order
          )
        );
        // Update selected order if it's the same one
        if (selectedOrder && selectedOrder._id === notesModal.orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            adminNotes: notesModal.notes,
          }));
        }
        // Close modal
        setNotesModal({
          isOpen: false,
          orderId: null,
          notes: "",
          originalNotes: "",
          loading: false,
          hasChanges: false,
        });
        toast.success(t("alerts.notesSaved"));
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(t("alerts.failedToSaveNotes") + (error?.message || ""));
    } finally {
      setNotesModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const closeNotesModal = () => {
    if (notesModal.hasChanges) {
      if (confirm(t("alerts.unsavedChanges"))) {
        setNotesModal({
          isOpen: false,
          orderId: null,
          notes: "",
          originalNotes: "",
          loading: false,
          hasChanges: false,
        });
      }
    } else {
      setNotesModal({
        isOpen: false,
        orderId: null,
        notes: "",
        originalNotes: "",
        loading: false,
        hasChanges: false,
      });
    }
  };

  // Inline notes editing functions for details modal
  const startEditingDetailsNotes = () => {
    setDetailsNotes({
      value: selectedOrder?.adminNotes || "",
      isEditing: true,
      loading: false,
      hasChanges: false,
    });
  };

  const cancelEditingDetailsNotes = () => {
    setDetailsNotes({
      value: "",
      isEditing: false,
      loading: false,
      hasChanges: false,
    });
  };

  const handleDetailsNotesChange = (newValue) => {
    setDetailsNotes((prev) => ({
      ...prev,
      value: newValue,
      hasChanges: newValue !== (selectedOrder?.adminNotes || ""),
    }));
  };

  const saveDetailsNotes = async () => {
    if (!selectedOrder || !detailsNotes.hasChanges) {
      cancelEditingDetailsNotes();
      return;
    }

    try {
      setDetailsNotes((prev) => ({ ...prev, loading: true }));
      const response = await updatePurchase(selectedOrder._id, {
        adminNotes: detailsNotes.value,
      });

      if (response.success) {
        // Update orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder._id
              ? { ...order, adminNotes: detailsNotes.value }
              : order
          )
        );
        // Update selected order
        setSelectedOrder((prev) => ({
          ...prev,
          adminNotes: detailsNotes.value,
        }));
        // Reset editing state
        setDetailsNotes({
          value: "",
          isEditing: false,
          loading: false,
          hasChanges: false,
        });
        toast.success(t("alerts.notesSaved"));
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(t("alerts.failedToSaveNotes") + (error?.message || ""));
      setDetailsNotes((prev) => ({ ...prev, loading: false }));
    }
  };

  // Get notes preview for table display
  const getNotesPreview = (notes) => {
    if (!notes) return "";
    return notes.length > 50 ? notes.substring(0, 50) + "..." : notes;
  };

  // Memoize order items to prevent unnecessary re-renders
  const memoizedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      orderType: getOrderType(order),
      productNames: getProductNames(order),
      formattedPrice: formatPrice(order.total || calculateCartTotal(order)), // Use helper function
      notesPreview: getNotesPreview(order.adminNotes),
      // Ensure `confirmed` flag is derived from status for UI consistency
      confirmed: order.status === "confirmed",
      // Set `status` directly from order data, ensuring it's always available
      status: order.status || "pending",
    }));
  }, [orders]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Delete order handler
  const handleDeleteOrder = async (order) => {
    if (!order || !order._id) return;
    if (!confirm(t("alerts.confirmDeleteOrder"))) return; // Add confirmation

    try {
      const result = await deleteProductPurchase(order._id);
      if (result.success) {
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
        setError(null);
        // Optionally, update stats here if needed
        toast.success(t("alerts.orderDeleted"));
      } else {
        throw new Error(
          result.error || t("kalimaStore-orders.errors.deleteFailed")
        );
      }
    } catch (err) {
      setError(err.message);
      toast.error(t("alerts.failedToDeleteOrder") + (err?.message || ""));
    }
  };

  const groupedItems = selectedOrder?.items
    ? selectedOrder.items.reduce((acc, item) => {
        const title = item.productSnapshot?.title || item.productName;
        if (!acc[title]) acc[title] = [];
        acc[title].push(item);
        return acc;
      }, {})
    : {};

  const handleExport = async (type, scope) => {
    setExporting(true);
    try {
      const data = scope === "all" ? allOrders : memoizedOrders;
      if (data.length === 0) {
        toast.warning(t("alerts.noDataToExport"));
        return;
      }

      if (type === "csv") {
        // Build CSV rows from current orders (memoizedOrders contains derived fields)
        const rows = data.map((o) => ({
          orderId: o._id,
          purchaseSerial: o.purchaseSerial || "",
          productName: o.productNames || "", // Use productNames from memoizedOrders
          customerName: o.userName || o.createdBy?.name || "",
          type: o.orderType || "", // Use orderType from memoizedOrders
          itemCount: o.items?.length || (o.productName ? 1 : 0), // Count items
          price: o.formattedPrice || "", // Use formattedPrice from memoizedOrders
          couponCode: o.couponCode?.value || o.discountAmount || "",
          transferredFrom: o.numberTransferredFrom || o.bankTransferFrom || "",
          status:
            o.status === "confirmed"
              ? t("table.confirmed")
              : o.status === "received"
              ? t("table.received")
              : t("table.pending"),
          adminNotes: o.adminNotes || "",
          date: o.createdAt || "",
        }));

        // Convert to CSV
        const header = Object.keys(rows[0] || {})
          .map((h) => `"${h}"`)
          .join(",");
        const csv = [header]
          .concat(
            rows.map((r) =>
              Object.values(r)
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(",")
            )
          )
          .join("\n");

        // Create blob and download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders_export_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(t("alerts.exportSuccess") || "تم التصدير بنجاح");
      } else if (type === "xlsx") {
        const rows = data.map((o) => ({
          orderId: o._id,
          purchaseSerial: o.purchaseSerial || "",
          productName: o.productNames || "", // Use productNames from memoizedOrders
          customerName: o.userName || o.createdBy?.name || "",
          type: o.orderType || "", // Use orderType from memoizedOrders
          itemCount: o.items?.length || (o.productName ? 1 : 0), // Count items
          price: o.formattedPrice || "", // Use formattedPrice from memoizedOrders
          couponCode: o.couponCode?.value || o.discountAmount || "",
          transferredFrom: o.numberTransferredFrom || o.bankTransferFrom || "",
          status:
            o.status === "confirmed"
              ? t("table.confirmed")
              : o.status === "received"
              ? t("table.received")
              : t("table.pending"),
          adminNotes: o.adminNotes || "",
          date: o.createdAt || "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        const fileName = `orders_export_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.success(t("alerts.exportSuccess") || "تم التصدير بنجاح");
      } else if (type === "json") {
        const fileName = `orders_export_${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        // Filter out potentially large or sensitive data if necessary before stringifying
        const dataToExport = data.map((o) => {
          const { items, ...rest } = o; // Destructure to handle items separately if needed
          return {
            ...rest,
            items: items
              ? items.map(({ product, ...itemProps }) => ({
                  // Optionally clean up item.product if it's too verbose
                  ...itemProps,
                  productName:
                    product?.title || itemProps.productName || "Unknown", // Ensure product name is present
                }))
              : [],
          };
        });
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(t("alerts.exportSuccess") || "تم التصدير بنجاح");
      }
    } catch (err) {
      console.error("Error exporting orders:", err);
      toast.error(
        (t("alerts.exportFailed") || "فشل في التصدير") +
          (err?.message ? `: ${err.message}` : "")
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
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
            <h3 className="font-bold">{t("errorLoadingOrders")}</h3>
            <div className="text-xs">{error}</div>
          </div>
          <button onClick={fetchOrders} className="btn btn-sm">
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
        <h1 className="text-3xl font-bold text-center">
          {t("ordersManagement")}
        </h1>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img
            src="/ring.png"
            alt="Decorative circle"
            className="w-20 h-full animate-float-up-dottedball"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card bg-blue-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                📦
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.totalOrders")}
                </h3>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-green-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                ✅
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.confirmed")}
                </h3>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-orange-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                ⏳
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.pending")}
                </h3>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-purple-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                📚
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.books")}
                </h3>
                <p className="text-2xl font-bold">{stats.books}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-teal-600 text-white shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🛍️
              </div>
              <div>
                <h3 className="text-sm font-medium opacity-90">
                  {t("stats.products")}
                </h3>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-lg mb-6">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="input input-bordered w-full pr-12"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 min-w-40">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                className="input input-bordered w-full"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                title={t("filters.selectDate")}
              />
            </div>

            <div className="min-w-40">
              <select
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("filters.allStatus")}</option>
                <option value="confirmed">{t("filters.confirmed")}</option>
                <option value="pending">{t("filters.pending")}</option>
                <option value="received">{t("filters.received")}</option>
                <option value="returned">{t("filters.returned")}</option>

                {/* Added received filter */}
              </select>
            </div>

            <div className="min-w-40">
              <select
                className="select select-bordered w-full"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">{t("filters.allTypes")}</option>
                <option value="book">{t("filters.books")}</option>
                <option value="product">{t("filters.products")}</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "🔄"
              )}
              {t("refresh")}
            </button>

            {/* Export CSV button */}
            <div className="dropdown dropdown-end ml-2">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-outline btn-primary"
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {t("exporting")}
                  </>
                ) : (
                  <>
                    <span className="mr-2">📥</span>
                    {t("export")}
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
                    onClick={() => handleExport("csv", "page")}
                    disabled={exporting || memoizedOrders.length === 0}
                  >
                    {t("exportCSVPage") || "Export Page (CSV)"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("csv", "all")}
                    disabled={exporting || allOrders.length === 0}
                  >
                    {t("exportCSVAll") || "Export All (CSV)"}
                  </button>
                </li>
                <div className="divider my-1"></div>
                <li className="menu-title">
                  <span>{t("export.jsonFormat") || "JSON Format"}</span>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("json", "page")}
                    disabled={exporting || memoizedOrders.length === 0}
                  >
                    {t("exportJSONPage") || "Export Page (JSON)"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("json", "all")}
                    disabled={exporting || allOrders.length === 0}
                  >
                    {t("exportJSONAll") || "Export All (JSON)"}
                  </button>
                </li>
                <div className="divider my-1"></div>
                <li className="menu-title">
                  <span>{t("export.xlsxFormat") || "XLSX Format"}</span>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("xlsx", "page")}
                    disabled={exporting || memoizedOrders.length === 0}
                  >
                    {t("exportXLSXPage") || "Export Page (XLSX)"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("xlsx", "all")}
                    disabled={exporting || allOrders.length === 0}
                  >
                    {t("exportXLSXAll") || "Export All (XLSX)"}
                  </button>
                </li>
              </ul>
            </div>

            {hasActiveFilters && (
              <button className="btn btn-ghost" onClick={clearFilters}>
                <X className="w-4 h-4" />
                {t("clearFilters")}
              </button>
            )}
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
              {selectedDate && (
                <div className="badge badge-info gap-2">
                  Date: {selectedDate}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleDateChange("")}
                  />
                </div>
              )}
              {statusFilter !== "all" && (
                <div className="badge badge-primary gap-2">
                  {t(`filters.${statusFilter}`)}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  />
                </div>
              )}
              {typeFilter !== "all" && (
                <div className="badge badge-secondary gap-2">
                  {t(`filters.${typeFilter === "book" ? "books" : "products"}`)}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setTypeFilter("all")}
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
            </div>
          </div>
        </div>
      )}

      {/* Date Filter Alert */}
      {selectedDate && (
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Showing orders for {selectedDate}</span>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">{t("table.product")}</th>
                <th className="text-center">{t("table.customer")}</th>
                <th className="text-center">{t("table.itemCount")}</th>
                <th className="text-center">{t("table.price")}</th>
                <th className="text-center">{t("table.couponCode")}</th>
                <th className="text-center">{t("table.paymentMethod")}</th>
                <th className="text-center">{t("table.transferFrom")}</th>
                <th className="text-center">{t("table.status")}</th>
                <th className="text-center">{t("table.notes")}</th>
                <th className="text-center">{t("table.date")}</th>
                <th className="text-center">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center py-8">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-2 text-gray-500">{t("loading")}</p>
                  </td>
                </tr>
              ) : memoizedOrders.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-8">
                    <p className="text-gray-500">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      typeFilter !== "all" ||
                      selectedDate
                        ? t("noOrdersFound")
                        : t("noOrdersAvailable")}
                    </p>
                  </td>
                </tr>
              ) : (
                memoizedOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="text-center">
                      <div className="font-bold text-sm">
                        {order.productNames}
                      </div>
                      <div className="text-xs opacity-50">
                        {order.purchaseSerial}
                      </div>
                    </td>
                    <td className="text-center">
                      <div>
                        <div className="font-medium">{order.userName}</div>
                        <div className="text-xs opacity-50">
                          {order.createdBy?.email}
                        </div>
                        <div className="text-xs opacity-50">
                          {order.createdBy?.role}
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-bold">
                      {order.items?.length || (order.productName ? 1 : 0)}{" "}
                      {/* Display item count */}
                    </td>
                    <td className="text-center font-bold">
                      {order.formattedPrice}
                    </td>{" "}
                    {/* Display cart total */}
                    <td className="text-center font-bold">
                      {order.couponCode != null ? (
                        <span className="text-green-500">
                          {order.couponCode.value ||
                            order.discountAmount ||
                            "Applied"}
                        </span>
                      ) : (
                        "NA"
                      )}
                    </td>
                    <td className="text-center">
                      {order.paymentMethod ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="badge badge-primary">
                            {typeof order.paymentMethod === 'object' 
                              ? order.paymentMethod.name 
                              : order.paymentMethod}
                          </span>
                          {typeof order.paymentMethod === 'object' && order.paymentMethod.phoneNumber && (
                            <span className="text-xs text-gray-600">
                              {order.paymentMethod.phoneNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="text-center font-mono text-sm">
                      {order.numberTransferredFrom ||
                        order.bankTransferFrom ||
                        "N/A"}
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        {/* 🟡 Returned */}
                        {order.status === "returned" && (
                          <div className="badge badge-warning">
                            {t("table.returned") || "Returned"}
                          </div>
                        )}

                        {/* 🟢 Confirmed */}
                        {order.status === "confirmed" && (
                          <div className="badge badge-success">
                            {t("table.confirmed")}
                          </div>
                        )}

                        {/* 🔵 Received */}
                        {order.status === "received" && (
                          <div className="badge badge-info">
                            {t("table.received")}
                          </div>
                        )}

                        {/* 🔴 Pending */}
                        {order.status === "pending" && (
                          <div className="badge badge-error">
                            {t("table.pending")}
                          </div>
                        )}

                        {/* Show Received By */}
                        {order.receivedBy?.name && (
                          <div className="text-xs opacity-50">
                            {t("table.receivedBy")} {order.receivedBy.name}
                          </div>
                        )}

                        {/* Show Confirmed By */}
                        {order.confirmedBy?.name && (
                          <div className="text-xs opacity-50">
                            {t("table.confirmedBy")} {order.confirmedBy.name}
                          </div>
                        )}

                        {/* Show Returned By */}
                        {order.returnedBy?.name && (
                          <div className="text-xs opacity-50">
                            {t("table.returnedBy") || "Returned By"}{" "}
                            {order.returnedBy.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center max-w-32">
                      {order.adminNotes ? (
                        <div
                          className="tooltip tooltip-left"
                          data-tip={order.adminNotes}
                        >
                          <div className="flex items-center gap-1 text-blue-600 cursor-help">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs truncate">
                              {order.notesPreview}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          {t("table.noNotes")}
                        </span>
                      )}
                    </td>
                    <td className="text-center text-sm">
                      {new Date(order.createdAt).toLocaleDateString(
                        i18n.language
                      )}{" "}
                      - {formatTime(order.createdAt)}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        {/* View */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleViewDetails(order)}
                          title={t("table.viewDetails")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Notes */}
                        <button
                          className={`btn btn-ghost btn-sm relative ${
                            order.adminNotes ? "text-blue-600" : "text-gray-400"
                          }`}
                          onClick={() => openNotesModal(order)}
                          title={
                            order.adminNotes
                              ? t("table.viewEditNotes")
                              : t("table.addNotes")
                          }
                        >
                          <Notebook className="w-4 h-4" />
                          {order.adminNotes && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </button>

                        {/* Payment Screenshot */}
                        {order.paymentScreenShot && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              handleViewPaymentScreenshot(
                                order.paymentScreenShot
                              )
                            }
                            title={t("table.viewPaymentScreenshot")}
                          >
                            <ImageIcon className="w-3 h-3" />
                          </button>
                        )}
                        {order.watermark && (
                          <button
                            className="btn btn-ghost btn-sm text-purple-600"
                            onClick={() =>
                              handleViewPaymentScreenshot(
                                order.watermark
                              )
                            }
                            title={t("table.viewWatermark") || "View Watermark"}
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span className="text-xs">W</span>
                          </button>
                        )}

                        {/* WhatsApp */}
                        {(order.numberTransferredFrom ||
                          order.bankTransferFrom) && (
                          <button
                            className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50"
                            onClick={() => handleWhatsAppContact(order)}
                            title={t("table.contactWhatsApp")}
                          >
                            <FaWhatsapp />
                          </button>
                        )}

                        <button
                          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteOrder(order)}
                          title={t("table.deleteOrder")}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Receive → Confirm Buttons */}
                        {order.status !== "confirmed" &&
                          order.status !== "returned" && (
                            <button
                              className={`btn btn-sm ${
                                order.status === "pending"
                                  ? "btn-error"
                                  : "btn-success"
                              }`}
                              onClick={() => handleConfirmOrder(order)}
                              disabled={confirmLoading[order._id]}
                              title={
                                order.status === "pending"
                                  ? t("table.receiveOrder")
                                  : t("table.confirmOrder")
                              }
                            >
                              {confirmLoading[order._id] ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  {order.status === "pending"
                                    ? t("table.receive")
                                    : t("table.confirm")}
                                </>
                              )}
                            </button>
                          )}

                        {/* Return / Re-confirm loop */}
                        {order.status === "confirmed" && (
                          <button
                            className="btn btn-warning btn-sm hover:bg-yellow-500"
                            onClick={() => handleReturnOrder(order)}
                            disabled={confirmLoading[order._id]}
                            title={t("table.returnOrder")}
                          >
                            {confirmLoading[order._id] ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4" />
                                {t("table.return")}
                              </>
                            )}
                          </button>
                        )}

                        {order.status === "returned" && (
                          <button
                            className="btn btn-success btn-sm hover:bg-green-600"
                            onClick={() => handleReConfirmOrder(order)}
                            disabled={confirmLoading[order._id]}
                            title="Re-confirm order"
                          >
                            {confirmLoading[order._id] ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                {t("table.confirm")}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">
              {t("table.noOrdersFound")}
            </h3>
            <p className="text-gray-500">{t("table.tryAdjustingSearch")}</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("table.previous")}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageToShow}
                  className={`join-item btn ${
                    currentPage === pageToShow ? "btn-primary" : ""
                  }`}
                  onClick={() => handlePageChange(pageToShow)}
                  disabled={loading}
                >
                  {pageToShow}
                </button>
              );
            })}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              {t("table.next")}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {t("table.page")} {currentPage} {t("table.of")} {totalPages} (
            {totalPurchases} {t("table.totalOrders")})
          </div>
        </div>
      )}

      {/* Enhanced Admin Notes Modal */}
      {notesModal.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                {t("table.adminNotes")}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeNotesModal}
                disabled={notesModal.loading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    {t("table.notesLabel")}
                  </span>
                  <span className="label-text-alt">
                    {notesModal.notes.length}/500 {t("table.characters")}
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-32 resize-none"
                  placeholder={t("table.notesPlaceholder")}
                  value={notesModal.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  maxLength={500}
                  disabled={notesModal.loading}
                />
              </div>
              {notesModal.hasChanges && (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>{t("table.unsavedChanges")}</span>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={closeNotesModal}
                disabled={notesModal.loading}
              >
                {t("table.cancel")}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveNotes}
                disabled={notesModal.loading || !notesModal.hasChanges}
              >
                {notesModal.loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {t("table.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("table.saveNotes")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              {t("table.orderDetails")}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("table.orderID")}
                    </span>
                  </label>
                  <p className="font-mono text-sm">{selectedOrder._id}</p>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      {t("table.purchaseSerial")}
                    </span>
                  </label>
                  <p className="font-mono text-sm">
                    {selectedOrder.purchaseSerial}
                  </p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("table.customerInfo")}
                  </span>
                </label>
                <div className="bg-base-200 p-3 rounded">
                  <p>
                    <strong>{t("table.name")}:</strong> {selectedOrder.userName}
                  </p>
                  <p>
                    <strong>{t("table.email")}:</strong>{" "}
                    {selectedOrder.createdBy?.email}
                  </p>
                  <p>
                    <strong>{t("table.role")}:</strong>{" "}
                    {selectedOrder.createdBy?.role}
                  </p>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    📝 {t("table.customerNotes") || "ملاحظات العميل"}
                  </span>
                </label>
                <div className="bg-base-200 p-3 rounded min-h-16">
                  {selectedOrder.notes ? (
                    <p className="whitespace-pre-wrap">{selectedOrder.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      لا توجد ملاحظات من العميل
                    </p>
                  )}
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Cart Items ({selectedOrder.items.length})
                    </span>
                  </label>
                  <div className="bg-base-200 p-3 rounded space-y-3">
                    {Object.entries(groupedItems).map(([title, items], idx) => (
                      <div key={idx} className="border-b pb-3 last:border-b-0">
                        {/* عنوان الكتاب */}
                        <div className="flex justify-between items-start">
                          <div>
                            <p>
                              <strong>{title}</strong>
                            </p>

                            {/* عرض Type */}
                            <p className="text-sm opacity-75">
                              Type: {items[0].productType}
                            </p>

                            {/* Product Serial */}
                            {items[0].productSnapshot?.serial && (
                              <p className="text-sm font-mono">
                                <strong>{t("table.productSerial") || "Serial"}:</strong>{" "}
                                <span className="badge badge-ghost badge-sm">
                                  {items[0].productSnapshot.serial}
                                </span>
                              </p>
                            )}

                            <p className="text-sm">
                              عدد الطلبات :{items.length}
                            </p>
                          </div>

                          {/* السعر */}
                          <p className="font-bold">
                            {formatPrice(
                              items.reduce(
                                (sum, it) =>
                                  sum + it.priceAtPurchase * (it.quantity || 1),
                                0
                              )
                            )}
                          </p>
                        </div>

                        {/* 📚 Book Info – تظهر مرة واحدة فقط */}
                        {items[0].productType === "ECBook" && (
                          <div className="mt-2 ml-4 border-l-2 border-primary pl-2 text-sm">
                            <label className="label">
                              <span className="label-text font-medium text-xs">
                                {t("table.bookInfo")}
                              </span>
                            </label>

                            {items[0].nameOnBook && (
                              <p>
                                <strong>{t("table.nameOnBook")}:</strong>{" "}
                                {items[0].nameOnBook}
                              </p>
                            )}

                            {items[0].numberOnBook && (
                              <p>
                                <strong>{t("table.numberOnBook")}:</strong>{" "}
                                {items[0].numberOnBook}
                              </p>
                            )}

                            {items[0].seriesName && (
                              <p>
                                <strong>{t("table.seriesName")}:</strong>{" "}
                                {items[0].seriesName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    {t("table.paymentInfo")}
                  </span>
                </label>

                <div className="bg-base-200 p-3 rounded">
                  <p>
                    <strong>{t("table.totalPrice")}:</strong>{" "}
                    {formatPrice(calculateCartTotal(selectedOrder))}
                  </p>
                  {selectedOrder.discountAmount && (
                    <p>
                      <strong>Discount:</strong>{" "}
                      {formatPrice(selectedOrder.discountAmount)}
                    </p>
                  )}
                  {selectedOrder.paymentMethod && (
                    <div className="mb-2">
                      <p>
                        <strong>{t("table.paymentMethod")}:</strong>{" "}
                        <span className="badge badge-primary ml-2">
                          {typeof selectedOrder.paymentMethod === 'object' 
                            ? selectedOrder.paymentMethod.name 
                            : selectedOrder.paymentMethod}
                        </span>
                      </p>
                      {typeof selectedOrder.paymentMethod === 'object' && selectedOrder.paymentMethod.phoneNumber && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>{t("table.paymentMethodPhone")}:</strong>{" "}
                          {selectedOrder.paymentMethod.phoneNumber}
                        </p>
                      )}
                    </div>
                  )}
                  <p>
                    <strong>{t("table.paymentNumber")}:</strong>{" "}
                    {selectedOrder.paymentNumber || "N/A"}
                  </p>
                  <p>
                    <strong>{t("table.transferredFrom")}:</strong>{" "}
                    {selectedOrder.numberTransferredFrom ||
                      selectedOrder.bankTransferFrom ||
                      "N/A"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {selectedOrder.paymentScreenShot && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          handleViewPaymentScreenshot(
                            selectedOrder.paymentScreenShot
                          )
                        }
                      >
                        {t("table.viewPaymentScreenshot")}
                      </button>
                    )}
                    {selectedOrder.watermark && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          handleViewPaymentScreenshot(
                            selectedOrder.watermark
                          )
                        }
                      >
                        {t("table.viewWatermark") || "View Watermark"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t("table.adminNotes")}
                  </span>
                  {!detailsNotes.isEditing && (
                    <button
                      className="btn btn-ghost btn-xs gap-1"
                      onClick={startEditingDetailsNotes}
                    >
                      <Edit3 className="w-3 h-3" />
                      {selectedOrder.adminNotes
                        ? (t("table.editNotes") || (isRTL ? "تعديل" : "Edit"))
                        : (t("table.addNotes") || (isRTL ? "إضافة ملاحظة" : "Add Note"))}
                    </button>
                  )}
                </label>

                {detailsNotes.isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      className="textarea textarea-bordered w-full min-h-24 text-sm"
                      placeholder={isRTL ? "اكتب ملاحظاتك هنا..." : "Write your notes here..."}
                      value={detailsNotes.value}
                      onChange={(e) => handleDetailsNotesChange(e.target.value)}
                      disabled={detailsNotes.loading}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        className="btn btn-ghost btn-sm gap-1"
                        onClick={cancelEditingDetailsNotes}
                        disabled={detailsNotes.loading}
                      >
                        <X className="w-4 h-4" />
                        {t("table.cancel") || (isRTL ? "إلغاء" : "Cancel")}
                      </button>
                      <button
                        className={`btn btn-primary btn-sm gap-1 ${
                          detailsNotes.hasChanges ? "" : "btn-disabled"
                        }`}
                        onClick={saveDetailsNotes}
                        disabled={detailsNotes.loading || !detailsNotes.hasChanges}
                      >
                        {detailsNotes.loading ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {t("table.saveNotes") || (isRTL ? "حفظ" : "Save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-base-200 p-3 rounded min-h-16">
                    {selectedOrder.adminNotes ? (
                      <div>
                        <p className="whitespace-pre-wrap">
                          {selectedOrder.adminNotes}
                        </p>
                        {selectedOrder.adminNoteBy && (
                          <div className="flex flex-col mt-2 text-xs opacity-75">
                            <p>
                              Created By:{" "}
                              <strong>{selectedOrder.adminNoteBy.name}</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        {t("table.noAdminNotes")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                  cancelEditingDetailsNotes();
                }}
              >
                {t("table.close")}
              </button>
              {!selectedOrder.confirmed && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleConfirmOrder(selectedOrder);
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                    cancelEditingDetailsNotes();
                  }}
                  disabled={confirmLoading[selectedOrder._id]}
                >
                  {confirmLoading[selectedOrder._id] ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    t("table.confirmOrder")
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
