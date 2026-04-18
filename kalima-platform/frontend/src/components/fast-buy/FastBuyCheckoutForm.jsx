import FastBuyOrderSummaryCard from "./FastBuyOrderSummaryCard";
import FastBuyPaymentDetailsCard from "./FastBuyPaymentDetailsCard";
import FastBuyNotesCard from "./FastBuyNotesCard";
import FastBuyDynamicFields from "./FastBuyDynamicFields";

export default function FastBuyCheckoutForm({ form, onApplyCoupon, loading }) {
  const paymentMethods = form.preview?.paymentMethods || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
      <div className="flex-1 space-y-8 w-full">
        <FastBuyPaymentDetailsCard
          state={form.formData}
          updateField={form.updateField}
          needsTransferNumber={form.computed.needsTransferNumber}
          needsScreenshot={form.computed.needsScreenshot}
          isFreeOrder={form.computed.isFreeOrder}
          screenshotName={form.computed.screenshotName}
          paymentMethods={paymentMethods}
        />

        <FastBuyDynamicFields
          itemsMissingFields={form.computed.itemsMissingFields}
          itemFields={form.itemFields}
          updateItemField={form.updateItemField}
        />

        <FastBuyNotesCard state={form.formData} updateField={form.updateField} />
      </div>

      <FastBuyOrderSummaryCard
        items={form.computed.items}
        subtotal={form.computed.subtotal}
        total={form.computed.total}
        discount={form.computed.discount}
        loading={loading}
        isSubmitDisabled={form.computed.isSubmitDisabled}
        onSubmit={form.checkoutFastBuy}
        onApplyCoupon={onApplyCoupon}
      />
    </div>
  );
}
