"use client"
import { useTranslation } from "react-i18next"

const SectionsManagement = ({
  sections = [],
  products = [],
  books = [],
  searchQuery,
  setSearchQuery,
  onEditSection,
  onDeleteSection,
  actionLoading,
  isRTL,
}) => {
  const { t } = useTranslation("kalimaStore-admin")

  // Filter sections with error handling
  const filteredSections = (sections || []).filter((section) => {
    if (!section?.name) return false
    return section.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  })

  // Calculate products per section with error handling
  const sectionsWithCounts = filteredSections.map((section) => {
    if (!section?._id) return { ...section, productCount: 0 }

    const sectionProducts = (products || []).filter(
      (product) => product?.section && (product.section._id === section._id || product.section === section._id),
    )
    const sectionBooks = (books || []).filter((book) => book?.section === section._id)

    return {
      ...section,
      productCount: sectionProducts.length + sectionBooks.length,
    }
  })

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center relative mb-8">
        {/* Decorative elements */}
        <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
          <img src="/waves.png" alt="Decorative zigzag" className="w-20 h-full animate-float-zigzag" />
        </div>
        <h2 className="text-3xl font-bold text-center">{t("sectionsManagement.title") || "Sections Management"}</h2>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img src="/ring.png" alt="Decorative circle" className="w-20 h-full animate-float-up-dottedball" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={t("sectionsManagement.searchPlaceholder") || "Search sections..."}
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className={`input input-bordered w-full ${isRTL ? "pr-4 pl-12" : "pl-4 pr-12"}`}
          />
          <button
            className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm`}
          >
            🔍
          </button>
        </div>
      </div>

      {/* Sections Table */}
      <div className="card shadow-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">{t("sectionsManagement.table.name") || "Name"}</th>
                <th className="text-center">{t("sectionsManagement.table.sectionNumber") || "Section Number"}</th>
                <th className="text-center">
                  {t("sectionsManagement.table.numberOfProducts") || "Number of Products"}
                </th>
                <th className="text-center">{t("sectionsManagement.table.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {sectionsWithCounts.map((section) => {
                if (!section?._id) return null

                return (
                  <tr key={section._id}>
                    <td className="text-center font-medium">{section?.name || "N/A"}</td>
                    <td className="text-center">{section?.number || "N/A"}</td>
                    <td className="text-center">{section?.productCount || 0}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onEditSection?.(section)}
                          disabled={actionLoading}
                          title={t("sectionsManagement.table.edit") || "Edit"}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onDeleteSection?.(section)}
                          disabled={actionLoading}
                          title={t("sectionsManagement.table.delete") || "Delete"}
                        >
                          🗑️
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
        {sectionsWithCounts.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {sections.length === 0
                ? t("sectionsManagement.noSectionsAvailable") || "No sections available"
                : t("sectionsManagement.noSections") || "No sections found"}
            </p>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-2">
                {t("sectionsManagement.tryDifferentSearch") || "Try a different search term"}
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

export default SectionsManagement
