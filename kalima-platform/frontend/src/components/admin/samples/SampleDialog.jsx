import { useTranslation } from 'react-i18next';
import { Upload, X, Loader2, AlertCircle, Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { useAdminSampleSections } from '@/hooks/admin/useAdminSampleSections';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

const detectMediaType = (file) => {
    if (!file) return null;
    const type = file.type;
    const name = file.name.toLowerCase();

    // Check by mime type first
    if (type.includes('pdf')) return 'pdf';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('word') || type.includes('officedocument.wordprocessingml')) return 'word';
    if (type.includes('powerpoint') || type.includes('presentationml')) return 'powerpoint';

    // Check by extension fallback
    if (name.endsWith('.pdf')) return 'pdf';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].some(ext => name.endsWith(ext))) return 'image';
    if (['.mp4', '.webm', '.ogg', '.mov'].some(ext => name.endsWith(ext))) return 'video';
    if (['.mp3', '.wav', '.ogg', '.aac', '.m4a'].some(ext => name.endsWith(ext))) return 'audio';
    if (['.doc', '.docx'].some(ext => name.endsWith(ext))) return 'word';
    if (['.ppt', '.pptx'].some(ext => name.endsWith(ext))) return 'powerpoint';

    return null;
};

export default function SampleDialog({ open, onOpenChange, sectionId, sample, onCreate, onUpdate, showMediaTypeSelector = true }) {
    const { t, i18n } = useTranslation('admin');
    const { products, setSearch, loading: productsLoading } = useProducts({
        initialParams: {
            page: null,
            limit: null,
            is_archived: null
        }
    });

    const { sections, fetchSections, loading: sectionsLoading } = useAdminSampleSections();
    const [title, setTitle] = useState(sample?.title || '');
    const [selectedSectionId, setSelectedSectionId] = useState(sectionId?.toString() || '');
    const [mediaType, setMediaType] = useState(sample?.media_type || 'pdf');

    const showHQ = !['word', 'powerpoint'].includes(mediaType);

    const [productId, setProductId] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [openPicker, setOpenPicker] = useState(false);

    const [hqFileName, setHqFileName] = useState('');
    const [lqFileName, setLqFileName] = useState('');

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationError, setValidationError] = useState('');

    const hqFileRef = useRef(null);
    const lqFileRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        if (sample) {
            setProductId(sample.product_id ? String(sample.product_id) : '');
            setTitle(sample.title || '');
            setMediaType(sample.media_type || 'pdf');
            setSelectedSectionId(sectionId || (sample.section_id ? String(sample.section_id) : ''));
            const name = sample.original_name || '';
            setHqFileName(sample.high_quality_url ? name : '');
            setLqFileName(sample.low_quality_url ? name : '');
        } else {
            setProductId('');
            setTitle('');
            setMediaType('pdf');
            setSelectedSectionId(sectionId || '');
            setHqFileName('');
            setLqFileName('');
        }
        setValidationError('');
    }, [sample, open, sectionId]);

    useEffect(() => {
        if (open && !sectionId && sections.length === 0) {
            fetchSections();
        }
    }, [open, sectionId, sections.length, fetchSections]);

    useEffect(() => {
        if (open) {
            setSearch(productSearch);
        }
    }, [productSearch, open, setSearch]);

    const selectedProduct = products.find(p => String(p.id) === String(productId));

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setUploading(false);
    };

    const getTypes = (newHq = null, newLq = null) => {
        const hqFile = newHq || hqFileRef.current?.files?.[0];
        const lqFile = newLq || lqFileRef.current?.files?.[0];

        // HQ is considered to "exist" if a new one is selected OR if it's already on the server
        const hqExists = hqFile || (sample && sample.high_quality_url);
        const lqExists = lqFile || (sample && sample.low_quality_url);

        const hqType = hqFile ? detectMediaType(hqFile) : (sample ? sample.media_type : null);
        const lqType = lqFile ? detectMediaType(lqFile) : (sample ? sample.media_type : null);

        return { hqExists, lqExists, hqType, lqType };
    };

    const validateFiles = (newHq = null, newLq = null, overrideTitle = null) => {
        const hqFileToCheck = newHq || hqFileRef.current?.files?.[0];
        const lqFileToCheck = newLq || lqFileRef.current?.files?.[0];
        const { hqType, lqType } = getTypes(newHq, newLq);

        if (!sectionId && !selectedSectionId) return t('samples.errors.sectionRequired', 'Sample section is required');

        const currentTitle = overrideTitle !== null ? overrideTitle : title;
        if (!currentTitle.trim()) return t('samples.errors.titleRequired');

        const hqExists = !!sample?.high_quality_url || !!hqFileToCheck;
        const lqExists = !!sample?.low_quality_url || !!lqFileToCheck;

        if (showHQ && !hqExists) return t('samples.errors.noHqFile', 'High quality file is required.');
        if (!showHQ && !lqExists) return t('samples.errors.noLqFile', 'Low quality file is required for this media type.');

        // Check for unsupported formats first
        if (hqExists && !hqType && (newHq || hqFileRef.current?.files?.[0])) return t('samples.errors.unsupportedType');
        if (lqExists && !lqType && (newLq || lqFileRef.current?.files?.[0])) return t('samples.errors.unsupportedType');

        // If both exist, they MUST match
        if (hqExists && lqExists && hqType && lqType && hqType !== lqType) {
            return t('samples.errors.mismatchedTypes');
        }

        return '';
    };

    const isInvalid = !title.trim() || (!sectionId && !selectedSectionId) || (showHQ && !hqFileName && !sample?.high_quality_url);
    const isSubmitDisabled = uploading || isInvalid;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const error = validateFiles();
        if (error) {
            setValidationError(error);
            return;
        }

        const { hqType, lqType } = getTypes();
        const finalMediaType = (hqFileRef.current?.files?.[0] ? detectMediaType(hqFileRef.current.files[0]) : null) ||
            (lqFileRef.current?.files?.[0] ? detectMediaType(lqFileRef.current.files[0]) : null) ||
            mediaType;

        if (!finalMediaType) {
            setValidationError(t('samples.errors.unsupportedType', 'Unable to determine media type.'));
            return;
        }

        setValidationError('');
        const formData = new FormData();
        formData.append('media_type', finalMediaType);
        if (productId) formData.append('product_id', productId);
        if (title) formData.append('title', title);
        if (!sectionId && selectedSectionId) formData.append('sample_section_id', selectedSectionId);

        const hqFile = hqFileRef.current?.files?.[0];
        const lqFile = lqFileRef.current?.files?.[0];
        if (hqFile) formData.append('high_quality', hqFile);
        if (lqFile) formData.append('low_quality', lqFile);

        setUploading(true);
        setUploadProgress(0);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const onProgress = (progressEvent) => {
            if (progressEvent.total) {
                setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
        };

        try {
            let success = false;
            if (sample) {
                success = await onUpdate(sample.id, formData, onProgress, abortController.signal);
            } else {
                success = await onCreate(formData, onProgress, abortController.signal);
            }

            if (success) {
                onOpenChange(false);
                setProductId('');
                if (hqFileRef.current) hqFileRef.current.value = '';
                if (lqFileRef.current) lqFileRef.current.value = '';
            }
        } catch (error) {
            if (error?.name !== 'AbortError') {
                toast.error(t('samples.errors.uploadFailed', 'Failed to upload sample.'));
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
            abortControllerRef.current = null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !uploading && onOpenChange(val)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {sample ? t('samples.editTitle', 'Edit Sample') : t('samples.addTitle', 'Add Sample')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('samples.description', 'Upload sample files for protected preview and download.')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">{t('samples.titleLabel', 'Sample Title')} *</Label>
                        <Input
                            id="title"
                            placeholder={t('samples.titlePlaceholder')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading}
                        />
                    </div>

                    {!sectionId && (
                        <div className="grid gap-2">
                            <Label>{t('samples.table.section', 'Section')} *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "justify-between w-full font-normal",
                                            uploading && "!bg-neutral-800 !text-neutral-500 !opacity-30 !cursor-not-allowed grayscale"
                                        )}
                                        disabled={uploading}
                                    >
                                        {selectedSectionId ? sections.find(s => String(s.id) === String(selectedSectionId))?.title : t('samples.selectSection', 'Select a section...')}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder={t('samples.table.searchSection', 'Search sections...')} />
                                        <CommandList>
                                            <CommandEmpty>{sectionsLoading ? t('common.loading') : t('samples.noSectionsFound', 'No sections found.')}</CommandEmpty>
                                            <CommandGroup>
                                                {sections.map((s) => (
                                                    <CommandItem
                                                        key={s.id}
                                                        value={String(s.id)}
                                                        onSelect={(currentValue) => {
                                                            setSelectedSectionId(currentValue);
                                                            // We cannot auto-close popover easily without state, so we tolerate it open or add close logic.
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4 shrink-0", String(selectedSectionId) === String(s.id) ? "opacity-100" : "opacity-0", i18n.dir() === "rtl" ? "scale-x-[-1]" : "")} />
                                                        <span className="truncate">{s.title}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>{t('samples.table.product', 'Associated Product')}</Label>
                        <Popover open={openPicker} onOpenChange={setOpenPicker}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openPicker}
                                    className={cn(
                                        "justify-between w-full font-normal",
                                        uploading && "!bg-neutral-800 !text-neutral-500 !opacity-30 !cursor-not-allowed grayscale"
                                    )}
                                    disabled={uploading}
                                >
                                    {productId ? (
                                        selectedProduct ? selectedProduct.title :
                                            (sample && String(sample.product_id) === String(productId) ? t('common.loading') : `${t('samples.idLabel', 'ID')}: ${productId}`)
                                    ) : t('samples.noAssociatedProduct', 'No Associated Product')}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder={t('products.searchPlaceholder', 'Search products...')}
                                        value={productSearch}
                                        onValueChange={setProductSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {productsLoading ? t('common.loading') : t('products.noProducts')}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="none"
                                                onSelect={() => {
                                                    setProductId('');
                                                    setOpenPicker(false);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Check className={cn("mr-2 h-4 w-4", !productId ? "opacity-100" : "opacity-0", i18n.dir() === "rtl" ? "scale-x-[-1]" : "")} />
                                                    {t('samples.noAssociatedProduct', 'No Associated Product')}
                                                </div>
                                            </CommandItem>

                                            {products.map((p) => (
                                                <CommandItem
                                                    key={p.id}
                                                    value={String(p.id)}
                                                    onSelect={(currentValue) => {
                                                        setProductId(currentValue === String(productId) ? "" : currentValue);
                                                        setOpenPicker(false);
                                                    }}
                                                >
                                                    <div className="flex items-center overflow-hidden">
                                                        <Check className={cn("mr-2 h-4 w-4 shrink-0", String(productId) === String(p.id) ? "opacity-100" : "opacity-0", i18n.dir() === "rtl" ? "scale-x-[-1]" : "")} />
                                                        <span className="truncate">{p.title}</span>
                                                        <span className="ms-2 text-[10px] text-muted-foreground shrink-0">(#{p.id})</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-[10px] text-muted-foreground">{t('samples.productHint', 'Optional. Connect this sample to a specific product.')}</p>
                    </div>

                    {showMediaTypeSelector && (
                        <div className="grid gap-2">
                            <Label>{t('samples.mediaTypeLabel', 'Media Type')}</Label>
                            <Select dir={i18n.dir()} value={mediaType} onValueChange={(val) => {
                                setMediaType(val);
                                if (val === 'word' || val === 'powerpoint') {
                                    if (hqFileRef.current) hqFileRef.current.value = '';
                                    setHqFileName('');
                                }
                                setValidationError('');
                            }} disabled={!!sample || uploading}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">{t('samples.mediaTypes.pdf', 'PDF Document')}</SelectItem>
                                    <SelectItem value="image">{t('samples.mediaTypes.image', 'Image')}</SelectItem>
                                    <SelectItem value="video">{t('samples.mediaTypes.video', 'Video')}</SelectItem>
                                    <SelectItem value="audio">{t('samples.mediaTypes.audio', 'Audio')}</SelectItem>
                                    <SelectItem value="word">{t('samples.mediaTypes.word', 'Word Document')}</SelectItem>
                                    <SelectItem value="powerpoint">{t('samples.mediaTypes.powerpoint', 'PowerPoint')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showHQ && (
                        <div className="grid gap-2">
                            <Label htmlFor="hq-file">{t('samples.hqFileLabel', 'High Quality File (Protected)')} *</Label>
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => hqFileRef.current?.click()}
                                    disabled={uploading}
                                    className={cn(
                                        "justify-start font-normal text-muted-foreground h-10 px-3",
                                        uploading && "!bg-neutral-800 !text-neutral-500 !opacity-30 !cursor-not-allowed grayscale"
                                    )}
                                >
                                    <Upload className="h-4 w-4 me-2 shrink-0" />
                                    <span className="truncate">
                                        {hqFileName || t('common.chooseFile', 'Choose File')}
                                    </span>
                                </Button>
                                <input
                                    id="hq-file"
                                    type="file"
                                    ref={hqFileRef}
                                    className="hidden"
                                    accept={mediaType === 'pdf' ? '.pdf,application/pdf' : mediaType === 'video' ? '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime' : mediaType === 'audio' ? '.mp3,.wav,.ogg,.aac,.m4a,audio/*' : mediaType === 'image' ? '.jpg,.jpeg,.png,.webp,.gif,.svg,image/*' : '*/*'}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setHqFileName(file.name);
                                            // Auto-populate title from filename if currently empty
                                            let updatedTitle = title;
                                            if (!title.trim()) {
                                                const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
                                                updatedTitle = nameWithoutExt || file.name;
                                                setTitle(updatedTitle);
                                            }
                                            const error = validateFiles(file, null, updatedTitle);
                                            setValidationError(error);

                                            const detected = detectMediaType(file);
                                            if (detected) {
                                                setMediaType(detected);
                                            }
                                        } else {
                                            setHqFileName('');
                                            setValidationError(validateFiles(null, null));
                                        }
                                    }}
                                    disabled={uploading}
                                    required={!sample}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">{t('samples.hqNote', 'Used for in-app protected preview.')}</p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="lq-file">{t('samples.lqFileLabel', 'Low Quality File (Downloadable)')} {!showHQ ? '*' : ''}</Label>
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => lqFileRef.current?.click()}
                                disabled={uploading}
                                className={cn(
                                    "justify-start font-normal text-muted-foreground h-10 px-3",
                                    uploading && "!bg-neutral-800 !text-neutral-500 !opacity-30 !cursor-not-allowed grayscale"
                                )}
                            >
                                <Upload className="h-4 w-4 me-2 shrink-0" />
                                <span className="truncate">
                                    {lqFileName || t('common.chooseFile', 'Choose File')}
                                </span>
                            </Button>
                            <input
                                id="lq-file"
                                type="file"
                                ref={lqFileRef}
                                className="hidden"
                                accept={mediaType === 'pdf' ? '.pdf,application/pdf' : mediaType === 'word' ? '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : mediaType === 'powerpoint' ? '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation' : mediaType === 'video' ? '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime' : mediaType === 'audio' ? '.mp3,.wav,.ogg,.aac,.m4a,audio/*' : mediaType === 'image' ? '.jpg,.jpeg,.png,.webp,.gif,.svg,image/*' : '*/*'}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setLqFileName(file.name);
                                        // Auto-populate title from filename if currently empty
                                        let updatedTitle = title;
                                        if (!title.trim()) {
                                            const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
                                            updatedTitle = nameWithoutExt || file.name;
                                            setTitle(updatedTitle);
                                        }
                                        const error = validateFiles(null, file, updatedTitle);
                                        setValidationError(error);

                                        const detected = detectMediaType(file);
                                        if (detected && !hqFileRef.current?.files?.[0]) {
                                            setMediaType(detected);
                                        }
                                    } else {
                                        setLqFileName('');
                                        setValidationError(validateFiles(null, null));
                                    }
                                }}
                                disabled={uploading}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{t('samples.lqNote', 'Optional. The file available for user download.')}</p>
                    </div>

                    {!sample && (
                        <div className="flex items-center gap-2 pt-2">
                            <span className="text-xs font-medium text-muted-foreground">{t('samples.detectedType', 'Detected Media Type')}:</span>
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                {mediaType ? t(`samples.mediaTypes.${mediaType}`, mediaType) : t('common.na')}
                            </Badge>
                        </div>
                    )}

                    {validationError && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2 rounded-lg flex items-center animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 me-2 shrink-0" />
                            {validationError}
                        </div>
                    )}

                    {uploading && (
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-xs font-medium">
                                <span>{uploadProgress < 100 ? t('common.uploading', 'Uploading...') : t('common.processing', 'Processing...')}</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={uploading && uploadProgress === 0}
                            onClick={() => uploading ? handleCancelUpload() : onOpenChange(false)}
                            className={cn(uploading && "!bg-neutral-800 !text-neutral-500 !opacity-30 !cursor-not-allowed grayscale")}
                        >
                            {uploading ? <><X className="h-4 w-4 me-2" /> {t('common.cancel')}</> : t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className={cn(
                                isSubmitDisabled && "!bg-neutral-800 !text-neutral-500 !opacity-30 !cursor-not-allowed grayscale !border-transparent"
                            )}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                    {t('common.uploading', 'Uploading...')}
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 me-2" />
                                    {sample ? t('common.save') : t('common.add')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
