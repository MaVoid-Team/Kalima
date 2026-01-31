import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    getAllProductPurchases,
    confirmProductPurchase,
    receiveProductPurchase,
    updatePurchase,
    deleteProductPurchase,
    ReturnProductPurchase,
    deleteItemFromPurchase,
} from "../../../../../routes/orders"; // Adjusted path to routes
import { formatPrice, calculateCartTotal, getProductNames, getOrderType } from "../utils";
import { useMemo } from "react";

export const useOrders = () => {
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
    const [selectedDate, setSelectedDate] = useState("");
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
    const [allOrders, setAllOrders] = useState([]);
    const [deletingItemId, setDeletingItemId] = useState(null);

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
            console.error("Error fetching all orders:", err);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchAllOrders();
    }, [fetchOrders, fetchAllOrders]);

    const handleRefresh = useCallback(() => {
        fetchOrders();
        fetchAllOrders();
    }, [fetchOrders, fetchAllOrders]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setTypeFilter("all");
        setSelectedDate("");
        setCurrentPage(1);
    };

    const handleReturnOrder = async (order) => {
        try {
            setConfirmLoading((prev) => ({ ...prev, [order._id]: true }));

            const response = await ReturnProductPurchase(order._id);

            if (response.success) {
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

            const response = await confirmProductPurchase(order._id);

            if (response.success) {
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
                response = await receiveProductPurchase(order._id);
            } else if (order.status === "received") {
                response = await confirmProductPurchase(order._id);
            } else {
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
                                return { ...o, status: "confirmed", confirmed: true };
                            }
                        }
                        return o;
                    })
                );

                setStats((prevStats) => {
                    const updates = { ...prevStats };
                    if (order.status === "pending") {
                        updates.pending = Math.max(0, prevStats.pending - 1);
                    } else if (order.status === "received") {
                        updates.confirmed = prevStats.confirmed + 1;
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

    const handleDeleteOrder = async (order) => {
        if (!order || !order._id) return;
        if (!confirm(t("alerts.confirmDeleteOrder"))) return;

        try {
            const result = await deleteProductPurchase(order._id);
            if (result.success) {
                setOrders((prev) => prev.filter((o) => o._id !== order._id));
                setError(null);
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

    const handleDeleteItem = async (itemId) => {
        if (!selectedOrder || !itemId) return;

        if (selectedOrder.items.length === 1) {
            toast.error(t("alerts.cannotDeleteLastItem"));
            return;
        }

        if (!confirm(t("alerts.confirmDeleteItem"))) return;

        try {
            setDeletingItemId(itemId);
            // Using deleteItemFromPurchase imported from routes
            // Ensure selectedOrder._id is available
            const result = await deleteItemFromPurchase(selectedOrder._id, itemId);

            if (result.success) {
                const updatedPurchase = result.data.data.purchase;
                setSelectedOrder(updatedPurchase);

                setOrders((prev) =>
                    prev.map((o) => (o._id === selectedOrder._id ? updatedPurchase : o))
                );

                toast.success(t("alerts.itemDeletedSuccess"));
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            toast.error(t("alerts.failedToDeleteItem") + ": " + err.message);
        } finally {
            setDeletingItemId(null);
        }
    };

    // Notes modal handlers
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

    const handleSaveNotes = async () => {
        if (!notesModal.hasChanges) {
            closeNotesModal(); // reset
            return;
        }

        try {
            setNotesModal((prev) => ({ ...prev, loading: true }));
            const response = await updatePurchase(notesModal.orderId, {
                adminNotes: notesModal.notes,
            });

            if (response.success) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === notesModal.orderId
                            ? { ...order, adminNotes: notesModal.notes }
                            : order
                    )
                );

                if (selectedOrder && selectedOrder._id === notesModal.orderId) {
                    setSelectedOrder((prev) => ({
                        ...prev,
                        adminNotes: notesModal.notes,
                    }));
                }

                // Close modal manually resetting to clean state
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

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    // Get notes preview for table display
    const getNotesPreview = (notes) => {
        if (!notes) return "";
        return notes.length > 50 ? notes.substring(0, 50) + "..." : notes;
    };

    const formattedOrders = useMemo(() => {
        return orders.map((order) => ({
            ...order,
            orderType: getOrderType(order),
            productNames: getProductNames(order),
            formattedPrice: formatPrice(order.total || calculateCartTotal(order)),
            notesPreview: getNotesPreview(order.adminNotes),
            confirmed: order.status === "confirmed",
            status: order.status || "pending",
        }));
    }, [orders]);

    return {
        orders: formattedOrders,
        rawOrders: orders,
        setOrders,
        loading,
        isInitialLoad,
        error,
        confirmLoading,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        selectedDate,
        handleDateChange,
        currentPage,
        totalPages,
        totalPurchases,
        selectedOrder,
        setSelectedOrder,
        showDetailsModal,
        setShowDetailsModal,
        stats,
        allOrders,
        notesModal,
        openNotesModal,
        handleNotesChange,
        closeNotesModal,
        handleSaveNotes,
        handleRefresh,
        clearFilters,
        handleConfirmOrder,
        handleReConfirmOrder,
        handleReturnOrder,
        handleDeleteOrder,
        handleViewDetails,
        handlePageChange,
        handleDeleteItem,
        deletingItemId,
        t,
        isRTL
    };
};
