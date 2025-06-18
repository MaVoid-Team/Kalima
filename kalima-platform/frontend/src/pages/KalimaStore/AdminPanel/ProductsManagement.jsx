"use client"
import { useTranslation } from "react-i18next"

const ProductsManagement = ({
  products = [],
  books = [],
  sections = [],
  subjects = [],
  productSearchQuery,
  setProductSearchQuery,
  onEditProduct,
  onDeleteProduct,
  actionLoading,
  isRTL,
}) => {
  const { t } = useTranslation("kalimaStore-admin")

  // Helper functions with error handling
  const getSectionName = (sectionId) => {
    if (!sectionId) return t("products.unknownSection") || "Unknown Section"

    const section = sections.find(
      (s) => s?._id === sectionId || (typeof sectionId === "object" && s?._id === sectionId?._id),
    )
    return section?.name || t("products.unknownSection") || "Unknown Section"
  }

  const getSubjectName = (subjectId) => {
    if (!subjectId) return "Unknown Subject"

    const subject = subjects.find(
      (s) => s?._id === subjectId || (typeof subjectId === "object" && s?._id === subjectId?._id),
    )
    return subject?.name || "Unknown Subject"
  }

  const formatPrice = (price, discountPercentage) => {
    if (!price || !discountPercentage || discountPercentage <= 0) {
      return price || 0
    }
    const discountAmount = (price * discountPercentage) / 100
    return (price - discountAmount).toFixed(2)
  }

  // Filter products with error handling
  const filteredProducts = (products || []).filter((product) => {
    if (!product?.title) return false
    return product.title.toLowerCase().includes((productSearchQuery || "").toLowerCase())
  })

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center relative mb-8">
        {/* Decorative elements */}
        <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
          <img src="/waves.png" alt="Decorative zigzag" className="w-20 h-full animate-float-zigzag" />
        </div>
        <h2 className="text-3xl font-bold text-center">{t("productsManagement.title") || "Products Management"}</h2>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img src="/ring.png" alt="Decorative circle" className="w-20 h-full animate-float-up-dottedball" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={t("productsManagement.searchPlaceholder") || "Search products..."}
            value={productSearchQuery || ""}
            onChange={(e) => setProductSearchQuery?.(e.target.value)}
            className={`input input-bordered w-full ${isRTL ? "pr-4 pl-12" : "pl-4 pr-12"}`}
          />
          <button
            className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm`}
          >
            🔍
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">{t("productsManagement.table.thumbnail") || "Thumbnail"}</th>
                <th className="text-center">{t("productsManagement.table.title") || "Title"}</th>
                <th className="text-center">{t("productsManagement.table.serial") || "Serial"}</th>
                <th className="text-center">{t("productsManagement.table.section") || "Section"}</th>
                <th className="text-center">Subject</th>
                <th className="text-center">{t("productsManagement.table.price") || "Price"}</th>
                <th className="text-center">{t("productsManagement.table.discount") || "Discount"}</th>
                <th className="text-center">{t("productsManagement.table.finalPrice") || "Final Price"}</th>
                <th className="text-center">{t("productsManagement.table.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                if (!product?._id) return null

                return (
                  <tr key={product._id}>
                    <td className="text-center">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded">
                          <img
                            src={product?.thumbnail || "/placeholder.svg?height=48&width=48"}
                            alt={product?.title || "Product"}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder.svg?height=48&width=48"
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-medium">{product?.title || "N/A"}</td>
                    <td className="text-center">{product?.serial || "N/A"}</td>
                    <td className="text-center">{getSectionName(product?.section)}</td>
                    <td className="text-center">{product?.subject ? getSubjectName(product.subject) : "-"}</td>
                    <td className="text-center">{product?.price || 0}</td>
                    <td className="text-center">
                      {product?.discountPercentage > 0 ? `${product.discountPercentage}%` : "-"}
                    </td>
                    <td className="text-center">
                      {product?.discountPercentage > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium">
                            {formatPrice(product?.price, product?.discountPercentage)}
                          </span>
                          <span className="text-xs line-through text-gray-500">{product?.price}</span>
                        </div>
                      ) : (
                        product?.price || 0
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          title={t("productsManagement.table.edit") || "Edit"}
                          onClick={() => onEditProduct?.(product)}
                          disabled={actionLoading}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={t("productsManagement.table.delete") || "Delete"}
                          onClick={() => onDeleteProduct?.(product)}
                          disabled={actionLoading}
                        >
                          🗑️
                        </button>
                        <button className="btn btn-ghost btn-sm" title={t("productsManagement.table.view") || "View"}>
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {products.length === 0
                ? t("productsManagement.noProductsAvailable") || "No products available"
                : t("productsManagement.noProducts") || "No products found"}
            </p>
            {productSearchQuery && (
              <p className="text-sm text-gray-400 mt-2">
                {t("productsManagement.tryDifferentSearch") || "Try a different search term"}
              </p>
            )}
          </div>
        )}

        {/* Decorative dots */}
        <div className={`absolute bottom-4 ${isRTL ? "left-4" : "right-4"}`}>
          <img src="/rDots.png" alt="Decorative dots" className="w-16 h-full animate-float-down-dottedball" />
        </div>
      </div>
    </div>
  )
}

export default ProductsManagement
