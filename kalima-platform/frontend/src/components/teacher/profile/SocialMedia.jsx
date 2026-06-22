import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkIcon } from 'lucide-react';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SocialMedia() {
    const { t } = useTranslation('teacher');
    const { links, fetchSocialMedia } = useSocialMedia();

    useEffect(() => {
        fetchSocialMedia();
    }, [fetchSocialMedia]);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    {t('profile.socialMedia', 'Social Media')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {links.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        {t('profile.noSocialMedia', 'No social media links added yet.')}
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {links.map((link) => (
                            <div key={link.id} className="rounded-xl border bg-muted/30 p-4">
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="break-words text-sm font-semibold text-primary underline underline-offset-2"
                                >
                                    {link.url}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
