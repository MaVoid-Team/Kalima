import { useState } from "react";
import { Menu, X, Globe, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import logo from "../assets/Logo.png";
import CartPreview from "../components/cart/CartPreview";

export default function Navbar() {
  const [cartItems] = useState([
      ]);
    
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation("landing");
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  const toggleCartModal = () => {
    setIsCartModalOpen(!isCartModalOpen);
    setIsMenuOpen(false);
  }

  const handleViewFullCart = () => {
    setIsCartModalOpen(false);
    navigate("/cart", { state: { cartItems } }); // Pass cart items to the cart page
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
  );
}
