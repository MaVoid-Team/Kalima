"use client"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"

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
  // Pagination props
  productsPagination,
  productsLoading,
  onPageChange,
  onItemsPerPageChange,
  onSearch,
}) => {
  const { t } = useTranslation("kalimaStore-admin")
  const [searchInput, setSearchInput] = useState(productSearchQuery || "")

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch && searchInput !== productSearchQuery) {
        onSearch(searchInput)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchInput, onSearch, productSearchQuery])

  const getFileUrl = (filename) => {
    if (!filename) return null;
    const baseURL = import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") || "";
    return `${baseURL}/uploads/product_thumbnail/${filename}`;
  };

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

  // Pagination component
  const PaginationControls = () => {
    const { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPrevPage } = productsPagination

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t("pagination.itemsPerPage") || "Items per page:"}</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
            className="select select-bordered select-sm"
            disabled={productsLoading}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Pagination info */}
        <div className="text-sm text-gray-600">
          {t("pagination.showing") || "Showing"} {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} {t("pagination.of") || "of"} {totalItems}{" "}
          {t("pagination.items") || "items"}
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange?.(1)}
            disabled={!hasPrevPage || productsLoading}
            className="btn btn-sm btn-outline"
            title={t("pagination.firstPage") || "First page"}
          >
            ⟪
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={!hasPrevPage || productsLoading}
            className="btn btn-sm btn-outline"
            title={t("pagination.previousPage") || "Previous page"}
          >
            ⟨
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange?.(pageNum)}
              disabled={productsLoading}
              className={`btn btn-sm ${pageNum === currentPage ? "btn-primary" : "btn-outline"}`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next page */}
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={!hasNextPage || productsLoading}
            className="btn btn-sm btn-outline"
            title={t("pagination.nextPage") || "Next page"}
          >
            ⟩
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange?.(totalPages)}
            disabled={!hasNextPage || productsLoading}
            className="btn btn-sm btn-outline"
            title={t("pagination.lastPage") || "Last page"}
          >
            ⟫
          </button>
        </div>
      </div>
    )
  }

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`input input-bordered w-full ${isRTL ? "pr-4 pl-12" : "pl-4 pr-12"}`}
            disabled={productsLoading}
          />
          <button
            className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm`}
            disabled={productsLoading}
          >
            {productsLoading ? <span className="loading loading-spinner loading-xs"></span> : "🔍"}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-lg overflow-hidden relative">
        {/* Loading overlay */}
        {productsLoading && (
          <div className="absolute inset-0 bg-base-100 bg-opacity-50 flex items-center justify-center z-10">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
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
              {products.map((product) => {
                if (!product?._id) return null

                return (
                  <tr key={product._id}>
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
                          disabled={actionLoading || productsLoading}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={t("productsManagement.table.delete") || "Delete"}
                          onClick={() => onDeleteProduct?.(product)}
                          disabled={actionLoading || productsLoading}
                        >
                          🗑️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title={t("productsManagement.table.view") || "View"}
                          disabled={productsLoading}
                        >
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
        {!productsLoading && products.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {searchInput
                ? t("productsManagement.noProducts") || "No products found"
                : t("productsManagement.noProductsAvailable") || "No products available"}
            </p>
            {searchInput && (
              <p className="text-sm text-gray-400 mt-2">
                {t("productsManagement.tryDifferentSearch") || "Try a different search term"}
              </p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!productsLoading && products.length > 0 && productsPagination && (
          <div className="p-4 border-t">
            <PaginationControls />
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
