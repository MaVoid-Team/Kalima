import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Eye, EyeOff, ImageOff, Video, Link as LinkIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from '@/lib/storeUtils';

export default function GalleryManager({ 
    product, 
    onAddImages, 
    onAddVideo, 
    onAddExternalVideo, 
    onUpdateEntry, 
    onRemoveImage, 
    onRemoveVideo, 
    loading 
}) {
    const { t } = useTranslation('admin');
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [externalVideoOpen, setExternalVideoOpen] = useState(false);
    const [externalUrl, setExternalUrl] = useState('');

    // product_gallery_full might not be populated immediately if it's fetched asynchronously 
    // fall back to old product_gallery mapping if not present
    let gallery = product?.product_gallery_full || [];
    if (!product?.product_gallery_full && product?.product_gallery) {
        gallery = product.product_gallery.map(g => ({
            ...g,
            type: 'image',
            url: g.images?.url
        }));
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const formData = new FormData();
        files.forEach(f => formData.append('gallery', f));
        onAddImages(formData);
        e.target.value = '';
    };

    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const formData = new FormData();
        formData.append('video', files[0]);
        onAddVideo(formData);
        e.target.value = '';
    };

    const handleExternalVideoSubmit = (e) => {
        e.preventDefault();
        if (!externalUrl) return;
        onAddExternalVideo(externalUrl);
        setExternalUrl('');
        setExternalVideoOpen(false);
    };

    return (
        <div className="space-y-4" data-testid="gallery-manager">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                />
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleVideoChange}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            <Plus className="me-2 h-4 w-4" />
                            {t('products.detail.addMedia', 'Add Media')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                            <Upload className="me-2 h-4 w-4" />
                            {t('products.detail.addGalleryImages', 'Upload Images')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
                            <Video className="me-2 h-4 w-4" />
                            {t('products.detail.addGalleryVideo', 'Upload Video')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setExternalVideoOpen(true)}>
                            <LinkIcon className="me-2 h-4 w-4" />
                            {t('products.detail.addExternalVideo', 'Add External Video')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={externalVideoOpen} onOpenChange={setExternalVideoOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('products.detail.addExternalVideo', 'Add External Video')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleExternalVideoSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>{t('products.detail.videoUrl', 'Video URL')}</Label>
                                <Input 
                                    placeholder="https://youtube.com/..." 
                                    value={externalUrl} 
                                    onChange={(e) => setExternalUrl(e.target.value)} 
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">{t('products.detail.videoUrlHelp', 'Supported link from Youtube, Vimeo, etc.')}</p>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={!externalUrl || loading}>
                                    {t('common.add', 'Add')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Gallery grid */}
            {gallery.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-lg">
                    <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t('products.detail.noGalleryImages', 'No gallery items found')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {gallery.map((entry) => {
                        const isVideo = entry.type === 'video';
                        const isExternal = isVideo && entry.source_type === 'external';
                        const mediaUrl = isVideo ? entry.url : getImageUrl(entry.url || entry.images?.url);

                        const isYoutube = mediaUrl?.includes('youtube.com') || mediaUrl?.includes('youtu.be');

                        let thumbnail = null;
                        if (isVideo && isYoutube) {
                            // Extract video ID for thumbnail
                            let videoId = '';
                            try {
                                if (mediaUrl.includes('youtube.com/watch')) {
                                    videoId = new URL(mediaUrl).searchParams.get('v');
                                } else if (mediaUrl.includes('youtu.be/')) {
                                    videoId = mediaUrl.split('youtu.be/')[1].split(/[?#]/)[0];
                                }
                            } catch (e) {}
                            if (videoId) {
                                thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }
                        }

                        // Determine active flag (videos might not have toggle functionality, depending on API. Looking at API, Get Full Gallery filters by active: true, but update gallery entry is for images. Wait, the API doesn't specify update for video. We will assume videos are always active or just handle remove for videos.)
                        const isActive = entry.active !== false;

                        return (
                            <div
                                key={`${entry.type}-${entry.id}`}
                                className={`relative group rounded-lg overflow-hidden border border-border bg-muted ${!isActive ? 'opacity-50' : ''}`}
                            >
                                {isVideo ? (
                                    isExternal ? (
                                        thumbnail ? (
                                            <img src={thumbnail} alt="" className="w-full h-32 object-cover" />
                                        ) : (
                                            <div className="w-full h-32 flex flex-col items-center justify-center text-muted-foreground">
                                                <Video className="h-8 w-8 mb-2 opacity-50" />
                                                <span className="text-xs font-medium">External Video</span>
                                            </div>
                                        )
                                    ) : (
                                        <video
                                            src={getImageUrl(mediaUrl)}
                                            className="w-full h-32 object-cover"
                                            controls={false}
                                            muted
                                        />
                                    )
                                ) : mediaUrl ? (
                                    <img
                                        src={mediaUrl}
                                        alt=""
                                        className="w-full h-32 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center">
                                        <ImageOff className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Status badge */}
                                <div className="absolute top-1 start-1 flex gap-1">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs px-1.5 bg-background/80 backdrop-blur"
                                    >
                                        {isVideo ? (isExternal ? 'Ext. Video' : 'Video') : 'Image'}
                                    </Badge>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {!isVideo && onUpdateEntry && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-white hover:bg-white/20"
                                            disabled={loading}
                                            onClick={() => onUpdateEntry(entry.id, { active: !isActive })}
                                            title={t('products.detail.toggleVisibility')}
                                        >
                                            {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-red-500/40"
                                        disabled={loading}
                                        onClick={() => isVideo ? onRemoveVideo(entry.id) : onRemoveImage(entry.id)}
                                        title={t('common.remove', 'Remove')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
