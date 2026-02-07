import { useState, useEffect } from "react";
import { Menu, X, Globe, Search, ShoppingCart } from "lucide-react";
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
import CartPreview from "../components/cart/CartPreview";

export default function Navbar() {
  const [cartItems] = useState([
    {
      id: 'item-1',
      name: 'Algebra Basics Booklet',
      description: 'A beginner-friendly algebra booklet.',
      price: 9.99,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Algebra'
    },
    {
      id: 'item-2',
      name: 'English Grammar Guide',
      description: 'Concise grammar rules and exercises.',
      price: 7.5,
      quantity: 2,
      image: 'https://via.placeholder.com/150?text=Grammar'
    },
    {
      id: 'item-3',
      name: 'Physics Problem Sets',
      description: 'Challenging problems with solutions.',
      price: 12.0,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Physics'
    },
    {
      id: 'item-4',
      name: 'Chemistry Lab Notes',
      description: 'Key lab techniques and safety tips.',
      price: 8.25,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Chemistry'
    },
    {
      id: 'item-5',
      name: 'World History Timeline',
      description: 'Important events summarized.',
      price: 5.99,
      quantity: 3,
      image: 'https://via.placeholder.com/150?text=History'
    },
    {
      id: 'item-6',
      name: 'Biology Illustrated',
      description: 'Visual guide to biological concepts.',
      price: 11.5,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Biology'
    },
    {
      id: 'item-7',
      name: 'Geography Maps Pack',
      description: 'High-quality printable maps.',
      price: 6.0,
      quantity: 2,
      image: 'https://via.placeholder.com/150?text=Maps'
    },
    {
      id: 'item-8',
      name: 'Arabic Reading Set',
      description: 'Beginner reading exercises in Arabic.',
      price: 9.0,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Arabic'
    },
    {
      id: 'item-9',
      name: 'Programming Fundamentals',
      description: 'Intro to coding concepts and exercises.',
      price: 14.99,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Code'
    },
    {
      id: 'item-10',
      name: 'Exam Prep Pack',
      description: 'Practice tests and solutions.',
      price: 19.99,
      quantity: 1,
      image: 'https://via.placeholder.com/150?text=Exam+Prep'
    }
  ]);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
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

  const toggleCartModal = () => {
    setIsCartModalOpen(!isCartModalOpen);
    setIsMenuOpen(false);
  };

  const handleViewFullCart = () => {
    setIsCartModalOpen(false);
    navigate("/cart", { state: { cart: cartItems } }); // Pass cart items to the cart page
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

              {/* Cart Button Desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCartModal}
                className="relative hover:bg-transparent hover:text-primary"
                title={t("navbar.cartToggle")}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className={`absolute -top-2 ${i18n.language === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                  {cartItems.length}
                </span>
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

            {/* Cart Button */}
            {/* Note that this button will take the place of login/signup buttons after logging in */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCartModal}
              className="relative hover:bg-transparent hover:text-primary"
              title={t("navbar.cartToggle")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className={`absolute -top-2 ${i18n.language === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                {cartItems.length}
              </span>
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

              {/* Cart Button Mobile */}
              {/* Note that this button will take the place of login/signup buttons after logging in */}
              <Button
                variant="ghost"
                onClick={toggleCartModal}
                className="justify-start gap-2 px-2 py-1 text-base font-medium text-muted-foreground h-auto"
              >
                <ShoppingCart className="h-5 w-5" />
                <div className="flex flex-row justify-between items-center w-full">
                  <span>{t("navbar.cartToggle")}</span>
                  <span className={`${i18n.language === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                    {cartItems.length}
                  </span>
                </div>
              </Button>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  variant="outline"
                  className="w-full font-bold justify-center"
                  onClick={() => setIsMenuOpen(false)}
                  asChild
                >
                  <Link to="/login">{t("navbar.login")}</Link>
                </Button>
                <Button
                  variant="default"
                  className="w-full font-bold justify-center"
                  onClick={() => setIsMenuOpen(false)}
                  asChild
                >
                  <Link to="/signup">{t("navbar.signup")}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}

        <CartPreview
          open={isCartModalOpen}
          onOpenChange={setIsCartModalOpen}
          cartItems={cartItems}
          onViewFullCart={handleViewFullCart}
        />
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
