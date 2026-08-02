import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@/api/axios';
import useApiMutation from '@/hooks/useApiMutation';

export default function useAdminAppreciationPage() {
    const { t } = useTranslation('appreciation');
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { mutate, loading: mutating } = useApiMutation();

    const loadPage = useCallback(async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/appreciation-page`);
            const nextPage = response.data?.data || null;
            setPage(nextPage);
            return nextPage;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateComment = useCallback(async (userId, commentId, values) => {
        const response = await mutate({
            endpoint: `/admin/users/${userId}/appreciation-page/comments/${commentId}`,
            method: 'patch',
            data: values,
            defaultSuccessMessage: t('messages.commentUpdated'),
        });

        const updatedComment = response?.data;
        if (updatedComment) {
            setPage((current) => current ? ({
                ...current,
                comments: (current.comments || []).map((comment) => (
                    comment.id === updatedComment.id ? updatedComment : comment
                )),
            }) : current);
        }

        return updatedComment;
    }, [mutate, t]);

    const deleteComment = useCallback(async (userId, commentId) => {
        await mutate({
            endpoint: `/admin/users/${userId}/appreciation-page/comments/${commentId}`,
            method: 'delete',
            defaultSuccessMessage: t('messages.commentDeleted'),
        });

        setPage((current) => current ? ({
            ...current,
            comments: (current.comments || []).filter((comment) => comment.id !== commentId),
            commentCount: Math.max(0, (current.commentCount || 0) - 1),
        }) : current);
    }, [mutate, t]);

    return {
        page,
        loading,
        error,
        mutating,
        loadPage,
        updateComment,
        deleteComment,
    };
}
