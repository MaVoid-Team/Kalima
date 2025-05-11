"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, Check, Lock } from 'lucide-react'

export const LectureCard = ({
  id,
  image,
  title,
  subject,
  teacher,
  teacherRole,
  grade,
  status,
  price,
  isRTL,
  isPurchased,
  onPurchase,
  userPoints,
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const isFree = status === "مجاني"
  const canAfford = userPoints >= price

  const handlePurchase = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isPurchased || isFree || !canAfford || isPurchasing) {
      return
    }
    
    setIsPurchasing(true)
    try {
      await onPurchase(id)
    } finally {
      setIsPurchasing(false)
    }
  }

  const renderPurchaseButton = () => {
    if (isPurchased) {
      return (
        <div className="flex items-center text-success">
          <Check className="w-4 h-4 mr-1" />
          <span>{isRTL ? "تم الشراء" : "Purchased"}</span>
        </div>
      )
    }

    if (isFree) {
      return <div className="text-success font-medium">{isRTL ? "مجاني" : "Free"}</div>
    }

    if (!canAfford) {
      return (
        <div className="flex items-center text-error">
          <Lock className="w-4 h-4 mr-1" />
          <span>{isRTL ? "نقاط غير كافية" : "Insufficient Points"}</span>
        </div>
      )
    }

    return (
      <button
        className="btn btn-primary btn-sm"
        onClick={handlePurchase}
        disabled={isPurchasing}
      >
        {isPurchasing ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isRTL ? "شراء" : "Purchase"}
          </>
        )}
      </button>
    )
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <Link 
        to={isPurchased || isFree ? `/dashboard/student-dashboard/lecture-display/${id}` : "#"}
        onClick={(e) => {
          if (!isPurchased && !isFree) {
            e.preventDefault()
          }
        }}
        className="block flex-grow"
      >
        <div className="relative">
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-48 object-cover" />
          <div className="absolute top-0 left-0 bg-primary px-3 py-1 rounded-br-lg">{subject}</div>
        </div>

        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">{title}</h3>
          </div>

          <div className="flex items-center text-sm  mb-2">
            <span>{teacher}</span>
            <span className="mx-1">•</span>
            <span>{teacherRole}</span>
          </div>

          <div className="flex items-center text-sm  mb-4">
            <span>{grade}</span>
          </div>
          <div className="flex items-center text-sm-300 mb-4">
            <span>{subject}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 flex justify-between items-center">
        <div className="font-bold text-primary">{price} {isRTL ? "نقطة" : "points"}</div>
        {renderPurchaseButton()}
      </div>
    </div>
  )
}
