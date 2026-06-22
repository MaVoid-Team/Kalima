import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import useLookups from '@/hooks/useLookups';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StudentProfileForm from '@/components/student/profile/StudentProfileForm';
import StudentAvatarCard from '@/components/student/profile/StudentAvatarCard';

export default function StudentProfilePage() {
    const { t } = useTranslation('student');
    const { profile, uploadAvatar, fetchProfile, loading } = useProfile();
    const { governments, levels, getZonesByGovernment, zones } = useLookups();

    const [formReady, setFormReady] = useState(false);
    const [defaultValues, setDefaultValues] = useState({});

    const buildDefaults = (p) => ({
        name: p.name || '',
        phone: p.phone || '',
        secondary_phone: p.secondary_phone || '',
        gender: p.gender || undefined,
        government_id: p.students?.government_id || undefined,
        zone_id: p.students?.zone_id || undefined,
        level_id: p.students?.level_id || undefined,
        faction: p.students?.faction || '',
        parent_phone_number: p.students?.parent_phone_number || '',
    });

    useEffect(() => {
        const load = async () => {
            const p = await fetchProfile();
            if (p) {
                setDefaultValues(buildDefaults(p));
                if (p.students?.government_id) {
                    getZonesByGovernment(p.students.government_id);
                }
                setFormReady(true);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading && !profile) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="student-profile-page">
            <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('profile.title', 'My Profile')}</h1>
                    <p className="text-muted-foreground">{t('profile.description', 'Manage your personal information')}</p>
                </div>
            </div>

            <StudentAvatarCard
                profile={profile}
                uploadAvatar={uploadAvatar}
                fetchProfile={fetchProfile}
            />

            {formReady && (
                <StudentProfileForm
                    defaultValues={defaultValues}
                    governments={governments}
                    levels={levels}
                    zones={zones}
                />
            )}
        </div>
    );
}
