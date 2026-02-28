import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Camera, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { PhoneInput, egyptPhoneSchema } from '@/components/ui/phone-input';
import FileUploadProgress from './FileUploadProgress';
import { useProfile } from '@/hooks/useProfile';
import { getImageUrl } from '@/lib/storeUtils';

const getProfileSchema = (t) => z.object({
    name: z.string().min(1, t('settings.profile.validation.nameRequired', 'Name is required')).max(255),
    email: z.string().email(t('settings.profile.validation.emailInvalid', 'Invalid email address')),
    phone: z.string().optional().refine(val => !val || egyptPhoneSchema.safeParse(val).success, {
        message: t('settings.profile.validation.invalidPhone', 'Invalid Egyptian phone number')
    }),
    secondary_phone: z.string().optional().refine(val => !val || egyptPhoneSchema.safeParse(val).success, {
        message: t('settings.profile.validation.invalidPhone', 'Invalid Egyptian phone number')
    }),
    gender: z.string().optional()
});

export default function ProfileSection() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';
    const [isEditing, setIsEditing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const { profile, updateProfile, uploadAvatar, cancelUpload, loading } = useProfile();

    const form = useForm({
        resolver: zodResolver(getProfileSchema(t)),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            secondary_phone: '',
            gender: ''
        }
    });

    // Initialize form data when profile is loaded
    useEffect(() => {
        if (profile) {
            form.reset({
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                secondary_phone: profile.secondary_phone || '',
                gender: profile.gender || ''
            });
        }
    }, [profile, form]);

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

    const onSubmit = async (values) => {
        try {
            await updateProfile(values);
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
                        <AvatarImage src={getImageUrl(profile?.profile_pic_url)} />
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('settings.profile.name')}</FormLabel>
                                            <FormControl>
                                                <Input disabled={loading} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('settings.profile.email')}</FormLabel>
                                            <FormControl>
                                                <Input type="email" disabled={loading} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem dir="ltr">
                                            <FormLabel className={isRtl ? "text-right block w-full" : ""}>
                                                {t('settings.profile.phone')}
                                            </FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    disabled={loading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className={isRtl ? "text-right block w-full" : ""} />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="secondary_phone"
                                    render={({ field }) => (
                                        <FormItem dir="ltr">
                                            <FormLabel className={isRtl ? "text-right block w-full" : ""}>
                                                {t('settings.profile.secondaryPhone')}
                                            </FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    disabled={loading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className={isRtl ? "text-right block w-full" : ""} />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('settings.profile.gender')}</FormLabel>
                                            <Select
                                                dir={i18n.dir()}
                                                disabled={loading}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('common.select', 'Select')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">{t('gender.male', 'Male')}</SelectItem>
                                                    <SelectItem value="female">{t('gender.female', 'Female')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                    </Form>
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
                                <p className="flex items-center gap-2" dir="ltr">
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
