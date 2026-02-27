/* eslint-disable react/prop-types */
export default function OrdersStatusFilter({ statusOptions, filters, onStatusChange }) {
  return (
    <div className="flex bg-muted/50 p-1 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar">
      {statusOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onStatusChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 ${(filters.status === opt.value || (!filters.status && opt.value === 'all'))
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
          data-testid={`orders-status-filter-${opt.value}-button`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
