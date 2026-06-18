/**
 * Shared utility for authentication side-effects.
 */
export const performLocalLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('portalAccess');
    localStorage.removeItem('impersonationOriginalSession');
    localStorage.removeItem('impersonationSession');
    window.location.href = '/login';
};
