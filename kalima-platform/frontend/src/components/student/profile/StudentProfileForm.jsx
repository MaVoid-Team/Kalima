import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, BookOpen, Loader2 } from 'lucide-react';
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

const profileSchema = (t) => z.object({
    name: z.string().min(1, t('common:validation.required', 'Required')).max(255),
    phone: z.string().max(50).optional().or(z.literal('')),
    secondary_phone: z.string().max(50).optional().or(z.literal('')),
    gender: z.enum(['male', 'female']).optional(),
    government_id: z.coerce.number().optional(),
    zone_id: z.coerce.number().optional(),
    level_id: z.coerce.number().optional(),
    faction: z.string().max(255).optional().or(z.literal('')),
    parent_phone_number: z.string().max(255).optional().or(z.literal('')),
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
    const { t } = useTranslation(['student', 'common']);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
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

                    {/* Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">{t('student:profile.phone')}</Label>
                            <Input
                                id="phone"
                                data-testid="student-profile-input-phone"
                                {...register('phone')}
                                className="mt-1"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <Label htmlFor="secondary_phone">{t('student:profile.secondaryPhone')}</Label>
                            <Input
                                id="secondary_phone"
                                data-testid="student-profile-input-secondary-phone"
                                {...register('secondary_phone')}
                                className="mt-1"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <Label>{t('student:profile.gender')}</Label>
                        <Select value={gender || ''} onValueChange={(v) => setValue('gender', v, { shouldDirty: true })}>
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

                    <div>
                        <Label htmlFor="parent_phone_number">{t('student:profile.parentPhone')}</Label>
                        <Input
                            id="parent_phone_number"
                            data-testid="student-profile-input-parent-phone"
                            {...register('parent_phone_number')}
                            className="mt-1"
                            dir="ltr"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading || !isDirty} data-testid="student-profile-button-save">
                            {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                            {t('student:profile.save')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
