import { useTranslation } from "react-i18next";

export default function ContactInformation() {
    const { t } = useTranslation('checkout');

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">{t('contact.title')}</h2>
                <a href="#" className="text-primary text-sm hover:underline">{t('contact.login')}</a>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t('contact.email_label')}
                </label>
                <input
                    type="email"
                    placeholder={t('contact.email_placeholder')}
                    className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
                />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border border-border rounded cursor-pointer accent-primary" />
                <span className="text-sm text-muted-foreground">{t('contact.news_offers')}</span>
            </label>
        </div>
    );
}
