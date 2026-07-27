import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const openWhatsAppDraft = ({ phone, message, openWindow = window.open }) => {
  const parsedPhone = parsePhoneNumberFromString(String(phone), 'EG');
  if (!parsedPhone?.isValid()) return false;

  const whatsappPhone = parsedPhone.number.replace(/^\+/, '');
  const href = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
  openWindow(href, '_blank', 'noopener,noreferrer');
  return true;
};
