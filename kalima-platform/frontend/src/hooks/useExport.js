import { useState } from 'react';
import axios from '@/api/axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { buildQueryString } from '@/lib/queryUtils';

export const useExport = () => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation('common');

    const exportData = async ({ resource, format = 'csv', ids = [], filters = {} }) => {
        setLoading(true);
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
                responseType: 'blob'
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
        }
    };

    return { exportData, loading };
};

export default useExport;
