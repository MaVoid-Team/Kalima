import { createContext, useState, useEffect } from 'react';
import { performLocalLogout } from '../lib/authUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

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
        }
        setLoading(false);
    }, []);

    const loginSuccess = (userData, tokens) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    };

    const logout = () => {
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
