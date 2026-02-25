import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getImageUrl, formatFileSize } from '@/lib/storeUtils';
import useApiMutation from '@/hooks/useApiMutation';
import useExport from '@/hooks/useExport';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminSamplesPage() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';
    const { mutate: fetchApi, loading } = useApiMutation();
    const { exportData, loading: exportLoading } = useExport();

    const [samples, setSamples] = useState([]);
    const [fetched, setFetched] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const loadSamples = useCallback(async () => {
        try {
            const res = await fetchApi({ endpoint: '/samples', method: 'get' });
            if (res?.success) setSamples(res.data ?? []);
        } catch (e) {
            console.error('Failed to fetch samples:', e);
        } finally {
            setFetched(true);
        }
    }, [fetchApi]);

    useEffect(() => {
        loadSamples();
    }, [loadSamples]);

    const handleSelect = (id, checked) => {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(samples.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleExport = (format) => {
        exportData({
            resource: 'samples',
            format,
            ids: selectedIds,
        });
    };

    return (
        <div className="space-y-6" data-testid="admin-samples-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('samples.title')}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{t('samples.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    {fetched && !loading && (
                        <Badge variant="outline" className="shrink-0" data-testid="admin-samples-count">
                            {samples.length} {t('samples.count', { count: samples.length })}
                        </Badge>
                    )}

                    {/* Export dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={exportLoading} variant="outline" data-testid="samples-export-button">
                                <Download className="me-2 h-4 w-4" />
                                {t('orders.export', 'Export')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleExport('csv')}
                                disabled={exportLoading}
                                data-testid="samples-export-csv"
                            >
                                {t('orders.exportCsv', 'Export as CSV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleExport('xlsx')}
                                disabled={exportLoading}
                                data-testid="samples-export-excel"
                            >
                                {t('orders.exportXlsx', 'Export as Excel')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table / List */}
            {loading && !fetched ? (
                <div className="space-y-3" data-testid="admin-samples-skeleton">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            ) : samples.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground" data-testid="admin-samples-empty">
                    <FileText className="h-10 w-10 opacity-40" />
                    <p className="text-sm">{t('samples.noSamples')}</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden" data-testid="admin-samples-list">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="ps-4 py-3 w-10">
                                    <Checkbox
                                        checked={samples.length > 0 && selectedIds.length === samples.length}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all samples"
                                        data-testid="samples-table-select-all"
                                    />
                                </th>
                                <th className="text-start py-3 font-medium">{t('samples.table.file')}</th>
                                <th className="text-start py-3 font-medium hidden sm:table-cell">{t('samples.table.product')}</th>
                                <th className="text-start py-3 font-medium hidden md:table-cell">{t('samples.table.size')}</th>
                                <th className="text-start py-3 font-medium hidden md:table-cell">{t('samples.table.type')}</th>
                                <th className="text-end pe-4 py-3 font-medium">{t('samples.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {samples.map((sample) => (
                                <tr key={sample.id} className="hover:bg-muted/30 transition-colors" data-testid={`admin-samples-row-${sample.id}`}>
                                    {/* Checkbox */}
                                    <td className="ps-4 py-3">
                                        <Checkbox
                                            checked={selectedIds.includes(sample.id)}
                                            onCheckedChange={(checked) => handleSelect(sample.id, checked)}
                                            aria-label={`Select sample ${sample.original_name}`}
                                            data-testid={`samples-table-select-${sample.id}`}
                                        />
                                    </td>

                                    {/* File name */}
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-medium truncate max-w-[180px]">{sample.original_name}</span>
                                        </div>
                                    </td>

                                    {/* Product */}
                                    <td className="py-3 hidden sm:table-cell">
                                        {sample.products?.id ? (
                                            <Link
                                                to={`/admin/products/${sample.products.id}`}
                                                className="text-primary hover:underline truncate max-w-[160px] block"
                                                data-testid={`admin-samples-product-link-${sample.id}`}
                                            >
                                                {sample.products.title ?? `#${sample.products.id}`}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>

                                    {/* Size */}
                                    <td className="py-3 text-muted-foreground hidden md:table-cell">
                                        {formatFileSize(sample.size)}
                                    </td>

                                    {/* Type */}
                                    <td className="py-3 hidden md:table-cell">
                                        <Badge variant="outline" className="text-xs">
                                            {sample.mime_type === 'application/pdf' ? 'PDF' : 'Word'}
                                        </Badge>
                                    </td>

                                    {/* Actions */}
                                    <td className="pe-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                data-testid={`admin-samples-view-button-${sample.id}`}
                                            >
                                                <Link to={`/samples/${sample.id}`}>
                                                    {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                data-testid={`admin-samples-download-button-${sample.id}`}
                                            >
                                                <a href={getImageUrl(sample.url)} download target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
