import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    MessageSquare,
    Edit3,
    X,
    Trash2,
    Save,
} from "lucide-react";
import { formatPrice, calculateCartTotal } from "../utils";
import { updatePurchase } from "../../../../../routes/orders"; // Adjusted path
import { toast } from "sonner";

const OrderDetailsModal = ({
    selectedOrder,
    showDetailsModal,
    setShowDetailsModal,
    handleDeleteItem,
    deletingItemId,
    handleViewPaymentScreenshot,
    onOrderUpdate, // Callback to update order in parent
}) => {
    const { t, i18n } = useTranslation("kalimaStore-orders");
    const isRTL = i18n.language === "ar";

    const [detailsNotes, setDetailsNotes] = useState({
        value: "",
        isEditing: false,
        loading: false,
        hasChanges: false,
    });

    // Reset local state when modal opens/order changes
    useEffect(() => {
        if (showDetailsModal && selectedOrder) {
            setDetailsNotes({
                value: selectedOrder.adminNotes || "",
                isEditing: false,
                loading: false,
                hasChanges: false,
            });
        }
    }, [showDetailsModal, selectedOrder]);

    if (!showDetailsModal || !selectedOrder) return null;

    const startEditingDetailsNotes = () => {
        setDetailsNotes((prev) => ({
            ...prev,
            isEditing: true,
            value: selectedOrder.adminNotes || "",
        }));
    };

    const cancelEditingDetailsNotes = () => {
        setDetailsNotes((prev) => ({
            ...prev,
            isEditing: false,
            value: selectedOrder.adminNotes || "",
            hasChanges: false,
        }));
    };

    const handleDetailsNotesChange = (newValue) => {
        setDetailsNotes((prev) => ({
            ...prev,
            value: newValue,
            hasChanges: newValue !== (selectedOrder.adminNotes || ""),
        }));
    };

    const handleSaveDetailsNotes = async () => {
        if (!detailsNotes.hasChanges) {
            setDetailsNotes(prev => ({ ...prev, isEditing: false }));
            return;
        }

        try {
            setDetailsNotes((prev) => ({ ...prev, loading: true }));
            const response = await updatePurchase(selectedOrder._id, {
                adminNotes: detailsNotes.value,
            });

            if (response.success) {
                // Update parent state
                if (onOrderUpdate) {
                    onOrderUpdate(selectedOrder._id, { adminNotes: detailsNotes.value });
                }

                setDetailsNotes((prev) => ({
                    ...prev,
                    loading: false,
                    isEditing: false,
                    hasChanges: false,
                }));
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

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
                <h3 className="font-bold text-lg mb-4">{t("table.orderDetails")}</h3>
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
                            <p className="mt-2">
                                <strong>{t("table.totalPurchases")}:</strong>{" "}
                                <span
                                    className={`badge ${selectedOrder.createdBy?.numberOfPurchases > 5
                                            ? "badge-success"
                                            : selectedOrder.createdBy?.numberOfPurchases > 0
                                                ? "badge-primary"
                                                : "badge-ghost"
                                        }`}
                                >
                                    {selectedOrder.createdBy?.numberOfPurchases || 0}
                                </span>
                                {selectedOrder.createdBy?.numberOfPurchases > 5 && (
                                    <span className="ml-2 text-xs text-success font-semibold">
                                        🌟 {t("table.frequentBuyer")}
                                    </span>
                                )}
                                {(!selectedOrder.createdBy?.numberOfPurchases ||
                                    selectedOrder.createdBy?.numberOfPurchases === 0) && (
                                        <span className="ml-2 text-xs text-base-content/50">
                                            {t("table.newClient")}
                                        </span>
                                    )}
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
                                <p className="text-base-content/50 italic">
                                    لا توجد ملاحظات من العميل
                                </p>
                            )}
                        </div>
                    </div>

                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">
                                    {t("table.cartItems")} ({selectedOrder.items.length})
                                </span>
                                {selectedOrder.items.length > 1 && (
                                    <span className="label-text-alt text-warning">
                                        {t("table.canDeleteItems")}
                                    </span>
                                )}
                            </label>
                            <div className="bg-base-200 p-3 rounded space-y-3">
                                {selectedOrder.items.map((item, idx) => (
                                    <div
                                        key={item._id || idx}
                                        className="border-b pb-3 last:border-b-0"
                                    >
                                        {/* عنوان المنتج */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p>
                                                    <strong>
                                                        {item.productSnapshot?.title || item.productName}
                                                    </strong>
                                                </p>

                                                {/* عرض Type */}
                                                <p className="text-sm opacity-75">
                                                    {t("table.type")}:{" "}
                                                    {item.productType === "ECBook"
                                                        ? t("table.book")
                                                        : t("table.productType")}
                                                </p>

                                                {/* Product Serial */}
                                                {item.productSnapshot?.serial && (
                                                    <p className="text-sm font-mono">
                                                        <strong>
                                                            {t("table.productSerial") || "Serial"}:
                                                        </strong>{" "}
                                                        <span className="badge badge-ghost badge-sm">
                                                            {item.productSnapshot.serial}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* السعر وزرار الحذف */}
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold">
                                                    {formatPrice(
                                                        item.priceAtPurchase * (item.quantity || 1)
                                                    )}
                                                </p>
                                                {/* Delete button - only show if more than 1 item */}
                                                {selectedOrder.items.length > 1 && (
                                                    <button
                                                        className="btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        disabled={deletingItemId === item._id}
                                                        title={t("table.deleteItem")}
                                                    >
                                                        {deletingItemId === item._id ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* 📚 Book Info */}
                                        {item.productType === "ECBook" && (
                                            <div className="mt-2 ml-4 border-l-2 border-primary pl-2 text-sm">
                                                <label className="label">
                                                    <span className="label-text font-medium text-xs">
                                                        {t("table.bookInfo")}
                                                    </span>
                                                </label>

                                                {item.nameOnBook && (
                                                    <p>
                                                        <strong>{t("table.nameOnBook")}:</strong>{" "}
                                                        {item.nameOnBook}
                                                    </p>
                                                )}

                                                {item.numberOnBook && (
                                                    <p>
                                                        <strong>{t("table.numberOnBook")}:</strong>{" "}
                                                        {item.numberOnBook}
                                                    </p>
                                                )}

                                                {item.seriesName && (
                                                    <p>
                                                        <strong>{t("table.seriesName")}:</strong>{" "}
                                                        {item.seriesName}
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
                                            {typeof selectedOrder.paymentMethod === "object"
                                                ? selectedOrder.paymentMethod.name
                                                : selectedOrder.paymentMethod}
                                        </span>
                                    </p>
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
                                            handleViewPaymentScreenshot(selectedOrder.watermark)
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
                                    className="btn-ghost btn-xs gap-1"
                                    onClick={startEditingDetailsNotes}
                                >
                                    <Edit3 className="w-3 h-3" />
                                    {selectedOrder.adminNotes
                                        ? t("table.editNotes") || (isRTL ? "تعديل" : "Edit")
                                        : t("table.addNotes") ||
                                        (isRTL ? "إضافة ملاحظة" : "Add Note")}
                                </button>
                            )}
                        </label>

                        {detailsNotes.isEditing ? (
                            <div className="space-y-3">
                                <textarea
                                    className="textarea textarea-bordered w-full min-h-24 text-sm"
                                    placeholder={
                                        isRTL
                                            ? "اكتب ملاحظاتك هنا..."
                                            : "Write your notes here..."
                                    }
                                    value={detailsNotes.value}
                                    onChange={(e) => handleDetailsNotesChange(e.target.value)}
                                    disabled={detailsNotes.loading}
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        className="btn-ghost btn-sm gap-1"
                                        onClick={cancelEditingDetailsNotes}
                                        disabled={detailsNotes.loading}
                                    >
                                        <X className="w-4 h-4" />
                                        {t("table.cancel") || (isRTL ? "إلغاء" : "Cancel")}
                                    </button>
                                    <button
                                        className={`btn btn-primary btn-sm gap-1 ${detailsNotes.hasChanges ? "" : "btn-disabled"
                                            }`}
                                        onClick={handleSaveDetailsNotes}
                                        disabled={detailsNotes.loading || !detailsNotes.hasChanges}
                                    >
                                        {detailsNotes.loading ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {t("table.save") || (isRTL ? "حفظ" : "Save")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-base-200 p-3 rounded min-h-16">
                                {selectedOrder.adminNotes ? (
                                    <p className="whitespace-pre-wrap">
                                        {selectedOrder.adminNotes}
                                    </p>
                                ) : (
                                    <p className="text-base-content/50 italic">
                                        {t("table.noAdminNotes") || "لا توجد ملاحظات إدارية"}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-action">
                    <button
                        className="btn"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        {t("table.close")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
