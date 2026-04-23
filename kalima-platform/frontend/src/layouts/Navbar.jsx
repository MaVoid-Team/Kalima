import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ShoppingCart, ShoppingBag, FileText, Home, User } from "lucide-react";
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
import logo from "../assets/Logo.webp";
import CartPreview from "../components/cart/CartPreview";
import useAuth from "../hooks/auth/useAuth";
import { useCart } from "../contexts/CartContext";
import { useRole } from "@/hooks/useRole";

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { hasAdminAccess, isTeacher, isStudent, isParent } = useRole();
  const isStudentOrParent = isStudent || isParent;
  // Cart is only relevant for regular store users
  const { cart, loading } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("landing");
  const [commandValue, setCommandValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update header transparency/style
      setScrolled(currentScrollY > 50);

      if (window.innerWidth < 768) {
        // Only hide if we've scrolled down a bit (threshold of 80px)
        // And if we are actually scrolling down
        if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          setShowMobileNav(false);
        } 
        // Show if we are scrolling up
        else if (currentScrollY < lastScrollY.current) {
          setShowMobileNav(true);
        }
      }
      
      lastScrollY.current = currentScrollY;
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

            {/* Mobile Actions (Top) */}
            <div className="flex items-center gap-1 md:hidden">
              {/* Language Toggle Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="hover:bg-primary/10 hover:text-primary h-9 w-9"
              >
                <Globe className="h-4 w-4" />
              </Button>

              {/* Cart Button Mobile */}
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
                    {loading ? "..." : cart.cart_items.length}
                  </span>
                </Button>
              )}
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 inset-x-4 z-[70] flex justify-center pointer-events-none">
        <AnimatePresence>
          {showMobileNav && (
            <motion.div
              key="mobile-nav"
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                duration: 0.3 
              }}
              className={cn(
                "pointer-events-auto h-16 w-[calc(100%-2rem)] max-w-[420px] overflow-hidden",
                "flex items-center justify-around px-2",
                "rounded-full safe-area-pb transition-all duration-500",
                "border border-white/20 dark:border-white/10",
                "shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
              )}
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
              }}
            >
              <Link to="/" className={cn(
                "flex items-center justify-center min-w-[48px] h-10 transition-all relative group",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Home
                  className={cn("h-6 w-6 transition-all relative z-10")}
                  strokeWidth={location.pathname === "/" ? 2.5 : 2}
                />
              </Link>

              {!isStudentOrParent && (
                <Link to="/market" className={cn(
                  "flex items-center justify-center min-w-[48px] h-10 transition-all relative group",
                  location.pathname === "/market" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  {location.pathname === "/market" && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <ShoppingBag
                    className={cn("h-6 w-6 transition-all relative z-10")}
                    strokeWidth={location.pathname === "/market" ? 2.5 : 2}
                  />
                </Link>
              )}

              {!isStudentOrParent && (
                <Link to="/samples" className={cn(
                  "flex items-center justify-center min-w-[48px] h-10 transition-all relative group",
                  location.pathname === "/samples" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  {location.pathname === "/samples" && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <FileText
                    className={cn("h-6 w-6 transition-all relative z-10")}
                    strokeWidth={location.pathname === "/samples" ? 2.5 : 2}
                  />
                </Link>
              )}

              {isAuthenticated ? (
                <Link
                  to={
                    hasAdminAccess ? "/admin" :
                      isTeacher ? "/teacher/profile" :
                        isStudent ? "/student/profile" :
                          isParent ? "/parent/profile" : "/orders"
                  }
                  className={cn(
                    "flex items-center justify-center min-w-[48px] h-10 transition-all relative group",
                    ["/admin", "/teacher", "/student", "/parent", "/orders"].some(p => location.pathname.startsWith(p)) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {["/admin", "/teacher", "/student", "/parent", "/orders"].some(p => location.pathname.startsWith(p)) && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <User
                    className={cn("h-6 w-6 transition-all relative z-10")}
                    strokeWidth={["/admin", "/teacher", "/student", "/parent", "/orders"].some(p => location.pathname.startsWith(p)) ? 2.5 : 2}
                  />
                </Link>
              ) : (
                <Link to="/login" className={cn(
                  "flex items-center justify-center min-w-[48px] h-10 transition-all relative group",
                  location.pathname === "/login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  {location.pathname === "/login" && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-primary/10 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <User
                    className={cn("h-6 w-6 transition-all relative z-10")}
                    strokeWidth={location.pathname === "/login" ? 2.5 : 2}
                  />
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
