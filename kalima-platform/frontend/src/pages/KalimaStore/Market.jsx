"use client"

import { useState, useEffect } from "react"
import {
  getAllSections,
  getAllBooks,
  getAllProducts,
  getProductsBySection,
  getBooksBySection,
} from "../../routes/market"

const Market = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [itemsPerPage] = useState(9)

  // Fetch sections on component mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsResponse = await getAllSections()
        if (sectionsResponse.status === "success") {
          setSections(sectionsResponse.data.sections)
        }
      } catch (err) {
        console.error("Error fetching sections:", err)
      }
    }

    fetchSections()
  }, [])

  // Fetch data based on active tab and current page
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (activeTab === "all") {
          // Fetch all products and books
          const [productsResponse, booksResponse] = await Promise.all([
            getAllProducts({ page: currentPage, limit: itemsPerPage }),
            getAllBooks({ page: currentPage, limit: itemsPerPage }),
          ])

          const products = productsResponse.data?.products || []
          const books = booksResponse.data?.books || []
          const combinedItems = [...products, ...books]

          setAllItems(combinedItems)

          // Calculate total results and pages
          const totalProductsCount = productsResponse.results || 0
          const totalBooksCount = booksResponse.results || 0
          const totalCount = totalProductsCount + totalBooksCount
          setTotalResults(totalCount)
          setTotalPages(Math.ceil(totalCount / itemsPerPage) || 1)
        } else {
          // Fetch products and books for specific section
          const [sectionProductsResponse, sectionBooksResponse] = await Promise.all([
            getProductsBySection(activeTab, { page: currentPage, limit: itemsPerPage }),
            getBooksBySection(activeTab, { page: currentPage, limit: itemsPerPage }),
          ])

          // Handle the new API response structure for section products
          const sectionProducts = sectionProductsResponse.data?.section?.products || []
          const sectionBooks = sectionBooksResponse.data?.books || []
          const combinedItems = [...sectionProducts, ...sectionBooks]

          setAllItems(combinedItems)

          // For section-specific data, we might need to handle pagination differently
          // Since the new API returns all products in the section, we'll handle pagination client-side for now
          const totalCount = combinedItems.length
          setTotalResults(totalCount)
          setTotalPages(Math.ceil(totalCount / itemsPerPage) || 1)
        }
      } catch (err) {
        setError(err.message)
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (sections.length > 0 || activeTab === "all") {
      fetchData()
    }
  }, [activeTab, currentPage, itemsPerPage, sections.length])

  // Reset to first page when changing tabs
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Create categories array with "All" option and fetched sections
  const categories = [
    { id: "all", name: "All Sections", icon: "☰" },
    ...sections.map((section) => ({
      id: section._id,
      name: section.name,
      icon: "📚",
    })),
  ]

  // Filter items based on search query and handle pagination for filtered results
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handle client-side pagination for filtered results
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = searchQuery ? filteredItems.slice(startIndex, endIndex) : filteredItems

  // Update total pages based on filtered results
  const effectiveTotalPages = searchQuery ? Math.ceil(filteredItems.length / itemsPerPage) || 1 : totalPages

  if (loading && allItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading market data: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <img src="/bookshelf.png" alt="Books illustration" className="h-24 w-auto" />
            <h1 className="text-lg font-semibold flex-1 text-center md:text-right">
              Everything a teacher and student needs in one place
            </h1>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-primary px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex-shrink-0 px-10 py-2 text-sm font-medium transition-colors border-r-2 border-secondary ${
                  activeTab === category.id ? "bg-secondary/55 rounded-t-lg" : "hover:bg-primary"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="input input-bordered w-full pl-12 focus:border-primary focus:ring-primary"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button className="btn btn-square btn-primary bg-primary border-primary hover:bg-primary/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="text-sm text-gray-600">
          {searchQuery ? (
            <span>
              Found {filteredItems.length} results for "{searchQuery}"
            </span>
          ) : (
            <span>
              Showing {paginatedItems.length} of {totalResults} items
            </span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center mb-8">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item) => (
            <div
              key={item._id}
              className="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
            >
              {/* Discount Badge */}
              {item.discountPercentage && item.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-primary px-3 py-1 rounded-br-2xl text-sm font-medium">
                    Discounts
                    <br />
                    <span className="text-lg font-bold">{item.discountPercentage}%</span>
                  </div>
                </div>
              )}

              {/* Subject Badge for Books */}
              {item.__t === "ECBook" && item.subject && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-secondary px-2 py-1 rounded-bl-2xl text-xs font-medium">
                    {item.subject.name || item.subject}
                  </div>
                </div>
              )}

              <figure className="px-4 pt-4">
                <img
                  src={item.thumbnail || "/placeholder.svg?height=200&width=200"}
                  alt={item.title}
                  className="rounded-xl w-full h-48 object-cover"
                />
              </figure>

              <div className="card-body items-center text-center p-6">
                <h2 className="card-title text-lg font-semibold mb-2">{item.title}</h2>

                <div className="flex items-center gap-2 mb-4">
                  {item.priceAfterDiscount && item.priceAfterDiscount < item.price ? (
                    <>
                      <span className="text-2xl font-bold text-primary">{item.priceAfterDiscount} ج</span>
                      <span className="text-sm line-through text-gray-500">{item.price} ج</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-primary">{item.price} ج</span>
                  )}
                </div>

                <div className="card-actions w-full">
                  <button className="btn btn-primary bg-primary border-primary hover:bg-primary/50 w-full">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {paginatedItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms" : "Try adjusting your filter criteria"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {effectiveTotalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="join">
              <button
                className="join-item btn rounded-full"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Generate page buttons dynamically */}
              {Array.from({ length: Math.min(effectiveTotalPages, 5) }, (_, i) => {
                let pageToShow
                if (effectiveTotalPages <= 5) {
                  pageToShow = i + 1
                } else if (currentPage <= 3) {
                  pageToShow = i + 1
                } else if (currentPage >= effectiveTotalPages - 2) {
                  pageToShow = effectiveTotalPages - 4 + i
                } else {
                  pageToShow = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageToShow}
                    className={`join-item btn rounded-full ${currentPage === pageToShow ? "btn-primary" : ""}`}
                    onClick={() => setCurrentPage(pageToShow)}
                    disabled={loading}
                  >
                    {pageToShow}
                  </button>
                )
              })}

              <button
                className="join-item btn rounded-full"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, effectiveTotalPages))}
                disabled={currentPage === effectiveTotalPages || loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Market
