/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { ImageOff } from "lucide-react";
import { getImageUrl } from "@/lib/storeUtils";

export default function PaymentMethod({ getPaymentMethods, selectedId, onSelect,
    numberTransferredFrom, setNumberTransferredFrom,
    notes, setNotes,
    screenshotFile, setScreenshotFile }) {
    const { t, i18n } = useTranslation('checkout');
    const [methods, setMethods] = useState([]);
    const fileInputRef = useRef(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (screenshotFile) {
            const url = URL.createObjectURL(screenshotFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl('');
        }
    }, [screenshotFile]);

    useEffect(() => {
        getPaymentMethods().then(setMethods).catch(console.error);
    }, [getPaymentMethods]);

    const safeMethods = Array.isArray(methods) ? methods : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('payment.title')}</CardTitle>
                <CardDescription>{t('payment.secureNotice')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <Label htmlFor="transfer-screenshot" className="text-xs uppercase tracking-wide">
                        {t('payment.chooseMethod')}
                        <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                        value={selectedId?.toString()}
                        onValueChange={val => onSelect && onSelect(Number(val))}
                        className="grid gap-4"
                        dir={i18n.dir()}
                    >
                        {safeMethods.map(m => (
                            <div key={m.id} className="border rounded-md overflow-hidden">
                                <div className="flex justify-between items-center p-4">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem
                                            value={m.id.toString()}
                                            id={`pm-${m.id}`}
                                            data-testid={`checkout-payment-method-${m.id}`}
                                        />
                                        <Label htmlFor={`pm-${m.id}`} className="font-medium cursor-pointer">
                                            {m.name}
                                        </Label>
                                    </div>
                                    {m?.image_url && (
                                        <img
                                            src={getImageUrl(m.image_url) || ''}
                                            alt={m.name}
                                            className="w-8 h-8 object-contain"
                                        />
                                    )}
                                </div>
                                {m.phone_number && (
                                    <div className="p-4 bg-muted/30 border-t border-border text-xs text-muted-foreground">
                                        {t('payment.phone')}: {m.phone_number}
                                    </div>
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {/* bank transfer inputs */}
                <div className="grid gap-4 mt-6">
                    <div className="grid gap-2">
                        <Label htmlFor="transfer-number" className="text-xs uppercase tracking-wide">
                            {t('payment.transferNumber')}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="transfer-number"
                            type="text"
                            value={numberTransferredFrom}
                            onChange={e => setNumberTransferredFrom(e.target.value)}
                            className="w-full"
                            data-testid="checkout-payment-method-transfer-number"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="transfer-notes" className="text-xs uppercase tracking-wide">
                            {t('payment.notes')}
                        </Label>
                        <Textarea
                            id="transfer-notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="input w-full h-20 resize-none"
                            data-testid="checkout-payment-method-notes"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase tracking-wide flex items-center justify-between">
                            {t('payment.screenshot')}
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            {screenshotFile ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="text-sm underline text-primary"
                                        onClick={() => setShowPreview(true)}
                                        data-testid="checkout-payment-method-preview-button"
                                    >
                                        {screenshotFile.name}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-destructive"
                                        onClick={() => {
                                            setScreenshotFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        aria-label={t('payment.removeScreenshot', 'Remove screenshot')}
                                        data-testid="checkout-payment-method-remove-button"
                                    >
                                        &times;
                                    </Button>
                                </>
                            ) : (
                                <Label
                                    htmlFor="transfer-screenshot"
                                    className="cursor-pointer px-3 py-1 bg-accent text-accent-foreground rounded-sm text-sm"
                                    data-testid="checkout-payment-method-upload-button"
                                >
                                    {t('payment.uploadScreenshotButton', 'Upload image')}
                                </Label>
                            )}
                        </div>
                        {/* hidden input used for selecting file */}
                        <Input
                            id="transfer-screenshot"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setScreenshotFile(file);
                                }
                            }}
                            data-testid="checkout-payment-method-file-input"
                        />
                    </div>
                </div>
            </CardContent>
            {/* preview dialog */}
            <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
                <AlertDialogContent>
                    {previewUrl ? <img src={previewUrl} alt={t('payment.preview', 'Screenshot preview')} className="w-full h-auto" /> : <ImageOff className="w-16 h-16 text-muted-foreground mx-auto my-8" />}
                    <AlertDialogFooter>
                        <Button variant="destructive" onClick={() => { setScreenshotFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} data-testid="checkout-payment-method-dialog-remove-button">
                            {t('payment.removeScreenshot', 'Remove')}
                        </Button>
                        <AlertDialogCancel data-testid="checkout-payment-method-dialog-cancel-button">{t('payment.cancel', 'Cancel')}</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
