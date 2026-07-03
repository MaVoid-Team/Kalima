import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useApiMutation from '@/hooks/useApiMutation';

const SAMPLE_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
const THUMBNAIL_FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const NGINX_REQUEST_SIZE_LIMIT = 150 * 1024 * 1024;
const SAMPLE_FILE_FIELDS = ['high_quality', 'low_quality'];
const UPLOAD_FILE_FIELDS = [...SAMPLE_FILE_FIELDS, 'thumbnail'];

const isFileValue = (value) => typeof Blob !== 'undefined' && value instanceof Blob;

const getUploadFile = (formData, fieldName) => {
    const value = formData.get(fieldName);
    return isFileValue(value) ? value : null;
};

const getUploadBytes = (formData) => {
    let total = 0;
    for (const value of formData.values()) {
        if (isFileValue(value)) {
            total += value.size;
        }
    }
    return total;
};

const copyTextFields = (source, target) => {
    for (const [key, value] of source.entries()) {
        if (!isFileValue(value)) {
            target.append(key, value);
        }
    }
};

const appendFileField = (source, target, fieldName) => {
    const file = getUploadFile(source, fieldName);
    if (file) {
        target.append(fieldName, file);
    }
};

const buildFormData = (source, fields, includeTextFields = false) => {
    const target = new FormData();
    if (includeTextFields) {
        copyTextFields(source, target);
    }
    fields.forEach((field) => appendFileField(source, target, field));
    return target;
};

const makeProgressHandler = (onProgress, offset, total) => {
    if (!onProgress || !total) return onProgress;
    return (event) => {
        onProgress({
            ...event,
            loaded: offset + (event.loaded || 0),
            total,
        });
    };
};

const validateFileSizes = (formData, t, sampleErrorKey) => {
    for (const field of SAMPLE_FILE_FIELDS) {
        const file = getUploadFile(formData, field);
        if (file && file.size > SAMPLE_FILE_SIZE_LIMIT) {
            toast.error(t(sampleErrorKey, 'Each sample file must be 150MB or smaller.'));
            return false;
        }
    }

    const thumbnail = getUploadFile(formData, 'thumbnail');
    if (thumbnail && thumbnail.size > THUMBNAIL_FILE_SIZE_LIMIT) {
        toast.error(t('samples.upload.thumbnailTooLarge', 'Thumbnail image must be 5MB or smaller.'));
        return false;
    }

    return true;
};

const buildCreateRequests = (formData) => {
    if (getUploadBytes(formData) <= NGINX_REQUEST_SIZE_LIMIT) {
        return [formData];
    }

    const primaryField = getUploadFile(formData, 'high_quality') ? 'high_quality' : 'low_quality';
    if (!getUploadFile(formData, primaryField)) {
        return [formData];
    }

    const firstRequest = buildFormData(formData, [primaryField], true);
    const remainingFields = UPLOAD_FILE_FIELDS.filter(
        (field) => field !== primaryField && getUploadFile(formData, field),
    );

    const thumbnailIndex = remainingFields.indexOf('thumbnail');
    if (
        thumbnailIndex >= 0 &&
        getUploadBytes(firstRequest) + getUploadFile(formData, 'thumbnail').size <= NGINX_REQUEST_SIZE_LIMIT
    ) {
        appendFileField(formData, firstRequest, 'thumbnail');
        remainingFields.splice(thumbnailIndex, 1);
    }

    return [
        firstRequest,
        ...remainingFields.map((field) => buildFormData(formData, [field])),
    ];
};

const buildUpdateRequests = (formData) => {
    if (getUploadBytes(formData) <= NGINX_REQUEST_SIZE_LIMIT) {
        return [formData];
    }

    const fileFields = UPLOAD_FILE_FIELDS.filter((field) => getUploadFile(formData, field));
    if (fileFields.length === 0) {
        return [formData];
    }

    return fileFields.map((field, index) => buildFormData(formData, [field], index === 0));
};

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
        if (!validateFileSizes(formData, t, 'samples.uploadProcess.fileTooLarge')) {
            return null;
        }

        const requests = buildCreateRequests(formData);
        if (requests.length === 1) {
            return apiMutate({
                endpoint: `/sample-sections/${sectionId}/samples`,
                method: 'post',
                data: formData,
                onUploadProgress: onProgress,
                signal: abortSignal,
                defaultSuccessMessage: t('samples.uploadProcess.success', 'Sample uploaded successfully'),
            });
        }

        const totalBytes = requests.reduce((sum, request) => sum + getUploadBytes(request), 0);
        let uploadedOffset = 0;
        let createdSample = null;

        try {
            const createRes = await apiMutate({
                endpoint: `/sample-sections/${sectionId}/samples`,
                method: 'post',
                data: requests[0],
                onUploadProgress: makeProgressHandler(onProgress, uploadedOffset, totalBytes),
                signal: abortSignal,
            }, false);

            createdSample = createRes?.data;
            if (!createdSample?.id) {
                throw new Error('Sample upload did not return an id for follow-up files.');
            }
            uploadedOffset += getUploadBytes(requests[0]);

            for (const request of requests.slice(1)) {
                await apiMutate({
                    endpoint: `/sample-sections/${sectionId}/samples/${createdSample.id}`,
                    method: 'patch',
                    data: request,
                    onUploadProgress: makeProgressHandler(onProgress, uploadedOffset, totalBytes),
                    signal: abortSignal,
                }, false);
                uploadedOffset += getUploadBytes(request);
            }

            return createRes;
        } catch (error) {
            if (createdSample?.id) {
                await apiMutate({
                    endpoint: `/sample-sections/${sectionId}/samples/${createdSample.id}`,
                    method: 'delete',
                    suppressErrorToast: true,
                }, false).catch(() => {});
            }
            throw error;
        }
    }, [apiMutate, t]);

    const updateSample = useCallback(async (sectionId, sampleId, formData, onProgress, abortSignal) => {
        if (!validateFileSizes(formData, t, 'samples.upload.fileTooLarge')) {
            return null;
        }

        const requests = buildUpdateRequests(formData);
        if (requests.length === 1) {
            return apiMutate({
                endpoint: `/sample-sections/${sectionId}/samples/${sampleId}`,
                method: 'patch',
                data: formData,
                onUploadProgress: onProgress,
                signal: abortSignal,
                defaultSuccessMessage: t('samples.uploadProcess.updateSuccess', 'Sample updated successfully'),
            });
        }

        const totalBytes = requests.reduce((sum, request) => sum + getUploadBytes(request), 0);
        let uploadedOffset = 0;
        let lastResponse = null;

        for (const request of requests) {
            lastResponse = await apiMutate({
                endpoint: `/sample-sections/${sectionId}/samples/${sampleId}`,
                method: 'patch',
                data: request,
                onUploadProgress: makeProgressHandler(onProgress, uploadedOffset, totalBytes),
                signal: abortSignal,
            }, false);
            uploadedOffset += getUploadBytes(request);
        }

        return lastResponse;
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
