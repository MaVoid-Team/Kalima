import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/storeUtils';

export default function TeacherAvatarCard({ profile, uploadAvatar, fetchProfile }) {
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

    const teacher = profile?.teachers;

    return (
        <Card className="shadow-sm overflow-hidden">
            <div className="h-20 bg-linear-to-r from-primary/30 via-primary/10 to-transparent" />
            <CardContent className="px-6 pb-6 -mt-10">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="relative shrink-0">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                            <AvatarImage src={getImageUrl(profile?.profile_pic_url)} alt={profile?.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold uppercase">
                                {profile?.name?.trim().charAt(0) || 'T'}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={avatarUploading}
                            className="absolute bottom-0 end-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border-2 border-background hover:bg-primary/90 transition-colors"
                            data-testid="teacher-upload-avatar-button"
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
                        {teacher?.subjects?.title && (
                            <Badge variant="secondary" className="mt-2">{teacher.subjects.title}</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
