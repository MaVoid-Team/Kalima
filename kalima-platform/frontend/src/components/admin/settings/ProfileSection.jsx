import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Camera, Upload } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import FileUploadProgress from './FileUploadProgress';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileSection() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';
    const [isEditing, setIsEditing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        secondary_phone: '',
        gender: ''
    });

    const { profile, updateProfile, uploadAvatar, cancelUpload, loading } = useProfile();

    // Initialize form data when profile is loaded
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                secondary_phone: profile.secondary_phone || '',
                gender: profile.gender || ''
            });
        }
    }, [profile]);

    const handleAvatarUpload = async (file) => {
        setSelectedFile(file);
        setIsUploading(true);
        setUploadError(null);
        
        try {
            const result = await uploadAvatar(file, (progress) => {
                setUploadProgress(progress);
            });
            
            // Check if upload was cancelled
            if (result?.cancelled) {
                setUploadProgress(null);
                return;
            }
            
            // Show success message
            setUploadProgress(null);
            // Success message is handled by the useApiMutation hook
        } catch (error) {
            setUploadProgress(null);
            setUploadError(error.message || t('settings.upload.error', 'Upload failed'));
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
        }
    };

    const handleCancelUpload = () => {
        cancelUpload();
        setIsUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleAvatarUpload(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            setIsEditing(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('settings.profile.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.profile_pic_url} />
                        <AvatarFallback>
                            {profile?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <div>
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                                    <span>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {isUploading ? t('common.loading') : t('settings.profile.uploadAvatar')}
                                    </span>
                                </Button>
                            </Label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('settings.profile.avatarHint', 'JPG, PNG or GIF. Max size 2MB.')}
                        </p>
                    </div>
                </div>

                {/* Upload Progress */}
                <FileUploadProgress
                    progress={uploadProgress}
                    isUploading={isUploading}
                    onCancel={handleCancelUpload}
                    fileName={selectedFile?.name}
                    error={uploadError}
                />

                {/* Profile Form */}
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('settings.profile.name')}</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secondary_phone">{t('settings.profile.secondaryPhone')}</Label>
                                <Input
                                    id="secondary_phone"
                                    value={formData.secondary_phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_phone: e.target.value }))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">{t('settings.profile.gender')}</Label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                    disabled={loading}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">{t('common.select', 'Select')}</option>
                                    <option value="male">{t('settings.gender.male', 'Male')}</option>
                                    <option value="female">{t('settings.gender.female', 'Female')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? t('common.loading') : t('common.save')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    {t('settings.profile.name')}
                                </Label>
                                <p className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {profile?.name || t('common.notSpecified')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    {t('settings.profile.email')}
                                </Label>
                                <p className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {profile?.email || t('common.notSpecified')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    {t('settings.profile.phone')}
                                </Label>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {profile?.phone || t('common.notSpecified')}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    {t('settings.profile.gender')}
                                </Label>
                                <Badge variant="secondary">
                                    {profile?.gender || t('common.notSpecified')}
                                </Badge>
                            </div>
                        </div>
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            {t('settings.profile.editProfile')}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
