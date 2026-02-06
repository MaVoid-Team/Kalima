import OrderItem from "./OrderItem";
import DiscountCode from "./DiscountCode";
import PricingSummary from "./PricingSummary";
import { Lock, Heart, FileText } from "lucide-react";

export default function OrderSummary({ items, pricing }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-6">Order Summary</h2>

            <div className="flex flex-col gap-4 mb-6">
                {items.map(item => (
                    <OrderItem key={item.id} item={item} />
                ))}
            </div>

            <div className="mb-6 pb-6 border-b border-border">
                <DiscountCode />
            </div>

            <PricingSummary pricing={pricing} />

            <div className="flex justify-center gap-4 mt-4 pt-4">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <Heart className="w-5 h-5 text-muted-foreground" />
                <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
        </div>
    );
}
