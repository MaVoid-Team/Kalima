"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Check, X, Gift, Info, UserPlus } from "lucide-react"
import { updateCurrentUser } from "../../routes/update-user"

const ReferralSection = ({ userInfo, onUserUpdate }) => {
  const { t } = useTranslation("promoCodes")

  const [referralSerial, setReferralSerial] = useState("")
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralError, setReferralError] = useState(null)
  const [referralSuccess, setReferralSuccess] = useState(null)

  // Check if user has already used a referral (you might need to add this field to your user model)
  const hasUsedReferral = userInfo?.referralUsed || userInfo?.referredBy

  const handleSubmitReferral = async () => {
    if (!referralSerial.trim()) {
      setReferralError(t("referral.errors.emptySerial") || "Please enter a referral serial")
      return
    }

    if (hasUsedReferral) {
      setReferralError(t("referral.errors.alreadyUsed") || "You have already used a referral code")
      return
    }

    setReferralLoading(true)
    setReferralError(null)
    setReferralSuccess(null)

    try {
      const updateData = {
        referralSerial: referralSerial.trim(),
      }

      const result = await updateCurrentUser(updateData)

      if (result.success) {
        setReferralSuccess(t("referral.success") || "Referral code applied successfully! You may receive bonus points.")
        setReferralSerial("")

        // Call the parent component's update function if provided
        if (onUserUpdate) {
          onUserUpdate()
        }
      } else {
        setReferralError(result.error || t("referral.errors.generic") || "Failed to apply referral code")
      }
    } catch (error) {
      setReferralError(t("referral.errors.generic") || "Failed to apply referral code")
    } finally {
      setReferralLoading(false)
    }
  }

  // Don't show the section if user has already used a referral
  if (hasUsedReferral) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-200 mb-8">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-success">
              <Gift className="w-5 h-5 mr-2" />
              {t("referral.completedTitle") || "Referral Applied"}
            </h2>
            <div className="badge badge-success">
              <Check className="w-3 h-3 mr-1" />
              {t("referral.used") || "Used"}
            </div>
          </div>

          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span className="text-success font-medium">
                {t("referral.alreadyApplied") || "You have successfully applied a referral code!"}
              </span>
            </div>
            {userInfo?.referredBy && (
              <p className="text-sm text-base-content/70 mt-2">
                {t("referral.referredBy") || "Referred by:"} {userInfo.referredBy}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 mb-8">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            <UserPlus className="w-5 h-5 mr-2 text-primary" />
            {t("referral.title") || "Referral Code"}
          </h2>
          <div className="badge badge-outline">{t("referral.oneTime") || "One-time use"}</div>
        </div>

        <div className="space-y-4">
          {/* Info Section */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-primary mb-2">{t("referral.infoTitle") || "Have a referral code?"}</h3>
                <p className="text-sm text-base-content/70">
                  {t("referral.infoDescription") ||
                    "If someone referred you to our platform, enter their referral serial below to get bonus points and help them earn rewards too!"}
                </p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-base-content/80">
                {t("referral.label") || "Referral Serial"}
              </span>
              <span className="label-text-alt text-base-content/60">{t("referral.required") || "Required"}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralSerial}
                onChange={(e) => setReferralSerial(e.target.value)}
                placeholder={t("referral.placeholder") || "Enter referral serial (e.g., REF123456)"}
                className="input input-bordered flex-1 focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={referralLoading}
              />
              <button
                onClick={handleSubmitReferral}
                disabled={referralLoading || !referralSerial.trim()}
                className="btn btn-primary min-w-[120px]"
              >
                {referralLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    {t("referral.button") || "Apply"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {referralError && (
            <div className="alert alert-error shadow-lg">
              <X className="w-5 h-5 shrink-0" />
              <span>{referralError}</span>
            </div>
          )}

          {/* Success Message */}
          {referralSuccess && (
            <div className="alert alert-success shadow-lg">
              <Check className="w-5 h-5 shrink-0" />
              <span>{referralSuccess}</span>
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-base-200/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center">
              <Gift className="w-4 h-4 mr-2 text-primary" />
              {t("referral.benefitsTitle") || "Referral Benefits"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>{t("referral.benefit1") || "Get bonus points when you apply a valid referral code"}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>{t("referral.benefit2") || "Help your friend earn rewards for referring you"}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>{t("referral.benefit3") || "One-time use ensures fair distribution of rewards"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferralSection
