import { toast } from "sonner";

// Success toast
export const showSuccess = (message) => {
  toast.success(message);
};

// Error toast
export const showError = (message) => {
  toast.error(message);
};

// Warning toast
export const showWarning = (message) => {
  toast.warning(message);
};

// Info toast
export const showInfo = (message) => {
  toast.info(message);
};

// Replace native alert with toast
export const showAlert = (message) => {
  toast(message);
};

export { toast };
