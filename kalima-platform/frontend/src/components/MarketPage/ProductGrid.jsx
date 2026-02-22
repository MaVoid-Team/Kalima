import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

    const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
    const NextIcon = isRtl ? ChevronLeft : ChevronRight;

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
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
                        }}
                    >
                        <ProductCard {...product} />
                    </motion.div>
                ))}
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                    >
                        <PrevIcon className="h-4 w-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        {t("pagination.page")} {pagination.currentPage}{" "}
                        {t("pagination.of")} {pagination.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                    >
                        <NextIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
