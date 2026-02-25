import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

/**
 * CategorySidebar
 * Props:
 *   - categories: Array<{ id, name }>
 *   - selectedId: string | null
 *   - onSelect: (id: string | null) => void
 *   - loading: boolean
 */
export default function CategorySidebar({
    categories = [],
    selectedId,
    onSelect,
    loading = false,
}) {
    const { t } = useTranslation("market");

    return (
        <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full md:w-56 shrink-0"
        >
            <nav className="flex flex-col gap-1">
                {/* All Categories */}
                <button
                    onClick={() => onSelect(null)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-start w-full",
                        selectedId === null
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                    )}
                    data-testid="market-category-all-button"
                >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    {t("sidebar.allCategories")}
                </button>

                {/* Skeleton while loading */}
                {loading &&
                    Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 rounded-lg bg-muted animate-pulse mx-1"
                        />
                    ))}

                {/* Category list */}
                {!loading &&
                    categories.map((cat, i) => (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-start w-full",
                                selectedId === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                            )}
                            data-testid={`market-category-${cat.id}-button`}
                        >
                            <span className="truncate">{cat.title ?? cat.name}</span>
                        </motion.button>
                    ))}
            </nav>
        </motion.aside>
    );
}
