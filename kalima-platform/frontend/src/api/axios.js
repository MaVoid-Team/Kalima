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

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
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
                    errorMessage = i18n.t('auth:errors.unauthorized');
                    // Optionally handle logout here if token expired
                    // localStorage.removeItem('accessToken');
                    // window.location.href = '/login'; 
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
