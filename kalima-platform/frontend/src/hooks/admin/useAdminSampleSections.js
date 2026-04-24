import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useApiMutation from '@/hooks/useApiMutation';

export function useAdminSampleSections() {
    const { t } = useTranslation('admin');
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
        // Limit: 150MB
        const MAX_SIZE = 150 * 1024 * 1024;
        let totalSize = 0;
        for (let value of formData.values()) {
            if (value instanceof Blob) {
                totalSize += value.size;
            }
        }

        if (totalSize > MAX_SIZE) {
            toast.error(t('samples.uploadProcess.fileTooLarge', 'File size exceeds the limit of 150MB.'));
            return null;
        }

        const res = await apiMutate({
            endpoint: `/sample-sections/${sectionId}/samples`,
            method: 'post',
            data: formData, // FormData instance
            onUploadProgress: onProgress,
            defaultSuccessMessage: t('samples.uploadProcess.success', 'Sample uploaded successfully'),
        });
        return res;
    }, [apiMutate, t]);

    const updateSample = useCallback(async (sectionId, sampleId, formData, onProgress, abortSignal) => {
        // Limit: 150MB
        const MAX_SIZE = 150 * 1024 * 1024;
        let totalSize = 0;
        for (let value of formData.values()) {
            if (value instanceof Blob) {
                totalSize += value.size;
            }
        }

        if (totalSize > MAX_SIZE) {
            toast.error(t('samples.upload.fileTooLarge', 'File size exceeds the limit of 150MB.'));
            return null;
        }

        const res = await apiMutate({
            endpoint: `/sample-sections/${sectionId}/samples/${sampleId}`,
            method: 'patch',
            data: formData,
            onUploadProgress: onProgress,
            defaultSuccessMessage: t('samples.uploadProcess.updateSuccess', 'Sample updated successfully'),
        });
        return res;
    }, [apiMutate, t]);

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
