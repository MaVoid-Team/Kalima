import { useCallback, useState } from 'react';
import axiosInstance from '@/api/axios';
import useApiMutation from '@/hooks/useApiMutation';

export default function usePublicAppreciationPage() {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { mutate, loading: submitting } = useApiMutation();

    const loadPage = useCallback(async (token) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(`/appreciation/${token}`);
            const nextPageData = response.data?.data || null;
            setPageData(nextPageData);
            return nextPageData;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const submitComment = useCallback(async (token, values) => {
        const response = await mutate({
            endpoint: `/appreciation/${token}/comments`,
            method: 'post',
            data: values,
            defaultSuccessMessage: 'Comment submitted successfully',
        });

        const createdComment = response?.data;
        if (createdComment) {
            setPageData((current) => current ? ({
                ...current,
                comments: [createdComment, ...(current.comments || [])],
            }) : current);
        }

        return createdComment;
    }, [mutate]);

    return {
        pageData,
        loading,
        error,
        submitting,
        loadPage,
        submitComment,
    };
}
