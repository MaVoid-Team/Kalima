import { CreditCard, HelpCircle } from "lucide-react";

export default function PaymentMethod() {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-2">Payment</h2>
            <p className="text-sm text-muted-foreground mb-4">All transactions are secure and encrypted.</p>

            {/* Credit Card Option */}
            <div className="border-2 border-primary rounded-md overflow-hidden mb-2">
                <div className="flex justify-between items-center p-4 bg-primary/5">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                        <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-primary" />
                        <span>Credit Card</span>
                    </label>
                    <div className="flex gap-2 items-center">
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                    </div>
                </div>

                <div className="p-4 bg-muted/30 border-t border-border">
                    <div className="mb-4">
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            CARD NUMBER
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                EXPIRATION (MM/YY)
                            </label>
                            <input
                                type="text"
                                placeholder="MM / YY"
                                className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                SECURITY CODE
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="CVC"
                                    className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                                />
                                <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            NAME ON CARD
                        </label>
                        <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                </div>
            </div>

            {/* PayPal Option */}
            <div className="border border-border rounded-md mb-2">
                <div className="flex justify-between items-center p-4 bg-muted/30">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                        <input type="radio" name="payment" className="w-4 h-4 accent-primary" />
                        <span>PayPal</span>
                    </label>
                    <a href="#" className="text-primary text-sm hover:underline">PayPal</a>
                </div>
            </div>

            {/* Apple Pay Option */}
            <div className="border border-border rounded-md">
                <div className="flex justify-between items-center p-4 bg-muted/30">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                        <input type="radio" name="payment" className="w-4 h-4 accent-primary" />
                        <span>Apple Pay</span>
                    </label>
                    <span className="text-sm text-foreground">⌘ Pay</span>
                </div>
            </div>
        </div>
    );
}
