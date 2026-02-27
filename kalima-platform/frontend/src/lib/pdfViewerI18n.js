import i18n from '@/i18n';

function getPdfViewerTranslations(lang) {
    const normalizedLang = lang?.startsWith('ar') ? 'ar' : 'en';
    return i18n.getResourceBundle(normalizedLang, 'PDFViewer') || {};
}

export function getPdfViewerI18nConfig(language) {
    const preferredLanguage = language?.startsWith('ar') ? 'ar' : 'en';

    return {
        defaultLocale: preferredLanguage,
        fallbackLocale: 'en',
        locales: [
            {
                code: 'en',
                name: 'English',
                translations: getPdfViewerTranslations('en'),
            },
            {
                code: 'ar',
                name: 'العربية',
                translations: getPdfViewerTranslations('ar'),
            },
        ],
    };
}
