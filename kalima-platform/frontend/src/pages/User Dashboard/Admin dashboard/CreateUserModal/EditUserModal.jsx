"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updateUser } from "../../../../routes/update-user";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const { t, i18n } = useTranslation("admin");
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const toAmPm = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const to24Hour = (timeStr) => {
    if (!timeStr) return "";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "", // Include role to prevent "invalid or missing role" error
    preferredContactTime: {
      from: "",
      to: "",
      note: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        password: "",
        role: user.role || "", // Preserve the user's role
        preferredContactTime: {
          from: to24Hour(user.preferredContactTime?.from) || "",
          to: to24Hour(user.preferredContactTime?.to) || "",
          note: user.preferredContactTime?.note || "",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("preferredContactTime.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferredContactTime: {
          ...prev.preferredContactTime,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Create update data object, only including fields that have values
    const updateData = {};
    if (formData.name) updateData.name = formData.name;
    if (formData.email) updateData.email = formData.email;
    if (formData.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
    if (formData.password) updateData.password = formData.password;

    // Handle Preferred Contact Time
    if (formData.preferredContactTime) {
      updateData.preferredContactTime = {};
      if (formData.preferredContactTime.from)
        updateData.preferredContactTime.from = toAmPm(
          formData.preferredContactTime.from
        );
      if (formData.preferredContactTime.to)
        updateData.preferredContactTime.to = toAmPm(
          formData.preferredContactTime.to
        );
      if (formData.preferredContactTime.note)
        updateData.preferredContactTime.note =
          formData.preferredContactTime.note;
    }

    // Always include the role to prevent "invalid or missing role" error
    updateData.role = formData.role;

    try {
      const result = await updateUser(user._id, updateData);

      if (result.success) {
        // Remove password from the data we pass back to the parent component
        const { password, ...dataToUpdate } = updateData;
        onUserUpdated(user._id, dataToUpdate);
        toast.success(t("admin.editSuccess") || "تم تعديل المستخدم بنجاح");
        onClose();
      } else {
        setError(result.error);
        toast.error(result.error || t("admin.editError") || "فشل في تعديل المستخدم");
      }
    } catch (err) {
      setError(err.message || "An error occurred while updating the user");
      toast.error(err.message || t("admin.editError") || "فشل في تعديل المستخدم");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box" dir={isRTL ? "rtl" : "ltr"}>
        <h3
          className={`font-bold text-lg mb-4 ${isRTL ? "text-right" : "text-left"
            }`}
        >
          {t("admin.editUser.title", { name: user?.name })}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label flex flex-col items-start">
              <span className="label-text mb-1">
                {t("admin.editUser.name")}
              </span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered"
              placeholder={t("admin.editUser.namePlaceholder")}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label flex flex-col items-start">
              <span className="label-text mb-1">
                {t("admin.editUser.email")}
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered"
              placeholder={t("admin.editUser.emailPlaceholder")}
            />
          </div>

          <div className="form-control mb-4">
            <label className="label flex flex-col items-start">
              <span className="label-text mb-1">
                {t("admin.editUser.phone")}
              </span>
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input input-bordered"
              placeholder={t("admin.editUser.phonePlaceholder")}
            />
          </div>

          <div className="form-control mb-6">
            <label className="label flex flex-col items-start mb-1 gap-1">
              <span className="label-text font-medium">
                {t("admin.editUser.password")}
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input input-bordered w-full ${isRTL ? "pl-10" : "pr-10"
                  }`}
                placeholder={t("admin.editUser.passwordPlaceholder")}
              />
              <button
                type="button"
                className={`absolute inset-y-0 ${isRTL ? "left-3" : "right-3"
                  } flex items-center cursor-pointer opacity-70 hover:opacity-100`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Preferred Contact Time */}
          <div className="form-control mb-6 border border-base-300 rounded-lg p-4 bg-base-50">
            <label className="label flex flex-col items-start px-0 pt-0">
              <span className="label-text font-bold mb-2">
                {t("admin.editUser.preferredContactTime")}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="label-text text-xs mb-1 block opacity-70">
                  {t("admin.editUser.from")}
                </label>
                <input
                  type="time"
                  name="preferredContactTime.from"
                  className="input input-bordered input-sm w-full"
                  value={formData.preferredContactTime.from}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label-text text-xs mb-1 block opacity-70">
                  {t("admin.editUser.to")}
                </label>
                <input
                  type="time"
                  name="preferredContactTime.to"
                  className="input input-bordered input-sm w-full"
                  value={formData.preferredContactTime.to}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label-text text-xs mb-1 block opacity-70">
                {t("admin.editUser.note")}
              </label>
              <textarea
                name="preferredContactTime.note"
                className="textarea textarea-bordered textarea-sm w-full"
                placeholder={t("admin.editUser.contactNotePlaceholder")}
                value={formData.preferredContactTime.note}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn-ghost" onClick={onClose}>
              {t("admin.editUser.cancel")}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                t("admin.editUser.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
