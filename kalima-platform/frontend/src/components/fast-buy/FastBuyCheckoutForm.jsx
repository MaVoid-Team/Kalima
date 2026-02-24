import FastBuyOrderSummaryCard from "./FastBuyOrderSummaryCard";
import FastBuyPaymentDetailsCard from "./FastBuyPaymentDetailsCard";
import FastBuyNotesCard from "./FastBuyNotesCard";
import { useFastBuyForm } from "@/hooks/useFastBuyForm";
import FastBuyDynamicFields from "./FastBuyDynamicFields";

export default function FastBuyCheckoutForm({
  preview,
  onSubmit,
  onApplyCoupon,
  loading,
}) {
  const paymentMethods = preview?.paymentMethods || [];
  const form = useFastBuyForm(preview, paymentMethods, onSubmit);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
      <div className="flex-1 space-y-8 w-full">
        <FastBuyPaymentDetailsCard
          state={form.state}
          updateField={form.updateField}
          needsTransferNumber={form.computed.needsTransferNumber}
          needsScreenshot={form.computed.needsScreenshot}
          screenshotName={form.computed.screenshotName}
          paymentMethods={paymentMethods}
        />

        <FastBuyDynamicFields
          itemsMissingFields={form.computed.itemsMissingFields}
          itemFields={form.itemFields}
          updateItemField={form.updateItemField}
        />

        <FastBuyNotesCard state={form.state} updateField={form.updateField} />
      </div>

      <FastBuyOrderSummaryCard
        items={form.computed.items}
        subtotal={form.computed.subtotal}
        total={form.computed.total}
        discount={form.computed.discount}
        loading={loading}
        isSubmitDisabled={form.computed.isSubmitDisabled}
        onSubmit={form.handlers.handleSubmit}
        onApplyCoupon={onApplyCoupon}
      />
    </div>
  );
}
