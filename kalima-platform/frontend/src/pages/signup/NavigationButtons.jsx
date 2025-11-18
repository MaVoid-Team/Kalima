export default function NavigationButtons({
  currentStep,
  handlePrev,
  handleNext,
  t,
  isLoading,
  totalSteps,
  isTeacherSkip,
  role,
}) {
  return (
    <div className="flex justify-between px-[10%] mt-8">
      <button
        onClick={handlePrev}
        disabled={currentStep === 1 || isLoading}
        className="btn btn-outline"
        type="button"
      >
        {t("buttons.previous")}
      </button>

      {/* Next / Skip / Submit */}
      <button
        onClick={handleNext}
        className="btn btn-primary"
        disabled={isLoading}
        type="button"
      >
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : isTeacherSkip ? (
          t("تخطي")
        ) : currentStep === totalSteps[role] ? (
          t("buttons.submit")
        ) : (
          t("buttons.next")
        )}
      </button>
    </div>
  );
}
