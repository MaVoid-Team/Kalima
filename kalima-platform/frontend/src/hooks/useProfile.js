import { useState, useEffect } from 'react';
import useApiMutation from './useApiMutation';
import axiosInstance from '@/api/axios';
import { useTranslation } from 'react-i18next';

export const useProfile = () => {
    const [uploadController, setUploadController] = useState(null);
    const [profile, setProfile] = useState(null);
    const { mutate, loading, error } = useApiMutation();
    const { t } = useTranslation('admin');

    // Fetch user profile
    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get('/profile/me');
            setProfile(response.data?.data || response.data);
            return response.data?.data || response.data;
        } catch (error) {
            // Error handled by axios interceptor
            throw error;
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const response = await mutate({
                endpoint: '/profile/me',
                method: 'PATCH',
                data: profileData,
                defaultSuccessMessage: t('settings.profile.updateSuccess', 'Profile updated successfully')
            });
            
            // Refresh profile data after update
            await fetchProfile();
            return response;
        } catch (error) {
            // Error handled by mutate
            throw error;
        }
    };

    // Upload avatar with progress tracking
    const uploadAvatar = async (file, onProgress) => {
        const formData = new FormData();
        formData.append('avatar', file);
        
        // Create abort controller for cancellation
        const controller = new AbortController();
        setUploadController(controller);
        
        try {
            const response = await axiosInstance.post('/profile/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                signal: controller.signal,
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(progress);
                },
            });
            
            // Update profile with new avatar data from response
            if (response.data?.data) {
                setProfile(response.data.data);
            }
            
            return response.data;
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                // Don't throw error for cancelled uploads, just handle gracefully
                return { cancelled: true };
            }
            throw error;
        } finally {
            setUploadController(null);
        }
    };

    // Cancel upload
    const cancelUpload = () => {
        if (uploadController) {
            uploadController.abort();
            setUploadController(null);
        }
    };

    // Initialize profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    return {
        profile,
        updateProfile,
        uploadAvatar,
        cancelUpload,
        fetchProfile,
        loading,
        error,
        isUploading: uploadController !== null
    };
};
