import { useState, useEffect } from 'react';
import useLinkAccounts from '@/hooks/auth/useLinkAccounts';

export const useAccountProviders = () => {
    const [linkedProviders, setLinkedProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getLinkedProviders } = useLinkAccounts();

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const providers = await getLinkedProviders();
            setLinkedProviders(providers);
        } catch (error) {
            // Error handled by hook
        } finally {
            setLoading(false);
        }
    };

    const refreshProviders = () => {
        fetchProviders();
    };

    // Check if user has OAuth providers (not local)
    const hasOAuthProviders = linkedProviders.some(p => p.provider !== 'local');
    const hasLocalProvider = linkedProviders.some(p => p.provider === 'local');
    const hasFirebaseProvider = linkedProviders.some(p => p.provider === 'firebase');

    return {
        linkedProviders,
        loading,
        refreshProviders,
        hasOAuthProviders,
        hasLocalProvider,
        hasFirebaseProvider
    };
};
