import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import i18n from "../i18n";
import backendMessageTranslator from "../locales/backendMessageTranslator.json";

const anomalies = {
  "Role Parent on portal store assigned to user ": "تم تعيين دور ولي الأمر في بوابة المتجر للمستخدم ",
  "Role Parent on portal store revoked from user ": "تم إلغاء تعيين دور ولي الأمر في بوابة المتجر للمستخدم ",
  "Role Student on portal store assigned to user ": "تم تعيين دور الطالب في بوابة المتجر للمستخدم ",
  "Role Student on portal store revoked from user ": "تم إلغاء تعيين دور الطالب في بوابة المتجر للمستخدم ",
  "Role Admin on portal store assigned to user ": "تم تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role Admin on portal store revoked from user ": "تم إلغاء تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role SubAdmin on portal store assigned to user ": "تم تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role SubAdmin on portal store revoked from user ": "تم إلغاء تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role Teacher on portal store assigned to user ": "تم تعيين دور المعلم في بوابة المتجر للمستخدم ",
  "Role Teacher on portal store revoked from user ": "تم إلغاء تعيين دور المعلم في بوابة المتجر للمستخدم ",
  "Role Lecturer on portal store assigned to user ": "تم تعيين دور المحاضر في بوابة المتجر للمستخدم ",
  "Role Lecturer on portal store revoked from user ": "تم إلغاء تعيين دور المحاضر في بوابة المتجر للمستخدم ",

  "Role Student on portal academy assigned to user ": "تم تعيين دور الطالب في بوابة المتجر للمستخدم ",
  "Role Student on portal academy revoked from user ": "تم إلغاء تعيين دور الطالب في بوابة المتجر للمستخدم ",
  "Role Parent on portal academy assigned to user ": "تم تعيين دور ولي الأمر في بوابة المتجر للمستخدم ",
  "Role Parent on portal academy revoked from user ": "تم إلغاء تعيين دور ولي الأمر في بوابة المتجر للمستخدم ",
  "Role Admin on portal academy assigned to user ": "تم تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role Admin on portal academy revoked from user ": "تم إلغاء تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role SubAdmin on portal academy assigned to user ": "تم تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role SubAdmin on portal academy revoked from user ": "تم إلغاء تعيين دور المسؤول في بوابة المتجر للمستخدم ",
  "Role Teacher on portal academy assigned to user ": "تم تعيين دور المعلم في بوابة المتجر للمستخدم ",
  "Role Teacher on portal academy revoked from user ": "تم إلغاء تعيين دور المعلم في بوابة المتجر للمستخدم ",
  "Role Lecturer on portal academy assigned to user ": "تم تعيين دور المحاضر في بوابة المتجر للمستخدم ",
  "Role Lecturer on portal academy revoked from user ": "تم إلغاء تعيين دور المحاضر في بوابة المتجر للمستخدم ",
}

function extractNumbers(message) {

  const numbers = message.match(/\d+/g);
  if (numbers) {
    return numbers;
  }
  return [];
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function translateBackendMessage(message) {
  if (!message) return message;

  const currentLang = i18n.language || 'en';

  if (currentLang === 'ar') {
    // in case that backend message contain numbers
    const matchingAnomaliesKey = Object.keys(anomalies).find(key => message.includes(key));

    if (matchingAnomaliesKey) {
      const numbers = extractNumbers(message);
      const newText = anomalies[matchingAnomaliesKey] + numbers[0];

      return newText;
    }
  }

  if (currentLang === 'ar' && backendMessageTranslator[message]) {

    return backendMessageTranslator[message];
  }

  return message;
}
