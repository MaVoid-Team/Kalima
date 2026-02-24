import useApiMutation from '../useApiMutation';
import useAuth from './useAuth';

const useLogin = () => {
    const { loginSuccess } = useAuth();
    const { mutate, loading, error } = useApiMutation();

    const login = async (credentials) => {
        const data = await mutate({
            endpoint: '/auth/login',
            data: credentials,
            defaultSuccessMessage: 'Login successful!'
        });
        const { user, tokens, portalAccess } = data.data;
        loginSuccess(user, tokens, portalAccess);
        return data;
    };

    const loginWithFirebase = async (idToken) => {
        const data = await mutate({
            endpoint: '/auth/login/firebase',
            data: { idToken },
            defaultSuccessMessage: 'Login successful!'
        });
        const { user, tokens, portalAccess } = data.data || data;
        loginSuccess(user, tokens, portalAccess);
        return data;
    };

    return {
        login,
        loginWithFirebase,
        loading,
        error
    };
};

export default useLogin;
