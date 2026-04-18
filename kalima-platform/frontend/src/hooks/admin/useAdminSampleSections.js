import { useState, useCallback } from 'react';
import useApiMutation from '@/hooks/useApiMutation';

export function useAdminSampleSections() {
    const { mutate: apiMutate, loading, error } = useApiMutation();
    const [sections, setSections] = useState([]);

    const fetchSections = useCallback(async () => {
        try {
            const res = await apiMutate({
                endpoint: '/sample-sections',
                method: 'get',
            }, false); // don't show toast on fetch
            if (res?.success) {
                setSections(res.data);
                return res.data;
            }
        } catch (err) {
            console.error('Failed to fetch sections:', err);
            return [];
        }
    }, [apiMutate]);

    const getSection = useCallback(async (id) => {
        try {
            const res = await apiMutate({
                endpoint: `/sample-sections/${id}`,
                method: 'get',
            }, false);
            return res?.success ? res.data : null;
        } catch (err) {
            console.error('Failed to fetch section:', err);
            return null;
        }
    }, [apiMutate]);

    const createSection = useCallback(async (data) => {
        const res = await apiMutate({
            endpoint: '/sample-sections',
            method: 'post',
            data,
            defaultSuccessMessage: 'Sample section created successfully',
        });
        if (res?.success) {
            await fetchSections();
        }
        return res;
    }, [apiMutate, fetchSections]);

    const updateSection = useCallback(async (id, data) => {
        const res = await apiMutate({
            endpoint: `/sample-sections/${id}`,
            method: 'patch',
            data,
            defaultSuccessMessage: 'Sample section updated successfully',
        });
        if (res?.success) {
            await fetchSections();
        }
        return res;
    }, [apiMutate, fetchSections]);

    const deleteSection = useCallback(async (id) => {
        const res = await apiMutate({
            endpoint: `/sample-sections/${id}`,
            method: 'delete',
            defaultSuccessMessage: 'Sample section deleted successfully',
        });
        if (res?.success) {
            await fetchSections();
        }
        return res;
    }, [apiMutate, fetchSections]);

    const createSample = useCallback(async (sectionId, formData, onProgress, abortSignal) => {
        const res = await apiMutate({
            endpoint: `/sample-sections/${sectionId}/samples`,
            method: 'post',
            data: formData, // FormData instance
            onUploadProgress: onProgress,
            defaultSuccessMessage: 'Sample uploaded successfully',
            // Signal unsupported out of the box by useApiMutation unless we pass it but useApiMutation doesn't explicitly pass it right now
            // We should ensure useApiMutation supports config overrides or pass it directly.
        });
        return res;
    }, [apiMutate]);

    const updateSample = useCallback(async (sectionId, sampleId, formData, onProgress, abortSignal) => {
        const res = await apiMutate({
            endpoint: `/sample-sections/${sectionId}/samples/${sampleId}`,
            method: 'patch',
            data: formData,
            onUploadProgress: onProgress,
            defaultSuccessMessage: 'Sample updated successfully',
        });
        return res;
    }, [apiMutate]);

    const deleteSample = useCallback(async (sectionId, sampleId) => {
        const res = await apiMutate({
            endpoint: `/sample-sections/${sectionId}/samples/${sampleId}`,
            method: 'delete',
            defaultSuccessMessage: 'Sample deleted successfully',
        });
        return res;
    }, [apiMutate]);

    return {
        sections,
        loading,
        error,
        fetchSections,
        getSection,
        createSection,
        updateSection,
        deleteSection,
        createSample,
        updateSample,
        deleteSample,
    };
}
