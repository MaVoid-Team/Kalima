export default function ContactInformation() {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">Contact Information</h2>
                <a href="#" className="text-primary text-sm hover:underline">Log in</a>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Email address
                </label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border border-border rounded cursor-pointer accent-primary" />
                <span className="text-sm text-muted-foreground">Email me with news and offers</span>
            </label>
        </div>
    );
}
