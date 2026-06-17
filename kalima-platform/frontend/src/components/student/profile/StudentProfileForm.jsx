import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PhoneInput, egyptPhoneSchema } from '@/components/ui/phone-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '../../ui/loading-spinner';

const profileSchema = (t) => z.object({
    name: z.string().min(1, t('common:validation.required', 'Required')).max(255),
    phone: egyptPhoneSchema(t).optional(),
    secondary_phone: egyptPhoneSchema(t).optional(),
    gender: z.enum(['male', 'female']).optional(),
    government_id: z.coerce.number().optional(),
    zone_id: z.coerce.number().optional(),
    level_id: z.coerce.number().optional(),
    faction: z.string().max(255).optional().or(z.literal('')),
    parent_phone_number: egyptPhoneSchema(t).optional(),
});

export default function StudentProfileForm({
    defaultValues,
    onSubmit,
    loading,
    governments,
    levels,
    zones,
    zonesLoading,
    onGovernmentChange
}) {
    const { t, i18n } = useTranslation(['student', 'common']);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(profileSchema(t)),
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
                    {t('student:profile.personalInfo')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name">{t('student:profile.name')} *</Label>
                        <Input
                            id="name"
                            data-testid="student-profile-input-name"
                            {...register('name')}
                            className="mt-1"
                        />
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div dir="ltr">
                            <Label htmlFor="phone" dir={i18n.dir()}>{t('student:profile.phone')}</Label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <PhoneInput
                                            id="phone"
                                            data-testid="student-profile-input-phone"
                                            disabled={loading}
                                            className="mt-1"
                                            {...field}
                                        />
                                        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                                    </div>
                                )}
                            />
                        </div>
                        <div dir="ltr">
                            <Label htmlFor="secondary_phone" dir={i18n.dir()}>{t('student:profile.secondaryPhone')}</Label>
                            <Controller
                                name="secondary_phone"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <PhoneInput
                                            id="secondary_phone"
                                            data-testid="student-profile-input-secondary-phone"
                                            disabled={loading}
                                            className="mt-1"
                                            {...field}
                                        />
                                        {errors.secondary_phone && <p className="text-xs text-destructive">{errors.secondary_phone.message}</p>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <Label>{t('student:profile.gender')}</Label>
                        <Select dir={i18n.dir()} value={gender || ''} onValueChange={(v) => setValue('gender', v, { shouldDirty: true })}>
                            <SelectTrigger className="mt-1" data-testid="student-profile-select-gender">
                                <SelectValue placeholder={t('student:profile.selectGender')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male" data-testid="student-profile-option-gender-male">{t('student:profile.male')}</SelectItem>
                                <SelectItem value="female" data-testid="student-profile-option-gender-female">{t('student:profile.female')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> {t('student:profile.studentInfo')}
                    </p>

                    <div>
                        <Label>{t('student:profile.level')}</Label>
                        <Select
                            dir={i18n.dir()}
                            value={watch('level_id') ? String(watch('level_id')) : ''}
                            onValueChange={(v) => setValue('level_id', Number(v), { shouldDirty: true })}
                        >
                            <SelectTrigger className="mt-1" data-testid="student-profile-select-level">
                                <SelectValue placeholder={t('student:profile.selectLevel')} />
                            </SelectTrigger>
                            <SelectContent>
                                {levels.map((l) => (
                                    <SelectItem key={l.id} value={String(l.id)} data-testid={`student-profile-option-level-${l.id}`}>{l.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="faction">{t('student:profile.faction')}</Label>
                        <Input
                            id="faction"
                            data-testid="student-profile-input-faction"
                            {...register('faction')}
                            className="mt-1"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>{t('student:profile.government')}</Label>
                            <Select
                                dir={i18n.dir()}
                                value={watch('government_id') ? String(watch('government_id')) : ''}
                                onValueChange={(v) => setValue('government_id', Number(v), { shouldDirty: true })}
                            >
                                <SelectTrigger className="mt-1" data-testid="student-profile-select-government">
                                    <SelectValue placeholder={t('student:profile.selectGovernment')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {governments.map((g) => (
                                        <SelectItem key={g.id} value={String(g.id)} data-testid={`student-profile-option-government-${g.id}`}>{g.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>{t('student:profile.zone')}</Label>
                            <Select
                                dir={i18n.dir()}
                                value={watch('zone_id') ? String(watch('zone_id')) : ''}
                                onValueChange={(v) => setValue('zone_id', Number(v), { shouldDirty: true })}
                                disabled={!watch('government_id') || zonesLoading}
                            >
                                <SelectTrigger className="mt-1" data-testid="student-profile-select-zone">
                                    <SelectValue placeholder={zonesLoading ? t('student:profile.loading') : t('student:profile.selectZone')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((z) => (
                                        <SelectItem key={z.id} value={String(z.id)} data-testid={`student-profile-option-zone-${z.id}`}>{z.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div dir="ltr">
                        <Label htmlFor="parent_phone_number">{t('student:profile.parentPhone')}</Label>
                        <Controller
                            name="parent_phone_number"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-1">
                                    <PhoneInput
                                        id="parent_phone_number"
                                        data-testid="student-profile-input-parent-phone"
                                        disabled={loading}
                                        className="mt-1"
                                        {...field}
                                    />
                                    {errors.parent_phone_number && <p className="text-xs text-destructive">{errors.parent_phone_number.message}</p>}
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={loading || !isDirty}
                            data-testid="student-profile-button-save"
                        >
                            {loading && <LoadingSpinner className="h-4 w-4" />}
                            {t('student:profile.save')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
