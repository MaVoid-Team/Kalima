import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Filter, X } from "lucide-react";

const OrdersFilter = ({
    searchQuery,
    setSearchQuery,
    selectedDate,
    handleDateChange,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    handleRefresh,
    loading,
    exporting,
    handleExport,
    allOrdersLength,
    pageOrdersLength,
    hasActiveFilters,
    clearFilters,
}) => {
    const { t } = useTranslation("kalimaStore-orders");

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <>
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
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-ghost btn-sm"
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
                                className="btn-outline btn-primary"
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
                                        disabled={exporting || pageOrdersLength === 0}
                                    >
                                        {t("exportCSVPage") || "Export Page (CSV)"}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleExport("csv", "all")}
                                        disabled={exporting || allOrdersLength === 0}
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
                                        disabled={exporting || pageOrdersLength === 0}
                                    >
                                        {t("exportJSONPage") || "Export Page (JSON)"}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleExport("json", "all")}
                                        disabled={exporting || allOrdersLength === 0}
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
                                        disabled={exporting || pageOrdersLength === 0}
                                    >
                                        {t("exportXLSXPage") || "Export Page (XLSX)"}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleExport("xlsx", "all")}
                                        disabled={exporting || allOrdersLength === 0}
                                    >
                                        {t("exportXLSXAll") || "Export All (XLSX)"}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {hasActiveFilters && (
                            <button className="btn-ghost" onClick={clearFilters}>
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
        </>
    );
};

export default OrdersFilter;
