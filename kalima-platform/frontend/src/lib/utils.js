import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import i18n from "../i18n";
import backendMessageTranslator from "../../locales/backendMessageTranslator.json";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function translateBackendMessage(message) {
  if (!message) return message;
  
  const currentLang = i18n.language || 'en';
  
  if (currentLang === 'ar' && backendMessageTranslator[message]) {
    return backendMessageTranslator[message];
  }
  
  return message;
}
