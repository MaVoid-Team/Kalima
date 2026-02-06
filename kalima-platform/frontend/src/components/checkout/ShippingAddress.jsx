import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ShippingAddress() {
    const { t } = useTranslation('checkout');

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">{t('shipping.title')}</h2>

            <div className="mb-4">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t('shipping.country_label')}
                </label>
                <div className="relative">
                    <select className="w-full px-4 py-3 pr-10 border border-border rounded-md text-sm bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Australia</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-medium text-primary uppercase tracking-wide mb-2">{t('shipping.first_name')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-primary uppercase tracking-wide mb-2">{t('shipping.last_name')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-medium text-primary uppercase tracking-wide mb-2">{t('shipping.address_label')}</label>
                <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t('shipping.apartment_placeholder')}
                    className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('shipping.city')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('shipping.state')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('shipping.zip_code')}</label>
                    <input type="text" className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
            </div>
        </div>
    );
}
