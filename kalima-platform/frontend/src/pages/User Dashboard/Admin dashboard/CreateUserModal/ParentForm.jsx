"use client";

const ParentForm = ({ userData, handleChange, t, isRTL }) => {
  // Helper to update nested preferredContactTime
  const updateContactTime = (field, value) => {
    const currentContactTime = userData.preferredContactTime || {};
    handleChange({
      target: {
        name: "preferredContactTime",
        value: {
          ...currentContactTime,
          [field]: value,
        },
      },
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const contactTime = userData.preferredContactTime || {};

  return (
    <div className="space-y-4">
      {/* Preferred Contact Time */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            {t("fields.preferredContactTime") || "Preferred Contact Time"}
          </span>
        </label>

        {/* Time Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* From */}
          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-70">
              {t("fields.from") || "From"}
            </label>
            <input
              type="time"
              className="input input-bordered"
              value={contactTime.from || ""}
              onChange={(e) => updateContactTime("from", e.target.value)}
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-70">
              {t("fields.to") || "To"}
            </label>
            <input
              type="time"
              className="input input-bordered"
              value={contactTime.to || ""}
              onChange={(e) => updateContactTime("to", e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        {(contactTime.from || contactTime.to) && (
          <div className="mt-3 text-sm text-base-content/70">
            <p>
              ⏰ <strong>{t("fields.from") || "From"}:</strong>{" "}
              {contactTime.from ? formatTime(contactTime.from) : "--"}
            </p>
            <p>
              ⏰ <strong>{t("fields.to") || "To"}:</strong>{" "}
              {contactTime.to ? formatTime(contactTime.to) : "--"}
            </p>
          </div>
        )}

        {/* Note */}
        <div className="mt-3">
          <label className="text-sm opacity-70">
            {t("fields.note") || "Note"}
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={2}
            placeholder={
              t("placeholders.contactNote") ||
              "Best time to call, WhatsApp preferred, etc."
            }
            value={contactTime.note || ""}
            onChange={(e) => updateContactTime("note", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ParentForm;
