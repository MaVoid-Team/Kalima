import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Camera, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { cn } from '@/lib/utils';
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
import LoadingSpinner from '@/components/ui/loading-spinner';

const getProfileSchema = (t) => z.object({
    name: z.string().min(1, t('settings.profile.validation.nameRequired', 'Name is required')).max(255),
    email: z.string().email(t('settings.profile.validation.emailInvalid', 'Invalid email address')),
    phone: egyptPhoneSchema(t).optional(),
    secondary_phone: egyptPhoneSchema(t).optional(),
    gender: z.string().optional()
});

export default function ProfileSection({ ns = 'admin' }) {
    const { t, i18n } = useTranslation(ns);
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
                <CardTitle 
                    className="flex items-center gap-2"
                    data-search-content={`${t('settings.profile.title', { lng: 'en' })} ${t('settings.profile.title', { lng: 'ar' })}`}
                >
                    <User className="h-5 w-5" />
                    {t('settings.profile.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pt-2">
                    <div className="relative group shrink-0 p-1">
                        <Avatar className="h-24 w-24 ring-4 ring-muted transition-all group-hover:ring-primary/20">
                            <AvatarImage src={getImageUrl(profile?.profile_pic_url)} className="object-cover" />
                            <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
                                {profile?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                                <Camera className="h-4 w-4" />
                            </div>
                        </Label>
                    </div>

                    <div className="flex flex-col items-center sm:items-start text-center sm:text-start space-y-3 flex-1">
                        <div>
                            <h3 
                                className="text-sm font-bold text-foreground"
                                data-search-content={`${t('settings.profile.avatarTitle', { lng: 'en' })} ${t('settings.profile.avatarTitle', { lng: 'ar' })}`}
                            >
                                {t('settings.profile.avatarTitle', 'Profile Picture')}
                            </h3>
                            <p 
                                className="text-xs text-muted-foreground mt-1 max-w-[200px]"
                                data-search-content={`${t('settings.profile.avatarHint', { lng: 'en' })} ${t('settings.profile.avatarHint', { lng: 'ar' })}`}
                            >
                                {t('settings.profile.avatarHint', 'JPG, PNG or GIF. Max size 2MB.')}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <Button variant="secondary" size="sm" asChild disabled={isUploading} className="pointer-events-none rounded-xl font-bold text-[10px] uppercase tracking-wider">
                                    <span>
                                        <Upload className="h-3.5 w-3.5 mr-1.5" />
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
                                            <FormLabel data-search-content={`${t('settings.profile.name', { lng: 'en' })} ${t('settings.profile.name', { lng: 'ar' })}`}>
                                                {t('settings.profile.name')}
                                            </FormLabel>
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
                                            <FormLabel data-search-content={`${t('settings.profile.email', { lng: 'en' })} ${t('settings.profile.email', { lng: 'ar' })}`}>
                                                {t('settings.profile.email')}
                                            </FormLabel>
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
                                            <FormLabel 
                                                className={isRtl ? "text-right block w-full" : ""}
                                                data-search-content={`${t('settings.profile.phone', { lng: 'en' })} ${t('settings.profile.phone', { lng: 'ar' })}`}
                                            >
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
                                            <FormLabel 
                                                className={isRtl ? "text-right block w-full" : ""}
                                                data-search-content={`${t('settings.profile.secondaryPhone', { lng: 'en' })} ${t('settings.profile.secondaryPhone', { lng: 'ar' })}`}
                                            >
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
                                            <FormLabel data-search-content={`${t('settings.profile.gender', { lng: 'en' })} ${t('settings.profile.gender', { lng: 'ar' })}`}>
                                                {t('settings.profile.gender')}
                                            </FormLabel>
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
                                                    <SelectItem value="male">{t('common:gender.male', 'Male')}</SelectItem>
                                                    <SelectItem value="female">{t('common:gender.female', 'Female')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={loading || !form.formState.isDirty}
                                >
                                    {loading && <LoadingSpinner className="h-4 w-4" />}
                                    {t('common:save', 'Save')}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    {t('common:cancel', 'Cancel')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-1.5">
                                <Label 
                                    className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60"
                                    data-search-content={`${t('settings.profile.name', { lng: 'en' })} ${t('settings.profile.name', { lng: 'ar' })}`}
                                >
                                    {t('settings.profile.name')}
                                </Label>
                                <div className="flex items-center gap-2 px-1">
                                    <div className="p-1.5 rounded-lg bg-muted/50">
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <p className="font-bold text-sm text-foreground">
                                        {profile?.name || t('common.notSpecified')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label 
                                    className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60"
                                    data-search-content={`${t('settings.profile.email', { lng: 'en' })} ${t('settings.profile.email', { lng: 'ar' })}`}
                                >
                                    {t('settings.profile.email')}
                                </Label>
                                <div className="flex items-center gap-2 px-1">
                                    <div className="p-1.5 rounded-lg bg-muted/50">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <p className="font-bold text-sm text-foreground truncate max-w-[200px]" title={profile?.email}>
                                        {profile?.email || t('common.notSpecified')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label 
                                    className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60"
                                    data-search-content={`${t('settings.profile.phone', { lng: 'en' })} ${t('settings.profile.phone', { lng: 'ar' })}`}
                                >
                                    {t('settings.profile.phone')}
                                </Label>
                                <div className="flex items-center gap-2 px-1" dir="ltr">
                                    <div className="p-1.5 rounded-lg bg-muted/50">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <p className="font-bold text-sm text-foreground">
                                        {profile?.phone || t('common.notSpecified')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label 
                                    className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60"
                                    data-search-content={`${t('settings.profile.gender', { lng: 'en' })} ${t('settings.profile.gender', { lng: 'ar' })}`}
                                >
                                    {t('settings.profile.gender')}
                                </Label>
                                <div className="flex items-center gap-2 px-1">
                                    <Badge variant="secondary" className="rounded-lg px-2 py-0.5 font-bold text-[10px]">
                                        {t(`gender.${profile?.gender}`) || t('common.notSpecified')}
                                    </Badge>
                                </div>
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
