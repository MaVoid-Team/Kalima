import { useState, useEffect, useRef } from "react";
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
import useAuth from "../hooks/auth/useAuth";
import useCart from "../hooks/cart/useCart";
import { is } from "zod/v4/locales";

export default function Navbar() {
  const [cart, setCart] = useState({ cart_items: [], subtotal: 0, discount: 0, total: 0 });
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { getCart, getProductThumbnail, loading } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("landing");
  const didFetchCart = useRef(false);
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
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

  // fetching cart items
  useEffect(() => {
    if (!isAuthenticated) {
      // reset flag when logging out so that a new login will refetch
      didFetchCart.current = false;
      return;
    }

    if (didFetchCart.current) return; // avoid duplicate calls (React strict mode, re-renders, etc.)
    didFetchCart.current = true;

    fetchCart();
  }, [isAuthenticated]);

    const fetchCart = async () => {
      try {
        const response = await getCart();
        console.log("Fetched cart items:", response);
        setCart(response);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const toggleCartModal = () => {
    if (!isCartModalOpen) fetchCart(); 
    setIsCartModalOpen(!isCartModalOpen);
    setIsMenuOpen(false);
  };

  const handleViewFullCart = () => {
    setIsCartModalOpen(false);
    navigate("/cart"); // Pass cart items to the cart page
  };

  const onGetProductThumbnail = async (productId) => {
    if (productId == null) return "https://via.placeholder.com/150";
    try {
      const thumbnailUrl = await getProductThumbnail(productId);
      return baseURL.split('api/v2')[0] + thumbnailUrl?.url;
    } catch (error) {
      console.error("Failed to get product thumbnail:", error);
      return "https://via.placeholder.com/150"; // fallback thumbnail
    }
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
              {isAuthenticated && <Button
                variant="ghost"
                size="icon"
                onClick={toggleCartModal}
                className="relative hover:bg-transparent hover:text-primary"
                title={t("navbar.cartToggle")}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className={`absolute -top-2 ${i18n.language === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                  {loading ? "..." : cart.cart_items.length}
                </span>
              </Button>}

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="font-bold hover:bg-transparent hover:text-primary"
                    asChild
                  >
                    <Link to="/orders">{t("navbar.myOrders", "My Orders")}</Link>
                  </Button>
                  <Button
                    variant="default"
                    size="default"
                    className="font-bold px-6"
                    asChild
                  >
                    <Link to="/dashboard">{t("navbar.dashboard", "Dashboard")}</Link>
                  </Button>
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
                </>
              )}
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
            {isAuthenticated && <Button
              variant="ghost"
              size="icon"
              onClick={toggleCartModal}
              className="relative hover:bg-transparent hover:text-primary"
              title={t("navbar.cartToggle")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className={`absolute -top-2 ${i18n.language === 'ar' ? '-left-2' : '-right-2'} w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10`}>
                {cart.cart_items.length}
              </span>
            </Button>}

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
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-background border-t border-border p-6 animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4 h-full overflow-y-auto pb-8">
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

              <div className="mt-auto space-y-4">
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
                      <Button
                        variant="outline"
                        className="w-full font-bold justify-center h-12 text-base"
                        onClick={() => setIsMenuOpen(false)}
                        asChild
                      >
                        <Link to="/orders">{t("navbar.myOrders", "My Orders")}</Link>
                      </Button>
                      <Button
                        variant="default"
                        className="w-full font-bold justify-center h-12 text-base"
                        onClick={() => setIsMenuOpen(false)}
                        asChild
                      >
                        <Link to="/dashboard">{t("navbar.dashboard", "Dashboard")}</Link>
                      </Button>
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
                        <Link to="/login">{t("navbar.login")}</Link>
                      </Button>
                      <Button
                        variant="default"
                        className="w-full font-bold justify-center h-12 text-base"
                        onClick={() => setIsMenuOpen(false)}
                        asChild
                      >
                        <Link to="/signup">{t("navbar.signup")}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}

        <CartPreview
          open={isCartModalOpen}
          onOpenChange={setIsCartModalOpen}
          cart={cart}
          onViewFullCart={handleViewFullCart}
          getProductThumbnail={onGetProductThumbnail}
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
