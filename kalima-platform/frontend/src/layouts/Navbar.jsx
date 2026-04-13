import { useState, useEffect } from "react";
import { Menu, X, Globe, ShoppingCart, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { hasAdminAccess, isTeacher, isStudent, isParent } = useRole();
  const isStudentOrParent = isStudent || isParent;
  // Cart is only relevant for regular store users
  const { cart, loading } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation("landing");
  const [commandValue, setCommandValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleScroll();
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
  ].filter(link => {
    if (link.href === "/market" && isStudentOrParent) return false;
    return true;
  });


  return (
    <>
      <div className={cn(
        "fixed inset-x-0 z-50 flex justify-center pointer-events-none transition-all duration-700",
        (scrolled && !isMobile) ? "top-4 px-4" : "top-0"
      )}>
        <motion.header
          initial={false}
          animate={{
            width: (scrolled && !isMobile) ? "min(1200px, 95vw)" : "100%",
            height: (scrolled && !isMobile) ? 64 : (isMobile ? 64 : 80),
            borderRadius: (scrolled && !isMobile) ? 32 : 0,
            backgroundColor: scrolled 
              ? "color-mix(in oklch, var(--background), transparent 30%)" 
              : "color-mix(in oklch, var(--background), transparent 100%)",
            backdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
            border: (scrolled && !isMobile) 
              ? "1px solid color-mix(in oklch, var(--primary), transparent 80%)" 
              : "0px solid transparent",
            borderBottom: (!scrolled || isMobile)
              ? "1px solid color-mix(in oklch, var(--border), transparent 60%)"
              : "1px solid color-mix(in oklch, var(--primary), transparent 80%)",
          }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className={cn(
            "pointer-events-auto relative flex items-center transition-all overflow-hidden",
            (scrolled && !isMobile) ? "shadow-[0_20px_50px_rgba(0,0,0,0.1)]" : "w-full"
          )}
        >
          <div className={cn(
            "h-full flex items-center justify-between transition-all duration-700 w-full relative",
            (scrolled && !isMobile) ? "px-8 md:px-10" : "container md:px-6"
          )}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 decoration-0 shrink-0">
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
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-2 lg:gap-3">
                {!isStudentOrParent && (
                  <Button
                    variant="default"
                    onClick={() => navigate("/market")}
                    className="h-9 px-4"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("navbar.market")}
                  </Button>
                )}
                {!isStudentOrParent && (
                  <Button 
                    variant='secondary' 
                    onClick={() => navigate("/samples")}
                    className="h-9 px-4"
                  >
                    <FileText className="mr-2 h-4 w-4"></FileText>
                    {t("navbar.samples")}
                  </Button>
                )}
                
                {/* Language Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  className="hover:bg-primary/10 hover:text-primary h-9 w-9"
                  title={t("navbar.languageToggle")}
                >
                  <Globe className="h-5 w-5" />
                </Button>

                {/* Cart Button Desktop */}
                {isAuthenticated && !isStudentOrParent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCartModal}
                    className="relative hover:bg-primary/10 hover:text-primary h-9 w-9"
                    title={t("navbar.cartToggle")}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className={cn(
                      "absolute -top-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center z-10",
                      i18n.language === 'ar' ? 'left-0' : 'right-0'
                    )}>
                      {loading ? "..." : cart.cart_items.length}
                    </span>
                  </Button>
                )}

                <div className="h-6 w-[1px] bg-border mx-2" />

                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    {hasAdminAccess && (
                      <Button variant="default" size="sm" className="font-bold whitespace-nowrap" asChild>
                        <Link to="/admin">{t("navbar.dashboard")}</Link>
                      </Button>
                    )}
                    {!hasAdminAccess && isTeacher && (
                      <Button variant="default" size="sm" className="font-bold whitespace-nowrap" asChild>
                        <Link to="/teacher/profile">{t("navbar.teacherPortal")}</Link>
                      </Button>
                    )}
                    {!hasAdminAccess && !isTeacher && isStudent && (
                      <Button variant="default" size="sm" className="font-bold whitespace-nowrap" asChild>
                        <Link to="/student/profile">{t("navbar.studentPortal")}</Link>
                      </Button>
                    )}
                    {!hasAdminAccess && !isTeacher && !isStudent && isParent && (
                      <Button variant="default" size="sm" className="font-bold whitespace-nowrap" asChild>
                        <Link to="/parent/profile">{t("navbar.parentPortal")}</Link>
                      </Button>
                    )}
                    {!hasAdminAccess && !isTeacher && !isStudent && !isParent && (
                      <Button variant="ghost" size="sm" className="font-bold whitespace-nowrap" asChild>
                        <Link to="/orders">{t("navbar.myOrders")}</Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-bold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={logout}
                    >
                      {t("navbar.logout", "Log out")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-bold hover:bg-primary/10 hover:text-primary"
                      asChild
                    >
                      <Link to="/login" state={{ from: location }} replace>{t("navbar.login")}</Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="font-bold px-4"
                      asChild
                    >
                      <Link to="/signup" state={{ from: location }}>{t("navbar.signup")}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated && !hasAdminAccess && !isTeacher && !isStudentOrParent && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCartModal}
                  className="relative hover:bg-primary/10 hover:text-primary h-9 w-9"
                  title={t("navbar.cartToggle")}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className={cn(
                    "absolute -top-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center z-10",
                    i18n.language === 'ar' ? 'left-0' : 'right-0'
                  )}>
                    {cart.cart_items.length}
                  </span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground h-9 w-9"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          <CartPreview
            open={isCartModalOpen}
            onOpenChange={setIsCartModalOpen}
            cart={cart}
            onViewFullCart={handleViewFullCart}
          />
        </motion.header>
      </div>

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
                      <Link to="/admin">{t("navbar.dashboard")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && isTeacher && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/teacher/profile">{t("navbar.teacherPortal")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && !isTeacher && isStudent && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/student/profile">{t("navbar.studentPortal")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && !isTeacher && !isStudent && isParent && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/parent/profile">{t("navbar.parentPortal")}</Link>
                    </Button>
                  )}
                  {!hasAdminAccess && !isTeacher && !isStudent && !isParent && (
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-12 text-base"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/orders">{t("navbar.myOrders")}</Link>
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
            {!isStudentOrParent && (
              <CommandItem value="/market" onSelect={() => runCommand(() => navigate("/market"))}>
                {t("navbar.market")}
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
    </>
  );
}
