/**
 * Shared utility for authentication side-effects.
 */
export const performLocalLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};
