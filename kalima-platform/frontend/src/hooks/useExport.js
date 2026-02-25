import { useState } from 'react';
import axios from '@/api/axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { buildQueryString } from '@/lib/queryUtils';

export const useExport = () => {
    const [loading, setLoading] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const { t } = useTranslation('common');

    const exportData = async ({ resource, format = 'csv', ids = [], filters = {} }) => {
        setLoading(true);
        setExportProgress(0);
        try {
            // Use buildQueryString to handle filters/dates appropriately
            const baseQuery = buildQueryString({ filters });
            const params = new URLSearchParams(baseQuery);

            // Expected by backend
            params.set('format', format);

            if (ids?.length > 0) {
                params.set('ids', ids.join(','));
            }

            const response = await axios.get(`/${resource}/export?${params.toString()}`, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setExportProgress(percentCompleted);
                    } else if (progressEvent.loaded) {
                        // Fallback logic if total is not available (e.g. chunked transfer)
                        // This won't be a 0-100 percentage, but we can set an indeterminate state
                        // For now we'll set to 99 so the bar shows some progress until completed
                        setExportProgress(99);
                    }
                }
            });

            // Extract filename from Content-Disposition header if available
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${resource}-${new Date().toISOString().split('T')[0]}.${format}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (filenameMatch && filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            // Trigger download
            const blob = new Blob([response.data], {
                type: format === 'csv'
                    ? 'text/csv; charset=utf-8'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('export.success', 'Export successful'));
        } catch (error) {
            console.error('Export failed:', error);
            // Error toast is handled globally by the axios response interceptor
        } finally {
            setLoading(false);
            setExportProgress(0); // clear progress when done or errored
        }
    };

    return { exportData, loading, exportProgress };
};

export default useExport;
