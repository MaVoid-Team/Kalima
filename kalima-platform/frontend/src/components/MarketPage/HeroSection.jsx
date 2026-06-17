import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { motion } from "framer-motion";

/**
 * HeroSection
 * Props:
 *   - onSearch: (query: string) => void  — called (debounced) on input change
 */
export default function HeroSection({ onSearch }) {
  const { t } = useTranslation("market");
  const debounceRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleValueChange = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(value);
    }, 400);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
      }}
      className="container py-8 md:py-12 flex flex-col items-center text-center"
    >
      <motion.h1
        variants={itemVariants}
        className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 max-w-4xl leading-[1.15] text-balance"
      >
        {t("hero.title")}{" "}
        <span className="block mt-2 text-primary">{t("hero.titleHighlight")}</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="hidden md:block text-muted-foreground text-base md:text-xl max-w-2xl mb-6 md:mb-8 font-light text-balance px-4"
      >
        {t("hero.subtitle")}
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="w-full max-w-lg mb-6 md:mb-8 px-2"
      >
        <Command className="rounded-xl border shadow-md" shouldFilter={false}>
          <div className="relative">
            <CommandInput
              placeholder={t("hero.searchPlaceholder")}
              className="h-12"
              onValueChange={handleValueChange}
              data-testid="market-hero-search-input"
            />
          </div>
          <CommandList className="hidden" />
        </Command>
      </motion.div>
    </motion.section>
  );
}
