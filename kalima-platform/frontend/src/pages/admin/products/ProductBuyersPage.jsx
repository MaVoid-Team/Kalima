import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';
import {
    ChevronLeft,
    Package,
    Users,
    CheckCircle2,
    Clock,
    ShoppingBag,
    DollarSign,
    Search,
    Download,
    Eye,
    Copy,
    Check,
    Phone,
    Mail,
    FileText,
    ExternalLink,
    AlertCircle,
    RotateCcw,
    Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
    generatePaginationLinks
} from '@/components/ui/pagination';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import useOrders from '@/hooks/useOrders';
import useExport from '@/hooks/useExport';
import { formatCurrency, getImageUrl } from '@/lib/storeUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductBuyersPage() {
    const { id } = useParams();
    const productId = Number(id);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';

    // Product info
    const { selectedProduct, fetchProductById, loading: productLoading } = useAdminProducts();

    // Orders / Buyers for this product
    const {
        orders,
        pagination,
        filters,
        loading: ordersLoading,
        setSearch,
        setStatus,
        setPage,
        fetchOrders
    } = useOrders({ productId, limit: 10 });

    const { exportData, loading: exportLoading, exportProgress } = useExport();
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeResponsesDialog, setActiveResponsesDialog] = useState(null);
    const [copiedSerial, setCopiedSerial] = useState(null);

    useEffect(() => {
        if (productId) {
            fetchProductById(productId);
        }
    }, [productId, fetchProductById]);

    const handleSearchChange = (val) => {
        setSearch(val);
    };

    const handleStatusChange = (val) => {
        setStatus(val === 'all' ? '' : val);
    };

    const handleSelect = (orderId, checked) => {
        setSelectedIds(prev =>
            checked ? [...prev, orderId] : prev.filter(selectedId => selectedId !== orderId)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(orders.map(o => o.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleCopySerial = (serial) => {
        if (!serial) return;
        navigator.clipboard.writeText(serial);
        setCopiedSerial(serial);
        toast.success(t('products.buyers.copied', 'Copied!'));
        setTimeout(() => setCopiedSerial(null), 2000);
    };

    const handleExport = (formatType) => {
        exportData({
            resource: 'purchases',
            format: formatType,
            ids: selectedIds,
            filters: {
                ...filters,
                productId,
            },
        });
    };

    // Calculate product sales summary from current loaded orders & pagination
    const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
    const totalUnitsSold = orders.reduce((sum, order) => {
        const item = order.purchase_items?.find(i => Number(i.product_id) === productId || Number(i.products?.id) === productId);
        return sum + (item?.quantity || 1);
    }, 0);

    const totalProductRevenue = orders.reduce((sum, order) => {
        const item = order.purchase_items?.find(i => Number(i.product_id) === productId || Number(i.products?.id) === productId);
        return sum + (Number(item?.final_price) || Number(item?.price_at_purchase) || 0);
    }, 0);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return (
                    <Badge className="bg-success/20 text-success border-success/50 hover:bg-success/30 gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('products.buyers.filterStatusConfirmed', 'Confirmed')}
                    </Badge>
                );
            case 'received':
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {t('products.buyers.filterStatusReceived', 'Received')}
                    </Badge>
                );
            case 'delivered':
                return (
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/50 hover:bg-emerald-500/30 gap-1 font-medium">
                        <Truck className="h-3 w-3" />
                        {t('products.buyers.filterStatusDelivered', 'Delivered')}
                    </Badge>
                );
            case 'returned':
                return (
                    <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/50 gap-1 font-medium">
                        <RotateCcw className="h-3 w-3" />
                        {t('products.buyers.filterStatusReturned', 'Returned')}
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        {t('products.buyers.filterStatusPending', 'Pending')}
                    </Badge>
                );
        }
    };

    const thumbnailUrl = getImageUrl(selectedProduct?.thumbnail_image?.url);

    return (
        <div className="space-y-6 no-scrollbar" data-testid="product-buyers-page">
            {/* Top Breadcrumb & Navigation */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        to="/admin/products"
                        className="hover:text-foreground transition-colors flex items-center gap-1"
                        data-testid="product-buyers-back-link"
                    >
                        <ChevronLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
                        {t('products.backToProducts', 'Back to Products')}
                    </Link>
                    <span>/</span>
                    <Link
                        to={`/admin/products/${productId}`}
                        className="hover:text-foreground transition-colors max-w-[200px] truncate"
                        title={selectedProduct?.title}
                    >
                        {selectedProduct?.title || `#${productId}`}
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{t('products.buyers.title', 'Product Buyers')}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid="product-buyers-view-product-button"
                    >
                        <Link to={`/admin/products/${productId}`}>
                            <Eye className="me-1.5 h-4 w-4" />
                            {t('products.buyers.viewProduct', 'View Product Details')}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Product Header Card */}
            <div className="rounded-2xl border border-primary/20 bg-card p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    {productLoading ? (
                        <Skeleton className="h-16 w-16 rounded-xl" />
                    ) : thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt={selectedProduct?.title || 'Product'}
                            className="h-16 w-16 rounded-xl object-cover border border-border shadow-xs"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
                            <Package className="h-8 w-8" />
                        </div>
                    )}

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {selectedProduct?.title || t('products.buyers.title', 'Product Buyers')}
                            </h1>
                            {selectedProduct?.serial && (
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {selectedProduct.serial}
                                </Badge>
                            )}
                            {selectedProduct?.type && (
                                <Badge variant="outline">
                                    {t(`products.type.${selectedProduct.type}`, selectedProduct.type)}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('products.buyers.subtitle', 'List of all customers who purchased this product')}
                        </p>
                    </div>
                </div>

                {/* Header Actions: Export */}
                <div className="flex items-center gap-2 shrink-0">
                    <DropdownMenu dir={i18n.dir()}>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline" data-testid="product-buyers-export-button">
                                <Download className="me-2 h-4 w-4" />
                                {t('products.buyers.exportBuyers', 'Export Buyers')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRtl ? 'start' : 'end'}>
                            <DropdownMenuItem
                                onClick={() => handleExport('csv')}
                                disabled={exportLoading}
                                data-testid="product-buyers-export-csv"
                            >
                                {t('products.buyers.exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExport('xlsx')}
                                disabled={exportLoading}
                                data-testid="product-buyers-export-excel"
                            >
                                {t('products.buyers.exportExcel', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Export Progress */}
            {exportLoading && exportProgress > 0 && (
                <div>
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                        <span>{exportProgress < 100 ? t('export.exporting', 'Exporting...') : t('export.processing', 'Processing...')}</span>
                        <span>{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} />
                </div>
            )}

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="product-buyers-stats">
                {/* Total Orders */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{t('products.buyers.totalOrders', 'Total Orders')}</span>
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">{pagination.total || 0}</p>
                </div>

                {/* Confirmed Orders */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{t('products.buyers.confirmedBuyers', 'Confirmed Buyers')}</span>
                        <div className="h-8 w-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-2 text-success">{confirmedCount}</p>
                </div>

                {/* Units Sold */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{t('products.buyers.unitsSold', 'Units Sold')}</span>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">{totalUnitsSold}</p>
                </div>

                {/* Total Revenue */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">{t('products.buyers.revenue', 'Total Revenue')}</span>
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">{formatCurrency(totalProductRevenue, t)}</p>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between" data-testid="product-buyers-filters">
                <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder={t('products.buyers.searchPlaceholder', 'Search buyers by name, email, phone, serial...')}
                        value={filters.search || ''}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="ps-9"
                        data-testid="product-buyers-search-input"
                    />
                </div>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={handleStatusChange}
                    dir={i18n.dir()}
                >
                    <SelectTrigger className="w-full sm:w-48" data-testid="product-buyers-status-select">
                        <SelectValue placeholder={t('products.buyers.filterStatusAll', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('products.buyers.filterStatusAll', 'All Statuses')}</SelectItem>
                        <SelectItem value="confirmed">{t('products.buyers.filterStatusConfirmed', 'Confirmed')}</SelectItem>
                        <SelectItem value="received">{t('products.buyers.filterStatusReceived', 'Received')}</SelectItem>
                        <SelectItem value="pending">{t('products.buyers.filterStatusPending', 'Pending')}</SelectItem>
                        <SelectItem value="delivered">{t('products.buyers.filterStatusDelivered', 'Delivered')}</SelectItem>
                        <SelectItem value="returned">{t('products.buyers.filterStatusReturned', 'Returned')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Buyers Table */}
            {ordersLoading ? (
                <div className="space-y-2" data-testid="product-buyers-skeleton">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-md" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border p-8" data-testid="product-buyers-empty">
                    <Users className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">{t('products.buyers.noBuyers', 'No buyers found')}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        {t('products.buyers.noBuyersDescription', 'No purchase records found for this product matching your search/filters.')}
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden bg-card" data-testid="product-buyers-table">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        className={isRtl ? 'scale-x-[-1]' : ''}
                                        checked={orders.length > 0 && selectedIds.length === orders.length}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all buyers"
                                        data-testid="product-buyers-select-all"
                                    />
                                </TableHead>
                                <TableHead>{t('products.buyers.customer', 'Customer')}</TableHead>
                                <TableHead>{t('products.buyers.contact', 'Contact Info')}</TableHead>
                                <TableHead>{t('products.buyers.orderSerial', 'Order Serial')}</TableHead>
                                <TableHead>{t('products.buyers.purchaseDate', 'Purchase Date')}</TableHead>
                                <TableHead status>{t('products.table.status', 'Status')}</TableHead>
                                <TableHead numeric>{t('products.buyers.quantity', 'Quantity')}</TableHead>
                                <TableHead numeric>{t('products.buyers.amountPaid', 'Amount Paid')}</TableHead>
                                <TableHead>{t('products.buyers.requiredFields', 'Order Responses')}</TableHead>
                                <TableHead actions>{t('products.table.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const customer = order.users || {};
                                const item = order.purchase_items?.find(i => Number(i.product_id) === productId || Number(i.products?.id) === productId);
                                const requiredFields = item?.purchase_item_required_fields || [];
                                const itemQuantity = item?.quantity || 1;
                                const itemPrice = Number(item?.final_price) || Number(item?.price_at_purchase) || 0;

                                return (
                                    <TableRow
                                        key={order.id}
                                        className="hover:bg-muted/40 transition-colors"
                                        data-state={selectedIds.includes(order.id) && 'selected'}
                                        data-testid={`product-buyer-row-${order.id}`}
                                    >
                                        {/* Checkbox */}
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                className={isRtl ? 'scale-x-[-1]' : ''}
                                                checked={selectedIds.includes(order.id)}
                                                onCheckedChange={(checked) => handleSelect(order.id, checked)}
                                                aria-label={`Select order ${order.purchase_serial}`}
                                                data-testid={`product-buyer-select-${order.id}`}
                                            />
                                        </TableCell>

                                        {/* Customer Name */}
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                                                    {(customer.name?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground line-clamp-1">{customer.name || t('common.unknownUser', 'Unknown')}</p>
                                                    {customer.role && (
                                                        <span className="text-xs text-muted-foreground">{customer.role}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Contact */}
                                        <TableCell>
                                            <div className="space-y-0.5 text-xs text-muted-foreground">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <bdi dir="ltr" className="font-mono">{customer.phone}</bdi>
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="truncate max-w-[180px]">{customer.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Serial */}
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <bdi dir="ltr" className="font-mono text-xs font-medium text-foreground">
                                                    {order.purchase_serial || `ID: ${order.id}`}
                                                </bdi>
                                                {order.purchase_serial && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleCopySerial(order.purchase_serial)}
                                                        title={t('products.buyers.copySerial', 'Copy Order Serial')}
                                                    >
                                                        {copiedSerial === order.purchase_serial ? (
                                                            <Check className="h-3 w-3 text-success" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Purchase Date */}
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {order.created_at ? (
                                                format(new Date(order.created_at), 'PPP p', { locale: isRtl ? arSA : undefined })
                                            ) : '—'}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell status>
                                            {getStatusBadge(order.status)}
                                        </TableCell>

                                        {/* Quantity */}
                                        <TableCell numeric className="font-medium text-foreground">
                                            x{itemQuantity}
                                        </TableCell>

                                        {/* Amount Paid */}
                                        <TableCell numeric className="font-semibold text-foreground">
                                            {formatCurrency(itemPrice, t)}
                                        </TableCell>

                                        {/* Required / Custom Fields Responses */}
                                        <TableCell>
                                            {requiredFields && requiredFields.length > 0 ? (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1.5"
                                                    onClick={() => setActiveResponsesDialog({
                                                        customerName: customer.name,
                                                        serial: order.purchase_serial,
                                                        fields: requiredFields
                                                    })}
                                                    data-testid={`product-buyer-responses-${order.id}`}
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {t('products.buyers.viewRequiredFields', 'View Responses')}
                                                    <Badge variant="outline" className="h-4 px-1 text-[10px] ms-0.5">
                                                        {requiredFields.length}
                                                    </Badge>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    {t('products.buyers.noRequiredFields', 'None')}
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell actions>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="h-8 gap-1 text-xs"
                                                title={t('products.buyers.openOrder', 'Open Order Details')}
                                                data-testid={`product-buyer-view-order-${order.id}`}
                                            >
                                                <Link to={`/admin/orders/${order.id}`}>
                                                    <ExternalLink className="h-3.5 w-3.5 me-1" />
                                                    {t('products.buyers.viewOrder', 'View Order')}
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-4 flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.previous')}
                                    data-testid="product-buyers-pagination-prev"
                                />
                            </PaginationItem>

                            {generatePaginationLinks(pagination.page, pagination.pages).map((pageNumber, index) => {
                                if (pageNumber === 'ellipsis') {
                                    return (
                                        <PaginationItem key={`ellipsis-${index}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            onClick={() => setPage(pageNumber)}
                                            isActive={pagination.page === pageNumber}
                                            className="cursor-pointer"
                                            data-testid={`product-buyers-pagination-${pageNumber}`}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))}
                                    className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    text={t('common.pagination.next')}
                                    data-testid="product-buyers-pagination-next"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Required Fields Answers Dialog */}
            <Dialog
                open={!!activeResponsesDialog}
                onOpenChange={(open) => { if (!open) setActiveResponsesDialog(null); }}
            >
                <DialogContent className="sm:max-w-md" dir={i18n.dir()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {t('products.buyers.requiredFieldsModalTitle', 'Buyer Order Responses')}
                        </DialogTitle>
                        <DialogDescription>
                            {activeResponsesDialog?.customerName && (
                                <span className="font-medium text-foreground">{activeResponsesDialog.customerName}</span>
                            )}
                            {activeResponsesDialog?.serial && (
                                <span className="font-mono text-xs block mt-0.5">({activeResponsesDialog.serial})</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto pr-1">
                        {activeResponsesDialog?.fields?.map((field, idx) => {
                            const fieldDef = field.required_field_definitions || {};
                            return (
                                <div key={idx} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {fieldDef.label || fieldDef.name || `Field #${field.field_definition_id}`}
                                    </p>
                                    <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                                        {field.value || '—'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
