/**
 * Builds a WhatsApp link with an automated message template.
 * @param {string} phone - The phone number to contact
 * @param {object} product - The product details object
 * @returns {string} The full WhatsApp URL with encoded message
 */
export function buildWhatsAppLink(phone, product) {
    if (!phone) return '#';
    
    // Remove '+' and spaces/dashes from phone number
    const formattedPhone = phone.replace(/[\s+-]/g, '');
    
    if (!product) {
        return `https://wa.me/${formattedPhone}`;
    }

    const priceText = product.price_after_discount 
        ? `${product.price_after_discount} EGP (discounted from ${product.price} EGP)` 
        : `${product.price} EGP`;

    const message = `Hello, I am interested in the following product:
Product Name: ${product.title}
${product.serial ? `Serial: ${product.serial}\n` : ''}Price: ${priceText}
URL: ${window.location.href}

Can you please provide more information?`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}
