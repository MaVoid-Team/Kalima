import React from "react";
import { useTranslation } from "react-i18next";
import { Edit3, X, Save } from "lucide-react";

const OrderNotesModal = ({
    notesModal,
    handleNotesChange,
    closeNotesModal,
    handleSaveNotes,
}) => {
    const { t } = useTranslation("kalimaStore-orders");

    if (!notesModal.isOpen) return null;

    return (
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
    );
};

export default OrderNotesModal;
