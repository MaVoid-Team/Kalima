"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getBookById, getProductById } from "../../routes/market"

const ProductDetails = () => {
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
        setError("Invalid product ID or type")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let response
        if (type === 'book') {
          response = await getBookById(id)
        } else if (type === 'product') {
          response = await getProductById(id)
        } else {
          throw new Error("Invalid item type")
        }

        if (response.status === "success") {
          const itemData = response.data.book || response.data.product
          setProduct(itemData)
        } else {
          throw new Error("Failed to fetch item data")
        }
      } catch (err) {
        setError(err.message)
        console.error("Error fetching item data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchItemData()
  }, [id, type])

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(product.paymentNumber)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy payment number:", err)
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
    console.log("Submitting purchase with file:", uploadedFile)
    // You can add API call to submit the purchase request
  }

  const getItemCategory = () => {
    if (product.__t === "ECBook" && product.subject) {
      return product.subject.name || product.subject
    }
    if (product.section && product.section.name) {
      return product.section.name
    }
    return type === 'book' ? 'Book' : 'Product'
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
            <h3 className="font-bold">Error!</h3>
            <div className="text-xs">{error || "Product not found"}</div>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-sm">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 btn btn-ghost btn-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="absolute left-20 w-16 h-1 bg-yellow-500 rounded"></div>
            <h1 className="text-2xl font-bold text-center">Purchase Details</h1>
            <div className="absolute right-0">
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
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full max-w-sm h-auto object-contain rounded-lg shadow-lg"
              />
              {/* Decorative dot */}
              <div className="absolute -bottom-4 left-8 w-4 h-4 bg-yellow-500 rounded-full animate-float-zigzag"></div>
              
              {/* Discount Badge */}
              {hasDiscount() && (
                <div className="absolute top-4 left-4">
                  <div className="bg-primary px-3 py-1 rounded-br-2xl text-sm font-medium text-white">
                    Discount
                    <br />
                    <span className="text-lg font-bold">{product.discountPercentage}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="text-center lg:text-right">
              <h2 className="text-3xl font-bold mb-2">Details</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-primary font-semibold">Product Name</span>
                  <p className="text-lg font-medium">{product.title}</p>
                </div>

                <div>
                  <span className="text-primary font-semibold">Category</span>
                  <p className="text-sm">{getItemCategory()}</p>
                </div>

                <div>
                  <span className="text-primary font-semibold">Serial Number</span>
                  <p className="text-sm font-mono">{product.serial}</p>
                </div>

                <div className="mt-4">
                  <span className="text-primary font-semibold">Product Price</span>
                  <div className="flex items-center justify-center lg:justify-end gap-2">
                    <p className="text-2xl font-bold">{getDisplayPrice()} ج</p>
                    {hasDiscount() && (
                      <p className="text-lg line-through text-gray-500">{product.price} ج</p>
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
                copySuccess ? 'btn-success' : ''
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
            {copySuccess && (
              <p className="mt-2 text-success font-semibold">Payment number copied!</p>
            )}
            <p className="mt-2">Send the specified amount to the above number</p>
          </div>

          {/* Purchase Steps */}
          <div className="text-center lg:text-right space-y-4">
            <h3 className="text-2xl font-bold">Purchase Steps</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-end gap-3">
                <span className="text-primary">💳</span>
                <p>Send the amount via electronic wallet or instapay</p>
              </div>

              <div className="flex items-center justify-center lg:justify-end gap-3">
                <span className="text-primary">📱</span>
                <p>Take a screenshot after completing the transfer process</p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Upload Transfer Screenshot Here</h3>

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
                    <p className="font-semibold text-primary">File uploaded successfully!</p>
                    <p className="text-sm">{uploadedFile.name}</p>
                    <button onClick={() => setUploadedFile(null)} className="text-sm text-red-500 hover:text-red-700">
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>Drag and drop your screenshot here</p>
                    <p className="text-sm">Maximum file size: 1 GB</p>
                  </div>
                )}

                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="btn btn-outline btn-primary cursor-pointer">
                  Add Image
                </label>
              </div>
            </div>
          </div>

          {/* Response Time Notice */}
          <div className="text-center space-y-2">
            <p>Please note that we will respond after uploading the screenshot</p>
            <p>Response will be within 1-2 hours during business hours</p>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="btn btn-primary bg-primary hover:bg-primary/80 px-12 py-3 text-lg font-semibold rounded-lg"
              disabled={!uploadedFile}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
