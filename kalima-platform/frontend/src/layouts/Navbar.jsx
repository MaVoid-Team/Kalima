import { useState, useEffect } from "react";
import { Menu, X, Globe, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import logo from "../assets/Logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation("landing");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  const NAV_LINKS = [
    { label: t("navbar.courses"), href: "/courses" },
    { label: t("navbar.teachers"), href: "/teachers" },
    { label: t("navbar.services"), href: "/services" },
    { label: t("navbar.market"), href: "/market" },
    { label: t("navbar.pricing"), href: "/pricing" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background ">
        <div className="container md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 decoration-0">
            <img
              src={logo}
              alt="Kalima Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-bold text-foreground tracking-tight">
              {t("navbar.brand")}
            </span>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Search Trigger */}
              <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">{t("navbar.searchButtonLong")}</span>
                <span className="inline-flex lg:hidden">{t("navbar.searchButtonShort")}</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">{t("navbar.shortcuts.open")}</span>
                </kbd>
              </Button>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="hover:bg-transparent hover:text-primary"
                title={t("navbar.languageToggle")}
              >
                <Globe className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                className="font-bold hover:bg-transparent hover:text-primary"
                asChild
              >
                <Link to="/login">{t("navbar.login")}</Link>
              </Button>
              <Button
                variant="default"
                size="default"
                className="font-bold px-6"
                asChild
              >
                <Link to="/signup">{t("navbar.signup")}</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button with Search Icon nearby if needed, or just keep inside menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 absolute top-16 left-0 right-0  duration-200">
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-base font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border my-2" />

              {/* Language Toggle Mobile */}
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="justify-start gap-2 px-2 py-1 text-base font-medium text-muted-foreground h-auto"
              >
                <Globe className="h-5 w-5" />
                <span>{t("navbar.languageToggle")}</span>
              </Button>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  variant="outline"
                  className="w-full font-bold justify-center"
                  asChild
                >
                  <Link to="/login">{t("navbar.login")}</Link>
                </Button>
                <Button
                  variant="default"
                  className="w-full font-bold justify-center"
                  asChild
                >
                  <Link to="/signup">{t("navbar.signup")}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("navbar.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("navbar.noResults")}</CommandEmpty>
          <CommandGroup heading={t("navbar.pages")}>
            <CommandItem onSelect={() => runCommand(() => navigate("/courses"))}>
              {t("navbar.courses")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/teachers"))}>
              {t("navbar.teachers")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/market"))}>
              {t("navbar.market")}
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/services"))}>
              {t("navbar.services")}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t("navbar.settings")}>
            <CommandItem onSelect={() => runCommand(() => toggleLanguage())}>
              {t("navbar.toggleLanguageAction")}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
