import { useTranslation } from 'react-i18next';
import { formatOrderDate } from '@/lib/storeUtils';

export default function StatusTimeline({ order }) {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';

    if (!order) return null;

    const steps = [
        {
            key: 'created',
            label: 'Created',
            date: order.created_at,
            user: order.users?.name,
            active: true, // always created
        },
        {
            key: 'received',
            label: 'Received',
            date: order.received_at,
            user: order.received_by_user?.name,
            active: !!order.received_at,
        }
    ];

    if (order.status === 'returned') {
        steps.push({
            key: 'returned',
            label: 'Returned',
            date: order.returned_at,
            user: order.returned_by_user?.name,
            active: true,
        });
    } else {
        steps.push({
            key: 'confirmed',
            label: 'Confirmed',
            date: order.confirmed_at,
            user: order.confirmed_by_user?.name,
            active: !!order.confirmed_at,
        });
    }

    return (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">{t('orders.details.statusTimeline')}</h3>
            <div className="relative pt-2 ps-4">
                <div className="absolute top-0 bottom-0 w-0.5 bg-border -ms-2.5 start-4" />
                <div className="space-y-6">
                    {steps.map((step, index) => {
                        return (
                            <div key={step.key} className="relative flex flex-col gap-1">
                                <div className={`absolute w-3 h-3 rounded-full -ms-[21px] mt-1 start-0 ${step.active ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted border-2 border-muted-foreground/30'}`} />

                                <div className="text-sm font-medium">
                                    {t(`orders.status${step.label}`, step.label)}
                                </div>
                                {step.active && step.date && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span>{formatOrderDate(step.date, i18n.language)}</span>
                                        {step.user && <span>• {t('orders.details.by', 'by')} {step.user}</span>}
                                    </div>
                                )}
                                {!step.active && (
                                    <div className="text-xs text-muted-foreground">{t('orders.statusPending', 'Pending')}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
