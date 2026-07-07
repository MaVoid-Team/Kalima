import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
    .use(resourcesToBackend((language, namespace) =>
        import(`./locales/${language}/${namespace}.json`)
    ))
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'ar'],
        debug: false,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        ns: ['common', 'landing'],
        defaultNS: 'landing',

        detection: {
            order: ['queryString', 'cookie', 'localStorage', 'navigator'],
            caches: ['localStorage', 'cookie'],
        }
    });

export default i18n;
