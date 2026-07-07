import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export default function NavbarCommandPalette({
  open,
  setOpen,
  commandValue,
  setCommandValue,
  t,
  runCommand,
  navigate,
  hasStoreAccess,
  canShowMarketToUser,
  canShowEBookletStoreToUser,
  isAuthenticated,
  isTeacher,
  hasAdminAccess,
  eBookletOrdersRoute,
  toggleLanguage,
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      commandProps={{ value: commandValue, onValueChange: setCommandValue }}
    >
      <CommandInput placeholder={t("navbar.searchPlaceholder")} />
      <CommandList>
        <CommandEmpty>{t("navbar.noResults")}</CommandEmpty>
        <CommandGroup heading={t("navbar.pages")}>
          {hasStoreAccess && (
            <CommandItem value="/samples" onSelect={() => runCommand(() => navigate("/samples"))}>
              {t("navbar.samples")}
            </CommandItem>
          )}
          {canShowMarketToUser && (
            <CommandItem value="/market" onSelect={() => runCommand(() => navigate("/market"))}>
              {t("navbar.market")}
            </CommandItem>
          )}
          {canShowEBookletStoreToUser && (
            <CommandItem value="/e-booklets" onSelect={() => runCommand(() => navigate("/e-booklets"))}>
              {t("navbar.eBooklets")}
            </CommandItem>
          )}
          {isAuthenticated && isTeacher && !hasAdminAccess && (
            <CommandItem value={eBookletOrdersRoute} onSelect={() => runCommand(() => navigate(eBookletOrdersRoute))}>
              {t("navbar.eBookletOrders")}
            </CommandItem>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("navbar.settings")}>
          <CommandItem onSelect={() => runCommand(() => toggleLanguage())}>
            {t("navbar.toggleLanguageAction")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
