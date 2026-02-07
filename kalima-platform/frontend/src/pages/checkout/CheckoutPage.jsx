import {
    StepIndicator,
    ContactInformation,
    ShippingAddress,
    PaymentMethod,
    OrderSummary,

} from '@/components/checkout';
import { orderItems, pricingData, steps } from './constants/checkoutData';

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <StepIndicator steps={steps} currentStep={3} />

            <main className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto px-8 py-8 flex-1">
                <div className="flex flex-col gap-6">
                    <ContactInformation />
                    <ShippingAddress />
                    <PaymentMethod />
                </div>

                <aside className="lg:sticky lg:top-8 h-fit">
                    <OrderSummary items={orderItems} pricing={pricingData} />
                </aside>
            </main>

        </div>
    );
}
