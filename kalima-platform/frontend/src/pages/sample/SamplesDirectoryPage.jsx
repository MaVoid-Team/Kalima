import React, { useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileText, Download, ExternalLink, Box } from "lucide-react";
import HeroSection from "@/components/MarketPage/HeroSection";
import useApiMutation from "@/hooks/useApiMutation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl, formatFileSize } from "@/lib/storeUtils";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
    generatePaginationLinks,
} from "@/components/ui/pagination";

const LIMIT = 8;

export default function SamplesDirectoryPage() {
    const { t, i18n } = useTranslation("market");
    const { mutate, loading } = useApiMutation();

    const [samples, setSamples] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [paginationMeta, setPaginationMeta] = React.useState({ total: 0, page: 1, limit: LIMIT });

    const isRtl = i18n.dir() === 'rtl';

    const fetchSamples = useCallback((currentPage) => {
        setFetched(false);
        const query = new URLSearchParams({ page: currentPage, limit: LIMIT });
        mutate({ endpoint: `/samples?${query.toString()}`, method: 'get' })
            .then(res => {
                if (res?.success) {
                    setSamples(res.data ?? []);
                    setPaginationMeta({
                        total: res.total ?? (res.data?.length ?? 0),
                        page: res.page ?? currentPage,
                        limit: res.limit ?? LIMIT,
                    });
                }
                setFetched(true);
            })
            .catch(() => setFetched(true));
    }, [mutate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchSamples(page);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalPages = Math.ceil(paginationMeta.total / paginationMeta.limit) || 1;
    const currentPage = paginationMeta.page;
    const paginationLinks = generatePaginationLinks(currentPage, totalPages);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPage(newPage);
    };

    return (
        <>
            <HeroSection
                onSearch={() => { }}
                title={t("samples.heroTitle", "Explore Free Samples")}
                subtitle={t("samples.heroSubtitle", "Download or preview high quality resources.")}
            />

            <div className="container py-12">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {t("samples.availableSamples", "Available Samples")}
                        </h2>
                        {fetched && !loading && (
                            <span className="text-muted-foreground text-sm font-medium">
                                {paginationMeta.total} {t("samples.count", "Samples")}
                            </span>
                        )}
                    </div>

                    {loading && !fetched ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(LIMIT)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="mt-4 flex gap-2">
                                        <Skeleton className="h-9 flex-1" />
                                        <Skeleton className="h-9 flex-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : samples.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                            <FileText className="h-16 w-16 opacity-30" />
                            <p className="text-lg font-medium">{t("samples.noSamples", "No samples found")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {samples.map((sample) => {
                                    const isPdf = sample.mime_type === 'application/pdf';
                                    return (
                                        <div
                                            key={sample.id}
                                            className="group flex flex-col justify-between rounded-xl border border-border p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                                        >
                                            <div className="space-y-4">
                                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                    <FileText className="h-6 w-6" />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-lg line-clamp-2 leading-tight" title={sample.original_name}>
                                                        {sample.original_name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                        <span className="font-medium bg-muted px-2 py-0.5 rounded-md text-xs">
                                                            {isPdf ? 'PDF' : 'DOC'}
                                                        </span>
                                                        <span>{formatFileSize(sample.size)}</span>
                                                    </div>
                                                </div>

                                                {sample.products && (
                                                    <div className="flex items-start gap-2 pt-3 border-t border-border line-clamp-2">
                                                        <Box className="h-4 w-4 shrink-0 text-muted-foreground relative top-0.5" />
                                                        <Link
                                                            to={`/product/${sample.products.id}`}
                                                            className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
                                                        >
                                                            {sample.products.title}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                                                <Button
                                                    variant={isPdf ? "default" : "outline"}
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <Link to={`/samples/${sample.id}`} state={{ cameFromAdmin: false }}>
                                                        <ExternalLink className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                                                        {t("samples.view", "Preview")}
                                                    </Link>
                                                </Button>

                                                <Button
                                                    variant={isPdf ? "outline" : "default"}
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <a href={getImageUrl(sample.url)} download target="_blank" rel="noopener noreferrer">
                                                        <Download className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                                                        {t("samples.download", "Download")}
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                aria-disabled={currentPage <= 1}
                                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                text={t("pagination.prev", "Previous")}
                                                data-testid="samples-pagination-prev-button"
                                            />
                                        </PaginationItem>

                                        {paginationLinks.map((link, idx) =>
                                            link === "ellipsis" ? (
                                                <PaginationItem key={`ellipsis-${idx}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={link}>
                                                    <PaginationLink
                                                        isActive={link === currentPage}
                                                        onClick={() => handlePageChange(link)}
                                                        className="cursor-pointer"
                                                        data-testid={`samples-pagination-page-${link}`}
                                                    >
                                                        {link}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                aria-disabled={currentPage >= totalPages}
                                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                text={t("pagination.next", "Next")}
                                                data-testid="samples-pagination-next-button"
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
