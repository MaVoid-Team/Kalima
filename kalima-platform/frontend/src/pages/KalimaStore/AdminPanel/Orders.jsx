import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useOrders } from "./Orders/hooks/useOrders";
import { useOrdersExport } from "./Orders/hooks/useOrdersExport";
import OrdersStats from "./Orders/components/OrdersStats";
import OrdersFilter from "./Orders/components/OrdersFilter";
import OrdersTable from "./Orders/components/OrdersTable";
import OrderNotesModal from "./Orders/components/OrderNotesModal";
import OrderDetailsModal from "./Orders/components/OrderDetailsModal";

const Orders = () => {
  const { t, i18n } = useTranslation("kalimaStore-orders");
  const isRTL = i18n.language === "ar";

  const {
    orders,
    setOrders, // Needed for local updates from modal
    loading,
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
    deletingItemId
  } = useOrders();

  const { exporting, handleExport } = useOrdersExport(t);

  const handleViewPaymentScreenshot = (url) => {
    window.open(url, "_blank");
  };

  const handleWhatsAppContact = (order) => {
    const phoneNumber = order.numberTransferredFrom || order.bankTransferFrom;

    if (!phoneNumber) {
      if ((order.total || 0) > 0) {
        toast.error(t("alerts.noPhoneNumber"));
        return;
      }
      return;
    }

    const formattedPhone = phoneNumber.replace(/\D/g, "");
    if (formattedPhone.length < 10) {
      toast.error(t("alerts.invalidPhoneNumber"));
      return;
    }

    const message = t("whatsappMessage", { orderId: order.purchaseSerial || order._id }) || `Hello regarding order ${order.purchaseSerial || order._id}`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const onOrderUpdateFromModal = (orderId, updates) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...updates } : o));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-error">
        <div className="alert alert-error max-w-md shadow-lg">
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
          <button onClick={handleRefresh} className="btn btn-sm">
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

      <OrdersStats stats={stats} />

      <OrdersFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        handleRefresh={handleRefresh}
        loading={loading}
        exporting={exporting}
        handleExport={handleExport}
        allOrdersLength={allOrders.length}
        pageOrdersLength={orders.length}
        hasActiveFilters={
          searchQuery.trim() !== "" ||
          statusFilter !== "all" ||
          typeFilter !== "all" ||
          selectedDate !== ""
        }
        clearFilters={clearFilters}
        memoizedOrders={orders}
        allOrders={allOrders}
      />

      <OrdersTable
        orders={orders}
        loading={loading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        selectedDate={selectedDate}
        handleViewDetails={handleViewDetails}
        openNotesModal={openNotesModal}
        handleViewPaymentScreenshot={handleViewPaymentScreenshot}
        handleWhatsAppContact={handleWhatsAppContact}
        handleDeleteOrder={handleDeleteOrder}
        handleConfirmOrder={handleConfirmOrder}
        handleReturnOrder={handleReturnOrder}
        handleReConfirmOrder={handleReConfirmOrder}
        confirmLoading={confirmLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        totalPurchases={totalPurchases}
      />

      <OrderNotesModal
        notesModal={notesModal}
        handleNotesChange={handleNotesChange}
        closeNotesModal={closeNotesModal}
        handleSaveNotes={handleSaveNotes}
      />

      <OrderDetailsModal
        selectedOrder={selectedOrder}
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        handleDeleteItem={handleDeleteItem}
        deletingItemId={deletingItemId}
        handleViewPaymentScreenshot={handleViewPaymentScreenshot}
        onOrderUpdate={onOrderUpdateFromModal}
      />
    </div>
  );
};

export default Orders;
