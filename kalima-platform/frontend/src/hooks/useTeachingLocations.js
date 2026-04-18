import { useState, useCallback } from 'react';
import useApiMutation from './useApiMutation';
import axiosInstance from '../api/axios';

export function useTeachingLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const { mutate, loading: mutateLoading } = useApiMutation();

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await mutate({
                endpoint: '/profile/me/teaches-at',
                method: 'GET',
            });
            if (res?.data) {
                setLocations(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch teaching locations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addLocation = async (data) => {
        const res = await mutate({
            endpoint: '/profile/me/teaches-at',
            method: 'POST',
            data,
            defaultSuccessMessage: 'Location added',
        });
        if (res?.success) {
            setLocations(prev => [...prev, res.data]);
            return true;
        }
        return false;
    };

    const updateLocation = async (id, data) => {
        const res = await mutate({
            endpoint: `/profile/me/teaches-at/${id}`,
            method: 'PATCH',
            data,
            defaultSuccessMessage: 'Location updated',
        });
        if (res?.success) {
            setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
            return true;
        }
        return false;
    };

    const deleteLocation = async (id) => {
        const res = await mutate({
            endpoint: `/profile/me/teaches-at/${id}`,
            method: 'DELETE',
            defaultSuccessMessage: 'Location deleted',
        });
        if (res?.success) {
            setLocations(prev => prev.filter(l => l.id !== id));
            return true;
        }
        return false;
    };

    return {
        locations,
        setLocations,
        loading: loading || mutateLoading,
        fetchLocations,
        addLocation,
        updateLocation,
        deleteLocation
    };
}
