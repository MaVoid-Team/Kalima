import { ArrowRight } from "lucide-react";

export default function PricingSummary({ pricing }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>${pricing.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxes (estimated)</span>
                <span>${pricing.taxes.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 mt-2 border-t border-border">
                <div className="flex items-baseline gap-2 text-sm text-card-foreground">
                    <span>Total</span>
                </div>
                <span className="text-2xl font-semibold text-card-foreground">${pricing.total.toFixed(2)}</span>
            </div>

            <button className="flex items-center justify-center gap-2 w-full py-4 mt-2 bg-primary text-primary-foreground rounded-md text-base font-semibold hover:bg-primary/90 transition-colors">
                Pay ${pricing.total.toFixed(2)}
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}
