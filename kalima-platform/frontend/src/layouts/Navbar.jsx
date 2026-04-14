import { useState, useEffect } from "react";
import { Menu, X, Globe, ShoppingCart, ShoppingBag, FileText } from "lucide-react";
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
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isMenuOpen]);

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
    { label: t("navbar.market"), href: "/market", icon: ShoppingCart },
    { label: t("navbar.samples"), href: "/samples", icon: FileText }
  ].filter(() => {
    if (isStudentOrParent) return false;
    return true;
  });


  return (
    <>
      <div className={cn(
        "fixed inset-x-0 z-[70] flex justify-center pointer-events-none transition-all duration-700",
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
                    <ShoppingBag className="h-5 w-5" />
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
              {isAuthenticated && !hasAdminAccess && !isStudentOrParent && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCartModal}
                  className="relative hover:bg-primary/10 hover:text-primary h-9 w-9"
                  title={t("navbar.cartToggle")}
                >
                  <ShoppingBag className="h-5 w-5" />
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
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[60] bg-background/95 backdrop-blur-2xl border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col h-full p-6 md:p-8 overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-6">
                {NAV_LINKS.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 px-2">
                      {t("navbar.navigation", "Navigation")}
                    </span>
                    {NAV_LINKS.map((link, idx) => {
                      const Icon = link.icon;
                      return (
                        <motion.div
                          key={link.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                          <Link
                            to={link.href}
                            className={cn(
                              "group flex items-center gap-4 text-xl font-bold p-3 rounded-2xl transition-all duration-300",
                              location.pathname === link.href
                                ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                : "text-foreground hover:bg-muted/50"
                            )}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
                              location.pathname === link.href
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className="flex-1">{link.label}</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </motion.div>
                      );
                    })}

                    {/* Add Cart Link for Mobile Menu
                    {isAuthenticated && !hasAdminAccess && !isStudentOrParent && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + NAV_LINKS.length * 0.05 }}
                      >
                        <button
                          className="group flex items-center gap-4 w-full text-xl font-bold p-3 rounded-2xl text-foreground hover:bg-muted/50 transition-all duration-300"
                          onClick={toggleCartModal}
                        >
                          <div className="h-12 w-12 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-all duration-300 relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cart.cart_items.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-background shadow-sm">
                                {cart.cart_items.length}
                              </span>
                            )}
                          </div>
                          <span className="flex-1 text-left rtl:text-right">
                             {t("navbar.cartToggle", "Cart")}
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </motion.div>
                    )} */}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="h-px bg-linear-to-r from-border/0 via-border to-border/0"
                />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/40"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {t("navbar.language", "Language")}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {i18n.language === 'ar' ? 'العربية' : 'English'}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleLanguage}
                    className="gap-2 rounded-xl px-4 h-10 border border-border/40 shadow-xs"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-bold tracking-wider text-[10px]">
                      {i18n.language === 'ar' ? 'English' : 'العربية'}
                    </span>
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto flex flex-col gap-3 pb-8"
              >
                {isAuthenticated ? (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      {hasAdminAccess && (
                        <Button
                          variant="default"
                          className="w-full font-bold justify-center h-14 text-base rounded-2xl shadow-lg shadow-primary/20"
                          onClick={() => setIsMenuOpen(false)}
                          asChild
                        >
                          <Link to="/admin">{t("navbar.dashboard")}</Link>
                        </Button>
                      )}
                      {!hasAdminAccess && isTeacher && (
                        <Button
                          variant="default"
                          className="w-full font-bold justify-center h-14 text-base rounded-2xl shadow-lg shadow-primary/20"
                          onClick={() => setIsMenuOpen(false)}
                          asChild
                        >
                          <Link to="/teacher/profile">{t("navbar.teacherPortal")}</Link>
                        </Button>
                      )}
                      {!hasAdminAccess && !isTeacher && isStudent && (
                        <Button
                          variant="default"
                          className="w-full font-bold justify-center h-14 text-base rounded-2xl shadow-lg shadow-primary/20"
                          onClick={() => setIsMenuOpen(false)}
                          asChild
                        >
                          <Link to="/student/profile">{t("navbar.studentPortal")}</Link>
                        </Button>
                      )}
                      {!hasAdminAccess && !isTeacher && !isStudent && isParent && (
                        <Button
                          variant="default"
                          className="w-full font-bold justify-center h-14 text-base rounded-2xl shadow-lg shadow-primary/20"
                          onClick={() => setIsMenuOpen(false)}
                          asChild
                        >
                          <Link to="/parent/profile">{t("navbar.parentPortal")}</Link>
                        </Button>
                      )}
                      {!hasAdminAccess && !isTeacher && !isStudent && !isParent && (
                        <Button
                          variant="default"
                          className="w-full font-bold justify-center h-14 text-base rounded-2xl shadow-lg shadow-primary/20"
                          onClick={() => setIsMenuOpen(false)}
                          asChild
                        >
                          <Link to="/orders">{t("navbar.myOrders")}</Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full font-bold justify-center h-14 text-base text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-colors mt-2"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                      >
                        {t("navbar.logout", "Log out")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full font-bold justify-center h-14 text-base rounded-2xl border-border/60"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/login" state={{ from: location }} replace>{t("navbar.login")}</Link>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full font-bold justify-center h-14 text-base rounded-2xl shadow-lg shadow-primary/20"
                      onClick={() => setIsMenuOpen(false)}
                      asChild
                    >
                      <Link to="/signup" state={{ from: location }}>{t("navbar.signup")}</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>


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
