"use client"

import { useState, useEffect } from "react"
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

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [sectionsResponse, booksResponse, productsResponse, subjectsResponse] = await Promise.all([
        getAllSections(),
        getAllBooks(),
        getAllProducts(),
        getAllSubjects(),
      ])

      console.log("API Responses:", {
        sectionsResponse,
        booksResponse,
        productsResponse,
        subjectsResponse,
      })

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

      // Process products data with error handling
      if (productsResponse?.status === "success" && productsResponse?.data?.products) {
        setProducts(productsResponse.data.products)
      } else {
        console.warn("Products data not available:", productsResponse)
        setProducts([])
      }

      // Process subjects data with error handling
      if (subjectsResponse?.success && subjectsResponse?.data) {
        setSubjects(subjectsResponse.data)
      } else {
        console.warn("Subjects data not available:", subjectsResponse)
        setSubjects([])
      }

      // Calculate statistics with safe fallbacks
      const totalProducts = productsResponse?.results || productsResponse?.data?.products?.length || 0
      const totalSections = sectionsResponse?.data?.sections?.length || 0

      // Calculate total sales with safe navigation
      const booksTotal =
        booksResponse?.data?.books?.reduce((sum, book) => sum + (book?.priceAfterDiscount || book?.price || 0), 0) || 0

      const productsTotal =
        productsResponse?.data?.products?.reduce(
          (sum, product) => sum + (product?.priceAfterDiscount || product?.price || 0),
          0,
        ) || 0

      const totalSales = booksTotal + productsTotal

      setStats({
        totalSales: totalSales,
        pendingApplications: 50, // This would come from a different API
        totalProducts: totalProducts,
        totalSections: totalSections,
      })
    } catch (err) {
      console.error("Error fetching admin data:", err)
      setError(err?.message || "Failed to fetch data")
      // Set empty arrays as fallbacks
      setSections([])
      setBooks([])
      setProducts([])
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    loading,
    error,
    sections,
    books,
    products,
    subjects,
    stats,
    refetch: fetchData,
    setSections,
    setBooks,
    setProducts,
  }
}
