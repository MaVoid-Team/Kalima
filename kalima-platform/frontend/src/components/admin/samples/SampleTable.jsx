import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import SampleTableRow from './SampleTableRow';

export default function SampleTable({ samples, sectionId, onEdit, onDelete, loading }) {
    const { t } = useTranslation('admin');

    if (samples.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-background rounded-xl border border-border">
                <FileText className="h-10 w-10 opacity-30 mb-2" />
                <p>{t('samples.sections.noSamplesNested', 'No samples are nested in this section yet.')}</p>
                <p className="text-sm mt-1">{t('samples.sections.addFromProduct', 'You can add samples to this section from the Product details page.')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border overflow-hidden bg-background">
            <table className="kalima-data-table">
                <thead>
                    <tr>
                        <th className="text-start ps-4 py-3 font-medium">{t('samples.table.file', 'Sample File')}</th>
                        <th className="kalima-number py-3 font-medium">{t('samples.table.productId', 'Product ID')}</th>
                        <th className="text-start py-3 font-medium hidden sm:table-cell">{t('samples.table.mediaType', 'Media Type')}</th>
                        <th className="kalima-actions pe-4 py-3 font-medium">{t('common.actions', 'Actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {samples.map((sample) => (
                        <SampleTableRow
                            key={sample.id}
                            sample={sample}
                            sectionId={sectionId}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            loading={loading}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
