"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { fetchPackageById, purchasePackage } from "../../routes/packages"
import { getUserDashboard } from "../../routes/auth-services"
import { toast } from "react-hot-toast"
import { ArrowLeft, Calendar, Users, Book, Award, Check, X } from "lucide-react"

const PackageDetails = () => {
  const navigate = useNavigate()
  const { packageId } = useParams()
  const { state } = useLocation()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  // Add state for purchased status
  const [isPurchased, setIsPurchased] = useState(false)

  // Fetch package details and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load package data
        let packageData
        if (state?.package) {
          packageData = state.package
        } else {
          const response = await fetchPackageById(packageId)
          packageData = response.data.package
        }
        setPkg(packageData)

        // Load user data and check if package is purchased
        try {
          const userResponse = await getUserDashboard()
          if (userResponse.success) {
            setUserData(userResponse.data.data.userInfo)

            // Check if package is already purchased
            const isPurchased = userResponse.data.data.purchaseHistory.some(
              (purchase) => purchase.type === "packagePurchase" && purchase.package?._id === packageData._id,
            )
            setIsPurchased(isPurchased)
          }
        } catch (userErr) {
          console.error("Failed to load user data:", userErr)
          // Don't set error state here, as we still want to show package details
        }

        setLoading(false)
      } catch (error) {
        console.error("Error loading package:", error)
        setError("Failed to load package details. Please try again later.")
        setLoading(false)
      }
    }
    loadData()
  }, [packageId, state])

  // Handle purchase
  const handlePurchase = () => {
    if (!userData) {
      toast.error("Please log in to purchase this package")
      return
    }

    if (userData.generalPoints < pkg.price) {
      toast.error("You don't have enough general points to purchase this package")
      return
    }

    setIsModalOpen(true)
  }

  // Confirm purchase
  const confirmPurchase = async () => {
    setPurchaseLoading(true)
    try {
      const response = await purchasePackage(pkg._id)
      if (response.success) {
        // Mark package as purchased
        setIsPurchased(true)

        // Update user data with new point balance
        if (userData && response.remainingPoints !== undefined) {
          setUserData({
            ...userData,
            generalPoints: response.remainingPoints,
          })
        }

        toast.success(
          <div>
            <p>Package purchased successfully!</p>
            <p className="text-sm mt-1">Remaining points: {response.remainingPoints}</p>
          </div>,
        )

        setIsModalOpen(false)
      } else {
        toast.error(response.message || "Failed to purchase package")
      }
    } catch (err) {
      toast.error("An error occurred while purchasing the package")
      console.error(err)
    } finally {
      setPurchaseLoading(false)
    }
  }

  // Get duration text
  const getDurationText = (type) => {
    switch (type) {
      case "month":
        return "1 Month Access"
      case "year":
        return "1 Year Access"
      case "week":
        return "1 Week Access"
      default:
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Access`
    }
  }

  // Calculate total points in the package
  const getTotalPoints = (points) => {
    return points.reduce((sum, point) => sum + point.points, 0)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="text-error mb-4 text-xl">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate("/packages")}>
          Back to Packages
        </button>
      </div>
    )

  if (!pkg)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="text-xl mb-4">Package not found</div>
        <button className="btn btn-primary" onClick={() => navigate("/packages")}>
          Back to Packages
        </button>
      </div>
    )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button className="btn btn-ghost mb-6 gap-2" onClick={() => navigate("/packages")}>
        <ArrowLeft className="w-4 h-4" />
        Back to Packages
      </button>

      {/* Package Header */}
      <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/80 to-secondary/80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{pkg.name}</h1>
              <p className="text-lg opacity-90">{getDurationText(pkg.type)}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-6 justify-between">
            {/* Package Info */}
            <div className="flex-1 min-w-[280px]">
              <h2 className="text-xl font-bold mb-4">Package Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm">{getDurationText(pkg.type)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Teachers</p>
                    <p className="text-sm">{pkg.points.length} expert instructors</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Book className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Total Points</p>
                    <p className="text-sm">{getTotalPoints(pkg.points)} points distributed</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Award className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm">{new Date(pkg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Card */}
            <div className="bg-base-200 p-6 rounded-xl min-w-[280px] max-w-sm">
              <h3 className="text-xl font-bold mb-4">Package Price</h3>
              <div className="text-3xl font-bold mb-4">{pkg.price} Points</div>

              {userData ? (
                isPurchased ? (
                  <div className="mb-6">
                    <div className="bg-success/20 p-4 rounded-lg text-center">
                      <div className="text-success font-bold mb-2">Already Purchased</div>
                      <p className="text-sm">You already own this package</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Your Balance:</span>
                      <span className="font-medium">{userData.generalPoints} Points</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">After Purchase:</span>
                      <span
                        className={`font-medium ${
                          userData.generalPoints - pkg.price < 0 ? "text-error" : "text-success"
                        }`}
                      >
                        {userData.generalPoints - pkg.price} Points
                      </span>
                    </div>

                    <div className="mt-4">
                      <button
                        className="btn btn-primary w-full"
                        onClick={handlePurchase}
                        disabled={userData.generalPoints < pkg.price}
                      >
                        {userData.generalPoints >= pkg.price ? "Purchase Now" : "Insufficient Points"}
                      </button>

                      {userData.generalPoints < pkg.price && (
                        <p className="text-xs text-error mt-2 text-center">
                          You need {pkg.price - userData.generalPoints} more points to purchase this package
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="mb-6">
                  <p className="text-sm mb-4">Please log in to purchase this package</p>
                  <button className="btn btn-primary w-full">Log In to Purchase</button>
                </div>
              )}

              <div className="text-xs mt-2">
                * This package can only be purchased using general points
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Teachers */}
        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Teachers Included
          </h2>

          <div className="space-y-4">
            {pkg.points.map((point, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div className="flex items-center">
                  <div className=" avatar avatar-placeholder">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">{point.lecturer.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{point.lecturer.name}</p>
                    <p className="text-xs">{point.lecturer.role}</p>
                  </div>
                </div>
                <div className="bg-primary px-3 py-1 rounded-full text-sm font-bold">
                  {point.points} Points
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Benefits */}
        <div className="bg-base-100 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-primary" />
            Package Benefits
          </h2>

          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="mt-1 mr-3 bg-primary/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Access to content from {pkg.points.length} expert teachers</span>
            </li>
            <li className="flex items-start">
              <div className="mt-1 mr-3 bg-primary/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>{getDurationText(pkg.type)} to all included materials</span>
            </li>
            <li className="flex items-start">
              <div className="mt-1 mr-3 bg-primary/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Total of {getTotalPoints(pkg.points)} points distributed across teachers</span>
            </li>
            <li className="flex items-start">
              <div className="mt-1 mr-3 bg-primary/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Flexible learning at your own pace</span>
            </li>
            <li className="flex items-start">
              <div className="mt-1 mr-3 bg-primary/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Comprehensive curriculum covering multiple subjects</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Confirm Purchase</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={purchaseLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-4">Are you sure you want to purchase this package?</p>

              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">{pkg.name}</h4>
                <p className="text-sm mb-1">
                  <span className="font-medium">Type:</span> {pkg.type === "month" ? "Monthly" : pkg.type}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Price:</span> {pkg.price} Points
                </p>
                <p className="text-sm">
                  <span className="font-medium">Teachers:</span>{" "}
                  {pkg.points.map((point) => point.lecturer.name).join(", ")}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Your Balance</p>
                  <p className="text-lg font-bold">{userData?.generalPoints || 0} Points</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">After Purchase</p>
                  <p className="text-lg font-bold">{(userData?.generalPoints || 0) - pkg.price} Points</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={purchaseLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmPurchase} disabled={purchaseLoading}>
                {purchaseLoading ? <span className="loading loading-spinner loading-sm"></span> : "Confirm Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageDetails
