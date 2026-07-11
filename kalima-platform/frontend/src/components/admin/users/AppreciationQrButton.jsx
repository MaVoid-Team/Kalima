import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';

import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';

function resolvePublicUrl(publicUrl) {
    if (!publicUrl) {
        return '';
    }

    if (/^https?:\/\//i.test(publicUrl)) {
        return publicUrl;
    }

    return `${window.location.origin}${publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`}`;
}

function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }

            reject(new Error('Unable to create QR image'));
        }, 'image/png');
    });
}

function waitForRenderedQrCanvas(canvasRef, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
        const deadline = performance.now() + timeoutMs;

        const checkCanvas = () => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');

            if (canvas && context && canvas.width > 0 && canvas.height > 0) {
                const [, , , alpha] = context.getImageData(0, 0, 1, 1).data;
                if (alpha > 0) {
                    resolve(canvas);
                    return;
                }
            }

            if (performance.now() >= deadline) {
                reject(new Error('QR canvas did not render before copy'));
                return;
            }

            requestAnimationFrame(checkCanvas);
        };

        requestAnimationFrame(checkCanvas);
    });
}

export default function AppreciationQrButton({ userId }) {
    const { t } = useTranslation('userManagement');
    const canvasRef = useRef(null);
    const [publicUrl, setPublicUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);

        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/appreciation-page`);
            const nextPublicUrl = resolvePublicUrl(response.data?.data?.publicUrl);
            if (!nextPublicUrl) {
                throw new Error('Appreciation page URL was not returned');
            }

            setPublicUrl(nextPublicUrl);
            const canvas = await waitForRenderedQrCanvas(canvasRef);

            if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
                throw new Error('Image clipboard is unavailable');
            }

            const blob = await canvasToBlob(canvas);
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
            ]);
            toast.success(t('actions.appreciationQrCopied'));
        } catch (error) {
            toast.error(t('actions.appreciationQrError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={handleGenerate}
                disabled={loading}
                title={t('actions.appreciationQr')}
                aria-label={t('actions.appreciationQr')}
                data-testid={`users-table-appreciation-qr-${userId}`}
            >
                <QrCode className="h-4 w-4" />
            </Button>
            {publicUrl && (
                <QRCodeCanvas
                    ref={canvasRef}
                    value={publicUrl}
                    size={512}
                    level="H"
                    includeMargin
                    style={{ left: '-9999px', opacity: 0, pointerEvents: 'none', position: 'fixed', top: 0 }}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
