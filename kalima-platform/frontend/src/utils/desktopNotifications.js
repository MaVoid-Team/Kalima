const DESKTOP_NOTIFICATION_ICON = '/Kalima.jpg';

const isLocalhost = () => {
    if (typeof window === 'undefined') return false;
    return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
};

export const getDesktopNotificationState = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return {
            supported: false,
            permission: 'unsupported',
            canRequest: false,
            enabled: false
        };
    }

    if (!window.isSecureContext && !isLocalhost()) {
        return {
            supported: false,
            permission: 'unsupported',
            canRequest: false,
            enabled: false
        };
    }

    const permission = window.Notification.permission;

    return {
        supported: true,
        permission,
        canRequest: permission === 'default',
        enabled: permission === 'granted'
    };
};

export const requestDesktopNotificationPermission = async () => {
    const state = getDesktopNotificationState();

    if (!state.supported || !state.canRequest) {
        return state.permission;
    }

    if (typeof window.Notification.requestPermission !== 'function') {
        return 'unsupported';
    }

    try {
        const permission = await window.Notification.requestPermission();
        return permission || window.Notification.permission;
    } catch (error) {
        console.error('Failed to request desktop notification permission:', error);
        return getDesktopNotificationState().permission;
    }
};

export const showDesktopNotification = ({
    title,
    body,
    url,
    tag
}) => {
    const state = getDesktopNotificationState();

    if (!state.enabled) return null;

    let notification;

    try {
        notification = new window.Notification(title, {
            body,
            icon: DESKTOP_NOTIFICATION_ICON,
            badge: DESKTOP_NOTIFICATION_ICON,
            tag,
            renotify: false
        });
    } catch (error) {
        console.error('Failed to show desktop notification:', error);
        return null;
    }

    notification.onclick = () => {
        window.focus();

        if (url) {
            window.location.assign(url);
        }

        notification.close();
    };

    return notification;
};
