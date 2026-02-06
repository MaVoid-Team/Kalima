export default function DiscountCode() {
    return (
        <div className="flex gap-2">
            <input
                type="text"
                placeholder="Discount code"
                className="flex-1 px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button className="px-5 py-3 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors">
                Apply
            </button>
        </div>
    );
}
