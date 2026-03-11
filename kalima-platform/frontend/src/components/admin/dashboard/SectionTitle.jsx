export default function SectionTitle({ icon: Icon, children }) {
    return (
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
            <Icon className="h-4 w-4" />
            {children}
        </h2>
    );
}
