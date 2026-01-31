import React from "react";
import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import {
    Check,
    Eye,
    ImageIcon,
    Notebook,
    MessageSquare,
    X,
    RotateCcw,
} from "lucide-react";
import { formatTime, calculateCartTotal } from "../utils";

const OrdersTable = ({
    orders,
    loading,
    searchQuery,
    statusFilter,
    typeFilter,
    selectedDate,
    handleViewDetails,
    openNotesModal,
    handleViewPaymentScreenshot,
    handleWhatsAppContact,
    handleDeleteOrder,
    handleConfirmOrder,
    handleReturnOrder,
    handleReConfirmOrder,
    confirmLoading,
    currentPage,
    totalPages,
    handlePageChange,
    totalPurchases,
}) => {
    const { t, i18n } = useTranslation("kalimaStore-orders");

    return (
        <>
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
                                    <td colSpan="11" className="text-center py-8">
                                        <div className="loading loading-spinner loading-lg"></div>
                                        <p className="mt-2 text-base-content/60">{t("loading")}</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center py-8">
                                        <p className="text-base-content/60">
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
                                orders.map((order) => (
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
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-medium">{order.userName}</span>
                                                    {order.createdBy?.numberOfPurchases > 5 && (
                                                        <span
                                                            className="badge badge-success badge-xs"
                                                            title={t("table.frequentBuyer")}
                                                        >
                                                            🌟 {order.createdBy.numberOfPurchases}
                                                        </span>
                                                    )}
                                                    {order.createdBy?.numberOfPurchases > 0 &&
                                                        order.createdBy?.numberOfPurchases <= 5 && (
                                                            <span className="badge badge-primary badge-xs">
                                                                {order.createdBy.numberOfPurchases}
                                                            </span>
                                                        )}
                                                    {(!order.createdBy?.numberOfPurchases ||
                                                        order.createdBy?.numberOfPurchases === 0) && (
                                                            <span
                                                                className="badge badge-ghost badge-xs"
                                                                title={t("table.newClient")}
                                                            >
                                                                {t("table.new")}
                                                            </span>
                                                        )}
                                                </div>
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
                                                <span className="text-success">
                                                    {order.couponCode.value ||
                                                        order.discountAmount ||
                                                        t("table.couponApplied")}
                                                </span>
                                            ) : (
                                                t("table.notAvailable")
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {order.paymentMethod ? (
                                                <span className="badge badge-primary">
                                                    {typeof order.paymentMethod === "object"
                                                        ? order.paymentMethod.name
                                                        : order.paymentMethod}
                                                </span>
                                            ) : (
                                                <span className="text-base-content/40">
                                                    {t("table.notAvailable")}
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center font-mono text-sm">
                                            {order.numberTransferredFrom ||
                                                order.bankTransferFrom ||
                                                t("table.notAvailable")}
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
                                                    <div className="flex items-center gap-1 text-info cursor-help">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="text-xs truncate">
                                                            {order.notesPreview}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-base-content/40 text-xs">
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
                                                    className="btn-ghost btn-sm"
                                                    onClick={() => handleViewDetails(order)}
                                                    title={t("table.viewDetails")}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {/* Notes */}
                                                <button
                                                    className={`btn-ghost btn-sm relative ${order.adminNotes
                                                            ? "text-info"
                                                            : "text-base-content/40"
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
                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-info rounded-full"></span>
                                                    )}
                                                </button>
                                                {/* Payment Screenshot */}
                                                {order.paymentScreenShot && (
                                                    <button
                                                        className="btn-ghost btn-sm"
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
                                                        className="btn-ghost btn-sm text-secondary"
                                                        onClick={() =>
                                                            handleViewPaymentScreenshot(order.watermark)
                                                        }
                                                        title={t("table.viewWatermark") || "View Watermark"}
                                                    >
                                                        <ImageIcon className="w-3 h-3" />
                                                        <span className="text-xs">W</span>
                                                    </button>
                                                )}
                                                {/* WhatsApp */}
                                                {(order.numberTransferredFrom ||
                                                    order.bankTransferFrom ||
                                                    (order.total || calculateCartTotal(order)) === 0) && (
                                                        <button
                                                            className="btn-ghost btn-sm text-success hover:bg-success/10"
                                                            onClick={() => handleWhatsAppContact(order)}
                                                            title={t("table.contactWhatsApp")}
                                                        >
                                                            <FaWhatsapp />
                                                        </button>
                                                    )}
                                                <button
                                                    className="btn-ghost btn-sm text-error hover:bg-error/10"
                                                    onClick={() => handleDeleteOrder(order)}
                                                    title={t("table.deleteOrder")}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {/* Receive → Confirm Buttons */}
                                                {order.status !== "confirmed" &&
                                                    order.status !== "returned" && (
                                                        <button
                                                            className={`btn btn-sm ${order.status === "pending"
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
                                                        className="btn btn-warning btn-sm hover:bg-warning-focus"
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
                                                        className="btn btn-success btn-sm hover:bg-success-focus"
                                                        onClick={() => handleReConfirmOrder(order)}
                                                        disabled={confirmLoading[order._id]}
                                                        title={t("table.reconfirmOrder")}
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

                {orders.length === 0 && !loading && (
                    <div className="py-8 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold mb-2">
                            {t("table.noOrdersFound")}
                        </h3>
                        <p className="text-base-content/60">
                            {t("table.tryAdjustingSearch")}
                        </p>
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
                                    className={`join-item btn ${currentPage === pageToShow ? "btn-primary" : ""
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
                    <div className="text-sm text-base-content/60">
                        {t("table.page")} {currentPage} {t("table.of")} {totalPages} (
                        {totalPurchases} {t("table.totalOrders")})
                    </div>
                </div>
            )}
        </>
    );
};

export default OrdersTable;
