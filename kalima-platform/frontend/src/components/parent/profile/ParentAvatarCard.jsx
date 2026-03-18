import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Loader2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getImageUrl } from '@/lib/storeUtils';

export default function ParentAvatarCard({ profile, uploadAvatar, fetchProfile }) {
    const { t } = useTranslation('parent');
    const avatarInputRef = useRef(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            await uploadAvatar(file, () => { });
            await fetchProfile();
        } finally {
            setAvatarUploading(false);
        }
    };

    return (
        <Card className="shadow-sm overflow-hidden">
            <div className="h-20 bg-linear-to-r from-primary/30 via-primary/10 to-transparent" />
            <CardContent className="px-6 pb-6 -mt-10">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="relative shrink-0">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                            <AvatarImage src={getImageUrl(profile?.profile_pic_url)} alt={profile?.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold uppercase">
                                {profile?.name?.trim().charAt(0) || 'P'}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={avatarUploading}
                            className="absolute bottom-0 end-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-background hover:bg-primary/90 transition-colors"
                            data-testid="parent-upload-avatar-button"
                        >
                            {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                        </button>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="flex-1 min-w-0 pt-3 sm:pt-0">
                        <h2 className="text-xl font-bold truncate">{profile?.name}</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="secondary">
                                {t('profile.parentRole', 'Parent')}
                            </Badge>

                            {/* Parent ID with tooltip */}
                            {profile?.id && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 border border-border rounded-md px-2 py-0.5 cursor-help select-all"
                                                data-testid="parent-profile-id-badge"
                                            >
                                                <span className="font-mono font-semibold">ID: {profile.id}</span>
                                                <Info className="h-3 w-3 shrink-0" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-[220px] text-center">
                                            {t('profile.idTooltip', 'This is your Parent ID. Students can share their ID with you so you can link their accounts here.')}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
