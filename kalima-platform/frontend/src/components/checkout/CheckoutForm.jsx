import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import PaymentDetailsCard from "./PaymentDetailsCard";
import BookDetailsCard from "./BookDetailsCard";
import NotesCard from "./NotesCard";
import OrderSummaryCard from "./OrderSummaryCard";

export default function CheckoutForm({
  preview,
  cartItems,
  onSubmit,
  loading,
}) {
  const form = useCheckoutForm({ preview, cartItems, onSubmit });

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
      {/* ── LEFT COLUMN: FORM FIELDS ── */}
      <div className="flex-1 space-y-8 w-full">
        <PaymentDetailsCard
          state={form.state}
          updateField={form.updateField}
          needsTransferNumber={form.computed.needsTransferNumber}
          needsScreenshot={form.computed.needsScreenshot}
          screenshotName={form.computed.screenshotName}
        />

        <BookDetailsCard
          hasBooks={form.computed.hasBooks}
          bookFields={form.computed.bookFields}
          state={form.state}
          updateField={form.updateField}
        />

        <NotesCard state={form.state} updateField={form.updateField} />
      </div>

      {/* ── RIGHT COLUMN: ORDER SUMMARY ── */}
      <OrderSummaryCard
        items={form.computed.items}
        subtotal={form.computed.subtotal}
        loading={loading}
        isSubmitDisabled={form.computed.isSubmitDisabled}
        onSubmit={form.handlers.handleSubmit}
      />
    </div>
  );
}
