"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { toast } from "sonner";

const PaymentMethodsManagement = ({
  paymentMethods = [],
  paymentMethodForm,
  setPaymentMethodForm,
  setEditingPaymentMethod,
  onUpdate,
  onDelete,
  onToggleStatus,
  actionLoading = false,
  isRTL = false,
}) => {
  const { t } = useTranslation("kalimaStore-admin");

  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [localMethods, setLocalMethods] = useState([]);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!paymentMethodForm.name?.trim()) {
      newErrors.name =
        t("paymentMethod.validation.nameRequired") || "Name is required";
    }

    if (!paymentMethodForm.phoneNumber?.trim()) {
      newErrors.phoneNumber =
        t("paymentMethod.validation.phoneRequired") ||
        "Phone number is required";
    } else if (!/^01[0-9]{9}$/.test(paymentMethodForm.phoneNumber)) {
      newErrors.phoneNumber =
        t("paymentMethod.validation.phoneInvalid") || "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    setLocalMethods(Array.isArray(paymentMethods) ? paymentMethods : []);
  }, [paymentMethods]);

  const handleToggleStatus = async (method) => {
    const nextStatus = !method.status;

    setLocalMethods((prev) =>
      prev.map((m) => (m._id === method._id ? { ...m, status: nextStatus } : m))
    );

    try {
      await onToggleStatus(method._id, nextStatus);
    } catch (err) {
      setLocalMethods((prev) =>
        prev.map((m) =>
          m._id === method._id ? { ...m, status: method.status } : m
        )
      );

      toast.error(
        err?.response?.data?.message ||
        t("alerts.toggleError") ||
        "Failed to change status"
      );
    }
  };

  /* =======================
     Edit
  ======================= */
  const openEdit = (method) => {
    setPaymentMethodForm({
      name: method.name,
      phoneNumber: method.phoneNumber,
    });
    setEditingPaymentMethod(method);
    setOpenEditPopup(true);
  };

  const closeEdit = () => {
    setOpenEditPopup(false);
    setEditingPaymentMethod(null);
  };

  return (
    <div className="mb-12">
      {/* ================= Header ================= */}
      <div className="flex justify-center mb-8">
        <h2 className="text-3xl font-bold">{t("paymentMethod.title")}</h2>
      </div>

      {/* ================= Edit Modal ================= */}
      {openEditPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-content/40">
          <div className="bg-base-100 w-full max-w-md rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {t("paymentMethod.actions.update")}
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!validateForm()) return;

                onUpdate(e);
                closeEdit();
              }}
              className="space-y-4"
            >
              <input
                className={`input input-bordered w-full ${errors.name ? "input-error" : ""
                  }`}
                value={paymentMethodForm.name}
                onChange={(e) =>
                  setPaymentMethodForm((p) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
                placeholder={t("paymentMethod.fields.name")}
              />

              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}

              <input
                className={`input input-bordered w-full ${errors.phoneNumber ? "input-error" : ""
                  }`}
                value={paymentMethodForm.phoneNumber}
                onChange={(e) =>
                  setPaymentMethodForm((p) => ({
                    ...p,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder={t("paymentMethod.fields.phoneNumber")}
              />

              {errors.phoneNumber && (
                <p className="text-error text-sm mt-1">{errors.phoneNumber}</p>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={closeEdit}
                >
                  {t("common.cancel") || "Cancel"}
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {t("paymentMethod.actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= Table ================= */}
      <div className="card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">{t("paymentMethod.table.name")}</th>
                <th className="text-center">
                  {t("paymentMethod.table.phoneNumber")}
                </th>
                <th className="text-center">
                  {t("paymentMethod.table.status")}
                </th>
                <th className="text-center">
                  {t("paymentMethod.table.createdAt")}
                </th>
                <th className="text-center">
                  {t("paymentMethod.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {localMethods.map((method) => (
                <tr key={method._id}>
                  <td className="text-center font-medium">
                    {method.name || "-"}
                  </td>

                  <td className="text-center">{method.phoneNumber || "-"}</td>

                  <td className="text-center">
                    <span
                      className={`badge ${method.status ? "badge-success" : "badge-error"
                        }`}
                    >
                      {method.status
                        ? t("paymentMethod.status.active")
                        : t("paymentMethod.status.disabled")}
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
                        className="btn-ghost btn-sm"
                        onClick={() => openEdit(method)}
                        disabled={actionLoading}
                      >
                        ✏️
                      </button>

                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => handleToggleStatus(method)}
                        disabled={actionLoading}
                      >
                        🔄
                      </button>

                      <button
                        className="btn-ghost btn-sm text-error"
                        onClick={() => onDelete(method)}
                        disabled={actionLoading}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {localMethods.length === 0 && (
          <div className="py-8 text-center text-base-content/50">
            {t("paymentMethod.noMethods")}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsManagement;
