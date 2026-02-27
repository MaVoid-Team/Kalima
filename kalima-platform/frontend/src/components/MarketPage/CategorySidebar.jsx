import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutGrid, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/**
 * Recursive Category Item Component
 */
function CategoryItem({ category, selectedId, onSelect, depth = 0 }) {
  const hasChildren =
    category.sub_categories && category.sub_categories.length > 0;
  const isSelected = String(selectedId) === String(category.id);
  const [isExpanded, setIsExpanded] = useState(isSelected || false);

  const handleToggle = (e) => {
    if (hasChildren) {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onSelect(category.id);
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleSelect}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-start w-full group",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted",
        )}
        style={{ paddingInlineStart: `${depth * 12 + 12}px` }}
        data-testid={`market-category-${category.id}-button`}
      >
        {hasChildren && (
          <span
            onClick={handleToggle}
            className="p-1 -ms-1 hover:bg-primary-foreground/20 rounded-md transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )}
          </span>
        )}
        {!hasChildren && depth > 0 && (
          <span className="w-3.5 h-3.5 shrink-0" /> // Spacer for alignment
        )}
        <span className="truncate">{category.title ?? category.name}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className="flex flex-col mt-0.5">
          {category.sub_categories.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * CategorySidebar
 * Props:
 *   - categories: Array<{ id, title, sub_categories: [] }>
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
      className="w-full md:w-64 shrink-0"
    >
      <nav className="flex flex-col gap-1">
        {/* All Categories */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-start w-full mb-1",
            selectedId === null
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted",
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

        {/* Recursive Category list */}
        {!loading &&
          categories
            .filter((cat) => !cat.parent_id && !cat.parent)
            .map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <CategoryItem
                  category={cat}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  depth={0}
                />
              </motion.div>
            ))}
      </nav>
    </motion.aside>
  );
}
