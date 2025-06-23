"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"

const PaymentSection = ({ paymentNumber, isRTL }) => {
  const { t } = useTranslation("kalimaStore-ProductDetails")
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(paymentNumber)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error(t("errors.copyFailed"), err)
    }
  }

  return (
    <div className="text-center space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Payment Information</h2>
        <p className="text-lg">Follow these simple steps to complete your purchase</p>
      </div>

      {/* Payment Number Card */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <p className="text-sm opacity-90 mb-2">Payment Number</p>
          <button
            onClick={handleCopyNumber}
            className={`btn btn-lg font-mono text-2xl ${
              copySuccess ? "btn-success" : "btn-ghost bg-base-100 text-base-content hover:bg-base-200"
            }`}
          >
            {paymentNumber}
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          {copySuccess && <p className="text-sm opacity-90 mt-2">✓ Copied to clipboard!</p>}
          <p className="opacity-90 mt-2">Click to copy the payment number</p>
        </div>
      </div>

      {/* Purchase Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="badge badge-primary badge-lg">1</div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Send Payment</h3>
                <p>Transfer the exact amount to the payment number above using your preferred payment method.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="badge badge-secondary badge-lg">2</div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Upload Screenshot</h3>
                <p>Take a screenshot of your payment confirmation and upload it in the form below.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="alert alert-warning">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="font-semibold">Important Note</h4>
          <p>
            Please ensure you send the exact amount and include the payment screenshot. We will process your order
            within 1-2 hours during business hours.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSection
