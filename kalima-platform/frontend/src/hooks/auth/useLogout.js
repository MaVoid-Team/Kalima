import { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'sonner';

const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const performLocalLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // If AuthContext handles this, standardizing a hard reload or redirect may be enough,
        // but typically you'd dispatch an action or rely on context to clear state.
        window.location.href = '/login';
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await axios.post('/auth/logout', { refreshToken });
            }
            performLocalLogout();
        } catch (err) {
            setError(err);
            performLocalLogout(); // Force logout even if the API call fails
        } finally {
            setLoading(false);
        }
    };

    const logoutAll = async () => {
        setLoading(true);
        setError(null);
        try {
            // Note: the backend docs don't specify sending the refresh token for logout-all, 
            // but the user must be authenticated.
            await axios.post('/auth/logout-all');
            performLocalLogout();
            toast.success('Logged out from all devices');
        } catch (err) {
            setError(err);
            performLocalLogout();
        } finally {
            setLoading(false);
        }
    };

    return {
        logout,
        logoutAll,
        loading,
        error
    };
};

export default useLogout;
