import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import useLookups from '@/hooks/useLookups';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ParentProfileForm from '@/components/parent/profile/ParentProfileForm';
import ParentAvatarCard from '@/components/parent/profile/ParentAvatarCard';
import ChildrenManager from '@/components/parent/profile/ChildrenManager';

export default function ParentProfilePage() {
    const { t } = useTranslation('parent');
    const { profile, updateProfile, uploadAvatar, fetchProfile, loading } = useProfile();
    const { governments, getZonesByGovernment, zones, zonesLoading } = useLookups();

    const [formReady, setFormReady] = useState(false);
    const [defaultValues, setDefaultValues] = useState({});

    const buildDefaults = (p) => ({
        name: p.name || '',
        phone: p.phone || '',
        secondary_phone: p.secondary_phone || '',
        gender: p.gender || undefined,
        government_id: p.parents?.government_id || undefined,
        zone_id: p.parents?.zone_id || undefined,
    });

    useEffect(() => {
        const load = async () => {
            const p = await fetchProfile();
            if (p) {
                setDefaultValues(buildDefaults(p));
                if (p.parents?.government_id) {
                    getZonesByGovernment(p.parents.government_id);
                }
                setFormReady(true);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (data) => {
        const clean = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
        );
        await updateProfile(clean);
        const p = await fetchProfile();
        if (p) setDefaultValues(buildDefaults(p));
    };

    if (loading && !profile) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10" data-testid="parent-profile-page">
            <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('profile.title', 'My Profile')}</h1>
                    <p className="text-muted-foreground">{t('profile.description', 'Manage your personal information and linked children')}</p>
                </div>
            </div>

            <ParentAvatarCard
                profile={profile}
                uploadAvatar={uploadAvatar}
                fetchProfile={fetchProfile}
            />

            {formReady && (
                <ParentProfileForm
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    loading={loading}
                    governments={governments}
                    zones={zones}
                    zonesLoading={zonesLoading}
                    onGovernmentChange={(govId) => govId && getZonesByGovernment(govId)}
                />
            )}

            <ChildrenManager />
        </div>
    );
}
