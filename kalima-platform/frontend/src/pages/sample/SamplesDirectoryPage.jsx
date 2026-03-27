import React, { useEffect, useCallback, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileText, Download, ExternalLink, Box, Folder, Video, FileAudio, Image as ImageIcon } from "lucide-react";
import HeroSection from "@/components/MarketPage/HeroSection";
import useApiMutation from "@/hooks/useApiMutation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl, formatFileSize } from "@/lib/storeUtils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import DownloadWithProgress from '@/components/ui/DownloadWithProgress';

export default function SamplesDirectoryPage() {
    const { t, i18n } = useTranslation("market");
    const { mutate, loading } = useApiMutation();

    const [sections, setSections] = useState([]);
    const [fetched, setFetched] = useState(false);

    const isRtl = i18n.dir() === 'rtl';

    const fetchSampleSections = useCallback(async () => {
        setFetched(false);
        try {
            // Depending on backend, /sample-sections might return fully populated nested samples
            const res = await mutate({ endpoint: '/sample-sections', method: 'get' }, false);
            if (res && res.success) {
                // If the sections response doesn't embed samples, we could fetch them here, 
                // but the prompt implies listing sections with nested samples, assuming API provides it.
                // Assuming `res.data` is an array of section objects, and each has `samples` array.
                // Alternatively, we fetch each section if `samples` doesn't exist, but typically active sections carry it.

                // For safety, let's just use what's returned.
                setSections(res.data?.filter(s => s.active) ?? []);
            }
        } catch (error) {
            console.error("Failed to fetch sample sections", error);
        } finally {
            setFetched(true);
        }
    }, [mutate]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSampleSections();
    }, [fetchSampleSections]);

    const getIconForType = (mediaType) => {
        const mt = mediaType?.toLowerCase();
        if (mt === 'video') return <Video className="h-6 w-6 text-blue-500" />;
        if (mt === 'audio') return <FileAudio className="h-6 w-6 text-orange-500" />;
        if (mt === 'image') return <ImageIcon className="h-6 w-6 text-green-500" />;
        return <FileText className="h-6 w-6 text-primary" />;
    };

    return (
        <>
            <HeroSection
                onSearch={() => { }}
                title={t("samples.heroTitle", "Explore Free Samples")}
                subtitle={t("samples.heroSubtitle", "Download or preview high quality resources.")}
                hideSearch={true}
            />

            <div className="container py-12">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {t("samples.availableSamples", "Available Samples")}
                        </h2>
                    </div>

                    {loading && !fetched ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                            <Folder className="h-16 w-16 opacity-30" />
                            <p className="text-lg font-medium">{t("samples.noSamples", "No samples found")}</p>
                        </div>
                    ) : (
                        <Accordion type="multiple" defaultValue={sections.map(s => String(s.id))} className="space-y-4">
                            {sections.map(section => (
                                <AccordionItem key={section.id} value={String(section.id)} className=" border border-border rounded-xl px-5 text-card-foreground">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-4 text-start">
                                            {section.thumbnail_url ? (
                                                <img src={section.thumbnail_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <Folder className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-lg" dir="auto">{section.title}</h3>
                                                {section.description && <p className="text-sm font-normal text-muted-foreground mt-0.5" dir="auto">{section.description}</p>}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-5 border-t border-border/50">
                                        {!section.samples || section.samples.length === 0 ? (
                                            <p className="text-muted-foreground py-4 text-center">{t('samples.noNestedSamples')}</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                                {section.samples.map((sample) => {
                                                    const apiUrl = import.meta.env.VITE_API_URL || '/api/v2';
                                                    const previewUrl = `${apiUrl}/sample-sections/${section.id}/samples/${sample.id}/preview`;
                                                    const downloadUrl = `${apiUrl}/sample-sections/${section.id}/samples/${sample.id}/download`;

                                                    return (
                                                    <div
                                                        key={sample.id}
                                                        className="group flex flex-col justify-between rounded-xl border border-border p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50 bg-background"
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {getIconForType(sample.media_type)}
                                                                <h3 dir="auto" className="font-semibold text-lg line-clamp-2 leading-tight">
                                                                    {t('samples.count')} #{sample.id}
                                                                </h3>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                                <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-xs">
                                                                    {t(`samples.mediaTypes.${sample.media_type}`, sample.media_type)}
                                                                </span>
                                                                {sample.high_quality_size > 0 && <span>{t('samples.hq')}: {formatFileSize(sample.high_quality_size)}</span>}
                                                                {sample.low_quality_size > 0 && <span>{t('samples.lq')}: {formatFileSize(sample.low_quality_size)}</span>}
                                                            </div>

                                                            {sample.product_id && (
                                                                <div className="flex items-start gap-2 pt-3 border-t border-border line-clamp-2">
                                                                    <Box className="h-4 w-4 shrink-0 text-muted-foreground relative top-0.5" />
                                                                    <Link
                                                                        to={`/product/${sample.product_id}`}
                                                                        dir="auto"
                                                                        className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline text-start"
                                                                    >
                                                                        {t('samplePage.viewProduct')}: #{sample.product_id}
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                                                            {sample.high_quality_url && (
                                                                <Button
                                                                    variant="default"
                                                                    className="flex-1"
                                                                    asChild
                                                                >
                                                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                                                        <ExternalLink className={`${isRtl ? 'ms-2' : 'me-2'} h-4 w-4`} />
                                                                        {t("samples.view")}
                                                                    </a>
                                                                </Button>
                                                            )}

                                                            {sample.low_quality_url && (
                                                                <Button variant="outline" className="flex-1" asChild>
                                                                    <a href={downloadUrl} download>
                                                                        <Download className={`${isRtl ? 'ms-2' : 'me-2'} h-4 w-4`} />
                                                                        {t("samples.download")}
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </>
    );
}
