import { useState } from "react";
import { useTranslation } from "react-i18next";
import ImageGallery from "@/components/ProductDetails/ImageGallery";
import BookletInfo from "@/components/BookletDetails/BookletInfo";
import BookletFormatSelector from "@/components/BookletDetails/BookletFormatSelector";
import BookletAccordions from "@/components/BookletDetails/BookletAccordions";
import BookletStickyFooter from "@/components/BookletDetails/BookletStickyFooter";
import BookletReviews from "@/components/BookletDetails/BookletReviews";

// Mock Data (Replace with API data later)
const MOCK_BOOKLET = {
  id: "booklet-1",
  title: "Interactive Photosynthesis Lab Booklet & Design Pack",
  price: 12.0,
  originalPrice: 15.0,
  rating: 4.8,
  reviewCount: 128,
  description:
    "Bring biology to life with this comprehensive Interactive Photosynthesis Lab Booklet. Designed specifically for 5th-grade learners.",
  gradeLevel: "4 - 6",
  subject: "Earth Sciences, Biology",
  images: {
    main: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    thumbnails: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1530912267332-6a6c382e8508?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200",
    ],
  },
  formats: [
    {
      id: "digital",
      type: "digital",
      label: "Digital Download",
      description: "Instant PDF Access • Editable",
      price: 12.0,
    },
    {
      id: "printed",
      type: "printed",
      label: "Printed Bundle",
      description: "Shipped • 80lb Paper • Spiral",
      price: 24.0,
    },
  ],
};

export default function BookletDetailsPage() {
  const { t } = useTranslation("product");
  const [selectedFormat, setSelectedFormat] = useState("digital");

  const currentPrice =
    MOCK_BOOKLET.formats.find((f) => f.id === selectedFormat)?.price ||
    MOCK_BOOKLET.price;

  return (
    <div className="container  mx-auto px-4 py-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-8">
        {/* Gallery */}
        <div className="w-full">
          <ImageGallery
            images={MOCK_BOOKLET.images}
            badge={t("badges.bestSeller", "Best Seller")}
          />
        </div>

        {/* Info & Actions */}
        <div className="flex flex-col">
          <BookletInfo product={{ ...MOCK_BOOKLET, price: currentPrice }} />

          <BookletFormatSelector
            formats={MOCK_BOOKLET.formats}
            selectedFormat={selectedFormat}
            onSelect={setSelectedFormat}
          />

          <BookletAccordions product={MOCK_BOOKLET} />

          <BookletReviews product={MOCK_BOOKLET} />
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <BookletStickyFooter
        price={currentPrice}
        onAddToCart={() => console.log("Added to cart", selectedFormat)}
      />
    </div>
  );
}
