import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted/60 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground leading-none mb-1 truncate">{label}</p>
                    <p className="text-2xl font-bold truncate">{value ?? '—'}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
