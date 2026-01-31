import React from "react";
import { useTranslation } from "react-i18next";

const OrdersStats = ({ stats }) => {
    const { t } = useTranslation("kalimaStore-orders");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="card bg-info text-info-content shadow-lg">
                <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                            📦
                        </div>
                        <div>
                            <h3 className="text-sm font-medium opacity-90">
                                {t("stats.totalOrders")}
                            </h3>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-success text-success-content shadow-lg">
                <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <div>
                            <h3 className="text-sm font-medium opacity-90">
                                {t("stats.confirmed")}
                            </h3>
                            <p className="text-2xl font-bold">{stats.confirmed}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-warning text-warning-content shadow-lg">
                <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                            ⏳
                        </div>
                        <div>
                            <h3 className="text-sm font-medium opacity-90">
                                {t("stats.pending")}
                            </h3>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-primary text-primary-content shadow-lg">
                <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                            📚
                        </div>
                        <div>
                            <h3 className="text-sm font-medium opacity-90">
                                {t("stats.books")}
                            </h3>
                            <p className="text-2xl font-bold">{stats.books}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-secondary text-secondary-content shadow-lg">
                <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-base-100/20 rounded-full flex items-center justify-center">
                            🛍️
                        </div>
                        <div>
                            <h3 className="text-sm font-medium opacity-90">
                                {t("stats.products")}
                            </h3>
                            <p className="text-2xl font-bold">{stats.products}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersStats;
