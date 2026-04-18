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
