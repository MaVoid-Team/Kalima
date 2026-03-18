import { useState, useEffect, useCallback } from 'react';
import useApiMutation from '@/hooks/useApiMutation';
import axiosInstance from '@/api/axios';

/**
 * Hook for managing parent-children relationships.
 * API: /api/v2/parent-children
 *
 * - GET  /parent-children      — list authenticated parent's children
 * - POST /parent-children      — link a student (parent sends only student_user_id)
 * - DELETE /parent-children/:id — unlink a student relationship
 */
export function useChildren() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const { mutate, loading: mutateLoading } = useApiMutation();

    const fetchChildren = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/profile/me/children');
            const data = res.data?.data ?? res.data ?? [];
            setChildren(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch children:', error);
            setChildren([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    /**
     * Link a student to the authenticated parent.
     * @param {number} studentUserId
     * @returns {boolean} success
     */
    const linkChild = async (studentUserId) => {
        const res = await mutate({
            endpoint: '/profile/me/children',
            method: 'POST',
            data: { student_user_id: studentUserId },
            defaultSuccessMessage: 'Student linked successfully',
        });
        if (res?.success || res?.data) {
            await fetchChildren();
            return true;
        }
        return false;
    };

    /**
     * Unlink a student by relationship id (parent_children.id).
     * @param {number} linkId
     * @returns {boolean} success
     */
    const unlinkChild = async (linkId) => {
        const res = await mutate({
            endpoint: `/profile/me/children/${linkId}`,
            method: 'DELETE',
            defaultSuccessMessage: 'Student unlinked successfully',
        });
        if (res?.success || res === undefined || res?.status === 204) {
            setChildren((prev) => prev.filter((c) => c.id !== linkId));
            return true;
        }
        return false;
    };

    return {
        children,
        loading: loading || mutateLoading,
        fetchChildren,
        linkChild,
        unlinkChild,
    };
}
