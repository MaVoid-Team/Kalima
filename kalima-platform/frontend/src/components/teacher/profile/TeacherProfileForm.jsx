import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, GraduationCap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    phone: z.string().max(50).optional().or(z.literal('')),
    secondary_phone: z.string().max(50).optional().or(z.literal('')),
    gender: z.enum(['male', 'female']).optional(),
    government_id: z.coerce.number().optional(),
    zone_id: z.coerce.number().optional(),
    subject_id: z.coerce.number().optional(),
});

export default function TeacherProfileForm({
    defaultValues,
    onSubmit,
    loading,
    governments,
    subjects,
    zones,
    zonesLoading,
    onGovernmentChange
}) {
    const { t } = useTranslation('teacher');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues
    });

    const gender = watch('gender');
    const governmentId = watch('government_id');

    useEffect(() => {
        if (governmentId) {
            onGovernmentChange(governmentId);
            setValue('zone_id', undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [governmentId]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t('profile.personalInfo', 'Personal Information')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">{t('profile.name', 'Full Name')} *</Label>
                        <Input id="name" {...register('name')} className="mt-1" data-testid="teacher-profile-name-input" />
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">{t('profile.phone', 'Phone')}</Label>
                            <Input id="phone" {...register('phone')} className="mt-1" dir="ltr" data-testid="teacher-profile-phone-input" />
                        </div>
                        <div>
                            <Label htmlFor="secondary_phone">{t('profile.secondaryPhone', 'Secondary Phone')}</Label>
                            <Input id="secondary_phone" {...register('secondary_phone')} className="mt-1" dir="ltr" data-testid="teacher-profile-secondary-phone-input" />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <Label>{t('profile.gender', 'Gender')}</Label>
                        <Select value={gender || ''} onValueChange={(v) => setValue('gender', v, { shouldDirty: true })}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('profile.selectGender', 'Select gender')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">{t('profile.male', 'Male')}</SelectItem>
                                <SelectItem value="female">{t('profile.female', 'Female')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> {t('profile.teacherInfo', 'Teaching Information')}
                    </p>

                    <div>
                        <Label>{t('profile.subject', 'Subject')}</Label>
                        <Select
                            value={watch('subject_id') ? String(watch('subject_id')) : ''}
                            onValueChange={(v) => setValue('subject_id', Number(v), { shouldDirty: true })}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('profile.selectSubject', 'Select subject')} />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>{t('profile.government', 'Governorate')}</Label>
                            <Select
                                value={watch('government_id') ? String(watch('government_id')) : ''}
                                onValueChange={(v) => setValue('government_id', Number(v), { shouldDirty: true })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={t('profile.selectGovernment', 'Select governorate')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {governments.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)}>{g.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>{t('profile.zone', 'Zone')}</Label>
                            <Select
                                value={watch('zone_id') ? String(watch('zone_id')) : ''}
                                onValueChange={(v) => setValue('zone_id', Number(v), { shouldDirty: true })}
                                disabled={!watch('government_id') || zonesLoading}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={zonesLoading ? t('common.loading', 'Loading...') : t('profile.selectZone', 'Select zone')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((z) => (
                                        <SelectItem key={z.id} value={String(z.id)}>{z.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading || !isDirty} data-testid="teacher-save-profile-button">
                            {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                            {t('profile.save', 'Save Changes')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
