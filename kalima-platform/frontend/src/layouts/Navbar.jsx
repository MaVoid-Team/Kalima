import { useState, useEffect } from "react";
import { Menu, X, Globe, ShoppingCart, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import useAuth from "../hooks/auth/useAuth";
import { useCart } from "../contexts/CartContext";
import { useRole } from "@/hooks/useRole";

export default function Navbar() {
  const { cart, loading } = useCart();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { hasAdminAccess, isTeacher } = useRole();
  // getCart is now handled by provider; cart data available directly
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation("landing");
  const [commandValue, setCommandValue] = useState("");

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

  useEffect(() => {
    if (!open) return;

    const routeValues = ["/market"];
    const current = routeValues.find((route) => location.pathname.startsWith(route));
    setCommandValue(current || "");
  }, [open, location.pathname]);


  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const toggleCartModal = () => {
    // provider keeps cart up to date automatically
    setIsCartModalOpen(!isCartModalOpen);
    setIsMenuOpen(false);
  };

  const handleViewFullCart = () => {
    setIsCartModalOpen(false);
    navigate("/cart"); // Pass cart items to the cart page
  };

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  const NAV_LINKS = [
    { label: t("navbar.market"), href: "/market" },
  ];


  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
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
            {/* <nav className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav> */}

            <div className="flex items-center gap-3">
              {/* Search Trigger */}
              {/* <Button
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
              </Button> */}
              {/* Market Button */}
              <Button
                variant="default"
                onClick={() => navigate("/market")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t("navbar.market")}
              </Button>
              <Button variant='default' onClick={() => navigate("/samples")}>
                <FileText className="mr-2 h-4 w-4"></FileText>
                {t("navbar.samples")}
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
              {isAuthenticated && <Button
                variant="ghost"
                size="icon"
                onClick={toggleCartModal}
                className="relative hover:bg-transparent hover:text-primary"
                title={t("navbar.cartToggle")}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className={`absolute -top-1 ${i18n.language === 'ar' ? 'left-0' : 'right-0'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                  {loading ? "..." : cart.cart_items.length}
                </span>
              </Button>}

              {isAuthenticated ? (
                <>
                  {hasAdminAccess && (
                    <Button
                      variant="default"
                      size="default"
                      className="font-bold px-6"
                      asChild
                    >
                      <Link to="/admin">{t("navbar.dashboard", "Dashboard")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && isTeacher && (
                    <Button
                      variant="default"
                      size="default"
                      className="font-bold px-6"
                      asChild
                    >
                      <Link to="/teacher/profile">{t("navbar.teacherPortal", "Teacher Portal")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && !isTeacher && (
                    <Button
                      variant="ghost"
                      className="font-bold hover:bg-transparent hover:text-primary"
                      asChild
                    >
                      <Link to="/orders">{t("navbar.myOrders", "My Orders")}</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="default"
                    className="font-bold px-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10 border-destructive/20"
                    onClick={logout}
                  >
                    {t("navbar.logout", "Log out")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="font-bold hover:bg-transparent hover:text-primary"
                    asChild
                  >
                    <Link to="/login" state={{ from: location }} replace>{t("navbar.login")}</Link>
                  </Button>
                  <Button
                    variant="default"
                    size="default"
                    className="font-bold px-6"
                    asChild
                  >
                    <Link to="/signup" state={{ from: location }}>{t("navbar.signup")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button with Search Icon nearby if needed, or just keep inside menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </Button> */}

            {/* Cart Button */}
            {/* Note that this button will take the place of login/signup buttons after logging in */}
            {isAuthenticated && !hasAdminAccess && !isTeacher && <Button
              variant="ghost"
              size="icon"
              onClick={toggleCartModal}
              className="relative hover:bg-transparent hover:text-primary"
              title={t("navbar.cartToggle")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className={`absolute -top-1 ${i18n.language === 'ar' ? 'left-0' : 'right-0'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                {cart.cart_items.length}
              </span>
            </Button>}

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        <CartPreview
          open={isCartModalOpen}
          onOpenChange={setIsCartModalOpen}
          cart={cart}
          onViewFullCart={handleViewFullCart}
        />
      </header>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-background border-t border-border p-6 transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <nav className="flex flex-col gap-4 overflow-y-auto pb-8 h-full">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-lg font-medium text-foreground hover:text-primary transition-colors px-2 py-2 border-b border-border/50"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 py-2 border-b border-border/50">
              <span className="text-base font-medium text-muted-foreground">{t("navbar.languageToggle")}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2"
              >
                <Globe className="h-5 w-5" />
                <span className="uppercase">{i18n.language}</span>
              </Button>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {isAuthenticated ? (
                <>
                  {hasAdminAccess && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/admin">{t("navbar.dashboard", "Dashboard")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && isTeacher && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/teacher/profile">{t("navbar.teacherPortal", "Teacher Portal")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && !isTeacher && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/orders">{t("navbar.myOrders", "My Orders")}</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full font-bold justify-center h-12 text-base text-destructive hover:text-destructive/90 hover:bg-destructive/10 border-destructive/20 mt-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  >
                    {t("navbar.logout", "Log out")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full font-bold justify-center h-12 text-base"
                    onClick={() => setIsMenuOpen(false)}
                    asChild
                  >
                    <Link to="/login" state={{ from: location }} replace>{t("navbar.login")}</Link>
                  </Button>
                  <Button
                    variant="default"
                    className="w-full font-bold justify-center h-12 text-base"
                    onClick={() => setIsMenuOpen(false)}
                    asChild
                  >
                    <Link to="/signup" state={{ from: location }}>{t("navbar.signup")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>


      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        commandProps={{ value: commandValue, onValueChange: setCommandValue }}
      >
        <CommandInput placeholder={t("navbar.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("navbar.noResults")}</CommandEmpty>
          <CommandGroup heading={t("navbar.pages")}>
            <CommandItem value="/market" onSelect={() => runCommand(() => navigate("/market"))}>
              {t("navbar.market")}
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
