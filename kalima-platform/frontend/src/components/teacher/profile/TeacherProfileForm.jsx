import { useTranslation } from 'react-i18next';
import { User, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function ProfileField({ label, value }) {
    return (
        <div className="rounded-xl border bg-muted/30 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 min-h-6 break-words text-sm font-semibold text-foreground">
                {value || '—'}
            </div>
        </div>
    );
}

export default function TeacherProfileForm({
    defaultValues,
    governments,
    subjects,
    zones,
}) {
    const { t } = useTranslation('teacher');
    const government = governments.find((item) => item.id === defaultValues.government_id)?.title;
    const zone = zones.find((item) => item.id === defaultValues.zone_id)?.title;
    const subject = subjects.find((item) => item.id === defaultValues.subject_id)?.title;
    const gender = defaultValues.gender ? t(`profile.${defaultValues.gender}`, defaultValues.gender) : '';

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t('profile.personalInfo', 'Personal Information')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <ProfileField label={t('profile.name', 'Full Name')} value={defaultValues.name} />
                    <ProfileField label={t('profile.phone', 'Phone')} value={defaultValues.phone} />
                    <ProfileField label={t('profile.secondaryPhone', 'Secondary Phone')} value={defaultValues.secondary_phone} />
                    <ProfileField label={t('profile.gender', 'Gender')} value={gender} />
                </div>

                <Separator />

                <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <GraduationCap className="h-4 w-4" /> {t('profile.teacherInfo', 'Teaching Information')}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <ProfileField label={t('profile.subject', 'Subject')} value={subject} />
                    <ProfileField label={t('profile.government', 'Governorate')} value={government} />
                    <ProfileField label={t('profile.zone', 'Zone')} value={zone} />
                </div>
            </CardContent>
        </Card>
    );
}
