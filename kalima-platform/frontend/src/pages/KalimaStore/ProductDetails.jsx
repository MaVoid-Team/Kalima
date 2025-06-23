"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getBookById, getProductById, purchaseProduct, purchaseBook } from "../../routes/market"

// Import components
import ProductHeader from "./components/ProductHeader"
import ProductGallery from "./components/ProductGallery"
import SampleDownload from "./components/SampleDownload"
import ProductInfo from "./components/ProductInfo"
import PaymentSection from "./components/PaymentSection"
import PurchaseForm from "./components/PurchaseForm"

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

  // Fetch product/book data
  useEffect(() => {
    const fetchItemData = async () => {
      if (!id || !type) {
        setError(t("errors.invalidProductInfo"))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let response
        if (type === "book") {
          response = await getBookById(id)
        } else if (type === "product") {
          response = await getProductById(id)
        } else {
          throw new Error(t("errors.invalidItemType"))
        }

        if (response.status === "success") {
          const itemData = response.data.book || response.data.product
          setProduct(itemData)
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
    if (!uploadedFile) {
      alert(t("errors.noFileSelected"))
      return
    }

    if (!purchaseForm.numberTransferredFrom) {
      alert(t("errors.noTransferNumber"))
      return
    }

    if (type === "book") {
      if (!purchaseForm.nameOnBook || !purchaseForm.numberOnBook || !purchaseForm.seriesName) {
        alert(t("errors.fillBookFields"))
        return
      }
    }

    try {
      setPurchaseLoading(true)

      const purchaseData = {
        productId: product._id,
        numberTransferredFrom: purchaseForm.numberTransferredFrom,
        paymentScreenshot: uploadedFile,
      }

      if (type === "book") {
        purchaseData.nameOnBook = purchaseForm.nameOnBook
        purchaseData.numberOnBook = purchaseForm.numberOnBook
        purchaseData.seriesName = purchaseForm.seriesName
      }

      let response
      if (type === "book") {
        response = await purchaseBook(purchaseData)
      } else {
        response = await purchaseProduct(purchaseData)
      }

      if (response.status === "success" || response.message) {
        alert(t("success.purchaseSubmitted"))
        setUploadedFile(null)
        setPurchaseForm({
          numberTransferredFrom: "",
          nameOnBook: "",
          numberOnBook: "",
          seriesName: "",
        })
        const fileInput = document.getElementById("file-upload")
        if (fileInput) fileInput.value = ""
      }
    } catch (err) {
      console.error("Error submitting purchase:", err)
      alert(t("errors.purchaseSubmissionFailed") + err.message)
    } finally {
      setPurchaseLoading(false)
    }
  }

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
                  <SampleDownload sample={product.sample} title={product.title} type={type} isRTL={isRTL} />
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div className="p-8 lg:p-12 border-l border-base-200">
                <ProductInfo product={product} type={type} isRTL={isRTL} />
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
              type={type}
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
