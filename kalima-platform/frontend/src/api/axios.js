import axios from 'axios';
import i18n from '../i18n';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v2';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshTokenPromise = null;

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const performLocalLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// Request Interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        // Skip refresh logic for auth endpoints
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh') || config.url?.includes('/auth/register')) {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        }

        let accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken) {
            const decodedToken = decodeToken(accessToken);
            // Check if token is expired or about to expire in less than 2 minutes (120 seconds)
            const currentTime = Date.now() / 1000;

            if (decodedToken && decodedToken.exp < currentTime + 120) {
                if (refreshToken) {
                    if (!refreshTokenPromise) {
                        refreshTokenPromise = axios.post(`${baseURL}/auth/refresh`, { refreshToken })
                            .then(response => {
                                const newTokens = response.data?.tokens || response.data?.data?.tokens;
                                if (newTokens && newTokens.accessToken) {
                                    localStorage.setItem('accessToken', newTokens.accessToken);
                                    if (newTokens.refreshToken) {
                                        localStorage.setItem('refreshToken', newTokens.refreshToken);
                                    }
                                    return newTokens.accessToken;
                                }
                                throw new Error('No access token returned');
                            })
                            .catch(error => {
                                performLocalLogout();
                                throw error;
                            })
                            .finally(() => {
                                refreshTokenPromise = null;
                            });
                    }

                    try {
                        accessToken = await refreshTokenPromise;
                    } catch (error) {
                        return Promise.reject(error);
                    }
                } else {
                    performLocalLogout();
                    return Promise.reject(new Error('Session expired'));
                }
            }

            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;
        let errorMessage = i18n.t('auth:errors.default');

        if (response) {
            switch (response.status) {
                case 400:
                    // Handle validation errors or bad requests
                    errorMessage = response.data.message || i18n.t('auth:validation.required'); // Fallback
                    break;
                case 401:
                    if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
                        errorMessage = i18n.t('auth:errors.invalid_credentials', 'Invalid email or password');
                    } else {
                        errorMessage = i18n.t('auth:errors.unauthorized');
                        // Final fallback logout if 401 occurs despite proactive refresh
                    }
                    break;
                case 403:
                    errorMessage = i18n.t('auth:errors.forbidden');
                    break;
                case 404:
                    errorMessage = response.data.message || i18n.t('auth:errors.default');
                    break;
                case 500:
                    errorMessage = i18n.t('auth:errors.server_error');
                    break;
                default:
                    errorMessage = response.data.message || errorMessage;
            }
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = i18n.t('auth:errors.network_error');
        }

        toast.error(errorMessage);
        return Promise.reject(error);
    }
);

export default axiosInstance;
