import { createContext, useState, useEffect } from 'react';
import { performLocalLogout } from '../lib/authUtils';

const AuthContext = createContext(null);

const DEV_AUTH_BYPASS_USER = {
    id: 1,
    name: 'Local Admin',
    email: 'admin@kalima.local',
    role: 'Admin',
    roles: [
        { portal: 'store', role: 'Admin' },
        { portal: 'academy', role: 'Admin' },
        { portal: 'store', role: 'Teacher' },
        { portal: 'store', role: 'Student' },
    ],
    is_email_verified: true,
    confirmed: true,
};

const DEV_AUTH_BYPASS_PORTAL_ACCESS = {
    store: { hasAccess: true, roles: ['Admin', 'Teacher', 'Student'] },
    academy: { hasAccess: true, roles: ['Admin', 'Teacher', 'Student'] },
};

const DEV_AUTH_BYPASS_TOKEN = 'local-dev-bypass-token';

const isDevAuthBypassActive = () => {
    if (!import.meta.env.DEV) {
        return false;
    }
    return import.meta.env.VITE_DEV_BYPASS_AUTH !== 'false';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        const explicitLogout = localStorage.getItem('dev_auth_logged_out') === 'true';

        if (storedUser && accessToken) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to parse user from local storage", error);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        } else if (isDevAuthBypassActive() && !explicitLogout) {
            setUser(DEV_AUTH_BYPASS_USER);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(DEV_AUTH_BYPASS_USER));
            localStorage.setItem('accessToken', DEV_AUTH_BYPASS_TOKEN);
            localStorage.setItem('portalAccess', JSON.stringify(DEV_AUTH_BYPASS_PORTAL_ACCESS));
        }
        setLoading(false);
    }, []);

    const loginSuccess = (userData, tokens, portalAccess) => {
        localStorage.removeItem('dev_auth_logged_out');
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        if (portalAccess) {
            localStorage.setItem('portalAccess', JSON.stringify(portalAccess));
        }
    };

    const logout = () => {
        if (isDevAuthBypassActive()) {
            localStorage.setItem('dev_auth_logged_out', 'true');
        }
        setUser(null);
        setIsAuthenticated(false);
        performLocalLogout();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            loginSuccess,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
