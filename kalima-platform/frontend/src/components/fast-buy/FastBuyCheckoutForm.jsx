import FastBuyOrderSummaryCard from "./FastBuyOrderSummaryCard";
import FastBuyPaymentDetailsCard from "./FastBuyPaymentDetailsCard";
import FastBuyNotesCard from "./FastBuyNotesCard";
import FastBuyDynamicFields from "./FastBuyDynamicFields";
import { Skeleton } from "@/components/ui/skeleton";

function FastBuySkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start w-full animate-in fade-in duration-500">
      <div className="flex-1 space-y-8 w-full">
        {/* Payment Card Skeleton */}
        <div className="border border-border/40 bg-card/60 backdrop-blur-md rounded-3xl p-8 space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Dynamic Fields Skeleton */}
        <div className="border border-border/40 bg-card/60 backdrop-blur-md rounded-3xl p-8 space-y-6">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card Skeleton */}
      <div className="w-full lg:w-96 border border-border/40 bg-card/60 backdrop-blur-md rounded-3xl p-8 space-y-8 sticky top-24">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-lg" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded-lg" />
          </div>
          <div className="border-t border-border/10 pt-4 flex justify-between">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function FastBuyCheckoutForm({ form, onApplyCoupon, loading }) {
  if (loading) return <FastBuySkeleton />;
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

        {/* <FastBuyNotesCard state={form.formData} updateField={form.updateField} /> */}
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
