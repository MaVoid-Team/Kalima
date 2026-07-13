export interface OrderDeliveredEmailData {
  name: string;
  purchaseSerial: string;
  totalItems: number;
  productListHTML: string;
  ordersUrl?: string;
}

export function getOrderDeliveredEmailSubject(): string {
  return "تم تسليم طلبك";
}

export function getOrderDeliveredEmailHtml(data: OrderDeliveredEmailData): string {
  return `
<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>تم تسليم طلبك</title></head>
<body style="margin:0;padding:0;font-family:'IBM Plex Sans Arabic','Outfit','Segoe UI',Tahoma,sans-serif;background:#f8f8f8" dir="rtl"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td align="center" style="padding:20px 10px"><table role="presentation" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;background:#fff;border-radius:12px;box-shadow:0 12px 30px rgba(175,13,14,.08)"><tr><td style="padding:32px 40px 20px;text-align:center;background:#059669;border-radius:12px 12px 0 0"><img src="cid:kalima-logo" alt="Kalima" width="72" style="display:block;margin:0 auto 12px;height:auto" /><h1 style="margin:0;color:#fff;font-size:26px">تم تسليم طلبك</h1></td></tr><tr><td style="padding:32px 40px"><h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px">وصل طلبك، ${data.name}!</h2><p style="margin:0 0 12px;color:#4b5563;font-size:16px;line-height:1.8">تم تسليم طلبك رقم (<strong>${data.purchaseSerial}</strong>) بنجاح.</p><p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:1.8">الطلب يضم <strong>${data.totalItems}</strong> منتجًا.</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:center;padding:10px;border-bottom:1px solid #e5e7eb;background:#fcfcfc">الرقم</th><th style="text-align:start;padding:10px;border-bottom:1px solid #e5e7eb;background:#fcfcfc">المنتج</th></tr></thead><tbody>${data.productListHTML}</tbody></table>${data.ordersUrl ? `<div style="text-align:center;margin:24px 0"><a href="${data.ordersUrl}" style="display:inline-block;padding:12px 24px;background:#af0d0e;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">عرض الطلب</a></div>` : ""}<p style="margin:16px 0 0;color:#1a1a1a;font-size:15px;line-height:1.8">مع أطيب التحيات،<br><strong>فريق كلمة</strong></p></td></tr><tr><td style="padding:24px 40px;background:#fcfcfc;border-radius:0 0 12px 12px;text-align:center"><p style="margin:0;color:#6b7280;font-size:12px">© ${new Date().getFullYear()} منصة كلمة. جميع الحقوق محفوظة.</p></td></tr></table></td></tr></table></body></html>`.trim();
}

export function getOrderDeliveredEmailText(data: OrderDeliveredEmailData): string {
  return `وصل طلبك، ${data.name}!\n\nتم تسليم طلبك رقم (${data.purchaseSerial}) بنجاح.\nالطلب يضم ${data.totalItems} منتجًا.${data.ordersUrl ? `\n\nعرض الطلب: ${data.ordersUrl}` : ""}\n\nمع أطيب التحيات،\nفريق كلمة`;
}
