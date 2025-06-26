"use client"

import { useState, useEffect, useCallback } from "react"
import { getAllSections, getAllBooks, getAllProducts } from "../../../routes/market"
import { getAllSubjects } from "../../../routes/courses"

export const useAdminData = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sections, setSections] = useState([])
  const [books, setBooks] = useState([])
  const [products, setProducts] = useState([])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingApplications: 0,
    totalProducts: 0,
    totalSections: 0,
  })

  // Pagination state for products
  const [productsPagination, setProductsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Loading states for different operations
  const [productsLoading, setProductsLoading] = useState(false)

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch sections, books, and subjects (these don't need pagination for admin)
      const [sectionsResponse, booksResponse, subjectsResponse] = await Promise.all([
        getAllSections(),
        getAllBooks(),
        getAllSubjects(),
      ])

      // Process sections data with error handling
      if (sectionsResponse?.status === "success" && sectionsResponse?.data?.sections) {
        setSections(sectionsResponse.data.sections)
      } else {
        console.warn("Sections data not available:", sectionsResponse)
        setSections([])
      }

      // Process books data with error handling
      if (booksResponse?.status === "success" && booksResponse?.data?.books) {
        setBooks(booksResponse.data.books)
      } else {
        console.warn("Books data not available:", booksResponse)
        setBooks([])
      }

      // Process subjects data with error handling
      if (subjectsResponse?.success && subjectsResponse?.data) {
        setSubjects(subjectsResponse.data)
      } else {
        console.warn("Subjects data not available:", subjectsResponse)
        setSubjects([])
      }

      // Calculate statistics with safe fallbacks
      const totalSections = sectionsResponse?.data?.sections?.length || 0

      // Calculate total sales with safe navigation
      const booksTotal =
        booksResponse?.data?.books?.reduce((sum, book) => sum + (book?.priceAfterDiscount || book?.price || 0), 0) || 0

      setStats((prevStats) => ({
        ...prevStats,
        totalSales: booksTotal, // Will be updated when products are fetched
        pendingApplications: 50, // This would come from a different API
        totalSections: totalSections,
      }))
    } catch (err) {
      console.error("Error fetching initial admin data:", err)
      setError(err?.message || "Failed to fetch data")
      // Set empty arrays as fallbacks
      setSections([])
      setBooks([])
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = useCallback(async (page = 1, limit = 10, search = "") => {
    try {
      setProductsLoading(true)
      setError(null)

      const queryParams = {
        page,
        limit,
        ...(search && { search }),
      }

      const productsResponse = await getAllProducts(queryParams)

      // Process products data with error handling
      if (productsResponse?.status === "success" && productsResponse?.data?.products) {
        setProducts(productsResponse.data.products)

        // Update pagination info
        setProductsPagination({
          currentPage: productsResponse.data.currentPage || page,
          totalPages: productsResponse.data.totalPages || 1,
          totalItems: productsResponse.data.totalProducts || productsResponse.results || 0,
          itemsPerPage: limit,
          hasNextPage: productsResponse.data.hasNextPage || false,
          hasPrevPage: productsResponse.data.hasPrevPage || false,
        })

        // Update stats with products total
        const productsTotal =
          productsResponse?.data?.products?.reduce(
            (sum, product) => sum + (product?.priceAfterDiscount || product?.price || 0),
            0,
          ) || 0

        setStats((prevStats) => ({
          ...prevStats,
          totalProducts: productsResponse.data.totalProducts || productsResponse.results || 0,
          totalSales: prevStats.totalSales + productsTotal,
        }))
      } else {
        console.warn("Products data not available:", productsResponse)
        setProducts([])
        setProductsPagination((prev) => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false,
        }))
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err?.message || "Failed to fetch products")
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchInitialData()
    await fetchProducts(productsPagination.currentPage, productsPagination.itemsPerPage)
  }, [fetchProducts, productsPagination.currentPage, productsPagination.itemsPerPage])

  // Pagination handlers
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= productsPagination.totalPages) {
        fetchProducts(page, productsPagination.itemsPerPage)
      }
    },
    [fetchProducts, productsPagination.totalPages, productsPagination.itemsPerPage],
  )

  const changeItemsPerPage = useCallback(
    (newLimit) => {
      setProductsPagination((prev) => ({ ...prev, itemsPerPage: newLimit }))
      fetchProducts(1, newLimit) // Reset to first page when changing items per page
    },
    [fetchProducts],
  )

  const searchProducts = useCallback(
    (searchQuery) => {
      fetchProducts(1, productsPagination.itemsPerPage, searchQuery)
    },
    [fetchProducts, productsPagination.itemsPerPage],
  )

  useEffect(() => {
    fetchInitialData()
    fetchProducts() // Fetch first page of products
  }, [])

  return {
    loading,
    error,
    sections,
    books,
    products,
    subjects,
    stats,
    refetch,
    setSections,
    setBooks,
    setProducts,
    // Products pagination
    productsPagination,
    productsLoading,
    goToPage,
    changeItemsPerPage,
    searchProducts,
    fetchProducts,
  }
}
