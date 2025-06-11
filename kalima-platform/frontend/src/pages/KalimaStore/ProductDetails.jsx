"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getBookById, getProductById } from "../../routes/market"

const ProductDetails = () => {
  const { t, i18n } = useTranslation("kalimaStore-ProductDetails")
  const isRTL = i18n.language === "ar"

  const [uploadedFile, setUploadedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const { id, type } = useParams() // type should be 'book' or 'product'
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

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(product.paymentNumber)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error(t("errors.copyFailed"), err)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log(t("logs.submittingPurchase"), uploadedFile)
    // You can add API call to submit the purchase request
  }

  const getItemCategory = () => {
    if (product.__t === "ECBook" && product.subject) {
      return product.subject.name || product.subject
    }
    if (product.section && product.section.name) {
      return product.section.name
    }
    return type === "book" ? t("product.types.book") : t("product.types.product")
  }

  const getDisplayPrice = () => {
    if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
      return product.priceAfterDiscount
    }
    return product.price
  }

  const hasDiscount = () => {
    return product.priceAfterDiscount && product.priceAfterDiscount < product.price
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
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
          <div>
            <h3 className="font-bold">{t("errors.title")}</h3>
            <div className="text-xs">{error || t("errors.productNotFound")}</div>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-sm">
            {t("navigation.goBack")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center relative">
            <button
              onClick={() => navigate(-1)}
              className={`absolute ${isRTL ? "right-0" : "left-0"} btn btn-ghost btn-sm`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: isRTL ? "rotate(180deg)" : "none" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("navigation.back")}
            </button>
            <div className={`absolute ${isRTL ? "right-20" : "left-20"} w-16 h-1 bg-yellow-500 rounded`}></div>
            <h1 className="text-2xl font-bold text-center">{t("header.purchaseDetails")}</h1>
            <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
              <div className="grid grid-cols-4 gap-1 rounded-full">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="w-2 h-2 bg-red-400 rounded-full animate-float-up-dottedball"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className={`flex justify-center ${isRTL ? "lg:justify-start" : "lg:justify-end"}`}>
            <div className="relative">
              <img
                src={product.thumbnail || "/placeholder.svg"}
                alt={product.title}
                className="w-full max-w-sm h-auto object-contain rounded-lg shadow-lg"
              />
              {/* Decorative dot */}
              <div
                className={`absolute -bottom-4 ${isRTL ? "right-8" : "left-8"} w-4 h-4 bg-yellow-500 rounded-full animate-float-zigzag`}
              ></div>

              {/* Discount Badge */}
              {hasDiscount() && (
                <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"}`}>
                  <div
                    className={`bg-primary px-3 py-1 ${isRTL ? "rounded-bl-2xl" : "rounded-br-2xl"} text-sm font-medium text-white`}
                  >
                    {t("product.discount")}
                    <br />
                    <span className="text-lg font-bold">{product.discountPercentage}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className={`text-center ${isRTL ? "lg:text-left" : "lg:text-right"}`}>
              <h2 className="text-3xl font-bold mb-2">{t("product.details")}</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-primary font-semibold">{t("product.name")}</span>
                  <p className="text-lg font-medium">{product.title}</p>
                </div>

                <div>
                  <span className="text-primary font-semibold">{t("product.category")}</span>
                  <p className="text-sm">{getItemCategory()}</p>
                </div>

                <div>
                  <span className="text-primary font-semibold">{t("product.serialNumber")}</span>
                  <p className="text-sm font-mono">{product.serial}</p>
                </div>

                <div className="mt-4">
                  <span className="text-primary font-semibold">{t("product.price")}</span>
                  <div
                    className={`flex items-center ${isRTL ? "lg:justify-start" : "lg:justify-end"} justify-center gap-2`}
                  >
                    <p className="text-2xl font-bold">
                      {getDisplayPrice()} {t("product.currency")}
                    </p>
                    {hasDiscount() && (
                      <p className="text-lg line-through text-gray-500">
                        {product.price} {t("product.currency")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="mt-12 space-y-8">
          {/* Payment Number */}
          <div className="text-center">
            <button
              onClick={handleCopyNumber}
              className={`btn btn-primary bg-primary hover:bg-primary/80 px-8 py-3 text-xl font-bold rounded-lg inline-flex items-center gap-3 transition-all ${
                copySuccess ? "btn-success" : ""
              }`}
            >
              {product.paymentNumber}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            {copySuccess && <p className="mt-2 text-success font-semibold">{t("payment.numberCopied")}</p>}
            <p className="mt-2">{t("payment.sendAmount")}</p>
          </div>

          {/* Purchase Steps */}
          <div className={`text-center ${isRTL ? "lg:text-left" : "lg:text-right"} space-y-4`}>
            <h3 className="text-2xl font-bold">{t("purchaseSteps.title")}</h3>

            <div className="space-y-3">
              <div
                className={`flex items-center ${isRTL ? "lg:justify-start" : "lg:justify-end"} justify-center gap-3`}
              >
                <span className="text-primary">💳</span>
                <p>{t("purchaseSteps.step1")}</p>
              </div>

              <div
                className={`flex items-center ${isRTL ? "lg:justify-start" : "lg:justify-end"} justify-center gap-3`}
              >
                <span className="text-primary">📱</span>
                <p>{t("purchaseSteps.step2")}</p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">{t("upload.title")}</h3>

            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                dragActive ? "border-primary bg-primary/10" : "border-base-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>

                {uploadedFile ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-primary">{t("upload.fileSuccess")}</p>
                    <p className="text-sm">{uploadedFile.name}</p>
                    <button onClick={() => setUploadedFile(null)} className="text-sm text-red-500 hover:text-red-700">
                      {t("upload.removeFile")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>{t("upload.dragDrop")}</p>
                    <p className="text-sm">{t("upload.maxFileSize")}</p>
                  </div>
                )}

                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="btn btn-outline btn-primary cursor-pointer">
                  {t("upload.addImage")}
                </label>
              </div>
            </div>
          </div>

          {/* Response Time Notice */}
          <div className="text-center space-y-2">
            <p>{t("response.note")}</p>
            <p>{t("response.timeframe")}</p>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="btn btn-primary bg-primary hover:bg-primary/80 px-12 py-3 text-lg font-semibold rounded-lg"
              disabled={!uploadedFile}
            >
              {t("buttons.done")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
