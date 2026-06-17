import { useState, useCallback } from 'react';
import useApiMutation from './useApiMutation';
import axiosInstance from '../api/axios';

export function useSocialMedia() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const { mutate, loading: mutateLoading } = useApiMutation();

    const fetchSocialMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await mutate({
                endpoint: '/profile/me/social-media',
                method: 'GET',
            });
            if (res?.data) {
                setLinks(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch social media links:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addLink = async (data) => {
        const res = await mutate({
            endpoint: '/profile/me/social-media',
            method: 'POST',
            data,
            defaultSuccessMessage: 'Social media added',
        });
        if (res?.success) {
            setLinks(prev => [...prev, res.data]);
            return true;
        }
        return false;
    };

    const updateLink = async (id, data) => {
        const res = await mutate({
            endpoint: `/profile/me/social-media/${id}`,
            method: 'PATCH',
            data,
            defaultSuccessMessage: 'Social media updated',
        });
        if (res?.success) {
            setLinks(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
            return true;
        }
        return false;
    };

    const deleteLink = async (id) => {
        const res = await mutate({
            endpoint: `/profile/me/social-media/${id}`,
            method: 'DELETE',
            defaultSuccessMessage: 'Removed',
        });
        if (res?.success) {
            setLinks(prev => prev.filter(l => l.id !== id));
            return true;
        }
        return false;
    };

    return {
        links,
        setLinks,
        loading: loading || mutateLoading,
        fetchSocialMedia,
        addLink,
        updateLink,
        deleteLink
    };
}
