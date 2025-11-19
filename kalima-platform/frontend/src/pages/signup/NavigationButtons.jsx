export default function NavigationButtons({
  currentStep,
  handlePrev,
  handleNext,
  t,
  isLoading,
  totalSteps,
  isAnyTeacherFieldFilled,
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

      <button
        onClick={handleNext}
        className="btn btn-primary"
        disabled={isLoading}
        type="button"
      >
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : role === "teacher" &&
          currentStep === 2 &&
          !isAnyTeacherFieldFilled ? (
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
