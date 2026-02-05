import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import logo from "../assets/Logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation("landing");
  const rtl = i18n.dir() === "rtl";

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const NAV_LINKS = [
    { label: t("navbar.courses"), href: "/courses" },
    { label: t("navbar.teachers"), href: "/teachers" },
    { label: t("navbar.services"), href: "/services" },
    { label: t("navbar.pricing"), href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background ">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 decoration-0">
          <img
            src={logo}
            alt="Kalima Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-xl font-bold text-foreground tracking-tight">
            {rtl ? "كلمة" : "Kalima"}
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
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full hover:bg-transparent hover:text-brand"
              title={rtl ? "English" : "العربية"}
            >
              <Globe className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              className="font-bold hover:bg-transparent hover:text-brand"
            >
              {t("navbar.login")}
            </Button>
            <Button className="rounded-full font-bold bg-brand text-white px-6">
              {t("navbar.signup")}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 absolute top-16 left-0 right-0 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-base font-medium text-foreground hover:text-primary transition-colors px-2 py-1 ${rtl ? "text-right" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />

            {/* Language Toggle Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-2 py-1 text-base font-medium text-muted-foreground transition-colors"
            >
              <Globe className="h-5 w-5" />
              <span>{rtl ? "English" : "العربية"}</span>
            </button>

            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="outline"
                className="w-full font-bold  justify-center"
              >
                {t("navbar.login")}
              </Button>
              <Button className="w-full font-bold bg-brand text-white justify-center">
                {t("navbar.signup")}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
