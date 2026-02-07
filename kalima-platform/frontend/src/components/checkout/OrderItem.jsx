import { Badge } from "@/components/ui/badge";

export default function OrderItem({ item }) {
    return (
        <div className="flex items-start gap-4">
            <div className="relative shrink-0">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
                <Badge variant="secondary" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full p-0 text-xs">
                    {item.quantity}
                </Badge>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type}</p>
            </div>
            <p className="text-sm font-medium text-card-foreground shrink-0">${item.price.toFixed(2)}</p>
        </div>
    );
}
