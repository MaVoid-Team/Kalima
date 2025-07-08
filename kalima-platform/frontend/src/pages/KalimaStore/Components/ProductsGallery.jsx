"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"

const ProductGallery = ({ gallery = [], title }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const { t } = useTranslation("kalimaStore-ProductDetails")

  const convertPathToUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;

  const normalizedPath = filePath.replace(/\\/g, "/");
  const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
  const baseUrl = API_URL.replace(/\/$/, "");

  return `${baseUrl}/${normalizedPath}`;
};

  const galleryImages = (gallery || [])
    .map((img, index) => ({
      url: convertPathToUrl(img),
      alt: `${title} - Gallery Image ${index + 1}`,
    }))
    .filter((img) => img.url)

  if (galleryImages.length === 0) {
    return (
      <div className="w-full">
        <div className="card bg-base-200 border-2 border-dashed border-base-300">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <h5 className="text-lg font-semibold mb-2">{t("gallery.noImages")}</h5>
            <p className="text-base-content/70">{t("gallery.noImagesDesc")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-header px-6 py-4 border-b border-base-200">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t("gallery.title")}
          </h4>
        </div>

        <div className="card-body">
          {/* Main Image Display */}
          <div className="mb-6">
            <div className="aspect-square w-full bg-base-200 rounded-lg overflow-hidden">
              <img
                src={galleryImages[selectedImage]?.url || "/placeholder.svg?height=400&width=400"}
                alt={galleryImages[selectedImage]?.alt || title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {galleryImages.length > 1 && (
            <div className="space-y-4">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-primary" : "border-base-300 hover:border-base-content/20"
                    }`}
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image Counter */}
              <div className="text-center">
                <div className="badge badge-outline">
                  {t("gallery.imageCounter", { current: selectedImage + 1, total: galleryImages.length })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductGallery
