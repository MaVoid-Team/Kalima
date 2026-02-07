import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export default function HeroSection() {
  const { t } = useTranslation("market");

  const popularTags = [
    { key: "ipadPlanners", label: t("hero.tags.ipadPlanners") },
    { key: "stemKits", label: t("hero.tags.stemKits") },
    { key: "math101", label: t("hero.tags.math101") },
    { key: "artSupplies", label: t("hero.tags.artSupplies") },
  ];

  return (
    <section className="container py-8 flex flex-col items-center text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]">
        {t("hero.title")}{" "}
        <span className="block mt-2">{t("hero.titleHighlight")}</span>
      </h1>

      <p className="text-muted-foreground text-lg md:text-xl max-w-2xl  mb-4 font-light">
        {t("hero.subtitle")}
      </p>

      <div className="w-full max-w-2xl mb-4">
        <Command>
          <div className="relative">
            <CommandInput
              placeholder={t("hero.searchPlaceholder")}
            />
          </div>
          <CommandList className="top-full left-0 w-full bg-popover rounded-b-lg shadow-lg z-50 mt-1 hidden group-focus-within:block">
            {/* <CommandEmpty>No results found.</CommandEmpty> */}
            {/* Add standard suggestions or search results here */}
          </CommandList>
        </Command>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {t("hero.popular")}
        </span>
        {popularTags.map((tag) => (
          <Badge key={tag.key} variant="secondary" className="px-4 py-1.5 ">
            {tag.label}
          </Badge>
        ))}
      </div>
    </section>
  );
}
