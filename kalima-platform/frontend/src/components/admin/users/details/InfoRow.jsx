import React from 'react';
import { useTranslation } from 'react-i18next';

const InfoRow = ({ icon: Icon, label, value, dir = 'auto' }) => {
    const { i18n } = useTranslation();

    return (
        <div className="flex items-start gap-3 py-2">
            <Icon className={`h-4 w-4 text-muted-foreground mt-0.5 shrink-0 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground leading-none mb-1">
                    {label}
                </p>
                <p className="text-sm font-medium break-words" dir={dir}>
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

export default InfoRow;
