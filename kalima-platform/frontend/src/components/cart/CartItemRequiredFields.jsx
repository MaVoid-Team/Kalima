import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash, ImageOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';

export default function CartItemRequiredFields({
    item,
    baseURL,
    updateCartItemRequiredFields,
    updateCartItemRequiredFieldsImage,
    onOpenChange
}) {
    const { t } = useTranslation('cart');
    const [isOpen, setIsOpen] = useState(true);
    const [fieldValues, setFieldValues] = useState({});
    const [imageFields, setImageFields] = useState({});
    const [originalImages, setOriginalImages] = useState({});
    const [fileErrors, setFileErrors] = useState({});
    const [brokenPreviews, setBrokenPreviews] = useState({});

    useEffect(() => {
        if (!item || !isOpen) return;
        const vals = {};
        const origImgs = {};
        const imgFields = {};

        item.cart_item_required_fields.forEach(rf => {
            if (rf.required_field_definitions.field_type === 'image') {
                const serverUrl = rf.value ? new URL(rf.value, baseURL).toString() : '';
                vals[rf.field_definition_id] = serverUrl;
                if (serverUrl) {
                    origImgs[rf.field_definition_id] = serverUrl;
                }
                imgFields[rf.field_definition_id] = null;
            } else {
                vals[rf.field_definition_id] = rf.value || '';
            }
        });
        setFieldValues(prev => ({ ...vals, ...prev }));
        setOriginalImages(prev => ({ ...origImgs, ...prev }));
        setImageFields(prev => ({ ...imgFields, ...prev }));
    }, [item, isOpen, baseURL]);

    const handleCartRequiredFieldsSubmit = async (e) => {
        e.preventDefault();
        let hasError = false;
        const errors = {};

        item.cart_item_required_fields.forEach(rf => {
            if (
                rf.required_field_definitions.field_type === 'image' &&
                rf.is_required &&
                !(imageFields[rf.field_definition_id] instanceof File)
            ) {
                hasError = true;
                errors[rf.field_definition_id] = t('pleaseSelectFile', 'Please select a file');
            }
        });

        if (hasError) {
            setFileErrors(errors);
            return;
        }

        setFileErrors({});

        const activeImageFieldDefIds = [];
        const imagePromises = [];
        for (const rf of item.cart_item_required_fields) {
            if (rf.required_field_definitions.field_type === 'image') {
                const file = imageFields[rf.field_definition_id];
                if (file instanceof File) {
                    activeImageFieldDefIds.push(rf.field_definition_id);
                    const p = updateCartItemRequiredFieldsImage(
                        item.id,
                        rf.field_definition_id,
                        file
                    ).then(() => {
                        setImageFields(prev => ({ ...prev, [rf.field_definition_id]: null }));
                        setOriginalImages(prev => {
                            const copy = { ...prev };
                            delete copy[rf.field_definition_id];
                            return copy;
                        });
                        setFieldValues(prev => ({ ...prev, [rf.field_definition_id]: '' }));
                        const inputEl = document.getElementById(`file-${item.id}-${rf.field_definition_id}`);
                        if (inputEl) inputEl.value = '';
                    }).catch(err => {
                        console.error('Required fields image update failed:', err);
                        throw err;
                    });
                    imagePromises.push(p);
                }
            }
        }

        try {
            await Promise.all(imagePromises);
        } catch (err) {
            // ignore
        }

        const data = Object.entries(fieldValues)
            .filter(([id]) => {
                return !(imageFields[id] instanceof File) && !activeImageFieldDefIds.includes(Number(id));
            })
            .map(([id, value]) => ({
                required_field_definition_id: Number(id),
                value,
            }));

        try {
            if (data.length > 0) {
                await updateCartItemRequiredFields(item.id, data);
            }
        } catch (e) {
            console.error('failed updating required fields', e);
        }
    };

    if (!item.cart_item_required_fields || item.cart_item_required_fields.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 overflow-x-hidden">
            <Accordion
                type="single"
                collapsible
                defaultValue="fields"
                className="w-full mb-2 overflow-x-hidden"
                onValueChange={val => {
                    const open = !!val;
                    setIsOpen(open);
                    onOpenChange?.(item.id, open);
                }}
            >
                <AccordionItem value="fields">
                    <AccordionTrigger className={"text-sm " + (item.required_fields_filled ? "text-success" : "text-primary")}>
                        {isOpen ? t('hideRequiredFields', 'Hide required fields') : t('viewRequiredFields', 'View required fields')}
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-2 p-2 border rounded overflow-x-hidden min-w-0 w-full box-border max-w-full">
                        <form onSubmit={handleCartRequiredFieldsSubmit} className='flex flex-col gap-2 w-full max-w-full overflow-x-hidden'>
                            {item.cart_item_required_fields.map(rf => (
                                <div key={rf.field_definition_id} className="flex flex-col">
                                    <label className="text-xs font-medium mb-1">
                                        {rf.required_field_definitions.label}
                                        <span className="text-destructive">{rf.is_required ? ' *' : ''}</span>
                                    </label>
                                    {rf.required_field_definitions.field_type === 'image' ? (
                                        <>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <label
                                                    htmlFor={`file-${item.id}-${rf.field_definition_id}`}
                                                    className="cursor-pointer px-3 py-1 bg-accent text-accent-foreground rounded-sm text-sm"
                                                >
                                                    {originalImages[rf.field_definition_id]
                                                        ? t('replaceImage', 'Replace image')
                                                        : t('uploadImage', 'Upload image')}
                                                </label>
                                                <Input
                                                    id={`file-${item.id}-${rf.field_definition_id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setImageFields(prev => ({
                                                                ...prev,
                                                                [rf.field_definition_id]: file,
                                                            }));
                                                            const url = URL.createObjectURL(file);
                                                            setFieldValues(prev => ({
                                                                ...prev,
                                                                [rf.field_definition_id]: url,
                                                            }));
                                                            setFileErrors(prev => {
                                                                const copy = { ...prev };
                                                                delete copy[rf.field_definition_id];
                                                                return copy;
                                                            });
                                                            setBrokenPreviews(prev => {
                                                                const copy = { ...prev };
                                                                delete copy[`${rf.field_definition_id}_new`];
                                                                return copy;
                                                            });
                                                        }
                                                    }}
                                                    className="sr-only"
                                                />
                                                {imageFields[rf.field_definition_id] ? (
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-sm max-w-40 truncate block" title={imageFields[rf.field_definition_id].name}>
                                                            {imageFields[rf.field_definition_id].name}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setImageFields(prev => ({
                                                                    ...prev,
                                                                    [rf.field_definition_id]: null,
                                                                }));
                                                                setFieldValues(prev => ({
                                                                    ...prev,
                                                                    [rf.field_definition_id]: originalImages[rf.field_definition_id] || '',
                                                                }));
                                                                const inputEl = document.getElementById(
                                                                    `file-${item.id}-${rf.field_definition_id}`
                                                                );
                                                                if (inputEl) inputEl.value = '';
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            <Trash className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : null}
                                                {fileErrors[rf.field_definition_id] && (
                                                    <p className="text-destructive text-xs mt-1">
                                                        {fileErrors[rf.field_definition_id]}
                                                    </p>
                                                )}
                                            </div>
                                            {
                                                (() => {
                                                    const originalUrl = originalImages[rf.field_definition_id];
                                                    const hasSelectedFile = !!(imageFields[rf.field_definition_id] instanceof File);
                                                    const selectedUrl = fieldValues[rf.field_definition_id];

                                                    const brokenOld = !!brokenPreviews[`${rf.field_definition_id}_old`];
                                                    const brokenNew = !!brokenPreviews[`${rf.field_definition_id}_new`];

                                                    if (originalUrl && hasSelectedFile) {
                                                        return (
                                                            <div className="mt-2 flex flex-wrap items-center gap-3 max-w-full min-w-0">
                                                                <div className="w-20 h-20 overflow-hidden rounded bg-muted border shrink-0">
                                                                    {!brokenOld ? (
                                                                        <img
                                                                            src={originalUrl}
                                                                            alt={t('oldImage', 'Old image')}
                                                                            className="w-full h-full object-cover max-w-full"
                                                                            onError={() => setBrokenPreviews(prev => ({ ...prev, [`${rf.field_definition_id}_old`]: true }))}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                            <ImageOff className="w-6 h-6 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                                                <div className="w-20 h-20 overflow-hidden rounded bg-muted border shrink-0">
                                                                    {!brokenNew ? (
                                                                        <img
                                                                            src={selectedUrl}
                                                                            alt={t('newImage', 'New image')}
                                                                            className="w-full h-full object-cover max-w-full"
                                                                            onError={() => setBrokenPreviews(prev => ({ ...prev, [`${rf.field_definition_id}_new`]: true }))}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                            <ImageOff className="w-6 h-6 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    const singleUrl = selectedUrl || originalUrl;
                                                    const singleBroken = selectedUrl ? brokenNew : brokenOld;
                                                    if (singleUrl && !singleBroken) {
                                                        return (
                                                            <img
                                                                src={singleUrl}
                                                                alt={t('preview', 'Preview')}
                                                                className="mt-2 w-24 max-w-full h-auto rounded"
                                                                style={{ display: 'block', maxWidth: '100%' }}
                                                                onError={() => {
                                                                    setBrokenPreviews(prev => ({ ...prev, [selectedUrl ? `${rf.field_definition_id}_new` : `${rf.field_definition_id}_old`]: true }));
                                                                }}
                                                            />
                                                        );
                                                    }

                                                    return (
                                                        <div className="mt-2 w-24 h-24 flex items-center justify-center bg-muted rounded">
                                                            <ImageOff className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                    );
                                                })()
                                            }
                                        </>
                                    ) : (
                                        <Input
                                            type={rf?.required_field_definitions?.field_type}
                                            value={fieldValues[rf.field_definition_id] || ''}
                                            required={rf?.is_required}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFieldValues(prev => ({
                                                    ...prev,
                                                    [rf.field_definition_id]: val,
                                                }));
                                            }}
                                            className="input-sm"
                                        />
                                    )}
                                </div>
                            ))}
                            <Button
                                size="sm"
                                type="submit"
                                className="w-fit self-end"
                            >
                                {t('save', 'Save')}
                            </Button>
                        </form>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
