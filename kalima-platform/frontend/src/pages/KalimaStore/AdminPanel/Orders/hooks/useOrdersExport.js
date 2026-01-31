import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { formatPrice, getProductNames, getOrderType } from "../utils";

export const useOrdersExport = (t) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async (type, scope, allOrders, memoizedOrders) => {
        setExporting(true);
        try {
            // Use memoizedOrders for "page" scope as they are already formatted
            // For "all" scope, we might need to format them on the fly
            const sourceData = scope === "all" ? allOrders : memoizedOrders;

            if (!sourceData || sourceData.length === 0) {
                toast.warning(t("alerts.noDataToExport"));
                return;
            }

            // Process data to ensure consistent format (handling raw allOrders if needed)
            const data = sourceData.map(o => {
                // Check if it's already formatted (has derived fields)
                if (o.formattedPrice && o.productNames) return o;

                // If not formatted (e.g. raw allOrders), format it now
                return {
                    ...o,
                    formattedPrice: formatPrice(o.total || o.price || 0), // Adjust based on actual data structure
                    productNames: getProductNames(o),
                    orderType: getOrderType(o),
                    // Add other derived fields if necessary
                };
            });

            if (type === "csv") {
                const rows = data.map((o) => ({
                    orderId: o._id,
                    purchaseSerial: o.purchaseSerial || "",
                    productName: o.productNames || "",
                    customerName: o.userName || o.createdBy?.name || "",
                    type: o.orderType || "",
                    itemCount: o.items?.length || (o.productName ? 1 : 0),
                    price: o.formattedPrice || "",
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
                    productName: o.productNames || "",
                    customerName: o.userName || o.createdBy?.name || "",
                    type: o.orderType || "",
                    itemCount: o.items?.length || (o.productName ? 1 : 0),
                    price: o.formattedPrice || "",
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

                const dataToExport = data.map((o) => {
                    const { items, ...rest } = o;
                    return {
                        ...rest,
                        items: items
                            ? items.map(({ product, ...itemProps }) => ({
                                ...itemProps,
                                productName:
                                    product?.title || itemProps.productName || "Unknown",
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

    return {
        exporting,
        handleExport,
    };
};
