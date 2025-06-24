"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getBookById, getProductById, purchaseProduct, purchaseBook } from "../../routes/market"

// Import components
import ProductHeader from "./Components/ProductHeader"
import ProductGallery from "./Components/ProductGallery"
import SampleDownload from "./Components/SampleDownload"
import ProductInfo from "./Components/ProductInfo"
import PaymentSection from "./Components/PaymentSection"
import PurchaseForm from "./Components/PurchaseForm"

const ProductDetails = () => {
  const { t, i18n } = useTranslation("kalimaStore-ProductDetails")
  const isRTL = i18n.language === "ar"

  const [uploadedFile, setUploadedFile] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    numberTransferredFrom: "",
    nameOnBook: "",
    numberOnBook: "",
    seriesName: "",
  })

  const { id, type } = useParams()
  const navigate = useNavigate()

  // Determine the actual item type from the API response
  const getItemType = (item) => {
    // If __t exists and equals "ECBook", it's a book
    if (item && item.__t === "ECBook") {
      return "book"
    }
    // Otherwise, it's a product
    return "product"
  }

  // Fetch product/book data
  useEffect(() => {
    const fetchItemData = async () => {
      if (!id) {
        setError(t("errors.invalidProductInfo"))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let response
        // Try to fetch as the type specified in URL first, but we'll determine actual type from response
        if (type === "book") {
          response = await getBookById(id)
        } else {
          // Default to trying product first, then book if it fails
          try {
            response = await getProductById(id)
          } catch (productError) {
            console.log("Failed to fetch as product, trying as book:", productError.message)
            response = await getBookById(id)
          }
        }

        if (response.status === "success") {
          const itemData = response.data.book || response.data.product
          setProduct(itemData)

          // Log the actual type determined from the response
          const actualType = getItemType(itemData)
        } else {
          throw new Error(t("errors.fetchFailed"))
        }
      } catch (err) {
        setError(err.message)
        console.error(t("errors.fetchErrorLog"), err)
      } finally {
        setLoading(false)
      }
    }

    fetchItemData()
  }, [id, type, t])

  const handleSubmit = async () => {
    if (!product) {
      alert("Product data not loaded")
      return
    }

    // Determine the actual type from the product data, not the URL
    const actualType = getItemType(product)



    if (!uploadedFile) {
      alert(t("errors.noFileSelected") || "Please select a payment screenshot")
      return
    }

    if (!purchaseForm.numberTransferredFrom) {
      alert(t("errors.noTransferNumber") || "Please enter the transfer number")
      return
    }

    // Validate book-specific fields if it's actually a book
    if (actualType === "book") {
      if (!purchaseForm.nameOnBook || !purchaseForm.numberOnBook || !purchaseForm.seriesName) {
        alert(t("errors.fillBookFields") || "Please fill in all book fields")
        return
      }
    }

    try {

      setPurchaseLoading(true)

      const purchaseData = {
        productId: product._id,
        numberTransferredFrom: purchaseForm.numberTransferredFrom,
        paymentScreenShot: uploadedFile,
      }

      // Add book-specific fields if it's a book
      if (actualType === "book") {
        purchaseData.nameOnBook = purchaseForm.nameOnBook
        purchaseData.numberOnBook = purchaseForm.numberOnBook
        purchaseData.seriesName = purchaseForm.seriesName
      }

      let response


      // Use the actual type determined from the API response
      if (actualType === "book") {

        response = await purchaseBook(purchaseData)
        

      } else {
        response = await purchaseProduct(purchaseData)

      }



      if (response.status === "success" || response.message) {
        alert(t("success.purchaseSubmitted") || "Purchase submitted successfully!")

        // Reset form
        setUploadedFile(null)
        setPurchaseForm({
          numberTransferredFrom: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
        })

        const fileInput = document.getElementById("file-upload")
        if (fileInput) fileInput.value = ""


      } else {
        throw new Error("Unexpected response format")
      }
    } catch (err) {
      console.error("💥 Error submitting purchase:", err)
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      })

      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred"
      alert((t("errors.purchaseSubmissionFailed") || "Purchase submission failed: ") + errorMessage)
    } finally {
      setPurchaseLoading(false)
    }
  }

  // Get the actual type for display purposes
  const displayType = product ? getItemType(product) : type

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">{t("errors.title")}</h3>
            <p className="mb-6">{error || t("errors.productNotFound")}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              {t("navigation.goBack")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Component */}
      <ProductHeader onBack={() => navigate(-1)} isRTL={isRTL} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Overview */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body p-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
              {/* Left Column - Gallery */}
              <div className="p-8 lg:p-12">
                <ProductGallery gallery={product.gallery} title={product.title} />
                <div className="mt-8">
                  <SampleDownload sample={product.sample} title={product.title} type={displayType} isRTL={isRTL} />
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div className="p-8 lg:p-12 border-l border-base-200">
                <ProductInfo product={product} type={displayType} isRTL={isRTL} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <PaymentSection paymentNumber={product.paymentNumber} isRTL={isRTL} />
          </div>
        </div>

        {/* Purchase Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <PurchaseForm
              type={displayType}
              purchaseForm={purchaseForm}
              setPurchaseForm={setPurchaseForm}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              onSubmit={handleSubmit}
              purchaseLoading={purchaseLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
