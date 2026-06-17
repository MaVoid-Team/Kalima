import axios from '../api/axios';
import { toast } from 'sonner';
import i18n from '../i18n';
import { useAdministrationGeneralSettings } from '../hooks/useAdministrationGeneralSettings';

/**
 * Vault of WhatsApp messages for different scenarios.
 */
export const WHATSAPP_MESSAGES = {
    PRODUCT_QUERY: (title, serial, price, url) => {
        const lines = [
            i18n.t('common:whatsapp.productQueryHeader', 'مرحباً، أود الاستفسار عن المنتج:'),
            `${title}`,
            serial ? `${i18n.t('product:info.sku', 'الرقم المسلسل')}: ${serial}` : null,
            `${i18n.t('product:info.totalPrice', 'السعر')}: ${price} ${i18n.t('product:info.currency', 'جم')}`,
            `${i18n.t('common:whatsapp.link', 'الرابط')}: ${url}`
        ].filter(Boolean);
        return lines.join('\n');
    },

    CART_CHECKOUT: (total, itemsCount) => {
        const lines = [
            i18n.t('common:whatsapp.cartCheckoutHeader', 'مرحباً، أود إتمام الطلب الخاص بي.'),
            `${i18n.t('cart:orderSummary.itemsCount', 'عدد المنتجات')}: ${itemsCount}`,
            `${i18n.t('cart:total', 'الإجمالي')}: ${total} ${i18n.t('cart:L.E', 'جم')}`
        ];
        return lines.join('\n');
    },

    GENERAL_QUERY: () => i18n.t('common:whatsapp.generalQuery', 'مرحباً، لدي استفسار بخصوص المنصة.')
};

/**
 * Builds a WhatsApp link with an automated message.
 * @param {string} phone - The phone number to contact
 * @param {string} message - The message to send
 * @returns {string} The full WhatsApp URL with encoded message
 */
export function buildWhatsAppLink(phone, message = '') {
    if (!phone) return '#';

    // Remove '+' and spaces/dashes from phone number
    const formattedPhone = phone.replace(/[\s+-]/g, '');

    if (!message) {
        return `https://wa.me/${formattedPhone}`;
    }

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}



/**
 * Custom hook to handle the logic of fetching the number, building the message, and opening WhatsApp.
 * @returns {Object} { handleWhatsAppContact, loading }
 */
export function useWhatsAppContact() {
    const { getAdminWhatsAppNumber, loading } = useAdministrationGeneralSettings();

    const handleWhatsAppContact = async (type, data = {}) => {
        const number = await getAdminWhatsAppNumber();
        if (!number) return; // Halt if no number was fetched

        let message = '';

        switch (type) {
            case 'product':
                message = WHATSAPP_MESSAGES.PRODUCT_QUERY(data.title, data.serial, data.price, data.url);
                break;
            case 'cart':
                message = WHATSAPP_MESSAGES.CART_CHECKOUT(data.total, data.itemsCount);
                break;
            case 'footer':
            default:
                message = WHATSAPP_MESSAGES.GENERAL_QUERY();
        }

        const link = buildWhatsAppLink(number, message);
        if (link !== '#') {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    };

    return { handleWhatsAppContact, loading };
}

