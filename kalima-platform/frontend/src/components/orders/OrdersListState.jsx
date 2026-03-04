/* eslint-disable react/prop-types */
import { PackageOpen } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import OrderCard from './OrderCard';

export default function OrdersListState({ loading, orders, filters, t }) {
  return (
    <div className="min-h-100">
      {loading ? (
        <LoadingSpinner />
      ) : orders && orders.length > 0 ? (
        <div className="flex flex-col space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border/40 shadow-sm">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <PackageOpen className="h-12 w-12 text-primary opacity-80" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            {t('orders.noOrders', 'No orders found')}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {filters.status && filters.status !== 'all'
              ? t('orders.noOrdersForStatus', 'You have no orders with this status.')
              : t('orders.noOrdersDescription', 'Looks like you haven\'t placed any orders yet.')}
          </p>
        </div>
      )}
    </div>
  );
}
