import { useState } from 'react';
import axios from '../../api/axios';
import useAuth from './useAuth';
import { toast } from 'sonner';

const useLogin = () => {
    const { loginSuccess } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/login', credentials);
            const { user, tokens } = response.data.data;

            loginSuccess(user, tokens);
            toast.success('Login successful!');
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        loading,
        error
    };
};

export default useLogin;
