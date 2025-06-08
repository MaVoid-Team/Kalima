"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  getAllSections,
  getAllBooks,
  getAllProducts,
  getProductsBySection,
  getBooksBySection,
} from "../../routes/market"

const Market = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sections, setSections] = useState([])
  const [products, setProducts] = useState([])
  const [books, setBooks] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(6) // Adjust based on your preference

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch sections
        const sectionsResponse = await getAllSections()
        if (sectionsResponse.status === "success") {
          setSections(sectionsResponse.data.sections)
        }

        // Fetch products and books with pagination
        const [productsResponse, booksResponse] = await Promise.all([
          getAllProducts({ page: currentPage, limit: itemsPerPage }),
          getAllBooks({ page: currentPage, limit: itemsPerPage }),
        ])

        if (productsResponse.status === "success") {
          setProducts(productsResponse.data.products)
        }

        if (booksResponse.status === "success") {
          setBooks(booksResponse.data.books)
        }

        // Combine products and books for display
        const combinedItems = [...(productsResponse.data?.products || []), ...(booksResponse.data?.books || [])]
        setAllItems(combinedItems)

        // Calculate total pages based on total results
        const totalProductsCount = productsResponse.results || 0
        const totalBooksCount = booksResponse.results || 0
        const totalItemsCount = totalProductsCount + totalBooksCount
        setTotalPages(Math.ceil(totalItemsCount / itemsPerPage) || 1)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching market data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [currentPage, itemsPerPage])

  // Handle tab change and filter by section
  useEffect(() => {
    const filterBySection = async () => {
      if (activeTab === "all") {
        try {
          setLoading(true)
          // Reset to first page when changing filters
          setCurrentPage(1)

          // Fetch all items with pagination
          const [productsResponse, booksResponse] = await Promise.all([
            getAllProducts({ page: 1, limit: itemsPerPage }),
            getAllBooks({ page: 1, limit: itemsPerPage }),
          ])

          const combinedItems = [...(productsResponse.data?.products || []), ...(booksResponse.data?.books || [])]
          setAllItems(combinedItems)

          // Update total pages
          const totalProductsCount = productsResponse.results || 0
          const totalBooksCount = booksResponse.results || 0
          const totalItemsCount = totalProductsCount + totalBooksCount
          setTotalPages(Math.ceil(totalItemsCount / itemsPerPage) || 1)
        } catch (err) {
          console.error("Error fetching all items:", err)
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        // Reset to first page when changing filters
        setCurrentPage(1)

        // Find the selected section
        const selectedSection = sections.find((section) => section._id === activeTab)
        if (!selectedSection) return

        // Fetch products and books for the selected section with pagination
        const [sectionProducts, sectionBooks] = await Promise.all([
          getProductsBySection(selectedSection._id, { page: 1, limit: itemsPerPage }),
          getBooksBySection(selectedSection._id, { page: 1, limit: itemsPerPage }),
        ])

        const combinedItems = [...(sectionProducts.data?.products || []), ...(sectionBooks.data?.books || [])]
        setAllItems(combinedItems)

        // Update total pages
        const totalProductsCount = sectionProducts.results || 0
        const totalBooksCount = sectionBooks.results || 0
        const totalItemsCount = totalProductsCount + totalBooksCount
        setTotalPages(Math.ceil(totalItemsCount / itemsPerPage) || 1)
      } catch (err) {
        console.error("Error filtering by section:", err)
      } finally {
        setLoading(false)
      }
    }

    if (sections.length > 0) {
      filterBySection()
    }
  }, [activeTab, sections, products, books, itemsPerPage])

  // Create categories array with "All" option and fetched sections
  const categories = [
    { id: "all", name: "All Sections", icon: "☰" },
    ...sections.map((section) => ({
      id: section._id,
      name: section.name,
      icon: "📚", // You can map different icons based on section type
    })),
  ]

  // Filter items based on search query
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

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
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center mb-8">
            <div className="loading loading-spinner loading-md"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
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
                  <button
                    onClick={() => {
                      const itemType = item.__t === "ECBook" ? "book" : "product"
                      navigate(`/market/product-details/${itemType}/${item._id}`)
                    }}
                    className="btn btn-primary bg-primary border-primary hover:bg-primary/50 w-full"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show current page and nearby pages
              let pageToShow
              if (totalPages <= 5) {
                // If 5 or fewer pages, show all
                pageToShow = i + 1
              } else if (currentPage <= 3) {
                // If near start, show first 5 pages
                pageToShow = i + 1
              } else if (currentPage >= totalPages - 2) {
                // If near end, show last 5 pages
                pageToShow = totalPages - 4 + i
              } else {
                // Otherwise show current page and 2 on each side
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Market
