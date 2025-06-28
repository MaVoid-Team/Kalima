"use client"
import { useState } from "react"

const SectionsManagement = ({ sections = [], products = [], books = [], onEditSection, onDeleteSection, actionLoading = false, isRTL = false }) => {
  const [searchText, setSearchText] = useState("")

  // Simple filtering
  const filteredSections = sections.filter(section => {
    if (!searchText.trim()) return true
    if (!section || !section.name) return false
    return section.name.toLowerCase().includes(searchText.toLowerCase())
  })

  // Add product counts
  const sectionsWithCounts = filteredSections.map(section => {
    const sectionProducts = products.filter(product => 
      product && product.section && (product.section._id === section._id || product.section === section._id)
    )
    const sectionBooks = books.filter(book => 
      book && book.section === section._id
    )
    
    return {
      ...section,
      productCount: sectionProducts.length + sectionBooks.length
    }
  })

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-8">
        <div className={`absolute ${isRTL ? "right-10" : "left-10"}`}>
          <img src="/waves.png" alt="Decorative zigzag" className="w-20 h-full animate-float-zigzag" />
        </div>
        <h2 className="text-3xl font-bold text-center">Sections Management</h2>
        <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
          <img src="/ring.png" alt="Decorative circle" className="w-20 h-full animate-float-up-dottedball" />
        </div>
      </div>

      {/* Search Input */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-bordered w-full pl-4 pr-12"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm">
            🔍
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-center mb-4 text-sm text-gray-500">
        Total sections: {sections.length} | Filtered: {sectionsWithCounts.length} | Search: "{searchText}"
      </div>

      {/* Table */}
      <div className="card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">Name</th>
                <th className="text-center">Section Number</th>
                <th className="text-center">Number of Products</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectionsWithCounts.map((section) => (
                <tr key={section._id}>
                  <td className="text-center font-medium">{section.name || "N/A"}</td>
                  <td className="text-center">{section.number || "N/A"}</td>
                  <td className="text-center">{section.productCount || 0}</td>
                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onEditSection?.(section)}
                        disabled={actionLoading}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onDeleteSection?.(section)}
                        disabled={actionLoading}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sectionsWithCounts.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {sections.length === 0 ? "No sections available" : "No sections found"}
            </p>
            {searchText && (
              <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
            )}
          </div>
        )}

        {/* Decorative dots */}
        <div className="absolute bottom-4 right-4">
          <img src="/rDots.png" alt="Decorative dots" className="w-16 h-full animate-float-down-dottedball" />
        </div>
      </div>
    </div>
  )
}

export default SectionsManagement
