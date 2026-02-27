import { useTranslation } from "react-i18next";
import { PackageOpen } from "lucide-react";
import ProductCard from "./ProductCard";
import { getImageUrl } from "@/lib/storeUtils";
import { motion } from "framer-motion";
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

/**
 * ProductGrid
 * Props:
 *   - products: Array<{ id, title, category, price, image, badge }>
 *   - loading: boolean
 *   - pagination: { currentPage, totalPages } | null
 *   - onPageChange: (page: number) => void
 */
export default function ProductGrid({
    products = [],
    loading = false,
    pagination = null,
    onPageChange,
}) {
    const { t, i18n } = useTranslation("market");
    const isRtl = i18n.dir() === "rtl";

    // Support both { currentPage, totalPages } and { page, total, limit } shapes
    const currentPage = pagination?.currentPage ?? pagination?.page ?? 1;
    const totalPages = pagination?.totalPages ??
        (pagination?.limit ? Math.ceil((pagination?.total ?? 0) / pagination.limit) : 1);
    const paginationLinks = generatePaginationLinks(currentPage, totalPages);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="rounded-4xl bg-muted animate-pulse aspect-4/5 sm:aspect-square" />
                        <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                        <div className="h-3 bg-muted animate-pulse rounded w-2/5" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <PackageOpen className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-lg font-semibold text-foreground">
                    {t("emptyState.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                    {t("emptyState.description")}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Product Grid */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                    },
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12"
            >
                {products.map((product) => {
                    const mappedProduct = {
                        ...product,
                        category: product.product_categories?.[0]?.categories?.title || product.category,
                        priceAfterDiscount: product.price_after_discount,
                        image: getImageUrl(product.thumbnail_image?.url) || product.image,
                        price: product.price,
                        isPurchased: product.isPurchased,
                    };
                    return (
                        <motion.div
                            key={product.id}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
                            }}
                        >
                            <ProductCard {...mappedProduct} />
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }}
                                aria-disabled={currentPage <= 1}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                text={isRtl ? t("pagination.next", "التالي") : t("pagination.prev", "السابق")}
                                data-testid="market-grid-prev-page-button"
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
                                        href="#"
                                        isActive={link === currentPage}
                                        onClick={(e) => { e.preventDefault(); onPageChange(link); }}
                                        data-testid={`market-grid-page-${link}`}
                                    >
                                        {link}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1); }}
                                aria-disabled={currentPage >= totalPages}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                                text={isRtl ? t("pagination.prev", "السابق") : t("pagination.next", "التالي")}
                                data-testid="market-grid-next-page-button"
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
