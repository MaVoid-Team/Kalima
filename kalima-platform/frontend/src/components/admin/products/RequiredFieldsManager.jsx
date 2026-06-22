import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function RequiredFieldsManager({ product, fieldDefinitions, onAttach, onDetach, onLoadDefinitions, loading }) {
    const { t, i18n } = useTranslation('admin');
    const [selectedDefId, setSelectedDefId] = useState('');

    // Load definitions on mount
    useEffect(() => {
        onLoadDefinitions?.();
    }, [onLoadDefinitions]);

    const attachedFields = product?.product_required_fields ?? [];
    const attachedDefIds = attachedFields.map(f => f.field_definition_id);

    // Only show definitions not already attached
    const availableDefinitions = fieldDefinitions.filter(def => !attachedDefIds.includes(def.id));

    const handleAttach = () => {
        if (!selectedDefId) return;
        onAttach([{ field_definition_id: parseInt(selectedDefId), is_required: true }]);
        setSelectedDefId('');
    };

    return (
        <div className="space-y-4" data-testid="required-fields-manager">
            {/* Attached fields table */}
            {attachedFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('products.detail.noRequiredFields')}</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('products.detail.fieldLabel')}</TableHead>
                            <TableHead>{t('products.detail.fieldType')}</TableHead>
                            <TableHead>{t('products.detail.fieldRequired')}</TableHead>
                            <TableHead actions><span className="sr-only">{t('common.actions', 'Actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attachedFields.map((field) => (
                            <TableRow key={field.id} data-testid={`required-field-row-${field.id}`}>
                                <TableCell truncate className="font-medium" title={field.required_field_definitions?.label}>
                                    {field.required_field_definitions?.label}
                                </TableCell>
                                <TableCell status>
                                    <Badge variant="outline">
                                        {field.required_field_definitions?.field_type}
                                    </Badge>
                                </TableCell>
                                <TableCell status>
                                    {field.is_required ? t('products.detail.yes') : t('products.detail.no')}
                                </TableCell>
                                <TableCell actions>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={loading}
                                        onClick={() => onDetach(field.field_definition_id)}
                                         className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                         title={t('products.detail.detachField', 'Detach field')}
                                         data-testid={`required-field-detach-${field.id}`}
                                     >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Attach picker */}
            {availableDefinitions.length > 0 && (
                <div className="flex items-center gap-2">
                    <Select dir={i18n.dir()} value={selectedDefId} onValueChange={setSelectedDefId}>
                        <SelectTrigger className="flex-1" data-testid="required-fields-manager-select">
                            <SelectValue placeholder={t('products.detail.selectField')} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableDefinitions.map((def) => (
                                <SelectItem key={def.id} value={def.id.toString()}>
                                    {def.label} ({def.field_type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        size="sm"
                        disabled={!selectedDefId || loading}
                        onClick={handleAttach}
                        data-testid="required-fields-manager-attach-button"
                    >
                        <PlusCircle className="me-2 h-4 w-4" />
                        {t('products.detail.attachField')}
                    </Button>
                </div>
            )}
        </div>
    );
}
