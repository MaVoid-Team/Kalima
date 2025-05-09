"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Html5Qrcode } from "html5-qrcode"
import {
  Wallet,
  Info,
  Ticket,
  QrCode,
  Gift,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  X,
  Search,
  Camera,
  RefreshCw,
  Users,
  Clock,
  BookOpen,
  BarChart3,
} from "lucide-react"
import { getUserDashboard } from "../../routes/auth-services"
import { redeemPromoCode } from "../../routes/codes"

const PromoCodes = () => {
  const { t, i18n } = useTranslation("promoCodes")
  const isRTL = i18n.language === "ar"
  const [transactions, setTransactions] = useState([])
  const [pointsBalances, setPointsBalances] = useState([])
  const [lectureAccess, setLectureAccess] = useState([])
  const [redeemCode, setRedeemCode] = useState("")
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemError, setRedeemError] = useState(null)
  const [redeemSuccess, setRedeemSuccess] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(6) // Number of transactions per page
  const [scannerActive, setScannerActive] = useState(false)
  const [scannerError, setScannerError] = useState(null)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [activeTab, setActiveTab] = useState("transactions")

  // Use a ref for the scanner instance to maintain it across renders
  const scannerRef = useRef(null)
  // Track if scanner is actually running
  const isRunningRef = useRef(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const result = await getUserDashboard({ page: currentPage, limit: limit })
        if (result.success) {
          const { userInfo, pointsBalances, redeemedCodes, purchaseHistory, lectureAccess, paginationInfo } =
            result.data.data || {}

          setUserInfo(userInfo)
          setBalance(userInfo?.totalPoints || 0)

          const mappedRedeemedCodes = (redeemedCodes || []).map((code, index) => ({
            id: `code-${index + 1}`,
            type: "Code Redemption",
            code: code.code,
            amount: code.pointsAmount,
            instructorName: code.lecturerId
              ? pointsBalances?.find((b) => b.lecturer?._id === code.lecturerId)?.lecturer?.name || "N/A"
              : t("generalPoints"),
            createdAt: new Date(code.redeemedAt).toLocaleString(i18n.language, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            isRedemption: true,
          }))

          const mappedPurchaseHistory = (purchaseHistory || []).map((purchase, index) => ({
            id: `purchase-${index + 1}`,
            type: "Course Purchase",
            code: purchase.description,
            amount: purchase.points,
            instructorName: purchase.lecturer?.name || "N/A",
            createdAt: new Date(purchase.purchasedAt).toLocaleString(i18n.language, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            isRedemption: false,
          }))

          const combinedTransactions = [...mappedRedeemedCodes, ...mappedPurchaseHistory].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          )

          setTransactions(combinedTransactions)
          setPointsBalances(pointsBalances || [])
          setLectureAccess(lectureAccess || [])

          // Set total pages based on the maximum totalPages from purchaseHistory or redeemedCodes
          const purchaseTotalPages = paginationInfo?.purchaseHistory?.totalPages || 1
          const redeemedTotalPages = paginationInfo?.redeemedCodes?.totalPages || 1
          setTotalPages(Math.max(purchaseTotalPages, redeemedTotalPages))
        } else {
          setFetchError(result.error || t("errors.fetchFailed"))
        }
      } catch (error) {
        setFetchError(t("errors.fetchFailed"))
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [currentPage, limit, redeemSuccess, t, i18n.language])

  // Initialize QR scanner
  useEffect(() => {
    // Add event listener for modal close events
    const scannerModal = document.getElementById("scanner_modal")

    const handleModalClose = () => {
      stopScanner()
    }

    if (scannerModal) {
      scannerModal.addEventListener("close", handleModalClose)
    }

    // Clean up scanner and event listener when component unmounts
    return () => {
      stopScanner()

      if (scannerModal) {
        scannerModal.removeEventListener("close", handleModalClose)
      }
    }
  }, [])

  const startScanner = () => {
    // Reset states
    setScannerActive(true)
    setScannerError(null)
    setScannerLoading(true)

    // Close the redeem modal if it's open
    document.getElementById("redeem_modal").close()
    // Open the scanner modal
    document.getElementById("scanner_modal").showModal()

    // Initialize scanner after modal is shown
    setTimeout(() => {
      try {
        // Create a new scanner instance
        const scanner = new Html5Qrcode("qr-reader")
        scannerRef.current = scanner

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        }

        // Start scanner with camera
        scanner
          .start(
            { facingMode: "environment" }, // Use back camera
            config,
            onScanSuccess,
            onScanFailure,
          )
          .then(() => {
            // Scanner started successfully
            isRunningRef.current = true
            setScannerLoading(false)
            console.log("Scanner started successfully")
          })
          .catch((err) => {
            setScannerError(t("scanner.errors.cameraPermission"))
            setScannerLoading(false)
            console.error("Error starting scanner:", err)
            scannerRef.current = null
            isRunningRef.current = false
          })
      } catch (err) {
        setScannerError(t("scanner.errors.initFailed"))
        setScannerLoading(false)
        console.error("Error initializing scanner:", err)
        scannerRef.current = null
        isRunningRef.current = false
      }
    }, 500)
  }

  const stopScanner = () => {
    // Only try to stop if we have a scanner instance and it's running
    if (scannerRef.current && isRunningRef.current) {
      try {
        scannerRef.current
          .stop()
          .then(() => {
            console.log("Scanner stopped successfully")
          })
          .catch((err) => {
            // Just log the error, don't throw
            console.log("Error stopping scanner (handled):", err)
          })
          .finally(() => {
            // Always reset state
            isRunningRef.current = false
            scannerRef.current = null
            setScannerActive(false)
            setScannerLoading(false)
          })
      } catch (err) {
        // Catch any synchronous errors
        console.log("Error in stopScanner (handled):", err)
        isRunningRef.current = false
        scannerRef.current = null
        setScannerActive(false)
        setScannerLoading(false)
      }
    } else {
      // Reset state even if scanner wasn't running
      isRunningRef.current = false
      scannerRef.current = null
      setScannerActive(false)
      setScannerLoading(false)
    }
  }

  const onScanSuccess = async (decodedText) => {
    // Mark scanner as not running to prevent multiple stop attempts
    isRunningRef.current = false

    try {
      // Try to stop scanner
      if (scannerRef.current) {
        await scannerRef.current.stop()
        console.log("Scanner stopped after successful scan")
      }
    } catch (err) {
      // Just log the error, don't throw
      console.log("Error stopping scanner after scan (handled):", err)
    } finally {
      // Always reset scanner state
      scannerRef.current = null
      setScannerActive(false)
      setScannerLoading(false)
    }

    try {
      // Try to parse the QR code content as JSON
      let codeToRedeem = decodedText

      try {
        const parsedData = JSON.parse(decodedText)
        if (parsedData && parsedData.code) {
          codeToRedeem = parsedData.code
        }
      } catch (e) {
        // If parsing fails, use the raw text as the code
        console.log("QR code is not in JSON format, using raw text")
      }

      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(200)
      }

      // Close scanner modal
      document.getElementById("scanner_modal").close()

      // Show redeem modal with the scanned code
      setRedeemCode(codeToRedeem)
      setRedeemError(null)
      setRedeemSuccess(null)
      document.getElementById("redeem_modal").showModal()
    } catch (error) {
      setScannerError(t("scanner.errors.invalidCode"))
      console.error("Error processing QR code:", error)
    }
  }

  const onScanFailure = (error) => {
    // Don't show errors for normal scanning attempts
    console.log("QR scan error (normal during scanning):", error)
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemError(t("redeem.errors.emptyCode"))
      return
    }
    setRedeemLoading(true)
    setRedeemError(null)
    setRedeemSuccess(null)
    try {
      const result = await redeemPromoCode(redeemCode)
      if (result.success) {
        setRedeemSuccess(t("redeem.success"))
        setRedeemCode("")
        setCurrentPage(1) // Reset to first page after redeeming a code
        document.getElementById("redeem_modal").close()
      } else {
        setRedeemError(result.error || t("redeem.errors.generic"))
      }
    } catch (error) {
      setRedeemError(t("redeem.errors.generic"))
    } finally {
      setRedeemLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const copyToClipboard = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // Show toast or notification
        console.log("Copied to clipboard:", code)
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  const renderTransactionsTab = () => (
    <div className="overflow-x-auto rounded-xl">
      <table className="table w-full">
        <thead className="bg-primary/5">
          <tr>
            <th className="rounded-tl-xl">{t("table.date")}</th>
            <th>{t("table.type")}</th>
            <th>{t("table.amount")}</th>
            <th>{t("table.teacher")}</th>
            <th className="rounded-tr-xl">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {!loading ? (
            transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`hover:bg-base-200 ${index % 2 === 0 ? "bg-base-100" : "bg-base-100/50"}`}
                >
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                        {transaction.isRedemption ? (
                          <Ticket className="w-4 h-4 text-primary" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.createdAt.split(",")[0]}</div>
                        <div className="text-xs opacity-70">{transaction.createdAt.split(",")[1]}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${transaction.isRedemption ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="font-medium">
                    {transaction.isRedemption ? (
                      <span className="text-green-600">+{transaction.amount}</span>
                    ) : (
                      <span className="text-red-600">-{transaction.amount}</span>
                    )}
                  </td>
                  <td>{transaction.instructorName}</td>
                  <td>
                    {transaction.isRedemption && (
                      <button
                        onClick={() => copyToClipboard(transaction.code)}
                        className="btn btn-ghost btn-sm"
                        title={t("copy")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    {!transaction.isRedemption && (
                      <button className="btn btn-ghost btn-sm" title={t("details")}>
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-base-content/60">
                    <div className="bg-base-200 p-4 rounded-full mb-4">
                      <Info className="w-8 h-8 text-base-content/60" />
                    </div>
                    <p className="text-lg font-medium">{t("noData")}</p>
                  </div>
                </td>
              </tr>
            )
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-10">
                <div className="flex flex-col items-center justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Show limited page numbers with ellipsis for large page counts */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  className={`join-item btn ${currentPage === pageNum ? "btn-primary" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              className="join-item btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderLectureAccessTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lectureAccess.length > 0 ? (
        lectureAccess.map((access, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
          >
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <h3 className="card-title text-base">{access.lecture.name}</h3>
                <div className="badge badge-primary">
                  {access.remainingViews} {t("views")}
                </div>
              </div>
              <p className="text-sm opacity-70 line-clamp-2">{access.lecture.description}</p>
              <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(access.lastAccessed).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {access.lecture.numberOfViews} {t("totalViews")}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-base-200 p-4 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-base-content/60" />
          </div>
          <p className="text-lg font-medium">{t("noLectures")}</p>
          <p className="text-sm opacity-70 max-w-md mt-2">{t("noLecturesDescription")}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-base-100" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-6 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center mb-2">{t("title")}</h1>
          <p className="text-center text-base-content/70">{t("subtitle")}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 -mt-8">
        {fetchError && (
          <div className="alert alert-error max-w-md mx-auto mb-6">
            <X className="w-5 h-5" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* User Info & Points Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Profile Card */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary/10 text-primary rounded-full w-16">
                    <span className="text-xl">{userInfo?.name?.charAt(0) || "U"}</span>
                  </div>
                </div>
                <div>
                  <h2 className="card-title">{userInfo?.name || t("user")}</h2>
                  <p className="text-sm opacity-70">{userInfo?.email || ""}</p>
                  <div className="badge badge-outline mt-1">{userInfo?.role || t("student")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Points Card */}
          <div className="card bg-primary text-primary-content shadow-md">
            <div className="card-body">
              <div className="flex justify-between items-center mb-2">
                <h2 className="card-title">{t("balance.title")}</h2>
                <Wallet className="w-6 h-6" />
              </div>
              <div className="stat-value text-3xl">
                {loading ? (
                  <span className="loading loading-dots loading-md"></span>
                ) : (
                  `${balance} ${t("balance.currency")}`
                )}
              </div>
              {/* <p className="text-sm opacity-80 mt-2">{t("balance.description")}</p> */}
              <p className="text-sm opacity-80 mt-2">كل الفلوس الي تم شحنها</p>
            </div>
          </div>

          {/* Actions Card */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title mb-4">{t("actions.title")}</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={startScanner} className="btn btn-primary">
                  <QrCode className="w-4 h-4 mr-2" />
                  {t("scanner.button")}
                </button>
                <button
                  onClick={() => {
                    setRedeemError(null)
                    setRedeemSuccess(null)
                    setRedeemCode("")
                    document.getElementById("redeem_modal").showModal()
                  }}
                  className="btn btn-outline btn-primary"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  {t("redeem.button")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Points Balances */}
        <div className="card bg-base-100 shadow-sm border border-base-200 mb-8">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">{t("lecturerPoints.title")}</h2>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : pointsBalances.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pointsBalances.map((balance, index) => (
                  <div key={index} className="bg-base-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {balance.lecturer ? (
                          <span className="text-primary font-medium">{balance.lecturer.name.charAt(0)}</span>
                        ) : (
                          <Wallet className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <h3 className="font-medium truncate">
                        {balance.lecturer ? balance.lecturer.name : t("generalPoints")}
                      </h3>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-bold">{balance.points}</p>
                      <span className="text-xs opacity-70">{t("balance.currency")}</span>
                    </div>
                    <p className="text-sm opacity-80 mt-2">كل الفلوس الي تم شحنها ل استاذ {balance.lecturer ? balance.lecturer.name : t("generalPoints")}</p>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-base-200/30 rounded-xl">
                <div className="flex flex-col items-center justify-center text-base-content/60">
                  <div className="bg-base-200 p-4 rounded-full mb-4">
                    <Wallet className="w-8 h-8 text-base-content/60" />
                  </div>
                  <p className="text-lg font-medium">{t("noLecturerPoints")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs for Transactions and Lecture Access */}
        <div className="card bg-base-100 shadow-sm border border-base-200 mb-8">
          <div className="card-body p-0">
            <div className="tabs tabs-bordered">
              <button
                className={`tab tab-lg ${activeTab === "transactions" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("transactions")}
              >
                <Clock className="w-4 h-4 mr-2" />
                {t("transactions.title")}
              </button>
              <button
                className={`tab tab-lg ${activeTab === "lectures" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("lectures")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {t("lectures.title")}
              </button>
            </div>

            <div className="p-4">
              {activeTab === "transactions" ? renderTransactionsTab() : renderLectureAccessTab()}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      <dialog id="scanner_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 relative max-w-md p-6">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={stopScanner}>
              <X className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center mb-4 text-primary">
            <QrCode className="w-6 h-6 mr-2" />
            <h3 className="font-bold text-xl">{t("scanner.title")}</h3>
          </div>

          {scannerError && (
            <div className="alert alert-error mb-4">
              <X className="w-5 h-5" />
              <span>{scannerError}</span>
              <button
                className="btn btn-sm btn-ghost ml-auto"
                onClick={() => {
                  setScannerError(null)
                  startScanner()
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                {t("retry")}
              </button>
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            {scannerLoading && (
              <div className="absolute inset-0 bg-base-100/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="mt-4 font-medium">{t("scanner.initializing")}</p>
                </div>
              </div>
            )}

            <div id="qr-reader" className="w-full max-w-xs overflow-hidden rounded-lg border-2 border-primary/20">
              {/* Scanner will be rendered here */}
              <div className="qr-overlay absolute pointer-events-none">
                <div className="qr-corners"></div>
              </div>
            </div>

            <div className="mt-6 text-center">
              {/* <p className="text-sm mb-3">{t("scanner.instructions")}</p> */}
              <p className="text-sm mb-3">هات الكاميرا على ال QR كود</p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    // Switch camera if available
                    if (scannerRef.current) {
                      stopScanner()
                      setTimeout(startScanner, 500)
                    }
                  }}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {t("scanner.switchCamera")}
                </button>
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={stopScanner}>close</button>
        </form>
      </dialog>

      {/* Redeem Code Modal */}
      <dialog id="redeem_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 relative max-w-md p-6">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <X className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center mb-4 text-primary">
            <Gift className="w-6 h-6 mr-2" />
            <h3 className="font-bold text-xl">{t("redeem.modalTitle")}</h3>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder={t("redeem.placeholder")}
                className="input input-bordered w-full pr-10"
                dir={isRTL ? "rtl" : "ltr"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Search className="w-5 h-5 text-base-content/40" />
              </div>
            </div>

            {redeemError && (
              <div className="alert alert-error mt-4">
                <X className="w-5 h-5" />
                <span>{redeemError}</span>
              </div>
            )}

            {redeemSuccess && (
              <div className="alert alert-success mt-4">
                <Check className="w-5 h-5" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            <div className="bg-base-200/50 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-primary" />
                {t("redeem.rulesTitle")}
              </h4>
              <ul className="space-y-2 text-sm">
                {[t("redeem.rules.1"), t("redeem.rules.2")].map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-primary/20 text-primary w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={handleRedeemCode} disabled={redeemLoading} className="btn btn-primary w-full mt-4">
              {redeemLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  {t("redeem.button")}
                </>
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default PromoCodes
