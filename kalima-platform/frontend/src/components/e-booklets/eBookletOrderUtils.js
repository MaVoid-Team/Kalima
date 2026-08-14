import { getEBookletDisplayTitle } from "@/utils/eBookletTitleUtils";

export const E_BOOKLET_ORDER_TRACKING_WHATSAPP_NUMBER = "201044067113";

export const E_BOOKLET_ORDER_STATUS_TONES = {
  pending: "bg-highlight/10 text-highlight border-highlight/50",
  awaiting_payment: "bg-highlight/10 text-highlight border-highlight/50",
  paid: "bg-primary/20 text-primary border-primary/50",
  needs_branding_info: "bg-amber-500/10 text-amber-700 border-amber-500/40",
  customization_in_progress: "bg-amber-500/10 text-amber-700 border-amber-500/40",
  ready: "bg-success/20 text-success border-success/50",
  delivered: "bg-success/20 text-success border-success/50",
  rejected: "bg-destructive/20 text-destructive border-destructive/50",
  cancelled: "bg-muted/40 text-muted-foreground border-muted",
  unknown: "bg-muted/20 text-muted-foreground border-muted",
};

const KNOWN_STATUSES = new Set(Object.keys(E_BOOKLET_ORDER_STATUS_TONES));

export const getEBookletOrderReference = (order) => (
  order?.purchase_serial || order?.serial || order?.reference || `#${order?.id}`
);

export const getEBookletOrderStatus = (value) => {
  const status = String(value || "unknown").toLowerCase();
  return KNOWN_STATUSES.has(status) ? status : "unknown";
};

export const getEBookletOrderLinks = (order) => {
  if (Array.isArray(order?.instances) && order.instances.length > 0) {
    return order.instances.map((instance) => ({
      id: `instance-${instance.id}`,
      status: instance.status || order?.status,
      booklet_instance: instance,
      template: instance.template || order?.template,
      template_version: instance.template_version || order?.template_version,
    }));
  }

  if (Array.isArray(order?.e_booklet_student_purchase_links) && order.e_booklet_student_purchase_links.length > 0) {
    return order.e_booklet_student_purchase_links;
  }

  return [{
    id: `purchase-${order?.id}`,
    status: order?.status,
    template: order?.template,
    template_version: order?.template_version,
    booklet_instance: null,
  }];
};

export const getEBookletOrderTitle = (link, fallback) => (
  getEBookletDisplayTitle(link, fallback)
);

export const getEBookletOrderManagementPath = (link) => {
  const instanceId = link?.booklet_instance?.id || link?.booklet_instance_id || link?.instance_id;
  return instanceId ? `/teacher/e-booklets/${instanceId}/invites` : "/teacher/e-booklets";
};

export const canManageEBookletOrder = (status, link) => {
  const orderStatus = getEBookletOrderStatus(status);
  const linkStatus = getEBookletOrderStatus(link?.status);
  const instanceId = link?.booklet_instance?.id || link?.booklet_instance_id || link?.instance_id;
  return Boolean(instanceId) && (
    ["ready", "delivered"].includes(orderStatus) ||
    ["ready", "delivered"].includes(linkStatus)
  );
};

export const getEBookletOrderAmount = (order) => {
  if (order?.final_payable_price !== null && order?.final_payable_price !== undefined) return order.final_payable_price;
  if (Number(order?.price) > 0) return order.price;
  return order?.marketing_price ?? order?.student_marketing_price ?? order?.total ?? order?.price ?? 0;
};

export const getEBookletOrderCurrency = (order) => order?.currency || "EGP";

export const getEBookletOrderPaymentScreenshot = (order) => (
  order?.payment_screenshot?.url || order?.payment_screenshot_url || order?.paymentScreenshotUrl || null
);
