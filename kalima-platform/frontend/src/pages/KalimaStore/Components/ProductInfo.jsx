"use client"

import { useTranslation } from "react-i18next"

const ProductInfo = ({ product, type, isRTL }) => {
  const { t } = useTranslation("kalimaStore-ProductDetails")

  const getItemCategory = () => {
    if (product.__t === "ECBook" && product.subject) {
      return product.subject.name || product.subject
    }
    if (product.section && product.section.name) {
      return product.section.name
    }
    return type === "book" ? t("product.types.book") : t("product.types.product")
  }

  const getDisplayPrice = () => {
    if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
      return product.priceAfterDiscount
    }
    return product.price
  }

  const hasDiscount = () => {
    return product.priceAfterDiscount && product.priceAfterDiscount < product.price
  }

  return (
    <div className="space-y-8">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
        <div className="flex flex-wrap gap-2">
          <div className={`badge ${type === "book" ? "badge-success" : "badge-info"}`}>
            {type === "book" ? "📚 Book" : "📦 Product"}
          </div>
          <div className="badge badge-outline">{getItemCategory()}</div>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
              <span className="font-semibold">Serial Number</span>
            </div>
            <p className="font-mono text-lg">{product.serial}</p>
          </div>
        </div>

        {product.description && (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-semibold">Description</span>
              </div>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Price</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {getDisplayPrice()} {t("product.currency")}
                </span>
                {hasDiscount() && (
                  <span className="text-lg line-through opacity-70">
                    {product.price} {t("product.currency")}
                  </span>
                )}
              </div>
            </div>

            {hasDiscount() && (
              <div className="text-right">
                <div className="badge badge-error badge-lg font-bold">{product.discountPercentage}% OFF</div>
                <p className="text-sm opacity-90 mt-1">
                  Save {(product.price - getDisplayPrice()).toFixed(2)} {t("product.currency")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-success text-success-content">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold">Instant Access</p>
                <p className="text-sm opacity-90">Download immediately</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-info text-info-content">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-sm opacity-90">Safe & protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
