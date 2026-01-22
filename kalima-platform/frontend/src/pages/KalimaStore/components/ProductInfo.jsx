"use client";

import { useTranslation } from "react-i18next";
import { BookOpen, Package } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const ProductInfo = ({ product, type, isRTL }) => {
  const { t } = useTranslation("kalimaStore-ProductDetails");

  // Determine actual type from product data
  const getActualType = () => {
    if (product && product.__t === "ECBook") {
      return "book";
    }
    return "product";
  };

  const actualType = getActualType();
  // dummy comment to re-commit
  const getItemCategory = () => {
    if (actualType === "book" && product.subject) {
      return product.subject.name || product.subject;
    }
    if (product.section && product.section.name) {
      return product.section.name;
    }
    return actualType === "book"
      ? t("product.types.book")
      : t("product.types.product");
  };

  const getDisplayPrice = () => {
    if (
      product.priceAfterDiscount &&
      product.priceAfterDiscount < product.price
    ) {
      return product.priceAfterDiscount;
    }
    return product.price;
  };

  const hasDiscount = () => {
    return (
      product.priceAfterDiscount && product.priceAfterDiscount < product.price
    );
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Product Title - Crimson Aesthetic */}
      <div>
        <h1 className="text-4xl font-black mb-4 text-gray-900 tracking-tight leading-tight">
          {product.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <div
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${
              actualType === "book"
                ? "bg-emerald-50/50 text-emerald-600 border-emerald-100"
                : "bg-blue-50/50 text-blue-600 border-blue-100"
            }`}
          >
            {actualType === "book" ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                {t("product.types.book")}
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5" />
                {t("product.types.product")}
              </>
            )}
          </div>
          <div className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100">
            {getItemCategory()}
          </div>
        </div>
      </div>

      {/* Product Details - Clean Cards */}
      <div className="space-y-4">
        {product.description && (
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 hover:bg-white hover:shadow-md hover:border-red-100 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="font-bold text-gray-900 uppercase tracking-wide text-xs">
                {t("product.description")}
              </span>
            </div>
            <p className="leading-relaxed text-gray-600 text-sm font-medium">
              {product.description}
            </p>
          </div>
        )}

        {/* Subject info for books */}
        {actualType === "book" && product.subject && (
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 hover:bg-white hover:shadow-md hover:border-red-100 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="font-bold text-gray-900 uppercase tracking-wide text-xs">
                {t("product.subject")}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {product.subject.name}
            </p>
          </div>
        )}
      </div>

      {/* Pricing Section - Crimson Gradient */}
      <div className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#991b1b] to-[#ef4444]" />
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="relative p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-100 uppercase tracking-widest mb-2 opacity-80">
                {t("product.price")}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tight">
                  {getDisplayPrice()}
                  <span className="text-2xl ml-1 font-bold opacity-90">
                    {t("product.currency")}
                  </span>
                </span>
                {hasDiscount() && (
                  <span className="text-lg line-through text-red-200 font-medium">
                    {product.price}
                  </span>
                )}
              </div>
            </div>

            {hasDiscount() && (
              <div className="text-right">
                <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-white font-bold mb-2">
                  {product.discountPercentage}% {t("product.off")}
                </div>
                <p className="text-xs text-red-100 font-medium">
                  {t("product.save", {
                    amount: (product.price - getDisplayPrice()).toFixed(2),
                    currency: t("product.currency"),
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
